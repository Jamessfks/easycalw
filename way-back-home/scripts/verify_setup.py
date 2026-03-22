#!/usr/bin/env python3
"""
Verify Setup Script

Checks that the local environment is correctly configured for the Way Back Home codelab:
- gcloud CLI is available and authenticated
- Python dependencies are installed

Run this AFTER cloning the repo and installing dependencies (uv sync from level_0/).
Project configuration and API enablement are handled by setup.sh in the next step.
"""

import sys
import subprocess


def check_gcloud_cli() -> tuple[bool, str]:
    """Check if gcloud CLI is available and authenticated."""
    try:
        result = subprocess.run(
            ["gcloud", "auth", "list", "--format=value(account)", "--filter=status:ACTIVE"],
            capture_output=True,
            text=True,
            timeout=10
        )
        account = result.stdout.strip()
        if account:
            return True, account
        return False, ""
    except FileNotFoundError:
        return False, "gcloud CLI not found"
    except subprocess.TimeoutExpired:
        return False, "timed out"


def check_dependencies() -> tuple[bool, list[str]]:
    """Check if required Python packages are installed."""
    missing = []

    try:
        import google.genai
    except ImportError:
        missing.append("google-genai")

    try:
        from PIL import Image
    except ImportError:
        missing.append("Pillow")

    try:
        import requests
    except ImportError:
        missing.append("requests")

    return len(missing) == 0, missing


def main():
    """Run all verification checks."""
    print("🔍 Verifying Way Back Home setup...\n")

    all_passed = True

    # Check 1: gcloud CLI available and authenticated
    gcloud_ok, account = check_gcloud_cli()
    if gcloud_ok:
        print(f"✓ Authenticated as: {account}")
    else:
        print("✗ gcloud CLI not authenticated")
        print("  Run: gcloud auth login")
        all_passed = False

    # Check 2: Python dependencies
    deps_ok, missing = check_dependencies()
    if deps_ok:
        print("✓ Python environment ready (uv)")
    else:
        print(f"✗ Missing dependencies: {', '.join(missing)}")
        print("  Run: uv sync  (from the level_0 directory)")
        all_passed = False

    # Final result
    print()
    if all_passed:
        print("✓ Ready to proceed!")
        print("  Please continue with the codelab instructions.")
        return 0
    else:
        print("✗ Please fix the issues above before continuing.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
