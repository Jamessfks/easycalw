"""
Survivor Network Database Setup Script
Run: python setup_database.py
Or:  python setup_database.py --project=your-project-id
"""

from google.cloud import spanner
from google.cloud.spanner_admin_instance_v1 import (
    Instance as InstancePB,
    CreateInstanceRequest,
)
from google.cloud.spanner_admin_database_v1.types import spanner_database_admin
import argparse
import time
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration - load from environment variables with defaults
INSTANCE_ID = os.getenv("INSTANCE_ID", "survivor-network")
DATABASE_ID = os.getenv("DATABASE_ID", "graph-db")
GRAPH_NAME = os.getenv("GRAPH_NAME", "SurvivorGraph")
PROJECT_ID = os.getenv("PROJECT_ID", None)
REGION = os.getenv("REGION", "us-central1")

# DDL Statements
DDL_STATEMENTS = [
    # Node Tables
    """CREATE TABLE Biomes (
        biome_id STRING(36) NOT NULL,
        name STRING(50) NOT NULL,
        quadrant STRING(5),
        color STRING(7),
        icon STRING(50),
        description STRING(MAX)
    ) PRIMARY KEY (biome_id)""",
    
    """CREATE TABLE Skills (
        skill_id STRING(36) NOT NULL,
        name STRING(100) NOT NULL,
        category STRING(50),
        icon STRING(50),
        color STRING(7),
        description STRING(MAX)
    ) PRIMARY KEY (skill_id)""",
    
    """CREATE TABLE Needs (
        need_id STRING(36) NOT NULL,
        description STRING(MAX) NOT NULL,
        category STRING(50),
        urgency STRING(20),
        icon STRING(50)
    ) PRIMARY KEY (need_id)""",
    
    """CREATE TABLE Resources (
        resource_id STRING(36) NOT NULL,
        name STRING(100) NOT NULL,
        type STRING(50),
        icon STRING(50),
        biome STRING(20),
        description STRING(MAX)
    ) PRIMARY KEY (resource_id)""",
    
    """CREATE TABLE Survivors (
        survivor_id STRING(36) NOT NULL,
        name STRING(100),
        callsign STRING(20),
        role STRING(50),
        biome STRING(20),
        quadrant STRING(5),
        status STRING(20),
        avatar_url STRING(500),
        color STRING(7),
        x_position FLOAT64,
        y_position FLOAT64,
        description STRING(MAX),
        created_at TIMESTAMP
    ) PRIMARY KEY (survivor_id)""",
    
    """CREATE TABLE Broadcasts (
        broadcast_id STRING(36) NOT NULL,
        survivor_id STRING(36) NOT NULL,
        broadcast_type STRING(20),
        title STRING(200),
        gcs_uri STRING(500),
        thumbnail_url STRING(500),
        duration_seconds INT64,
        transcript STRING(MAX),
        processed BOOL,
        processed_at TIMESTAMP,
        created_at TIMESTAMP
    ) PRIMARY KEY (broadcast_id)""",
    
    # Edge Tables
    """CREATE TABLE SurvivorHasSkill (
        survivor_id STRING(36) NOT NULL,
        skill_id STRING(36) NOT NULL,
        proficiency STRING(20)
    ) PRIMARY KEY (survivor_id, skill_id)""",
    
    """CREATE TABLE SurvivorHasNeed (
        survivor_id STRING(36) NOT NULL,
        need_id STRING(36) NOT NULL,
        status STRING(20)
    ) PRIMARY KEY (survivor_id, need_id)""",
    
    """CREATE TABLE SurvivorFoundResource (
        survivor_id STRING(36) NOT NULL,
        resource_id STRING(36) NOT NULL,
        found_at TIMESTAMP
    ) PRIMARY KEY (survivor_id, resource_id)""",
    
    """CREATE TABLE SurvivorInBiome (
        survivor_id STRING(36) NOT NULL,
        biome_id STRING(36) NOT NULL
    ) PRIMARY KEY (survivor_id, biome_id)""",
    
    """CREATE TABLE SurvivorCanHelp (
        helper_id STRING(36) NOT NULL,
        helpee_id STRING(36) NOT NULL,
        reason STRING(MAX),
        match_score FLOAT64,
        skill_id STRING(36),
        need_id STRING(36)
    ) PRIMARY KEY (helper_id, helpee_id)""",
    
    """CREATE TABLE SkillTreatsNeed (
        skill_id STRING(36) NOT NULL,
        need_id STRING(36) NOT NULL,
        effectiveness STRING(20)
    ) PRIMARY KEY (skill_id, need_id)""",
]


