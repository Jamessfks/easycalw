# Level 1: Location Analyzer MCP Server
# Dockerfile for Cloud Run deployment

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Run the MCP server with HTTP transport for Cloud Run
# FastMCP runs on port 8080 with Streamable HTTP transport
CMD ["python", "main.py"]
