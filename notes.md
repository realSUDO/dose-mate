# DoseMate AI Agent - Development Notes

## Project Overview
DoseMate is a medication assistant AI agent using Agora's Conversational AI platform with Gemini LLM and Cartesia TTS.

## Current Working Configuration

### Working LLM Configuration (Gemini)
```javascript
llm: {
  url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
  system_messages: [
    {
      parts: [
        {
          text: "You are DoseMate, a helpful medication assistant. Keep responses very short and conversational."
        }
      ],
      role: "user"
    }
  ],
  greeting_message: "Hi! I'm DoseMate. How can I help you with your medications today?",
  failure_message: "Sorry, could you repeat that?",
  max_history: 10,
  params: {
    model: "gemini-2.0-flash"
  },
  style: "gemini"
}
```

### Working TTS Configuration (Cartesia)
```javascript
tts: {
  vendor: "cartesia",
  params: {
    api_key: process.env.CARTESIA_API_KEY,
    model_id: "sonic-2",
    voice: {
      mode: "id",
      id: "6ccbfb76-1fc6-48f7-b71d-91ac6298247b"
    },
    output_format: {
      container: "raw",
      sample_rate: 16000
    },
    language: "en"
  }
}
```

## Issues Encountered & Solutions

### 1. Gemini API Rate Limiting (429 Errors)
**Problem**: Multiple Gemini API keys hit rate limits
- First key: `AIzaSyDAq3iJKuqid7qPPdB10WICuEnUM4ujMXk` - throttled
- Second key: `AIzaSyBFpYqeL8gjou2G769dpRRV-ZfprbIzbuQ` - also hit limits

**Why it happens**: 
- Gemini 2.0-flash has strict rate limits (200 requests/day on free tier)
- Multiple test requests quickly exhaust quota

**Solutions tried**:
- Switch to gemini-1.5-flash (better rate limits)
- DeepSeek integration (insufficient balance)
- Use fresh API keys

### 2. TTS Configuration Issues
**Problem**: Greeting message not playing, audio not working

**Wrong configurations tried**:
```javascript
// ❌ Wrong - missing api_key
params: { voice_id: "...", model_id: "sonic-2" }

// ❌ Wrong - incorrect key name
params: { key: "...", voice_id: "...", model_id: "sonic-2" }

// ❌ Wrong - invalid parameter
greeting_enabled: true
```

**✅ Correct configuration**:
- Use `api_key` not `key`
- Use `voice.id` structure, not `voice_id`
- Include `output_format` and `language`
- No `greeting_enabled` parameter needed

### 3. Agent Configuration Validation
**Problem**: 400 "InvalidRequest" errors

**Cause**: Invalid parameters in agent configuration
- `greeting_enabled: true` is not a valid parameter
- Incorrect TTS parameter structure

**Solution**: Follow exact API documentation format

## What Works & Why

### 1. Agent Creation ✅
- Proper base64 credentials using customer ID/secret
- Correct Agora API endpoint structure
- Valid agent configuration parameters

### 2. LLM Integration ✅
- Gemini 2.0-flash works when API key has quota
- Proper system message structure for Gemini
- Correct streaming URL format

### 3. TTS Integration ✅
- Cartesia configuration matches official docs
- Proper voice ID structure
- Correct output format for real-time streaming

### 4. Conversation Flow ✅
- Agent joins channel successfully
- Greeting message configured properly
- ASR picks up user speech
- LLM generates appropriate responses
- TTS converts responses to speech

## Backend Dependencies
```json
{
  "cors": "^2.8.5",
  "dotenv": "^17.2.3", 
  "express": "^5.1.0",
  "node-fetch": "^2.7.0",
  "openai": "^4.0.0"
}
```

## Server Status
- Backend runs on port 3000
- Test endpoint: http://localhost:3000/api/test
- Start agent: POST /api/start-ai-agent
- Stop agent: POST /api/stop-ai-agent

## Next Steps / TODO
- [ ] Implement rate limiting handling
- [ ] Add retry logic for API failures  
- [ ] Add conversation logging
- [ ] Implement agent health monitoring
