from typing import Dict, Any

class GQLBuilder:
    def build_help_query(self, survivor_name: str, need: str) -> str:
        # Example: Construct GQL to find who can help
        # Note: Spanner Graph syntax might vary, this is illustrative
        return f"""
        GRAPH SurvivorGraph
        MATCH (helper:Survivor)-[:HAS_SKILL]->(skill:Skill)-[:TREATS]->(need:Need)<-[:HAS_NEED]-(person:Survivor)
        WHERE person.name = "{survivor_name}" AND need.type = "{need}"
        RETURN helper, skill
        """
        
    def build_path_query(self, source_id: str, target_id: str) -> str:
        return f"""
        GRAPH SurvivorGraph
        MATCH p = SHORTEST_PATH( (n1)-[*]->(n2) )
        WHERE n1.id = "{source_id}" AND n2.id = "{target_id}"
        RETURN p
        """