def insert_data(database):
    """Insert all data into the database."""
    
    def insert_nodes(transaction):
        # Biomes
        transaction.insert(
            "Biomes",
            columns=["biome_id", "name", "quadrant", "color", "icon", "description"],
            values=[
                ("biome_bioluminescent", "BIOLUMINESCENT", "SW", "#A78BFA", "B", "Glowing forest"),
                ("biome_cryo", "CRYO", "NW", "#60A5FA", "X", "Frozen tundra"),
                ("biome_fossilized", "FOSSILIZED", "SE", "#FBBF24", "F", "Fossil region"),
                ("biome_volcanic", "VOLCANIC", "NE", "#F87171", "V", "Volcanic region"),
            ]
        )
        
        # Skills
        transaction.insert(
            "Skills",
            columns=["skill_id", "name", "category", "icon", "color", "description"],
            values=[
                ("skill_botany", "Botany", "science", "B", "#8B5CF6", None),
                ("skill_cartography", "Cartography", "science", "C", "#8B5CF6", None),
                ("skill_engineering", "Engineering", "technical", "E", "#3B82F6", None),
                ("skill_first_aid", "First Aid", "medical", "F", "#EF4444", None),
                ("skill_foraging", "Foraging", "survival", "F", "#10B981", None),
                ("skill_leadership", "Leadership", "leadership", "L", "#F59E0B", None),
                ("skill_medical_training", "Medical Training", "medical", "M", "#EF4444", None),
                ("skill_navigation", "Navigation", "technical", "N", "#3B82F6", None),
                ("skill_pilot", "Pilot", "technical", "P", "#3B82F6", None),
                ("skill_xenobiology", "Xenobiology", "science", "X", "#8B5CF6", None),
            ]
        )
        
        # Needs
        transaction.insert(
            "Needs",
            columns=["need_id", "description", "category", "urgency", "icon"],
            values=[
                ("need_chen_food", "Need food", "survival", "medium", "F"),
                ("need_chen_materials", "Need materials", "technical", "low", "M"),
                ("need_frost_analysis", "Analyze specimens", "science", "low", "A"),
                ("need_frost_arm", "Arm injury", "medical", "low", "N"),
                ("need_park_ankle", "Sprained ankle", "medical", "low", "A"),
                ("need_park_samples", "Analyze samples", "science", "low", "S"),
                ("need_tanaka_burns", "Burns", "medical", "medium", "B"),
            ]
        )
        
        # Resources
        transaction.insert(
            "Resources",
            columns=["resource_id", "name", "type", "icon", "biome", "description"],
            values=[
                ("resource_amber", "Amber Fuel", "power", "A", "FOSSILIZED", None),
                ("resource_fresh_water", "Fresh Water", "water", "W", "CRYO", None),
                ("resource_fungi", "Fungi", "tool", "F", "BIOLUMINESCENT", None),
                ("resource_geothermal", "Geothermal Power", "power", "G", "VOLCANIC", None),
                ("resource_hot_springs", "Hot Springs", "shelter", "H", "VOLCANIC", None),
                ("resource_ice_cave", "Ice Cave", "shelter", "I", "CRYO", None),
                ("resource_medicinal_plants", "Medicinal Plants", "medical", "M", "BIOLUMINESCENT", None),
                ("resource_salvaged_tools", "Salvaged Tools", "tool", "T", "FOSSILIZED", None),
            ]
        )
        
        # Survivors
        timestamp = "2026-01-09T11:51:58.482898948Z"
        transaction.insert(
            "Survivors",
            columns=["survivor_id", "name", "callsign", "role", "biome", "quadrant", "status", "avatar_url", "color", "x_position", "y_position", "description", "created_at"],
            values=[
                ("survivor_chen", "David Chen", "Forge-4", "Engineer", "FOSSILIZED", "SE", "active", "/avatars/chen.png", "#FBBF24", 450.0, 350.0, "Engineer", timestamp),
                ("survivor_frost", "Dr. Elena Frost", "Frost-7", "Xenobiologist", "CRYO", "NW", "active", "/avatars/frost.png", "#60A5FA", 150.0, 100.0, "Xenobiologist", timestamp),
                ("survivor_park", "Lt. Sarah Park", "Glow-2", "Navigator", "BIOLUMINESCENT", "SW", "active", "/avatars/park.png", "#A78BFA", 150.0, 350.0, "Navigator", timestamp),
                ("survivor_tanaka", "Captain Yuki Tanaka", "Ember-1", "Pilot", "VOLCANIC", "NE", "active", "/avatars/tanaka.png", "#F87171", 450.0, 100.0, "Pilot", timestamp),
            ]
        )
    
    def insert_edges(transaction):
        # SurvivorHasSkill
        transaction.insert(
            "SurvivorHasSkill",
            columns=["survivor_id", "skill_id", "proficiency"],
            values=[
                ("survivor_chen", "skill_engineering", "expert"),
                ("survivor_chen", "skill_first_aid", "basic"),
                ("survivor_frost", "skill_medical_training", "proficient"),
                ("survivor_frost", "skill_xenobiology", "expert"),
                ("survivor_park", "skill_botany", "proficient"),
                ("survivor_park", "skill_cartography", "expert"),
                ("survivor_park", "skill_navigation", "expert"),
                ("survivor_tanaka", "skill_leadership", "expert"),
                ("survivor_tanaka", "skill_pilot", "expert"),
            ]
        )
        
        # SurvivorHasNeed
        transaction.insert(
            "SurvivorHasNeed",
            columns=["survivor_id", "need_id", "status"],
            values=[
                ("survivor_chen", "need_chen_food", "active"),
                ("survivor_chen", "need_chen_materials", "active"),
                ("survivor_frost", "need_frost_analysis", "active"),
                ("survivor_frost", "need_frost_arm", "active"),
                ("survivor_park", "need_park_ankle", "active"),
                ("survivor_park", "need_park_samples", "active"),
                ("survivor_tanaka", "need_tanaka_burns", "active"),
            ]
        )
        
        # SurvivorFoundResource
        found_timestamp = "2026-01-09T11:52:17.437279487Z"
        transaction.insert(
            "SurvivorFoundResource",
            columns=["survivor_id", "resource_id", "found_at"],
            values=[
                ("survivor_chen", "resource_amber", found_timestamp),
                ("survivor_chen", "resource_salvaged_tools", found_timestamp),
                ("survivor_frost", "resource_fresh_water", found_timestamp),
                ("survivor_frost", "resource_ice_cave", found_timestamp),
                ("survivor_park", "resource_fungi", found_timestamp),
                ("survivor_park", "resource_medicinal_plants", found_timestamp),
                ("survivor_tanaka", "resource_geothermal", found_timestamp),
                ("survivor_tanaka", "resource_hot_springs", found_timestamp),
            ]
        )
        
        # SurvivorInBiome
        transaction.insert(
            "SurvivorInBiome",
            columns=["survivor_id", "biome_id"],
            values=[
                ("survivor_chen", "biome_fossilized"),
                ("survivor_frost", "biome_cryo"),
                ("survivor_park", "biome_bioluminescent"),
                ("survivor_tanaka", "biome_volcanic"),
            ]
        )
        
        # SurvivorCanHelp
        transaction.insert(
            "SurvivorCanHelp",
            columns=["helper_id", "helpee_id", "reason", "match_score", "skill_id", "need_id"],
            values=[
                ("survivor_chen", "survivor_tanaka", "Chen has first aid", 0.65, "skill_first_aid", "need_tanaka_burns"),
                ("survivor_frost", "survivor_park", "Frost can analyze samples", 0.9, "skill_xenobiology", "need_park_samples"),
                ("survivor_frost", "survivor_tanaka", "Frost can treat burns", 0.95, "skill_medical_training", "need_tanaka_burns"),
            ]
        )
        
        # SkillTreatsNeed
        transaction.insert(
            "SkillTreatsNeed",
            columns=["skill_id", "need_id", "effectiveness"],
            values=[
                ("skill_engineering", "need_chen_materials", "high"),
                ("skill_first_aid", "need_park_ankle", "high"),
                ("skill_foraging", "need_chen_food", "high"),
                ("skill_medical_training", "need_frost_arm", "high"),
                ("skill_medical_training", "need_tanaka_burns", "high"),
                ("skill_xenobiology", "need_frost_analysis", "high"),
                ("skill_xenobiology", "need_park_samples", "high"),
            ]
        )
    
    print("Inserting node data...")
    database.run_in_transaction(insert_nodes)
    print("Inserting edge data...")
    database.run_in_transaction(insert_edges)
    print("Data insertion complete!")


