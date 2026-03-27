# Supabase Setup for EasyClaw

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New Project**.
3. Choose your organization, set a project name (e.g. `easyclaw`), pick a strong database password, and select a region close to your Railway deployment.
4. Wait for provisioning (~2 minutes).

### Get your credentials

1. Go to **Project Settings → API**.
2. Copy:
   - **Project URL** — this is your `SUPABASE_URL`
   - **service_role key** (under "Project API keys") — this is your `SUPABASE_SERVICE_ROLE_KEY`

> The service_role key bypasses Row Level Security. Keep it server-side only.

---

## 2. Create the `guides` Table

Open the **SQL Editor** in your Supabase dashboard and run:

```sql
CREATE TABLE guides (
    id BIGSERIAL PRIMARY KEY,
    guide_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'generating',
    message TEXT,
    formatted_transcript TEXT,
    agent_session_id TEXT,
    agent_cost_usd NUMERIC(8, 4),
    agent_turns INTEGER,
    agent_duration_ms INTEGER,
    setup_guide TEXT,
    reference_documents JSONB DEFAULT '[]',
    prompts_to_send TEXT,
    scorecard JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guides_guide_id ON guides(guide_id);
CREATE INDEX idx_guides_created_at ON guides(created_at);
```

### Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guides_updated_at
    BEFORE UPDATE ON guides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

---

## 3. Add Environment Variables to Railway

In the Railway dashboard for your service:

1. Go to **Variables**.
2. Add:
   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
   ```
3. Redeploy the service.

The `GuideStore` in `supabase_store.py` auto-detects these vars. If they are not set, it falls back to in-memory storage — no breakage.

---

## 4. One-Time Migration from guide_store.json

Run this script once to migrate existing guides into Supabase:

```python
#!/usr/bin/env python3
"""Migrate guide_store.json → Supabase. Run once."""

import asyncio, json, os, sys

async def migrate():
    from supabase._async.client import create_client

    store_path = sys.argv[1] if len(sys.argv) > 1 else "/tmp/easyclaw_guide_store.json"
    if not os.path.exists(store_path):
        print(f"No file at {store_path}")
        return

    with open(store_path) as f:
        guides = json.load(f)

    sb = await create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )

    migrated = 0
    for guide_id, data in guides.items():
        row = {"guide_id": guide_id, "status": data.get("status", "unknown")}
        # Map known fields
        for field in (
            "message", "formatted_transcript", "agent_session_id",
            "setup_guide", "prompts_to_send",
        ):
            if field in data:
                row[field] = data[field]
        for field in ("agent_cost_usd",):
            if field in data:
                row[field] = float(data[field]) if data[field] is not None else None
        for int_field in ("agent_turns", "agent_duration_ms"):
            if int_field in data:
                row[int_field] = int(data[int_field]) if data[int_field] is not None else None
        for json_field in ("reference_documents", "scorecard"):
            if json_field in data:
                row[json_field] = data[json_field]

        await sb.table("guides").upsert(row, on_conflict="guide_id").execute()
        migrated += 1

    print(f"Migrated {migrated} guides to Supabase.")

asyncio.run(migrate())
```

Save as `backend/migrate_to_supabase.py` and run:

```bash
cd backend
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python migrate_to_supabase.py /path/to/guide_store.json
```

---

## 5. Wire It Up (Separate Step)

Once verified, replace the in-memory `guide_store` dict in `main.py` with:

```python
from supabase_store import GuideStore
guide_store = GuideStore()
```

This is a separate task — test the store in isolation first.
