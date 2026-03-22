# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (if any)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency management
RUN pip install uv

# Copy only the project definition files first to leverage Docker cache
COPY pyproject.toml .
# If you have a lock file, copy it too
# COPY uv.lock . 

# Install dependencies
# We use --system to install into the system python environment provided by the image
RUN uv pip install --system -r pyproject.toml

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
# Cloud Run sets the PORT env variable (default 8080)
ENV PORT=8080

# Command to run the application
# We use shell form to properly expand $PORT
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
