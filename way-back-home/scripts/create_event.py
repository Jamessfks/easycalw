#!/usr/bin/env python3
"""
Create a new event in Firestore.

Usage:
  python3 scripts/create_event.py buildwithai-dallas "Build with AI Dallas" --max 500

Requires: pip install google-cloud-firestore
Uses your gcloud credentials (no Firebase Auth needed).
"""

import argparse
import sys

from google.cloud import firestore


def main():
    parser = argparse.ArgumentParser(description="Create a Way Back Home event")
    parser.add_argument("code", help="Event code (e.g. buildwithai-dallas)")
    parser.add_argument("name", help="Event display name")
    parser.add_argument("--description", "-d", default="", help="Event description")
    parser.add_argument("--max", "-m", type=int, default=500, help="Max participants (default: 500)")
    parser.add_argument("--project", "-p", default="way-back-home-dev", help="GCP project ID")
    args = parser.parse_args()

    db = firestore.Client(project=args.project)
    doc_ref = db.collection("events").document(args.code)

    # Check if already exists
    if doc_ref.get().exists:
        print(f"⚠️  Event '{args.code}' already exists!")
        sys.exit(1)

    doc_ref.set({
        "code": args.code,
        "name": args.name,
        "description": args.description,
        "max_participants": args.max,
        "participant_count": 0,
        "active": True,
        "created_at": firestore.SERVER_TIMESTAMP,
        "created_by": "admin",
    })

    print(f"✓ Event '{args.code}' created!")
    print(f"  Name: {args.name}")
    print(f"  Max participants: {args.max}")


if __name__ == "__main__":
    main()
