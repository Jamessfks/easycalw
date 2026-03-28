#!/usr/bin/env python3
"""Create the guides table in Supabase.

Usage:
    # Option 1: Set DATABASE_URL and run this script
    DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres python setup_supabase.py

    # Option 2: Copy backend/supabase_schema.sql into the Supabase Dashboard SQL Editor
    #           https://supabase.com/dashboard/project/shfexblwukngbrliihmr/sql/new
"""

import asyncio
import os
import sys


async def main():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("ERROR: Set DATABASE_URL to your Supabase direct connection string.")
        print("Example: DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.shfexblwukngbrliihmr.supabase.co:5432/postgres")
        print()
        print("Alternatively, paste the contents of backend/supabase_schema.sql")
        print("into the Supabase Dashboard SQL Editor.")
        sys.exit(1)

    try:
        import asyncpg
    except ImportError:
        print("Installing asyncpg...")
        os.system(f"{sys.executable} -m pip install asyncpg")
        import asyncpg

    schema_path = os.path.join(os.path.dirname(__file__), "supabase_schema.sql")
    with open(schema_path) as f:
        sql = f.read()

    conn = await asyncpg.connect(db_url)
    try:
        await conn.execute(sql)
        print("SUCCESS: guides table created with indexes and triggers.")

        # Verify
        count = await conn.fetchval("SELECT COUNT(*) FROM guides")
        print(f"Verification: guides table has {count} rows.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
