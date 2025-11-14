Here's the sample code for voice-calling

import AgoraRTC from "agora-rtc-sdk-ng";

// RTC client instance
let client = null;  
// Local audio track
let localAudioTrack = null; 

// Connection parameters
let appId = "<-- Insert app ID -->";
let channel = "<-- Insert channel name -->";
let token = "<-- Insert token -->"; 
let uid = 0; // User ID

// Initialize the AgoraRTC client
function initializeClient() {
    client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setupEventListeners();
}

// Handle client events
function setupEventListeners() {
    // Set up event listeners for remote tracks
    client.on("user-published", async (user, mediaType) => {
        // Subscribe to the remote user when the SDK triggers the "user-published" event
        await client.subscribe(user, mediaType);
        console.log("subscribe success");
        // If the remote user publishes an audio track.
        if (mediaType === "audio") {
            // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
            const remoteAudioTrack = user.audioTrack;
            // Play the remote audio track.
            remoteAudioTrack.play();
        }
    });

    // Listen for the "user-unpublished" event
    client.on("user-unpublished", async (user) => {
        // Remote user unpublished
    });
}

// Create a local audio track
async function createLocalAudioTrack() {
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
}

// Join the channel and publish local audio
async function joinChannel() {
    await client.join(appId, channel, token, uid);
    await createLocalAudioTrack();
    await publishLocalAudio();
    console.log("Publish success!");
}

// Publish local audio track
async function publishLocalAudio() {
    await client.publish([localAudioTrack]);
}

// Leave the channel and clean up
async function leaveChannel() {
    localAudioTrack.close(); // Stop local audio
    await client.leave();    // Leave the channel
    console.log("Left the channel.");
}

// Set up button click handlers
function setupButtonHandlers() {
    document.getElementById("join").onclick = joinChannel;
    document.getElementById("leave").onclick = leaveChannel;
}

// Start the basic call process
function startBasicCall() {
    initializeClient();
    window.onload = setupButtonHandlers;
}

startBasicCall();


REST quickstart

This page describes how to call the Conversational AI Engine RESTful APIs to start and stop an AI agent.
Understand the tech

Agora’s Conversational AI technology enables real-time voice interactions between users and an AI-driven agent within an Agora channel. The basic process is as follows:

    User joins a Agora channel: A user joins an Agora channel.
    Start an AI agent: The user sends a request to your business server, which then makes an API call to the Conversational AI engine to start an agent. The agent joins the same channel as the user.
    Real-time interaction: The user communicates with the AI agent through voice, leveraging the specified LLM, a text-to-speech service, and Agora's low-latency Software-Defined Real-Time Network (SDRTN®).
    Stop the AI agent: When the user ends the conversation, the business server sends a request to stop the AI agent. The agent then leaves the Agora channel.
    User leaves the Agora channel: The user disconnects from the session.


Prerequisites

Before you begin, make sure that you have:

    Implemented the Voice Calling or Video Calling quickstart.

    Enabled Agora conversational AI for your project.

    The following information from Agora Console:
        App ID: The string identifier for your project used to call the Conversational AI Engine RESTful API.
        Customer ID and Customer secret: Used for HTTP authentication when calling the RESTful APIs.
        A temporary token: The token is used by the agent for authentication when joining an Agora channel.

    Obtained an API key and callback URL from a Large Language Model (LLM) provider such as OpenAI.

    Obtained an API key from a text-to-speech (TTS) provider such as Microsoft Azure.

    Implemented the voice or video calling quickstart.

info

For the best conversational experience, Agora recommends using Conversational AI Engine with specific Agora Video/Voice SDK versions. For details, contact technical support.


Implementation

This section introduces the basic RESTful API requests you use to start and stop a Conversational AI agent. In a production environment, implement these requests on your business server.
Start a conversational AI agent

Call the join endpoint to create an agent instance that joins an Agora channel. Pass in the channel name and token for agent authentication. To generate your base64-encoded credentials, see RESTful authentication.

    Node.js
    Curl
    Python

const fetch = require('node-fetch');

const url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/join";

const headers = {
  "Authorization": "Basic <your_base64_encoded_credentials>",
  "Content-Type": "application/json"
};

const data = {
  "name": "unique_name",
  "properties": {
    "channel": "<your_channel_name>",
    "token": "<your_rtc_token>",
    "agent_rtc_uid": "0",
    "remote_rtc_uids": ["*"],
    "enable_string_uid": false,
    "idle_timeout": 120,
    "llm": {
      "url": "https://api.openai.com/v1/chat/completions",
      "api_key": "<your_llm_api_key>",
      "system_messages": [
        {
          "role": "system",
          "content": "You are a helpful chatbot."
        }
      ],
      "greeting_message": "Hello, how can I help you?",
      "failure_message": "Sorry, I don't know how to answer this question.",
      "max_history": 10,
      "params": {
        "model": "gpt-4o-mini"
      }
    },
    "asr": {
      "language": "en-US"
    },
    "tts": {
      "vendor": "microsoft",
      "params": {
          "key": "<your_tts_api_key>",
          "region": "eastus",
          "voice_name": "en-US-AndrewMultilingualNeural"
      }
    }
  }
};

fetch(url, {
  method: "POST",
  headers: headers,
  body: JSON.stringify(data)
})
  .then(response => response.json())
  .then(json => console.log(json))
  .catch(error => console.error("Error:", error));


Start a conversational AI agent
POST

https://api.agora.io/api/conversational-ai-agent/v2/projects/{appid}/join

Use this endpoint to create and start a Conversational AI agent instance.


For complete information on all request parameters, see Start a conversational AI agent.

If the request is successful, you receive the following response:
// 200 OK
{
  "agent_id": "1NT29X10YHxxxxxWJOXLYHNYB",
  "create_ts": 1737111452,
  "status": "RUNNING"
}
Store the agent_id for use in subsequent API calls to query, update, and stop the AI agent.

Stop the conversational AI agent

To end the conversation with the AI agent, call the leave endpoint. This causes the agent to leave the Agora channel.

    Node.js
    Curl
    Python

const url = 'https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/leave';

const options = {
  method: 'POST',
  headers: {
    'Authorization': 'Basic <your_base64_encoded_credentials>',
    'Content-Type': 'application/json'
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));

If the request is successful, the server responds with a 200 OK status and an empty JSON object.
// 200 OK
{}

Stop a conversational AI agent
POST

https://api.agora.io/api/conversational-ai-agent/v2/projects/{appid}/agents/{agentId}/leave

Use this endpoint to stop the specified Conversational AI agent instance.

