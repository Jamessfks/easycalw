#!/usr/bin/env python3
"""
Way Back Home - Customize Your Explorer

This script lets you choose your space suit color and describe
your explorer's appearance before generating your avatar.
"""

import json
import os
import random
import sys

# Configuration file is in project root
CONFIG_FILE = "../config.json"

# Suit color options
SUIT_COLORS = {
    "1": ("Deep Blue", "deep blue with silver accents"),
    "2": ("Crimson Red", "crimson red with gold trim"),
    "3": ("Forest Green", "forest green with bronze details"),
    "4": ("Royal Purple", "royal purple with white accents"),
    "5": ("Solar Gold", "solar gold with black trim"),
    "6": ("Silver", "metallic silver with blue accents"),
}

# Random appearance traits for those who don't want to describe themselves
RANDOM_EXPRESSIONS = [
    "confident expression",
    "determined look",
    "friendly smile",
    "thoughtful gaze",
    "adventurous grin",
    "calm demeanor",
    "focused intensity",
    "warm expression",
]

RANDOM_HAIR_STYLES = [
    "short styled hair",
    "medium length hair",
    "cropped hair",
    "wavy hair",
    "slicked back hair",
    "natural curls",
    "braided hair",
    "shaved head",
]


def load_config() -> dict:
    """Load existing configuration from setup.sh."""
    if not os.path.exists(CONFIG_FILE):
        print("❌ Error: config.json not found.")
        print("Please run: cd .. && ./scripts/setup.sh")
        sys.exit(1)

    with open(CONFIG_FILE, "r") as f:
        return json.load(f)


def save_config(config: dict) -> None:
    """Save updated configuration."""
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=4)


def get_suit_color() -> str:
    """Prompt user to select a suit color."""
    print("\n🎨 Let's create your explorer identity!\n")
    print("Select suit color:")

    for key, (name, _) in SUIT_COLORS.items():
        print(f"  {key}. {name}")

    print()

    while True:
        choice = input("Choice [1-6, default=6]: ").strip()

        if choice == "":
            choice = "6"

        if choice in SUIT_COLORS:
            name, description = SUIT_COLORS[choice]
            print(f"✓ {name} selected")
            return description
        else:
            print("Please enter a number between 1 and 6.")


def get_appearance() -> str:
    """Prompt user to describe their explorer or generate random traits."""
    print("\nBrief description of your explorer (or Enter for random):")
    print("Example: 'short dark hair, glasses, friendly smile'")

    appearance = input("> ").strip()

    if appearance == "":
        # Generate random traits
        expression = random.choice(RANDOM_EXPRESSIONS)
        hair = random.choice(RANDOM_HAIR_STYLES)
        appearance = f"{expression}, {hair}"
        print(f"✓ Random traits: {appearance}")
    else:
        print("✓ Appearance saved")

    return appearance


def main():
    """Main customization flow."""
    # Load existing config
    config = load_config()

    # Get suit color
    suit_color = get_suit_color()
    config["suit_color"] = suit_color

    # Get appearance
    appearance = get_appearance()
    config["appearance"] = appearance

    # Save updated config
    save_config(config)

    print("\n✅ Preferences saved! Ready to proceed with the codelab instructions.")


if __name__ == "__main__":
    main()
