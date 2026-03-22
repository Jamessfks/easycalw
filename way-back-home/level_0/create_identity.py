#!/usr/bin/env python3
"""
Way Back Home - Create Identity Script

This script orchestrates the avatar generation and registration process:
1. Calls your generate_explorer_avatar() function from generator.py
2. Uploads the generated images to Mission Control
3. Registers your identity with the rescue network
4. Displays your map URL

You don't need to modify this file - it's provided for you.
Your task is to implement the code in generator.py.
"""

import json
import os
import sys
import requests

# Configuration
CONFIG_FILE = "../config.json"  # Config is in project root
WORKSHOP_CONFIG_FILE = "../workshop.config.json"  # Workshop-level config


def get_workshop_config() -> dict:
    """Load workshop configuration (URLs, etc.)."""
    if os.path.exists(WORKSHOP_CONFIG_FILE):
        with open(WORKSHOP_CONFIG_FILE, "r") as f:
            return json.load(f)
    return {
        "api_base_url": "https://api.waybackhome.dev",
        "map_base_url": "https://waybackhome.dev"
    }


def load_config() -> dict:
    """Load configuration from setup."""
    if not os.path.exists(CONFIG_FILE):
        print("❌ Error: config.json not found.")
        print("Please run: cd .. && ./scripts/setup.sh")
        sys.exit(1)

    with open(CONFIG_FILE, "r") as f:
        config = json.load(f)

    # Validate required fields
    required_fields = ["event_code", "username", "participant_id", "api_base"]
    missing = [f for f in required_fields if f not in config]
    if missing:
        print(f"❌ Error: Missing config fields: {', '.join(missing)}")
        print("Please run: cd .. && ./scripts/setup.sh")
        sys.exit(1)

    # Check for customization
    if "suit_color" not in config or "appearance" not in config:
        print("❌ Error: Avatar preferences not set.")
        print("Please run: python customize.py")
        sys.exit(1)

    return config


def generate_avatar() -> dict:
    """
    Call the user's generator code.

    Returns:
        dict with portrait_path and icon_path
    """
    # Import the user's generator module (same directory)
    try:
        from generator import generate_explorer_avatar
    except ImportError as e:
        print(f"❌ Error importing generator: {e}")
        print("Make sure generator.py exists and has no syntax errors.")
        sys.exit(1)

    # Create outputs directory
    os.makedirs("outputs", exist_ok=True)

    # Call the user's function
    try:
        result = generate_explorer_avatar()
    except Exception as e:
        print(f"❌ Error during generation: {e}")
        print("\nTroubleshooting tips:")
        print("- Check that you completed all three steps in generator.py")
        print("- Ensure your GOOGLE_CLOUD_PROJECT environment variable is set")
        print("- Verify the Vertex AI API is enabled for your project")
        sys.exit(1)

    # Validate result
    if not result or "portrait_path" not in result or "icon_path" not in result:
        print("❌ Error: generator.py must return a dict with portrait_path and icon_path")
        sys.exit(1)

    # Check files exist
    if not os.path.exists(result["portrait_path"]):
        print(f"❌ Error: Portrait file not found at {result['portrait_path']}")
        print("Make sure your code saves the portrait to outputs/portrait.png")
        sys.exit(1)

    if not os.path.exists(result["icon_path"]):
        print(f"❌ Error: Icon file not found at {result['icon_path']}")
        print("Make sure your code saves the icon to outputs/icon.png")
        sys.exit(1)

    return result


def upload_avatar(config: dict, portrait_path: str, icon_path: str) -> dict:
    """
    Upload avatar images to Mission Control.

    Args:
        config: Configuration dict
        portrait_path: Path to portrait image
        icon_path: Path to icon image

    Returns:
        dict with portrait_url and icon_url from the API
    """
    api_base = config["api_base"]
    participant_id = config["participant_id"]

    url = f"{api_base}/participants/{participant_id}/avatar"

    try:
        with open(portrait_path, "rb") as portrait_file, open(icon_path, "rb") as icon_file:
            files = {
                "portrait": ("portrait.png", portrait_file, "image/png"),
                "icon": ("icon.png", icon_file, "image/png")
            }

            response = requests.post(url, files=files, timeout=60)
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error during upload: {e}")
        sys.exit(1)

    if response.status_code not in (200, 201):
        print(f"❌ Upload failed with status {response.status_code}")
        try:
            error = response.json().get("detail", "Unknown error")
            print(f"Error: {error}")
        except:
            print(f"Response: {response.text[:200]}")
        sys.exit(1)

    return response.json()


def register_identity(config: dict) -> dict:
    """
    Register identity with the rescue network.

    Args:
        config: Configuration dict

    Returns:
        Registration response from API
    """
    api_base = config["api_base"]

    url = f"{api_base}/participants/register"

    payload = {
        "participant_id": config["participant_id"],
        "suit_color": config.get("suit_color"),
        "appearance": config.get("appearance")
    }

    try:
        response = requests.post(url, json=payload, timeout=30)
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error during registration: {e}")
        sys.exit(1)

    if response.status_code not in (200, 201):
        print(f"❌ Registration failed with status {response.status_code}")
        try:
            error = response.json().get("detail", "Unknown error")
            print(f"Error: {error}")
        except:
            print(f"Response: {response.text[:200]}")
        sys.exit(1)

    return response.json()


def print_success(config: dict, upload_result: dict):
    """Print success message with map URL."""
    workshop_config = get_workshop_config()

    username = config["username"]
    event_code = config["event_code"]
    starting_x = config.get("starting_x", "?")
    starting_y = config.get("starting_y", "?")
    map_base = config.get("map_base_url", workshop_config["map_base_url"])
    map_url = f"{map_base}/e/{event_code}"

    print()
    print("╔═══════════════════════════════════════════════════════════════╗")
    print("║                    ✅ IDENTITY CONFIRMED!                      ║")
    print("╠═══════════════════════════════════════════════════════════════╣")
    print("║                                                               ║")
    print(f"║  Explorer: {username:<50} ║")
    print(
        f"║  Location: ({starting_x}, {starting_y}) — unconfirmed{' ' * (36 - len(str(starting_x)) - len(str(starting_y)))}║")
    print("║                                                               ║")
    print("║  🗺️  You're now on the map!                                   ║")
    print(f"║  {map_url:<60} ║")
    print("║                                                               ║")
    print("║  ✅ Level 0 complete! Ready to proceed with the codelab.      ║")
    print("║                                                               ║")
    print("╚═══════════════════════════════════════════════════════════════╝")


def main():
    """Main orchestration flow."""
    # Load configuration
    config = load_config()
    username = config["username"]

    print(f"🚀 Creating identity for {username}...\n")

    # Step 1: Generate avatar using user's code
    result = generate_avatar()

    # Step 2: Upload images
    print("\n☁️  Uploading to mission database...")
    upload_result = upload_avatar(config, result["portrait_path"], result["icon_path"])
    print("✓ Avatar uploaded!")

    # Step 3: Register identity
    print("📍 Registering with rescue network...")
    register_result = register_identity(config)
    print("✓ Registration complete!")

    # Step 4: Display success
    print_success(config, upload_result)


if __name__ == "__main__":
    main()
