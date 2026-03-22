#!/usr/bin/env python3
"""
Way Back Home - Billing Enablement Script

Automatically links a billing account to the current Google Cloud project.
Based on battle-tested patterns from Google Cloud codelabs.

This script handles common workshop scenarios:
- API propagation delays after enabling
- Billing account propagation delays (when credits are just claimed)
- Verification that billing link is actually active

Selection heuristic (when multiple accounts exist):
  1. Prefer account already tagged with our suffix (from a previous run)
  2. Prefer account not yet linked to any project (freshest)
  3. Fall back to first open account

After selection, the account is tagged with a date suffix (e.g. -202602181530)
so subsequent runs can identify it.

Usage: Called by setup.sh, or run directly: python3 billing-enablement.py
"""

import os
import re
import subprocess
import sys
import time
from datetime import datetime

try:
    from google.cloud import billing_v1
    from google.api_core import exceptions
    from google.api_core.client_options import ClientOptions
except ImportError:
    print("Installing google-cloud-billing...")
    subprocess.check_call(
        [
            sys.executable,
            "-m",
            "pip",
            "install",
            "--quiet",
            "--user",
            "--break-system-packages",
            "google-cloud-billing",
        ]
    )
    from google.cloud import billing_v1
    from google.api_core import exceptions
    from google.api_core.client_options import ClientOptions


# Pattern to detect our date suffix (e.g., "-202602181530")
SUFFIX_PATTERN = re.compile(r"-\d{12}$")


