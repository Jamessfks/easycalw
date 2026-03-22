# Way Back Home - Level 4: Live Bidirectional Multi-Agent System

Building a multi-agent system combining bi-directional streaming, Agent-to-Agent (A2A) protocol, and streaming tools with Google ADK.

## Overview

Level 4 extends the bi-directional streaming from Level 3 into a multi-agent architecture. Two specialized agents work together: a Dispatch Agent handles real-time user interaction via bidi streaming, while an Architect Agent manages database queries and hazard monitoring via A2A protocol.

## Architecture

```
[Browser / React UI]
    |   ^
    |   |  WebSocket (bidi streaming)
    v   |
[Dispatch Agent]  ----A2A Protocol---->  [Architect Agent]
    (Primary Hub)                         (Database Interface)
    Bidi Streaming                            |
    Tool Calls                                v
                                         [Redis / Memorystore]
```

### Dispatch Agent (Primary Hub)

- Handles real-time user interaction via bi-directional streaming
- Receives audio and video input from the browser
- Routes complex queries to the Architect Agent via A2A
- Provides synthesized audio responses to the user
- Manages session state and conversation flow

### Architect Agent (Database Interface)

- Interfaces with Redis/Memorystore for schematic and data lookups
- Processes structured queries from the Dispatch Agent
- Returns data results and hazard monitoring alerts
- Runs as a separate microservice accessible via A2A protocol

## Three Core Patterns

### 1. Bidi Streaming

Same pattern as Level 3 — real-time audio/video streaming between the browser and the Dispatch Agent using Gemini Live API. The Dispatch Agent maintains a persistent streaming session.

### 2. Agent-to-Agent (A2A) Protocol

The Dispatch Agent communicates with the Architect Agent using A2A protocol:

```python
from google.adk.agents import A2AClient

# Dispatch Agent calls Architect Agent
architect_client = A2AClient(
    url="http://architect-agent:8081/a2a",
)

# Send a task to the Architect Agent
response = await architect_client.send_task(
    task="lookup_schematic",
    params={"component_id": "reactor-7"},
)
```

A2A enables:
- Asynchronous task delegation between agents
- Structured request/response communication
- Service discovery and health checking
- Cross-process and cross-machine agent calls

### 3. Streaming Tools

Tools that return results incrementally rather than all at once:

```python
async def monitor_for_hazard(zone: str) -> AsyncGenerator[dict, None]:
    """Monitor a zone for hazards, streaming updates as they occur.

    Args:
        zone: The zone identifier to monitor

    Yields:
        Hazard status updates as they are detected
    """
    while monitoring:
        status = await check_zone_status(zone)
        if status.has_update:
            yield {"zone": zone, "status": status.level, "detail": status.message}
        await asyncio.sleep(1)
```

Streaming tools allow the agent to receive partial results and relay them to the user in real-time, rather than waiting for the complete result.

## Setup

### Redis Provisioning

The Architect Agent uses Redis for data storage and retrieval:

```bash
# Local development
docker run -d --name redis -p 6379:6379 redis:7

# Or install locally
brew install redis
redis-server
```

Store schematic data:

```python
import redis

r = redis.Redis(host='localhost', port=6379, db=0)

# Store schematics
r.hset("schematic:reactor-7", mapping={
    "name": "Reactor Core Unit 7",
    "status": "operational",
    "power_output": "1.21GW",
    "last_inspection": "2026-03-15",
})
```

### ADK Scaffolding

Set up the multi-agent project structure:

```
level4/
├── dispatch_agent/
│   ├── __init__.py
│   ├── agent.py          # Dispatch Agent definition
│   ├── main.py           # FastAPI app with WebSocket
│   └── tools.py          # Dispatch-specific tools
├── architect_agent/
│   ├── __init__.py
│   ├── agent.py          # Architect Agent definition
│   ├── main.py           # FastAPI app with A2A endpoint
│   ├── tools.py          # Redis lookup tools
│   └── redis_client.py   # Redis connection management
├── frontend/
│   ├── src/
│   └── package.json
├── docker-compose.yaml
├── requirements.txt
└── README.md
```

### lookup_schematic_tool

The Architect Agent's primary tool for database lookups:

```python
def lookup_schematic(component_id: str) -> dict:
    """Look up schematic data for a component.

    Args:
        component_id: The unique identifier of the component

    Returns:
        Component schematic data including status, specs, and history
    """
    data = redis_client.hgetall(f"schematic:{component_id}")
    if not data:
        return {"error": f"Component {component_id} not found"}
    return {
        "component_id": component_id,
        **{k.decode(): v.decode() for k, v in data.items()},
    }
```

### monitor_for_hazard Streaming Tool

A streaming tool that continuously monitors for hazards:

```python
async def monitor_for_hazard(zone: str) -> AsyncGenerator[dict, None]:
    """Monitor a zone for environmental hazards.

    This is a streaming tool that yields updates as conditions change.

    Args:
        zone: Zone identifier to monitor

    Yields:
        Hazard detection updates
    """
    pubsub = redis_client.pubsub()
    pubsub.subscribe(f"hazard:{zone}")

    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                yield {
                    "zone": zone,
                    "hazard_type": data["type"],
                    "severity": data["severity"],
                    "description": data["description"],
                    "timestamp": data["timestamp"],
                }
    finally:
        pubsub.unsubscribe(f"hazard:{zone}")
```

## Agent Definitions

### Dispatch Agent

```python
from google.adk.agents import Agent, A2AClient

architect_client = A2AClient(url="http://architect-agent:8081/a2a")

dispatch_agent = Agent(
    name="dispatch_agent",
    model="gemini-live-2.5-flash-native-audio",
    instruction="""You are the Dispatch Agent, the primary interface for
    the Way Back Home system. You handle real-time communication with the
    user via audio and video.

    When the user asks about schematics or system data, delegate to the
    Architect Agent. When hazard monitoring is needed, use the streaming
    hazard monitor.

    Always keep the user informed of what you're doing.""",
    tools=[monitor_for_hazard],
    sub_agents=[architect_client],
)
```

### Architect Agent

```python
architect_agent = Agent(
    name="architect_agent",
    model="gemini-2.5-flash",
    instruction="""You are the Architect Agent, responsible for database
    operations and system schematic lookups. You respond to queries from
    the Dispatch Agent with accurate data from the Redis database.

    Always return structured data. If a component is not found, say so
    clearly.""",
    tools=[lookup_schematic, monitor_for_hazard],
)
```

## Cloud Deployment

### Memorystore Redis

Provision a managed Redis instance on Google Cloud:

```bash
# Create a Memorystore Redis instance
gcloud redis instances create waybackhome-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0 \
  --tier=basic

# Get the host IP
gcloud redis instances describe waybackhome-redis \
  --region=us-central1 \
  --format="value(host)"
```

### VPC Connectors

Cloud Run services need VPC connectors to reach Memorystore:

```bash
# Create a VPC connector
gcloud compute networks vpc-access connectors create openclaw-connector \
  --region=us-central1 \
  --range=10.8.0.0/28
```

### Containerized Cloud Run Microservices

#### Dispatch Agent Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY dispatch_agent/ ./dispatch_agent/
COPY frontend/build/ ./static/
EXPOSE 8080
CMD ["uvicorn", "dispatch_agent.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

#### Architect Agent Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY architect_agent/ ./architect_agent/
EXPOSE 8081
CMD ["uvicorn", "architect_agent.main:app", "--host", "0.0.0.0", "--port", "8081"]
```

#### Deploy Both Services

```bash
# Build images
gcloud builds submit --tag gcr.io/$PROJECT_ID/dispatch-agent ./dispatch_agent
gcloud builds submit --tag gcr.io/$PROJECT_ID/architect-agent ./architect_agent

# Deploy Architect Agent first (Dispatch depends on it)
gcloud run deploy architect-agent \
  --image gcr.io/$PROJECT_ID/architect-agent \
  --platform managed \
  --region us-central1 \
  --port 8081 \
  --memory 512Mi \
  --vpc-connector openclaw-connector \
  --set-env-vars "REDIS_HOST=$(gcloud redis instances describe waybackhome-redis --region=us-central1 --format='value(host)')" \
  --set-env-vars "GOOGLE_API_KEY=$GOOGLE_API_KEY" \
  --no-allow-unauthenticated

# Get the Architect Agent URL
ARCHITECT_URL=$(gcloud run services describe architect-agent --region=us-central1 --format='value(status.url)')

# Deploy Dispatch Agent
gcloud run deploy dispatch-agent \
  --image gcr.io/$PROJECT_ID/dispatch-agent \
  --platform managed \
  --region us-central1 \
  --port 8080 \
  --memory 1Gi \
  --cpu 2 \
  --vpc-connector openclaw-connector \
  --set-env-vars "ARCHITECT_AGENT_URL=$ARCHITECT_URL/a2a" \
  --set-env-vars "GOOGLE_API_KEY=$GOOGLE_API_KEY" \
  --allow-unauthenticated
```

#### Docker Compose (Local Development)

```yaml
version: "3.8"
services:
  redis:
    image: redis:7
    ports:
      - "6379:6379"

  architect-agent:
    build: ./architect_agent
    ports:
      - "8081:8081"
    environment:
      - REDIS_HOST=redis
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    depends_on:
      - redis

  dispatch-agent:
    build: ./dispatch_agent
    ports:
      - "8080:8080"
    environment:
      - ARCHITECT_AGENT_URL=http://architect-agent:8081/a2a
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    depends_on:
      - architect-agent
```

```bash
docker compose up --build
```
