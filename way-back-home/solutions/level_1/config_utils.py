"""
Level 1: Configuration Utilities

This module provides a unified way to get participant configuration that works in:
1. LOCAL development: Reads from config.json (found via __file__ based paths)
2. CLOUD RUN deployment: Uses env vars + fetches from backend API

This solves the fragile relative path problem and enables stateless Cloud Run deployment.

Usage:
    from config_utils import get_config, get_project_id

    config = get_config()
    evidence_urls = config.get("evidence_urls", {})
    participant_id = config["participant_id"]
"""

import os
import json
import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)

# Cache for config (avoid repeated API calls or file reads)
_config_cache: Optional[dict] = None


def find_config_file(start_path: Optional[str] = None) -> Optional[str]:
    """
    Find config.json by searching upward from a starting path.

    This is more robust than hardcoded relative paths because it:
    - Uses __file__ to get an absolute starting point
    - Searches upward until it finds config.json or hits root
    - Works regardless of current working directory

    Args:
        start_path: Directory to start searching from.
                   Defaults to this file's directory.

    Returns:
        Absolute path to config.json, or None if not found
    """
    if start_path is None:
        start_path = os.path.dirname(os.path.abspath(__file__))

    current = start_path

    # Search upward until we find config.json or hit root
    while current != '/':
        config_path = os.path.join(current, 'config.json')
        if os.path.exists(config_path):
            return config_path
        current = os.path.dirname(current)

    # Also check common locations relative to start_path
    for relative in ['../config.json', '../../config.json', 'config.json']:
        path = os.path.join(start_path, relative)
        if os.path.exists(path):
            return os.path.abspath(path)

    return None


def fetch_from_backend(participant_id: str, backend_url: str) -> dict:
    """
    Fetch participant configuration from the backend API.

    This enables stateless Cloud Run deployment - the agent doesn't
    need config.json, it fetches everything from the backend.

    Args:
        participant_id: The participant's unique ID
        backend_url: Base URL of the backend API

    Returns:
        Participant data including evidence_urls
    """
    url = f"{backend_url}/participants/{participant_id}"
    logger.info(f"[Config] Fetching from backend: {url}")

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Map backend response to config format
        return {
            "participant_id": data["participant_id"],
            "username": data["username"],
            "event_code": data["event_code"],
            "starting_x": data["x"],
            "starting_y": data["y"],
            "location_confirmed": data.get("location_confirmed", False),
            "evidence_urls": data.get("evidence_urls", {}),
            "project_id": os.environ.get("GOOGLE_CLOUD_PROJECT"),
            "api_base": backend_url,
        }
    except requests.exceptions.RequestException as e:
        logger.error(f"[Config] Failed to fetch from backend: {e}")
        raise


def get_config(force_refresh: bool = False) -> dict:
    """
    Get participant configuration from the best available source.

    Priority:
    1. Cached config (unless force_refresh)
    2. Environment variables + backend API (for Cloud Run)
    3. Local config.json file (for local development)

    Args:
        force_refresh: If True, bypass cache and reload config

    Returns:
        Configuration dict with participant data

    Raises:
        FileNotFoundError: If no config source is available
    """
    global _config_cache

    if _config_cache is not None and not force_refresh:
        return _config_cache

    # Option 1: Cloud Run - check for PARTICIPANT_ID env var
    participant_id = os.environ.get("PARTICIPANT_ID")
    if participant_id:
        backend_url = os.environ.get(
            "BACKEND_URL",
            os.environ.get("API_BASE", "https://api.waybackhome.dev")
        )
        logger.info(f"[Config] Cloud Run mode - fetching for participant: {participant_id}")
        _config_cache = fetch_from_backend(participant_id, backend_url)
        return _config_cache

    # Option 2: Local - find and read config.json
    config_path = find_config_file()

    if config_path:
        logger.info(f"[Config] Local mode - loading from: {config_path}")
        with open(config_path) as f:
            _config_cache = json.load(f)
        return _config_cache

    # No config available
    raise FileNotFoundError(
        "No configuration available.\n"
        "For local development: Ensure config.json exists in project root.\n"
        "For Cloud Run: Set PARTICIPANT_ID and BACKEND_URL environment variables."
    )


def get_project_id() -> str:
    """
    Get the Google Cloud Project ID.

    Priority:
    1. GOOGLE_CLOUD_PROJECT env var (standard for Cloud Run)
    2. PROJECT_ID env var (alternative)
    3. project_id from config.json

    Returns:
        Project ID string

    Raises:
        ValueError: If no project ID is available
    """
    # Check environment variables first
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT") or os.environ.get("PROJECT_ID")

    if project_id:
        return project_id

    # Fall back to config.json
    try:
        config = get_config()
        project_id = config.get("project_id")
        if project_id:
            return project_id
    except FileNotFoundError:
        pass

    raise ValueError(
        "No project ID available.\n"
        "Set GOOGLE_CLOUD_PROJECT environment variable or include project_id in config.json."
    )


def get_evidence_urls() -> dict:
    """
    Get evidence URLs from config.

    Returns:
        dict with 'soil', 'flora', 'stars' keys mapping to URLs
    """
    config = get_config()
    return config.get("evidence_urls", {})


def get_participant_id() -> str:
    """Get participant ID from config."""
    return get_config()["participant_id"]


def get_coordinates() -> tuple[int, int]:
    """Get starting coordinates as (x, y) tuple."""
    config = get_config()
    return (config.get("starting_x", 0), config.get("starting_y", 0))


def get_backend_url() -> str:
    """Get backend API URL."""
    # Check env var first (for Cloud Run)
    backend_url = os.environ.get("BACKEND_URL") or os.environ.get("API_BASE")
    if backend_url:
        return backend_url

    # Fall back to config
    config = get_config()
    return config.get("api_base", "https://api.waybackhome.dev")
