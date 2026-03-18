---
name: gemini-live-audio
description: Use when implementing voice-to-text, real-time audio, or voice command features for OdinAI. Reference for Gemini Live API Native Audio integration via Vertex AI.
---

# Gemini Live API — Native Audio for OdinAI

## Overview
Google's Gemini Live API provides real-time bidirectional audio streaming for AI assistants.
This is the foundation for OdinAI's voice command features (May 29 release).

## Integration Path
- **Provider:** Google Cloud Vertex AI
- **Model:** Gemini 2.0+ with native audio
- **Transport:** WebSocket for real-time streaming
- **Use Case:** Voice-to-UI commands ("OdinAI, create a hero section with aurora text")

## Planned Features (May 29)
1. **Voice-to-Text Prompt Commands** — Speak design instructions to OdinAI
2. **Real-Time Design Narration** — OdinAI explains what it's building as it builds
3. **Audio Feedback** — Sound effects for successful builds, errors, tier upgrades

## Architecture (Planned)
```
User Microphone → WebSocket → Vertex AI (Gemini Live) → Text Command
  → OdinAI Agent → Component Generation → Live Preview
```

## API Reference
- Docs: https://cloud.google.com/vertex-ai/generative-ai/docs/live-api
- Blog: https://cloud.google.com/blog/products/ai-machine-learning/how-to-use-gemini-live-api-native-audio-in-vertex-ai
- Requires: Google Cloud project with Vertex AI API enabled

## Environment Variables (Future)
```
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_AI_API_KEY=
```

## Notes
- This is a post-launch feature (May 29, 2026)
- Will be Elite-tier only (part of OdinAI Agent suite)
- Requires user microphone permission in browser
- Fallback: text-based prompts always available
