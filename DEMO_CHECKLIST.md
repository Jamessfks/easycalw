# EasyClaw Demo Day Checklist

## 30 Minutes Before Demo
- [ ] Run: `bash scripts/prewarm.sh <your-railway-url>`
- [ ] Open http://localhost:5175 (or Railway URL) — confirm landing page loads
- [ ] Click "Try Demo" → confirm guide loads in ~20 seconds
- [ ] Test mic: start an interview, speak a sentence, confirm transcript appears
- [ ] Confirm Cmd+Shift+D resets the app cleanly

## Vapi Dashboard (do once)
- [ ] Open https://dashboard.vapi.ai
- [ ] Open your EasyClaw assistant → Edit → System Prompt
- [ ] Paste contents of `backend/vapi_system_prompt.md`
- [ ] Save and test with a short call

## Railway Environment Variables (verify set)
- [ ] ANTHROPIC_API_KEY (or leave empty for Gemini fallback)
- [ ] GEMINI_API_KEY ✓
- [ ] VAPI_ASSISTANT_ID ✓
- [ ] VAPI_PUBLIC_KEY ✓
- [ ] GUIDE_OUTPUT_DIR=/data/guide_output
- [ ] GUIDE_STORE_PATH=/data/guide_store.json

## Demo Flow (3 minutes)
1. "EasyClaw turns a 2-minute voice conversation into a complete, personalized AI setup guide."
2. Click Start Interview → talk for 60 seconds (name, business, pain point, tech level, hardware, channel)
3. End interview → watch 20-second demo golden path → guide appears
4. Scroll through guide sections → show quality score
5. "Setup consultants charge $500/hour. We do this in minutes."

## Fallback Plan
- If Vapi fails: click "Try Demo" → select a demo persona → golden path still works
- If backend is slow: the demo stream endpoint is instant, no real generation needed
- Nuclear option: `demo-restaurant` guide is always pre-cached and available offline
