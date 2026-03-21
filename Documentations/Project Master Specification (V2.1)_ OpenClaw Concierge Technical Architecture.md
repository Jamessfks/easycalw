# Project Master Specification (V2.1): OpenClaw Concierge Technical Architecture

This document provides a comprehensive, high-fidelity technical architecture for the OpenClaw Concierge system. It is designed for an AI agent to ingest and understand the full system context, data flow, and technical constraints, ensuring 100% accurate implementation.

---

## 1. System Architecture Overview

The OpenClaw Concierge is a three-tier, voice-first system designed to simplify the onboarding and configuration of OpenClaw agents. It transforms a complex, multi-step manual setup process into a seamless, consultative voice conversation, culminating in a personalised, ready-to-deploy OpenClaw agent configuration package. The architecture is modular, leveraging Google ADK for the voice interface and a FastAPI backend for deterministic configuration generation.

### 1.1 The Three-Tier Pipeline

1.  **Discovery Layer (Model 1):** A Google ADK agent powered by Gemini Live, acting as a Consultative Researcher. It engages the user in a natural language conversation to understand their needs, constraints, and preferences.
2.  **Extraction Layer (Model 2):** The Google ADK agent, configured with a precise JSON schema, extracts structured data from the completed conversation. This acts as the definitive data contract between the voice interface and the backend.
3.  **Generation Layer (Model 3):** A FastAPI backend, powered by Gemini 2.5 Pro, which receives the structured JSON. It processes this data against a verified skill registry and smart templates to deterministically generate all required OpenClaw configuration files.

---

## 2. Model 1: The Consultative Discovery Layer (Google ADK / Gemini Live)

This layer is the user facing component, responsible for intelligent information gathering and user steering. It operates as a highly sophisticated interviewer, adapting its questions based on user input.

### 2.1 Core Functionality

*   **Dynamic Conversation:** Engages users in a natural, bi-directional voice conversation using Google ADK and the Gemini Multimodal Live API.
*   **Consultative Research:** Employs a `consultative_system_prompt.md` to act as a "Consultative Researcher." This prompt guides the agent to probe for user roles, daily pain points, hardware availability (e.g., Mac Mini, VPS), technical confidence (1-10 scale), and autonomy preferences (reactive vs. proactive).
*   **Hardware Steering:** The agent intelligently steers users towards appropriate OpenClaw hosting solutions based on their technical level and available hardware, without using technical jargon.
*   **Tiered Transparency:** Communicates the complexity and requirements of various OpenClaw capabilities (Tier 1, 2, 3) to the user during the conversation, managing expectations upfront.

### 2.2 Key Components

*   **Google ADK (Agent Development Kit):** Provides the framework for building the bi-directional voice agent, handling WebRTC connections and integration with Gemini Live.
*   **Gemini Multimodal Live API:** The underlying large language model (LLM) for real-time conversation, providing low-latency responses and advanced reasoning capabilities for the consultative process.
*   **`consultative_system_prompt.md`:** The comprehensive system instruction that defines the agent's persona, conversational flow, probing questions, and transparency rules.

---

## 3. Model 2: The Structured Extraction Layer (Google ADK)

This layer is responsible for transforming the free-form voice conversation into a structured, machine-readable format. It acts as the critical bridge between the natural language interaction and the deterministic backend generation.

### 3.1 Core Functionality

*   **Post-Call Extraction:** After the voice conversation concludes, the Google ADK agent processes the full transcript.
*   **Schema-Driven Parsing:** Utilises a predefined `schema.json` to extract specific data points from the conversation, ensuring consistency and accuracy.
*   **Data Contract:** The extracted JSON object serves as the formal data contract, guaranteeing that the backend receives all necessary information in a predictable format.

### 3.2 Key Components

*   **Google ADK:** Configured to perform post-call processing and structured data extraction based on the provided schema.
*   **`schema.json`:** A precise JSON schema that defines the structure and types of all data points to be extracted from the user conversation (e.g., user context, agent persona, use cases, hardware, technical level, autonomy, channel).

---

## 4. Model 3: The Deterministic Generation Layer (FastAPI / Gemini 2.5 Pro)

This layer is the backend engine that takes the structured user requirements and generates the actual OpenClaw configuration files. It operates deterministically, ensuring that the output is always correct and ready for deployment.

### 4.1 Core Functionality

*   **Webhook Ingestion:** A FastAPI endpoint securely receives the structured JSON payload from the Google ADK (Model 2).
*   **Skill Mapping:** Implements a Python function that uses the `registry.md` to map natural language use cases (extracted from Model 2) to verified OpenClaw skill slugs and their corresponding `clawhub install` commands.
*   **Configuration Generation:** Utilises `smart_markdown_templates.md` and `openclaw_ref.md` to generate a suite of OpenClaw configuration files, including `SOUL.md`, `USER.md`, `AGENTS.md`, `IDENTITY.md`, `setup.sh`, and `README.md`.
*   **Adaptive Output:** The generated files adapt to the user's `technical_level` and `hardware` preferences, providing tailored instructions and configurations.
*   **File Packaging:** Compresses all generated files into a single, downloadable ZIP archive.