def create_graphs(database, graph_name):
    """Create property graphs."""
    
    graph1_ddl = f"""
    CREATE OR REPLACE PROPERTY GRAPH {graph_name}
      NODE TABLES (
        Biomes KEY (biome_id) LABEL Biome PROPERTIES (biome_id, name, quadrant, color, icon, description),
        Needs KEY (need_id) LABEL Need PROPERTIES (need_id, description, category, urgency, icon),
        Resources KEY (resource_id) LABEL Resource PROPERTIES (resource_id, name, type, icon, biome, description),
        Skills KEY (skill_id) LABEL Skill PROPERTIES (skill_id, name, category, icon, color, description),
        Survivors KEY (survivor_id) LABEL Survivor PROPERTIES (survivor_id, name, callsign, role, biome, quadrant, status, avatar_url, color, x_position, y_position, description)
      )
      EDGE TABLES (
        SurvivorHasSkill KEY (survivor_id, skill_id) SOURCE KEY (survivor_id) REFERENCES Survivors (survivor_id) DESTINATION KEY (skill_id) REFERENCES Skills (skill_id) LABEL HAS_SKILL PROPERTIES (proficiency),
        SurvivorHasNeed KEY (survivor_id, need_id) SOURCE KEY (survivor_id) REFERENCES Survivors (survivor_id) DESTINATION KEY (need_id) REFERENCES Needs (need_id) LABEL HAS_NEED PROPERTIES (status),
        SurvivorFoundResource KEY (survivor_id, resource_id) SOURCE KEY (survivor_id) REFERENCES Survivors (survivor_id) DESTINATION KEY (resource_id) REFERENCES Resources (resource_id) LABEL FOUND PROPERTIES (found_at),
        SurvivorInBiome KEY (survivor_id, biome_id) SOURCE KEY (survivor_id) REFERENCES Survivors (survivor_id) DESTINATION KEY (biome_id) REFERENCES Biomes (biome_id) LABEL IN_BIOME PROPERTIES (survivor_id, biome_id),
        SurvivorCanHelp KEY (helper_id, helpee_id) SOURCE KEY (helper_id) REFERENCES Survivors (survivor_id) DESTINATION KEY (helpee_id) REFERENCES Survivors (survivor_id) LABEL CAN_HELP PROPERTIES (reason, match_score, skill_id, need_id),
        SkillTreatsNeed KEY (skill_id, need_id) SOURCE KEY (skill_id) REFERENCES Skills (skill_id) DESTINATION KEY (need_id) REFERENCES Needs (need_id) LABEL TREATS PROPERTIES (effectiveness)
      )
    """
    
    graph2_ddl = """
    CREATE OR REPLACE PROPERTY GRAPH SurvivorNetwork
      NODE TABLES (
        Biomes KEY (biome_id) LABEL Biomes PROPERTIES (biome_id, name, quadrant, color, icon, description),
        Broadcasts KEY (broadcast_id) LABEL Broadcasts PROPERTIES (broadcast_id, survivor_id, broadcast_type, title, gcs_uri, thumbnail_url, duration_seconds, transcript, processed, processed_at, created_at),
        Needs KEY (need_id) LABEL Needs PROPERTIES (need_id, description, category, urgency, icon),
        Resources KEY (resource_id) LABEL Resources PROPERTIES (resource_id, name, type, icon, biome, description),
        Skills KEY (skill_id) LABEL Skills PROPERTIES (skill_id, name, category, icon, color, description),
        Survivors KEY (survivor_id) LABEL Survivors PROPERTIES (survivor_id, name, callsign, role, biome, quadrant, status, avatar_url, color, x_position, y_position, description, created_at)
      )
      EDGE TABLES (
        SurvivorHasSkill KEY (survivor_id, skill_id) SOURCE KEY (survivor_id) REFERENCES Survivors (survivor_id) DESTINATION KEY (skill_id) REFERENCES Skills (skill_id) LABEL SurvivorHasSkill PROPERTIES (survivor_id, skill_id, proficiency),
        SurvivorHasNeed KEY (survivor_id, need_id) SOURCE KEY (survivor_id) REFERENCES Survivors (survivor_id) DESTINATION KEY (need_id) REFERENCES Needs (need_id) LABEL SurvivorHasNeed PROPERTIES (survivor_id, need_id, status),
        SurvivorFoundResource KEY (survivor_id, resource_id) SOURCE KEY (survivor_id) REFERENCES Survivors (survivor_id) DESTINATION KEY (resource_id) REFERENCES Resources (resource_id) LABEL SurvivorFoundResource PROPERTIES (survivor_id, resource_id, found_at),
        SurvivorInBiome KEY (survivor_id, biome_id) SOURCE KEY (survivor_id) REFERENCES Survivors (survivor_id) DESTINATION KEY (biome_id) REFERENCES Biomes (biome_id) LABEL SurvivorInBiome PROPERTIES (survivor_id, biome_id),
        SurvivorCanHelp KEY (helper_id, helpee_id) SOURCE KEY (helper_id) REFERENCES Survivors (survivor_id) DESTINATION KEY (helpee_id) REFERENCES Survivors (survivor_id) LABEL SurvivorCanHelp PROPERTIES (helper_id, helpee_id, reason, match_score, skill_id, need_id),
        SkillTreatsNeed KEY (skill_id, need_id) SOURCE KEY (skill_id) REFERENCES Skills (skill_id) DESTINATION KEY (need_id) REFERENCES Needs (need_id) LABEL SkillTreatsNeed PROPERTIES (skill_id, need_id, effectiveness)
      )
    """
    
    print(f"Creating {graph_name}...")
    operation = database.update_ddl([graph1_ddl])
    operation.result()
    
    print("Creating SurvivorNetwork...")
    operation = database.update_ddl([graph2_ddl])
    operation.result()
    
    print("Graphs created!")


