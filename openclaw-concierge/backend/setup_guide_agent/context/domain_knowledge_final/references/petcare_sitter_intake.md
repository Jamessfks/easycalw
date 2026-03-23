---
Source: https://lobehub.com/skills/openclaw-skills-pet-sitter-intake
Title: "pet-sitter-intake — OpenClaw Skill"
Author: basilanathan (openclaw)
Date: 2026-03-14
Type: reference
---

## Pet Sitter Client Intake Form Generator

Generates polished, client-ready PDF intake forms tailored for pet sitting businesses. With minimal inputs the skill produces branded, fillable PDFs.

### Features
- **Fillable PDF Fields** — Interactive text fields and checkboxes for digital completion
- **7 Color Themes** — lavender, ocean, forest, rose, sunset, neutral, midnight
- **Multi-Pet Support** — Generate forms with 1-10 pet profile sections
- **Service Templates** — Specialized sections for boarding, walking, drop-in visits
- **Home Access Section** — Key codes, alarm info, WiFi, parking (for in-home sitting)
- **Config File Support** — Save business presets in YAML for reuse

### Inputs Required
1. Business name (required)
2. Sitter name (optional)
3. Services offered
4. Location (city/state)
5. Contact info
6. Color theme (optional)
7. Service type (general, boarding, walking, drop_in)
8. Number of pets (optional)

### Form Sections Generated
- **Page 1 — Pet Owner Information:** Owner details, emergency contact, veterinarian info, authorized pickup, communication preferences
- **Page 2 — Home Access:** Entry method, alarm code, WiFi, parking, thermostat, house rules
- **Page 3 — Pet Profile:** Name, species, breed, age, weight, microchip, license
- **Page 4 — Vaccinations:** Interactive checkboxes (Rabies, DHPP, Bordetella, FVRCP, FeLV, Canine Influenza)
- **Page 5 — Health & Behavior:** Allergies, medications, behavior assessment, fear triggers, commands known
- **Page 6 — Feeding & Daily Care:** Food details, schedule, treats, exercise needs
- **Page 7 — Service-Specific:** Boarding (drop-off/pickup), Walking (leash behavior, routes), Drop-in (task checklist)
- **Final Page — Authorization:** Emergency vet care, transport, photo release, cancellation policy, signature

### Installation
```
pip install reportlab pyyaml
python scripts/generate_form.py --business-name "Happy Paws" --theme ocean --service-type boarding --pets 2
```

Requirements: Python 3.8+, reportlab, pyyaml (optional)
