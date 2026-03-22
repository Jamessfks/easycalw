from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
KNOWLEDGE_ROOT = BACKEND_ROOT / "openclaw_knowledge"
DOMAIN_DIR = KNOWLEDGE_ROOT / "domain"
SETUP_REQUIREMENTS = KNOWLEDGE_ROOT / "setup_requirements.md"
REGISTRY_HINTS = KNOWLEDGE_ROOT / "registry_hints.md"
