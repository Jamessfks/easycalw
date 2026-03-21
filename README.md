# OpenClaw Concierge Team Kickoff and Q&A

Alright team, I have listened to the recording. You are asking exactly the right questions, especially around security, user control, and the "API key problem." Kaan is right on the money with his instinct to avoid touching user API keys. This is a pre RSAC (RSA Conference) hackathon, which means security judges will absolutely destroy any architecture that stores user API keys in a central database. 

Here are direct answers to your questions, followed by who is building what, and how we kick off right now.

## 1. The Security and API Key Question (Travis & Kaan)
**The Debate:** Do we build an interface that takes their API keys and deploys OpenClaw for them, or do we just give them the files?
**The Answer:** Kaan is 100% correct. We **never** touch their API keys. Our system generates the `SOUL.md`, `USER.md`, and a `setup.sh` script. The final output also includes a `README.md` that says: "Step 1: Run this script. Step 2: OpenClaw will ask you for your Anthropic API key. Here is the link to get one." 
**Why this wins:** When the judges ask about security, your answer is: "We are a zero trust architecture. We don't store API keys, we don't host their agent, and we don't have a database of user credentials. We are a compiler that translates human intent into secure local configuration." Judges will love that.

## 2. The "How does the user know what's possible?" Question (Zicheng)
**The Problem:** Users don't know what OpenClaw can do, so how can they ask for it?
**The Answer:** The voice agent (Model 1) leads the dance. It does not ask "What do you want to do?" It asks "What do you do for work?" If the user says "I run a restaurant," the AI checks its system prompt and says, "Great. Other restaurant owners use this to automate WhatsApp reservations and manage staff schedules. Do either of those sound useful, or is there a different bottleneck you have?" The AI suggests the art of the possible based on their context.

## 3. The "How do they change it later?" Question (Pranav & Zicheng)
**The Problem:** What if they want to add a new skill next week?
**The Answer:** For the hackathon, we focus on the **Day 1 Setup**. But your pitch for the future (Day 2) is this: The user just calls the concierge again. They say, "Hey, it's Kaan. I want my agent to also handle my calendar now." The concierge pulls their existing config, updates it, and sends them a new `setup.sh` file to run. They never have to touch the CLI themselves.

## 4. The Frontend and Model Choices (Pranav & Travis)
**The Problem:** What models win the hackathon?
**The Answer:** This is a Google sponsored event. We must use Google tech where it makes sense.
*   **Voice Model:** Gemini 2.5 Flash via Vapi. It is insanely fast (370ms latency) and proves we are using the sponsor's tech.
*   **Config Generator:** We will use Gemini 2.5 Pro instead of Claude for the backend config generation. It is smart enough to write the Markdown files, and it keeps our entire stack Google native for the judges.
*   **Frontend:** React + Tailwind. Keep it dark mode, sleek, and minimal. Just a pulsing call button, a live transcript, and a download button at the end.

---

## The Execution Plan: Who is Doing What

We have roughly 20 hours. Here is the exact breakdown of ownership.

### Pranav: The Voice Pipeline Lead
*   **Your Mission:** Make the AI sound human and extract the right data.
*   **Task 1:** Set up a Vapi account and create an assistant using Gemini 2.5 Flash.
*   **Task 2:** Take the `model_1_system_prompt.md` we drafted and tune it in Vapi so the conversation flows naturally.
*   **Task 3:** Define the JSON Schema in Vapi's Structured Outputs feature to extract: Context, Persona, Use Cases, Channels, and Autonomy Level.

### Zicheng: The Backend and Logic Lead
*   **Your Mission:** Turn Vapi's JSON into OpenClaw files.
*   **Task 1:** Build a simple FastAPI server with one POST endpoint `/webhook` to receive Vapi's data.
*   **Task 2:** Implement the Python `Skill Lookup Table` we designed. It takes the "Use Cases" array from Vapi and maps them to real `clawhub` install commands.
*   **Task 3:** Write the Gemini 2.5 Pro prompt that takes the mapped skills and generates the final `SOUL.md` and `setup.sh` files, then zips them for download.

### Travis: The Frontend and Systems Lead
*   **Your Mission:** Build the user face and connect the pipes.
*   **Task 1:** Build the React frontend. State 1: Call Button. State 2: Live Transcript (using Vapi Web SDK). State 3: Download Results.
*   **Task 2:** Work with Zicheng to ensure the FastAPI backend returns the ZIP file cleanly to your frontend.
*   **Task 3:** Map out the exact architecture diagram we will use for the pitch deck.

### Kaan: Product Vision and Pitch
*   **Your Mission:** Make sure what we are building actually solves the problem and wins the judges.
*   **Task 1:** Work with Pranav to test the voice agent. Call it 20 times. Break it. Fix the prompt.
*   **Task 2:** Write the "Perfect Output" examples. Hand write exactly what a restaurant owner's `SOUL.md` should look like, so Zicheng knows what his backend needs to generate.
*   **Task 3:** Start building the story for the 4:00 PM Sunday demo.

## Next Steps to Kickoff
1.  **Pranav:** Go to Vapi.ai, make an account, and get a phone number or Web SDK key.
2.  **Zicheng:** Spin up a GitHub repo with a blank FastAPI app and a blank React app. Invite Travis.
3.  **Travis:** Pull the repo and start building the UI shell.
4.  **Kaan:** Tell me if this distribution of labor makes sense to you, and we will start writing code.
