# Way Back Home - Level 3: ADK Bi-Directional Streaming Agent

Building a Biometric Neural Sync application using Google ADK with Gemini Live API for real-time bi-directional audio and video streaming.

## Overview

Level 3 introduces bi-directional streaming with the Google Agent Development Kit (ADK). The application captures webcam video and microphone audio from the browser, streams them to a Gemini Live API-powered agent, and receives audio responses in real-time.

The agent acts as a biometric neural sync system that can analyze visual input (webcam frames) and respond with synthesized audio.

## Architecture

```
[Browser / React UI]
    |   ^
    |   |  WebSocket
    v   |
[FastAPI Backend]
    |   ^
    |   |  ADK Bidi Streaming
    v   |
[Gemini Live API]
```

### Backend: FastAPI + Python

- **FastAPI** serves the API and manages WebSocket connections
- **Google ADK** orchestrates the agent and streaming session
- **Gemini Live API** provides real-time multimodal processing
- **WebSocket** handles bidirectional communication between frontend and backend

### Frontend: React UI

- Webcam video capture via browser MediaDevices API
- Microphone audio capture (PCM format)
- Canvas-based frame capture for sending video frames
- Audio playback for agent responses
- Real-time status display and controls

## WebSocket Communication

The WebSocket protocol handles three types of messages:

### Client to Server (Upstream)

1. **Video frames** — Base64-encoded JPEG frames captured from webcam via canvas
2. **Audio chunks** — Raw PCM audio data from the microphone
3. **Control messages** — Start/stop streaming, tool responses

### Server to Client (Downstream)

1. **Audio responses** — Synthesized audio from the agent
2. **Tool calls** — Requests for the client to execute tools
3. **Status updates** — Connection state, processing indicators
4. **Text transcriptions** — Optional text versions of audio responses

## Video and Audio Capture

### Canvas-Based Frame Capture

Video frames are captured by drawing the webcam video element onto an HTML canvas, then extracting the frame as a JPEG:

```javascript
// Capture frame from video element
const canvas = document.createElement('canvas');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
const ctx = canvas.getContext('2d');
ctx.drawImage(video, 0, 0);
const frame = canvas.toDataURL('image/jpeg', 0.8);
```

Frames are sent at a configurable interval (e.g., every 1-2 seconds) to avoid overwhelming the API.

### PCM Audio Capture

Audio is captured using the Web Audio API's AudioWorklet or ScriptProcessorNode, outputting raw PCM data:

```javascript
// Audio processing for PCM output
const audioContext = new AudioContext({ sampleRate: 16000 });
const source = audioContext.createMediaStreamSource(micStream);
// Process audio data into PCM chunks and send via WebSocket
```

Audio is captured at 16kHz mono PCM format as required by the Gemini Live API.

## Multimodal Agent Design

### Agent Instructions

The agent is configured with specific instructions for the biometric neural sync scenario:

```python
agent = Agent(
    name="biometric_sync_agent",
    model="gemini-live-2.5-flash-native-audio",
    instruction="""You are a Biometric Neural Sync system.
    Analyze the visual input from the user's camera and audio input.
    Report observations about what you see and respond to voice commands.
    Use the report_digit tool when you identify numerical values.""",
    tools=[report_digit],
)
```

### report_digit Tool

A custom tool that the agent calls when it identifies digit patterns in the visual input:

```python
def report_digit(digit: int) -> dict:
    """Report a digit identified in the visual stream.

    Args:
        digit: The identified digit (0-9)

    Returns:
        Confirmation of the reported digit
    """
    return {"status": "recorded", "digit": digit}
```

### Model Selection

The agent uses `gemini-live-2.5-flash-native-audio`, which supports:
- Real-time audio input and output
- Video/image frame processing
- Function calling during streaming
- Low-latency responses

## Bi-Directional Streaming Implementation

### Session Configuration

```python
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()
runner = Runner(
    agent=agent,
    app_name="biometric_sync",
    session_service=session_service,
)
```

### LiveRequestQueue

The `LiveRequestQueue` manages the stream of inputs to the agent:

```python
from google.adk.agents import LiveRequestQueue

live_queue = LiveRequestQueue()

# Send audio data
live_queue.send_realtime(audio_data)

# Send video frame
live_queue.send_realtime(image_data)

# Close the queue when done
live_queue.close()
```

### Upstream and Downstream Tasks

Two concurrent tasks handle the bidirectional flow:

**Upstream task** — Reads from the WebSocket and feeds data into the LiveRequestQueue:

```python
async def upstream_task(websocket, live_queue):
    async for message in websocket.iter_bytes():
        # Parse message type (audio, video, control)
        # Feed into live_queue
        live_queue.send_realtime(parsed_data)
```

**Downstream task** — Reads agent responses and sends them back through the WebSocket:

```python
async def downstream_task(websocket, live_events):
    async for event in live_events:
        if event.audio:
            await websocket.send_bytes(event.audio)
        if event.tool_call:
            await websocket.send_json(event.tool_call)
        if event.text:
            await websocket.send_text(event.text)
```

### asyncio.gather

Both tasks run concurrently using `asyncio.gather`:

```python
async def handle_session(websocket):
    live_queue = LiveRequestQueue()
    live_events = runner.run_live(
        session_id=session_id,
        live_request_queue=live_queue,
    )

    await asyncio.gather(
        upstream_task(websocket, live_queue),
        downstream_task(websocket, live_events),
    )
```

## Testing

### Mock Server Test

A mock server simulates the Gemini Live API for local development and CI:

```python
# test_mock_server.py
async def test_bidi_streaming():
    """Test that the agent handles bidi streaming correctly."""
    mock_server = MockGeminiServer()
    mock_server.add_response(audio=b"mock_audio_data")

    async with mock_server:
        # Connect WebSocket client
        # Send test frame and audio
        # Verify response received
        pass
```

### ADK Web Simulator

The ADK provides a built-in web simulator for testing agents:

```bash
adk web
```

This launches a local web interface where you can:
- Test tool calls manually
- View agent state and session history
- Simulate audio and image inputs
- Debug streaming behavior

## Deployment

### Multi-Stage Docker Build

```dockerfile
# Stage 1: Build frontend
FROM node:24 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python backend
FROM python:3.12-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-build /app/frontend/build ./static/

EXPOSE 8080
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Cloud Run Deployment

```bash
# Build and push
gcloud builds submit --tag gcr.io/$PROJECT_ID/biometric-sync

# Deploy to Cloud Run
gcloud run deploy biometric-sync \
  --image gcr.io/$PROJECT_ID/biometric-sync \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 2 \
  --set-env-vars "GOOGLE_API_KEY=$GOOGLE_API_KEY"
```

Note: WebSocket support on Cloud Run requires HTTP/2 and session affinity configuration.
