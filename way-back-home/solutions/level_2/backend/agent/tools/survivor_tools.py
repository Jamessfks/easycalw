from services.graph_service import GraphService
from services.spanner_service import SpannerService
from models.graph import EdgeType, NodeType
import asyncio

async def get_survivors_with_skill(skill_name: str) -> str:
    """
    Finds survivors who possess a specific skill.
    
    Args:
        skill_name: The name of the skill to search for (e.g., "Medical", "Engineering").
        
    Returns:
        A formatted string listing the survivors with that skill.
    """
    try:
        # Initialize services
        # Note: In a real app with dependency injection, we might want to get these differently,
        # but for a simple tool, instantiating them here (or using a singleton pattern) is acceptable.
        spanner = SpannerService()
        graph_service = GraphService(spanner)
        
        graph_data = await graph_service.get_full_graph()
        
        # 1. Find the skill node ID(s) matching the name
        target_skill_ids = []
        skill_names_found = []
        for node in graph_data.nodes:
            if node.type == NodeType.SKILL and skill_name.lower() in node.label.lower():
                target_skill_ids.append(node.id)
                skill_names_found.append(node.label)
        
        if not target_skill_ids:
            return f"No skill found matching '{skill_name}'. Available skills might be named differently."
            
        # 2. Find survivors connected to these skills
        survivors = []
        seen_survivors = set()
        
        for edge in graph_data.edges:
            if edge.type == EdgeType.HAS_SKILL and edge.target in target_skill_ids:
                # Find the source survivor node
                survivor_node = next((n for n in graph_data.nodes if n.id == edge.source), None)
                if survivor_node and survivor_node.type == NodeType.SURVIVOR:
                    if survivor_node.id not in seen_survivors:
                        survivors.append(survivor_node.label)
                        seen_survivors.add(survivor_node.id)
        
        if not survivors:
             return f"No survivors found with the skill '{skill_name}' (matched skills: {', '.join(skill_names_found)})."
             
        return f"Survivors with skill matching '{skill_name}' ({', '.join(skill_names_found)}): {', '.join(survivors)}"

    except Exception as e:
        print(f"Error in get_survivors_with_skill: {e}")
        import traceback
        traceback.print_exc()
        return f"Error searching for survivors: {str(e)}"

async def get_all_survivors() -> str:
    """
    List all survivors and their locations (biomes).
    
    Returns:
        A formatted string listing all survivors and their locations.
    """
    try:
        spanner = SpannerService()
        graph_service = GraphService(spanner)
        
        graph_data = await graph_service.get_full_graph()
        
        survivors_info = []
        for node in graph_data.nodes:
            if node.type == NodeType.SURVIVOR:
                location = node.biome or "Unknown Location"
                survivors_info.append(f"{node.label} (Location: {location})")
        
        if not survivors_info:
            return "No survivors found in the network."
            
        return "All Survivors:\n- " + "\n- ".join(survivors_info)

    except Exception as e:
        print(f"Error in get_all_survivors: {e}")
        import traceback
        traceback.print_exc()
        return f"Error listing survivors: {str(e)}"

async def get_urgent_needs() -> str:
    """
    Finds and lists urgent needs currently affecting survivors.
    
    Returns:
        A formatted string listing urgent needs and the affected survivors.
    """
    try:
        spanner = SpannerService()
        graph_service = GraphService(spanner)
        
        graph_data = await graph_service.get_full_graph()
        
        urgent_needs = []
        
        for edge in graph_data.edges:
            # Check for HAS_NEED edges that might indicate urgency via status
            if edge.type == EdgeType.HAS_NEED:
                is_urgent = False
                status = edge.properties.get("status", "").lower()
                
                # Check edge status
                if status in ["critical", "high", "urgent", "active"]:
                    is_urgent = True
                
                # Also check target node properties for urgency
                if not is_urgent:
                    target_node = next((n for n in graph_data.nodes if n.id == edge.target), None)
                    if target_node and target_node.type == NodeType.NEED:
                        urgency = str(target_node.properties.get("urgency", "")).lower()
                        if urgency in ["high", "critical", "extreme"]:
                            is_urgent = True
                
                if is_urgent:
                    survivor_node = next((n for n in graph_data.nodes if n.id == edge.source), None)
                    need_node = next((n for n in graph_data.nodes if n.id == edge.target), None)
                    
                    if survivor_node and need_node:
                        survivor_name = survivor_node.label
                        need_desc = need_node.label
                        urgent_needs.append(f"{need_desc} (Affecting: {survivor_name})")
        
        if not urgent_needs:
            return "No urgent needs detected at this time."
            
        return "Urgent Needs:\n- " + "\n- ".join(urgent_needs)

    except Exception as e:
        print(f"Error in get_urgent_needs: {e}")
        import traceback
        traceback.print_exc()
        return f"Error searching for urgent needs: {str(e)}"