def get_project_id() -> str:
    """Get the current Google Cloud project ID from gcloud config."""
    try:
        result = subprocess.run(
            ["gcloud", "config", "get-value", "project"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        project_id = result.stdout.strip()
        if project_id and project_id != "(unset)":
            return project_id
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass

    print("❌ Error: No Google Cloud project configured.")
    print("   Run: gcloud config set project YOUR_PROJECT_ID")
    sys.exit(1)


def enable_billing_api(project_id: str) -> bool:
    """Enable the Cloud Billing API using gcloud."""
    print("   Enabling Cloud Billing API...")
    try:
        subprocess.run(
            [
                "gcloud",
                "services",
                "enable",
                "cloudbilling.googleapis.com",
                "--project",
                project_id,
                "--quiet",
            ],
            check=True,
            capture_output=True,
            text=True,
            timeout=60,
        )
        print("   ✓ Cloud Billing API enabled")
        return True
    except FileNotFoundError:
        print("   ❌ Error: 'gcloud' command not found")
        return False
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Error enabling API: {e.stderr}")
        return False
    except subprocess.TimeoutExpired:
        print("   ❌ Timeout enabling API")
        return False


def get_billing_accounts(client: billing_v1.CloudBillingClient):
    """Fetch billing accounts with error handling for API/permission issues."""
    try:
        accounts = client.list_billing_accounts()
        return list(accounts)
    except exceptions.PermissionDenied as e:
        error_message = e.message.lower()
        if (
            "api has not been used" in error_message
            or "service is disabled" in error_message
        ):
            # API not yet propagated - this is recoverable
            return "API_DISABLED_OR_PROPAGATING"
        else:
            # Actual permission issue
            print(f"   ❌ Permission denied: {e.message}")
            return "PERMISSION_DENIED"
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return "UNEXPECTED_ERROR"


def check_current_billing(
    client: billing_v1.CloudBillingClient, project_id: str
) -> tuple:
    """Check if project already has billing enabled. Returns (is_enabled, account_name)."""
    project_name = f"projects/{project_id}"
    try:
        info = client.get_project_billing_info(name=project_name)
        if info.billing_enabled:
            return True, info.billing_account_name
        return False, None
    except exceptions.NotFound:
        return False, None
    except Exception:
        return False, None


def get_linked_project_count(
    client: billing_v1.CloudBillingClient, billing_account
) -> int:
    """Count the number of projects linked to a billing account.

    Returns 0 if the account has no linked projects (freshest account),
    or -1 if the check fails (treat as unknown).
    """
    try:
        projects = client.list_project_billing_info(name=billing_account.name)
        count = 0
        for _ in projects:
            count += 1
            if count > 0:
                # We only need to know if there's at least one; stop early
                break
        return count
    except Exception:
        # If we can't check, return -1 (unknown — don't penalize this account)
        return -1


def find_best_billing_account(
    client: billing_v1.CloudBillingClient, open_accounts: list
) -> object:
    """Select the best billing account using our heuristic.

    Priority (designed for multi-day workshops where new credits are redeemed daily):
      1. Account not yet linked to any project (freshest — e.g. day 2 credits)
      2. Account with our suffix, preferring the newest suffix date
      3. First open account (fallback)
    """
    # Priority 1: Find account with no linked projects (freshest)
    unlinked_accounts = []
    for account in open_accounts:
        linked_count = get_linked_project_count(client, account)
        if linked_count == 0:
            unlinked_accounts.append(account)

    if unlinked_accounts:
        # Among unlinked, prefer accounts with "trial billing account" in the name
        # (workshop credits typically use this naming convention)
        unlinked_accounts.sort(
            key=lambda a: "trial billing account" in a.display_name.lower(),
            reverse=True,
        )
        account = unlinked_accounts[0]
        print(f"   Selected unlinked (fresh) account: {account.display_name}")
        return account

    # Priority 2: Among tagged accounts, pick the one with the newest suffix
    tagged_accounts = []
    for account in open_accounts:
        match = SUFFIX_PATTERN.search(account.display_name)
        if match:
            tagged_accounts.append((account, match.group()))

    if tagged_accounts:
        # Sort by suffix descending (newest date first)
        tagged_accounts.sort(key=lambda x: x[1], reverse=True)
        account = tagged_accounts[0][0]
        print(f"   Selected newest tagged account: {account.display_name}")
        return account

    # Priority 3: Fallback to first account
    account = open_accounts[0]
    print(f"   No unlinked or tagged accounts. Using: {account.display_name}")
    return account


def tag_billing_account(client: billing_v1.CloudBillingClient, account) -> None:
    """Tag billing account with date suffix for future identification.

    Appends a suffix like '-202602181530' to the display name.
    Silently skips if permission denied (requires billing.accounts.update).
    """
    # Don't double-tag
    if SUFFIX_PATTERN.search(account.display_name):
        return

    suffix = datetime.now().strftime("-%Y%m%d%H%M")
    new_name = f"{account.display_name}{suffix}"

    try:
        update_request = billing_v1.UpdateBillingAccountRequest(
            name=account.name,
            account=billing_v1.BillingAccount(display_name=new_name),
            update_mask={"paths": ["display_name"]},
        )
        client.update_billing_account(request=update_request)
        print(f"   ✓ Tagged account as: {new_name}")
    except exceptions.PermissionDenied:
        # User doesn't have billing.accounts.update — that's OK
        print(f"   ℹ  Could not tag account (insufficient permissions — this is OK)")
    except Exception as e:
        # Non-fatal — tagging is a convenience, not a requirement
        print(f"   ℹ  Could not tag account: {e}")


def link_billing_account(
    client: billing_v1.CloudBillingClient, project_id: str, billing_account
) -> bool:
    """Link billing account to project and verify it's active."""
    project_name = f"projects/{project_id}"
    billing_account_name = billing_account.name
    display_name = billing_account.display_name

    print(f"   Linking '{display_name}' to project...")

    try:
        project_billing_info = billing_v1.ProjectBillingInfo(
            billing_account_name=billing_account_name
        )
        client.update_project_billing_info(
            name=project_name, project_billing_info=project_billing_info
        )
    except exceptions.PermissionDenied as e:
        print(f"   ❌ Permission denied. You may need 'Billing Account User' role.")
        print(f"      {e.message}")
        return False
    except Exception as e:
        print(f"   ❌ Failed to link: {e}")
        return False

    # Verify the link is active (can take a few seconds to propagate)
    print("   Verifying billing link...")
    max_retries = 6
    wait_seconds = 10

    for i in range(max_retries):
        try:
            info = client.get_project_billing_info(name=project_name)
            if (
                info.billing_account_name == billing_account_name
                and info.billing_enabled
            ):
                print(f"   ✓ Billing verified active")
                return True
        except Exception:
            pass

        if i < max_retries - 1:
            time.sleep(wait_seconds)

    print("   ⚠️  Could not verify billing link (may still be propagating)")
    return True  # Optimistically continue


def main():
    """Main billing enablement flow."""
    print("💳 Checking billing configuration...")

    # Get project ID
    project_id = get_project_id()
    print(f"   Project: {project_id}")

    # Initialize billing client
    billing_client = billing_v1.CloudBillingClient(
        client_options=ClientOptions(quota_project_id=project_id)
    )

    # Check if billing is already enabled
    is_enabled, current_account = check_current_billing(billing_client, project_id)
    if is_enabled:
        print(f"✓ Billing already enabled")
        return 0

    print("   Billing not enabled. Searching for billing accounts...")

    # Try to get billing accounts
    accounts_result = get_billing_accounts(billing_client)

    # If API not ready, enable it and retry with backoff
    if accounts_result == "API_DISABLED_OR_PROPAGATING":
        if not enable_billing_api(project_id):
            return 1

        print("   Waiting for API to propagate...")
        max_retries = 5
        wait_seconds = 15

        for i in range(max_retries):
            print(f"   Retry {i + 1}/{max_retries} in {wait_seconds}s...")
            time.sleep(wait_seconds)
            accounts_result = get_billing_accounts(billing_client)
            if accounts_result != "API_DISABLED_OR_PROPAGATING":
                break
            wait_seconds = int(wait_seconds * 1.5)

    # If still no accounts, wait for potential credit propagation
    if isinstance(accounts_result, list) and not accounts_result:
        print("   No billing accounts found. Waiting for credit propagation...")
        print("   (This can take up to 2 minutes if you just claimed credits)")

        max_wait_retries = 6
        for i in range(max_wait_retries):
            print(f"   Waiting... ({i + 1}/{max_wait_retries})")
            time.sleep(20)
            accounts_result = get_billing_accounts(billing_client)
            if isinstance(accounts_result, list) and accounts_result:
                print("   ✓ Found billing accounts!")
                break

    # Handle final result
    if isinstance(accounts_result, list):
        if not accounts_result:
            print()
            print("╔═══════════════════════════════════════════════════════════════╗")
            print("║              ⚠️  BILLING ACCOUNT REQUIRED                      ║")
            print("╠═══════════════════════════════════════════════════════════════╣")
            print("║                                                               ║")
            print("║  No billing accounts found after waiting.                     ║")
            print("║                                                               ║")
            print("║  If you're at a workshop:                                     ║")
            print("║  • Make sure you've CLAIMED YOUR CREDIT from the organizer   ║")
            print("║  • Wait a minute for it to apply, then run setup.sh again    ║")
            print("║                                                               ║")
            print("║  If you're self-learning:                                     ║")
            print("║  • Create a billing account (free tier available):            ║")
            print("║    https://console.cloud.google.com/billing/create            ║")
            print("║                                                               ║")
            print("╚═══════════════════════════════════════════════════════════════╝")
            return 1

        # Filter to open accounts only
        open_accounts = [acc for acc in accounts_result if acc.open]

        if not open_accounts:
            print("   ❌ Found billing accounts, but none are currently open/active.")
            return 1

        # If only one account, use it automatically
        if len(open_accounts) == 1:
            account = open_accounts[0]
            print(f"   Found: {account.display_name}")
            if link_billing_account(billing_client, project_id, account):
                tag_billing_account(billing_client, account)
                print("✓ Billing configured successfully")
                return 0
            return 1

        # Multiple accounts — use smart selection heuristic
        print(f"   Found {len(open_accounts)} billing accounts")
        account = find_best_billing_account(billing_client, open_accounts)
        print(f"   Auto-selecting: {account.display_name}")
        if link_billing_account(billing_client, project_id, account):
            tag_billing_account(billing_client, account)
            print("✓ Billing configured successfully")
            return 0

        # Auto-select failed - fall back to manual selection
        print(
            f"\n   ⚠️  Failed to link '{account.display_name}'. Please select manually:"
        )
        for i, acc in enumerate(open_accounts, 1):
            print(f"   {i}. {acc.display_name}")
        print()

        while True:
            try:
                choice = input(f"   Select account [1-{len(open_accounts)}]: ").strip()
                if not choice:
                    continue
                index = int(choice) - 1
                if 0 <= index < len(open_accounts):
                    break
                print(f"   Please enter 1-{len(open_accounts)}")
            except ValueError:
                print("   Please enter a number")

        account = open_accounts[index]
        if link_billing_account(billing_client, project_id, account):
            tag_billing_account(billing_client, account)
            print("✓ Billing configured successfully")
            return 0
        return 1

    elif accounts_result == "API_DISABLED_OR_PROPAGATING":
        print("   ❌ Cloud Billing API did not become active.")
        print("   Please try again in a few minutes, or manually enable at:")
        print(
            f"   https://console.cloud.google.com/apis/library/cloudbilling.googleapis.com?project={project_id}"
        )
        return 1

    elif accounts_result == "PERMISSION_DENIED":
        print("   ❌ You don't have permission to view billing accounts.")
        print("   Ask your organization admin for 'Billing Account User' role.")
        return 1

    else:
        print("   ❌ An unexpected error occurred.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
