from typing import List, Dict, Any
from models.graph import Node, Edge, GraphData, NodeType, EdgeType
from services.spanner_service import SpannerService

class GraphService:
    def __init__(self, spanner: SpannerService):
        self.spanner = spanner

    async def get_full_graph(self) -> GraphData:
        """
        Fetch all nodes and edges from the Spanner graph.
        Uses direct SQL queries for maximum compatibility.
        """
        try:
            nodes_dict = {}
            edges_list = []
            
            # Execute all queries in a single snapshot
            with self.spanner.database.snapshot() as snapshot:
                # Get survivors
                survivor_query = "SELECT survivor_id, name, role, biome FROM Survivors LIMIT 100"
                survivor_results = list(snapshot.execute_sql(survivor_query))
                
                for row in survivor_results:
                    survivor_id, name, role, biome = row
                    nodes_dict[survivor_id] = Node(
                        id=survivor_id,
                        type=NodeType.SURVIVOR,
                        label=name or "",
                        properties={"role": role or ""},
                        biome=biome or None
                    )
            
            # Get skills in a new snapshot
            with self.spanner.database.snapshot() as snapshot:
                skill_query = "SELECT skill_id, name FROM Skills LIMIT 100"
                skill_results = list(snapshot.execute_sql(skill_query))
                
                for row in skill_results:
                    skill_id, name = row
                    nodes_dict[skill_id] = Node(
                        id=skill_id,
                        type=NodeType.SKILL,
                        label=name or "",
                        properties={}
                    )
            
            # Get needs
            with self.spanner.database.snapshot() as snapshot:
                need_query = "SELECT need_id, description FROM Needs LIMIT 100"
                need_results = list(snapshot.execute_sql(need_query))
                
                for row in need_results:
                    need_id, description = row
                    nodes_dict[need_id] = Node(
                        id=need_id,
                        type=NodeType.NEED,
                        label=description or "",
                        properties={}
                    )
            
            # Get edges: SurvivorHasSkill
            with self.spanner.database.snapshot() as snapshot:
                skill_edge_query = "SELECT survivor_id, skill_id, proficiency FROM SurvivorHasSkill LIMIT 100"
                skill_edge_results = list(snapshot.execute_sql(skill_edge_query))
                
                for row in skill_edge_results:
                    survivor_id, skill_id, proficiency = row
                    edges_list.append(Edge(
                        id=f"{survivor_id}-{skill_id}",
                        source=survivor_id,
                        target=skill_id,
                        type=EdgeType.HAS_SKILL,
                        properties={"proficiency": proficiency or ""}
                    ))
            
            # Get edges: SurvivorHasNeed
            with self.spanner.database.snapshot() as snapshot:
                need_edge_query = "SELECT survivor_id, need_id, status FROM SurvivorHasNeed LIMIT 100"
                need_edge_results = list(snapshot.execute_sql(need_edge_query))
                
                for row in need_edge_results:
                    survivor_id, need_id, status = row
                    edges_list.append(Edge(
                        id=f"{survivor_id}-{need_id}",
                        source=survivor_id,
                        target=need_id,
                        type=EdgeType.HAS_NEED,
                        properties={"status": status or ""}
                    ))
            
            # Get edges: SkillTreatsNeed
            with self.spanner.database.snapshot() as snapshot:
                treats_edge_query = "SELECT skill_id, need_id, effectiveness FROM SkillTreatsNeed LIMIT 100"
                treats_edge_results = list(snapshot.execute_sql(treats_edge_query))
                
                for row in treats_edge_results:
                    skill_id, need_id, effectiveness = row
                    edges_list.append(Edge(
                        id=f"{skill_id}-{need_id}",
                        source=skill_id,
                        target=need_id,
                        type=EdgeType.TREATS,
                        properties={"effectiveness": effectiveness or ""}
                    ))
            
            return GraphData(nodes=list(nodes_dict.values()), edges=edges_list)
            
        except Exception as e:
            print(f"Error fetching full graph: {e}")
            import traceback
            traceback.print_exc()
            # Return mock data as fallback
            return self._get_mock_data()

    async def query_graph(self, gql_query: str) -> GraphData:
        """
        Execute a custom query and return graph data.
        For now, returns the full graph.
        """
        # TODO: Implement custom query parsing
        return await self.get_full_graph()

    def _is_node(self, data: Any) -> bool:
        """Check if data represents a node."""
        if isinstance(data, dict):
            # Nodes typically have 'id', 'type', and 'label'
            return 'id' in data and 'type' in data
        return False

    def _is_edge(self, data: Any) -> bool:
        """Check if data represents an edge."""
        if isinstance(data, dict):
            # Edges typically have 'id', 'source', 'target', and 'type'
            return 'id' in data and 'source' in data and 'target' in data
        return False

    def _parse_node(self, node_data: Any) -> Node:
        """Parse Spanner node data into Node model."""
        if not isinstance(node_data, dict):
            return None
        
        try:
            # Extract node properties
            node_id = node_data.get('id', '')
            node_type = node_data.get('type', 'SURVIVOR')
            label = node_data.get('label', '')
            
            # Extract additional properties
            properties = {k: v for k, v in node_data.items() 
                         if k not in ['id', 'type', 'label', 'biome']}
            
            # Convert string type to NodeType enum
            try:
                node_type_enum = NodeType(node_type.upper())
            except ValueError:
                node_type_enum = NodeType.SURVIVOR
            
            return Node(
                id=node_id,
                type=node_type_enum,
                label=label,
                properties=properties,
                biome=node_data.get('biome', None)
            )
        except Exception as e:
            print(f"Error parsing node: {e}")
            return None

    def _parse_edge(self, edge_data: Any, source_data: Any, target_data: Any) -> Edge:
        """Parse Spanner edge data into Edge model."""
        if not isinstance(edge_data, dict):
            return None
        
        try:
            # Extract edge properties
            edge_id = edge_data.get('id', '')
            source = edge_data.get('source', source_data.get('id', ''))
            target = edge_data.get('target', target_data.get('id', ''))
            edge_type = edge_data.get('type', 'HAS_SKILL')
            
            # Extract additional properties
            properties = {k: v for k, v in edge_data.items() 
                         if k not in ['id', 'source', 'target', 'type']}
            
            # Convert string type to EdgeType enum
            try:
                edge_type_enum = EdgeType(edge_type.upper())
            except ValueError:
                edge_type_enum = EdgeType.HAS_SKILL
            
            return Edge(
                id=edge_id,
                source=source,
                target=target,
                type=edge_type_enum,
                properties=properties
            )
        except Exception as e:
            print(f"Error parsing edge: {e}")
            return None

    def _get_mock_data(self) -> GraphData:
        """Return mock data as fallback."""
        nodes = [
            Node(id="n1", type=NodeType.SURVIVOR, label="Frost", properties={"role": "Xenobiologist"}, biome="CRYO"),
            Node(id="n2", type=NodeType.SURVIVOR, label="Tanaka", properties={"role": "Captain"}, biome="FOSSILIZED"),
            Node(id="n3", type=NodeType.SKILL, label="Medical Training", properties={"level": "Expert"}),
            Node(id="n4", type=NodeType.NEED, label="Burns", properties={"urgency": "High"}),
        ]
        edges = [
            Edge(id="e1", source="n1", target="n3", type=EdgeType.HAS_SKILL, properties={}),
            Edge(id="e2", source="n2", target="n4", type=EdgeType.HAS_NEED, properties={}),
            Edge(id="e3", source="n3", target="n4", type=EdgeType.TREATS, properties={"effectiveness": "High"}),
        ]
        return GraphData(nodes=nodes, edges=edges)

