import os
from typing import List, Dict, Any, Optional
from google.cloud import spanner

class SpannerService:
    def __init__(self):
        # Set credentials if provided
        creds = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if creds:
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = creds
        
        # Initialize Spanner client
        self.client = spanner.Client(project=os.getenv('PROJECT_ID'))
        self.instance = self.client.instance(os.getenv('INSTANCE_ID'))
        self.database = self.instance.database(os.getenv('DATABASE_ID'))
        self.graph_name = os.getenv('GRAPH_NAME')

    def execute_gql(self, query: str) -> List[Dict[str, Any]]:
        """
        Execute a GQL (Graph Query Language) query against Spanner Graph.
        Returns a list of result dictionaries.
        """
        try:
            # Use a snapshot for read operations
            with self.database.snapshot() as snapshot:
                # Execute the GQL query
                # Note: Spanner Graph queries are executed using the execute_sql method
                # with the graph query wrapped in the appropriate syntax
                full_query = f"GRAPH {self.graph_name} {query}"
                
                results = snapshot.execute_sql(full_query)
                
                # Convert results to list of dictionaries
                result_list = []
                for row in results:
                    # Convert row to dictionary
                    row_dict = {}
                    for i, field in enumerate(results.fields):
                        row_dict[field.name] = row[i]
                    result_list.append(row_dict)
                
                return result_list
                
        except Exception as e:
            print(f"Error executing GQL query: {e}")
            raise

    def execute_update(self, query: str) -> None:
        """
        Execute a DML (Data Manipulation Language) query against Spanner Graph.
        Used for INSERT, UPDATE, DELETE operations.
        """
        def _execute_transaction(transaction):
            full_query = f"GRAPH {self.graph_name} {query}"
            transaction.execute_update(full_query)

        try:
            self.database.run_in_transaction(_execute_transaction)
        except Exception as e:
            print(f"Error executing GQL update: {e}")
            raise

    def parse_node(self, node_data: Any) -> Dict[str, Any]:
        """Parse a Spanner graph node into a dictionary."""
        if isinstance(node_data, dict):
            return node_data
        # Handle other node data formats as needed
        return {}

    def parse_edge(self, edge_data: Any) -> Dict[str, Any]:
        """Parse a Spanner graph edge into a dictionary."""
        if isinstance(edge_data, dict):
            return edge_data
        # Handle other edge data formats as needed
        return {}

    async def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific node by ID."""
        try:
            query = f"MATCH (n) WHERE n.id = '{node_id}' RETURN n"
            results = self.execute_gql(query)
            return results[0] if results else None
        except Exception as e:
            print(f"Error getting node: {e}")
            return None

    async def get_edge(self, edge_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific edge by ID."""
        try:
            query = f"MATCH ()-[e]->() WHERE e.id = '{edge_id}' RETURN e"
            results = self.execute_gql(query)
            return results[0] if results else None
        except Exception as e:
            print(f"Error getting edge: {e}")
            return None