def create_instance_with_enterprise(client, project_id, instance_id, region):
    """Create a Spanner instance with ENTERPRISE edition using the admin API."""
    config_name = f"projects/{project_id}/instanceConfigs/regional-{region}"
    instance_name = f"projects/{project_id}/instances/{instance_id}"
    
    instance_admin_client = client.instance_admin_api
    
    instance_pb = InstancePB(
        name=instance_name,
        config=config_name,
        display_name="Survivor Network",
        processing_units=100,
        edition=InstancePB.Edition.ENTERPRISE,
    )
    
    request = CreateInstanceRequest(
        parent=f"projects/{project_id}",
        instance_id=instance_id,
        instance=instance_pb,
    )
    
    operation = instance_admin_client.create_instance(request=request)
    return operation


def print_config():
    """Print current configuration."""
    print("\n" + "=" * 60)
    print("Current Configuration (from environment):")
    print("=" * 60)
    print(f"  PROJECT_ID:   {PROJECT_ID or 'Not set (use --project flag)'}")
    print(f"  INSTANCE_ID:  {INSTANCE_ID}")
    print(f"  DATABASE_ID:  {DATABASE_ID}")
    print(f"  GRAPH_NAME:   {GRAPH_NAME}")
    print(f"  REGION:       {REGION}")
    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description='Setup Survivor Network Database')
    parser.add_argument('--project', help='Google Cloud Project ID (overrides PROJECT_ID env var)')
    parser.add_argument('--instance', help='Spanner Instance ID (overrides INSTANCE_ID env var)')
    parser.add_argument('--database', help='Spanner Database ID (overrides DATABASE_ID env var)')
    parser.add_argument('--graph', help='Graph name (overrides GRAPH_NAME env var)')
    parser.add_argument('--region', help='GCP Region (overrides REGION env var)')
    parser.add_argument('--skip-instance', action='store_true', help='Skip instance creation (if exists)')
    parser.add_argument('--force', action='store_true', help='Delete and recreate database if exists')
    parser.add_argument('--show-config', action='store_true', help='Show current configuration and exit')
    args = parser.parse_args()
    
    # Use command line args or fall back to environment variables
    project_id = args.project or PROJECT_ID
    instance_id = args.instance or INSTANCE_ID
    database_id = args.database or DATABASE_ID
    graph_name = args.graph or GRAPH_NAME
    region = args.region or REGION
    
    # Show config if requested
    if args.show_config:
        print_config()
        return
    
    # Validate project_id
    if not project_id:
        print("ERROR: PROJECT_ID is required.")
        print("Set it via:")
        print("  1. Environment variable: export PROJECT_ID=your-project-id")
        print("  2. .env file: PROJECT_ID=your-project-id")
        print("  3. Command line: python setup_database.py --project=your-project-id")
        return
    
    print("\n" + "=" * 60)
    print("Survivor Network Database Setup")
    print("=" * 60)
    print(f"  Project:   {project_id}")
    print(f"  Instance:  {instance_id}")
    print(f"  Database:  {database_id}")
    print(f"  Graph:     {graph_name}")
    print(f"  Region:    {region}")
    print("=" * 60 + "\n")
    
    client = spanner.Client(project=project_id)
    
    # Get instance reference and check if it exists
    instance = client.instance(instance_id)
    instance_exists = instance.exists()
    
    if instance_exists:
        print(f"Instance {instance_id} already exists. Using existing instance.")
    elif not args.skip_instance:
        print(f"Creating instance {instance_id} with ENTERPRISE edition...")
        operation = create_instance_with_enterprise(client, project_id, instance_id, region)
        print("Waiting for instance creation (this may take a few minutes)...")
        operation.result()
        print("Instance created!")
        # Refresh instance reference
        instance = client.instance(instance_id)
    else:
        print("ERROR: Instance does not exist and --skip-instance was specified.")
        return
    
    # Check if database exists
    database = instance.database(database_id)
    database_exists = database.exists()
    
    if database_exists:
        if args.force:
            print(f"Database {database_id} exists. Deleting (--force specified)...")
            database.drop()
            print("Database deleted. Waiting 5 seconds...")
            time.sleep(5)
        else:
            print(f"Database {database_id} already exists.")
            print("Use --force to delete and recreate it.")
            print(f"\nAccess your existing database at:")
            print(f"https://console.cloud.google.com/spanner/instances/{instance_id}/databases/{database_id}?project={project_id}")
            return
    
    # Create database with schema
    print(f"Creating database {database_id} with schema...")
    database = instance.database(database_id, ddl_statements=DDL_STATEMENTS)
    operation = database.create()
    operation.result()
    print("Database and tables created!")
    
    # Insert data
    database = instance.database(database_id)
    insert_data(database)
    
    # Create graphs
    create_graphs(database, graph_name)
    
    print("\n" + "=" * 60)
    print("SUCCESS! Database setup complete.")
    print("=" * 60)
    print(f"\nInstance:  {instance_id}")
    print(f"Database:  {database_id}")
    print(f"Graph:     {graph_name}")
    print(f"\nAccess your database at:")
    print(f"https://console.cloud.google.com/spanner/instances/{instance_id}/databases/{database_id}?project={project_id}")


if __name__ == "__main__":
    main()
    # Force exit to prevent annoying Google Cloud Spanner metrics export errors on shutdown
    # regarding "One or more points were written more frequently..."
    os._exit(0)