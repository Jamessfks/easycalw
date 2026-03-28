"""End-to-end test: format -> generate-guide -> poll -> check 6-phase -> check supabase."""
import os
import sys
import json
import time
import httpx

BASE = "http://localhost:8000"
TRANSCRIPT_PATH = "evals/test_transcripts/restaurant.md"

def main():
    transcript = open(TRANSCRIPT_PATH).read()

    # Step 1: Format
    print("=== STEP 1: FORMAT ===")
    r = httpx.post(f"{BASE}/format", json={"transcript": transcript}, timeout=30)
    r.raise_for_status()
    formatted = r.json()["formatted"]
    print(f"Formatted: {len(formatted)} chars")

    # Step 2: Generate guide
    print("\n=== STEP 2: GENERATE GUIDE ===")
    r = httpx.post(f"{BASE}/generate-guide", json={
        "formatted_transcript": formatted,
        "selected_outputs": ["setup_guide", "prompts", "reference_docs"],
    }, timeout=30)
    r.raise_for_status()
    gen = r.json()
    guide_id = gen["guide_id"]
    print(f"Guide ID: {guide_id}, Status: {gen['status']}")

    # Step 3: Poll until complete
    print("\n=== STEP 3: POLL ===")
    for i in range(90):  # up to 15 minutes
        r = httpx.get(f"{BASE}/guide/{guide_id}", timeout=30)
        data = r.json()
        status = data.get("status", "unknown")
        print(f"  [{time.strftime('%H:%M:%S')}] Poll {i+1}: status={status}")
        if status in ("complete", "error"):
            break
        time.sleep(10)

    if status == "error":
        print(f"\nERROR: {data.get('message', 'unknown')}")
        sys.exit(1)

    # Step 4: Check 6-phase format
    print("\n=== STEP 4: CHECK 6-PHASE FORMAT ===")
    outputs = data.get("outputs", {})
    guide_text = outputs.get("setup_guide", "") or ""
    guide_chars = len(guide_text)
    print(f"Guide chars: {guide_chars}")

    phases_found = []
    for i in range(1, 7):
        markers = [
            f"Phase {i}",
            f"PHASE {i}",
            f"phase {i}",
            f"## Phase {i}",
            f"# Phase {i}",
        ]
        found = any(m.lower() in guide_text.lower() for m in markers)
        if found:
            phases_found.append(i)
    print(f"Phases found: {phases_found}")
    all_phases = len(phases_found) == 6

    prompts_text = outputs.get("prompts_to_send", "") or ""
    ref_docs = outputs.get("reference_documents", []) or []
    print(f"Prompts: {len(prompts_text)} chars")
    print(f"Reference docs: {len(ref_docs)} items")

    # Step 5: Check Supabase
    print("\n=== STEP 5: CHECK SUPABASE ===")
    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_saved = False
    if supabase_url and supabase_key:
        try:
            r = httpx.get(
                f"{supabase_url}/rest/v1/guides?guide_id=eq.{guide_id}&select=guide_id,status,created_at",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                },
                timeout=10,
            )
            rows = r.json()
            if rows and len(rows) > 0:
                supabase_saved = True
                print(f"Supabase: SAVED (created_at={rows[0].get('created_at', '?')})")
            else:
                print("Supabase: NOT FOUND")
        except Exception as e:
            print(f"Supabase check failed: {e}")
    else:
        print("Supabase: NOT CONFIGURED")

    # Step 6: Report
    print("\n" + "=" * 50)
    print("=== E2E TEST REPORT ===")
    print("=" * 50)
    print(f"Guide ID:        {guide_id}")
    print(f"Guide chars:     {guide_chars}")
    print(f"Phases found:    {phases_found} ({'ALL 6' if all_phases else 'INCOMPLETE'})")
    print(f"Prompts chars:   {len(prompts_text)}")
    print(f"Ref docs:        {len(ref_docs)}")
    print(f"Supabase saved:  {supabase_saved}")
    print(f"Scorecard:       {json.dumps(data.get('scorecard', {}), indent=2)[:500]}")
    print(f"Quality eval:    {json.dumps(data.get('quality_eval', {}), indent=2)[:500]}")

    issues = []
    if guide_chars < 500:
        issues.append(f"Guide too short ({guide_chars} chars)")
    if not all_phases:
        missing = [i for i in range(1, 7) if i not in phases_found]
        issues.append(f"Missing phases: {missing}")
    if not supabase_saved:
        issues.append("Not saved to Supabase")
    if not prompts_text:
        issues.append("No prompts_to_send content")

    if issues:
        print(f"\nISSUES: {issues}")
    else:
        print("\nNO ISSUES - ALL CHECKS PASSED")

    # Write summary for system event
    summary = f"guide_chars={guide_chars}, phases={len(phases_found)}/6, supabase={'yes' if supabase_saved else 'no'}, issues={len(issues)}"
    print(f"\nSUMMARY: {summary}")
    return 0 if not issues else 1

if __name__ == "__main__":
    sys.exit(main())