### 4.2 Key Components

*   **FastAPI:** A modern, fast (high-performance) web framework for building the Python backend API, handling webhook reception and file generation logic.
*   **Gemini 2.5 Pro:** The underlying LLM used by the FastAPI backend for generating the content of the configuration files based on the structured input and templates. Chosen for its advanced reasoning and generation capabilities, as latency is not a primary concern in this asynchronous step.
*   **`registry.md`:** The Universal Skill & Connector Registry, providing a comprehensive mapping of 50+ use cases to verified `clawhub` slugs, required API keys, and configuration tiers.
*   **`smart_markdown_templates.md`:** High-fidelity templates and logic specifications for generating the content of `SOUL.md`, `setup.sh`, `README.md`, and other configuration files.
*   **`openclaw_ref.md`:** The OpenClaw Configuration Reference, providing precise syntax and structure for `openclaw.json` and `clawhub` commands, ensuring 100% accuracy in generated configurations.

---

## 5. Technical Constraints & Security

The system is designed with security, user control, and transparency as paramount considerations.

### 5.1 OpenAI "Sign-In" (Codex OAuth)

*   **Zero-Key Storage:** The system strictly adheres to a zero-API-key-storage policy. Users authenticate directly with OpenAI via an official browser-based sign-in (`openclaw onboard --auth-choice openai-codex`). No API keys are ever handled or stored by the Concierge backend or generated files.
*   **Anthropic Restriction Mitigation:** This approach bypasses the recent Anthropic ban on OpenClaw by leveraging the fully supported OpenAI Codex subscription path.

### 5.2 Tiered Transparency

*   **Tier 1 (Native/Easy):** Full setup provided; user only needs to sign in (OAuth) or provide their own API keys.
*   **Tier 2 (Medium/Third-Party):** Configuration provided, but the user is explicitly informed about manual setup steps required for complex API scopes (e.g., creating developer accounts).
*   **Tier 3 (Advanced/Complex):** The Concierge explains the complexity and provides documentation links for advanced configurations, rather than attempting an auto-setup that might fail or be insecure.

### 5.3 Integrated Security Suite

Every generated OpenClaw setup includes a default security layer to enhance user safety and control:

*   **`agent-trust-hub`:** Intercepts outgoing tool calls to prevent malicious actions (e.g., system file deletion, data exfiltration).
*   **`snyk-scanner`:** Automatically scans new skills or code for known vulnerabilities.
*   **`permission-gatekeeper`:** Requires explicit user permission (via voice/chat) before performing any sensitive actions (e.g., sending an email, modifying a file, making a purchase). This ensures the agent operates within user-defined boundaries and prevents unintended autonomous actions.

---

## 6. The Skill Registry & Mapping Logic

The `registry.md` serves as the authoritative knowledge base for all OpenClaw capabilities. It is meticulously curated to bridge the gap between natural language user requests and precise technical configurations.

### 6.1 Registry Structure

*   **Use Case:** A human-centric description of a problem or desired functionality (e.g., "Email Triage & Drafts").
*   **Skill Slugs:** Verified `clawhub` identifiers for the OpenClaw skills that address the use case (e.g., `clawemail`, `email-autoreply`).
*   **Required API Keys / Setup:** Specific external credentials or setup steps needed for the skill to function (e.g., Google/Outlook OAuth, GitHub PAT).
*   **Description:** A brief explanation of what the skill does.
*   **Tier:** Categorisation into Tier 1, 2, or 3, indicating complexity and transparency requirements.

### 6.2 Mapping Logic

*   **Natural Language to Technical ID:** The backend (Model 3) uses a Python-based lookup function to map the `useCases` extracted by Model 2 into the exact `clawhub install <slug>` commands. This process is deterministic and avoids LLM hallucination of skill names.
*   **Dynamic `setup.sh` Generation:** The `setup.sh` script is dynamically generated to include all necessary `clawhub install` commands for the selected skills, along with any required `openclaw.json` snippets for channel configuration or model overrides.

---

## 7. Frontend Integration

The React frontend provides the user interface for initiating the voice conversation and receiving the generated configuration package.

### 7.1 User Flow

1.  **Initiation:** User clicks a 
button to initiate a WebRTC voice call via the Google ADK backend.
2.  **Live Transcript:** The frontend displays a real-time transcript of the conversation between the user and the Gemini Live agent.
3.  **Processing State:** After the call, the UI transitions to a "Building your agent..." state, polling the backend for completion.
4.  **Download:** Upon completion, the frontend presents a download link for the generated ZIP package.

### 7.2 Key Components

*   **React / TypeScript:** Frontend framework for building the interactive user interface.
*   **TailwindCSS:** For rapid and consistent styling.
*   **Google ADK WebRTC Client:** Handles the client-side voice communication with the backend agent.

---

## 8. Conclusion

The OpenClaw Concierge represents a significant advancement in AI agent onboarding. By combining a consultative voice interface with a deterministic configuration generation backend, it addresses the critical barrier of complexity in setting up powerful AI agents. The architecture prioritises user experience, security, and transparency, ensuring a robust and reliable solution for a wide range of users.

---

**Generated by Manus AI (2026-03-21)**
