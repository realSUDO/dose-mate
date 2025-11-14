---
title: REST quickstart
description: Set up real-time interaction with a Conversational AI agent.
sidebar_position: 1
platform: android
exported_from: https://docs.agora.io/en/conversational-ai/get-started/quickstart
exported_on: '2025-10-19T10:28:33.564032Z'
exported_file: quickstart.md
---

[HTML Version](https://docs.agora.io/en/conversational-ai/get-started/quickstart)

# REST quickstart


This page describes how to call the Conversational AI Engine RESTful APIs to start and stop an AI agent.

## Understand the tech

Agora’s Conversational AI technology enables real-time voice interactions between users and an AI-driven agent within an Agora channel. The basic process is as follows:

1. **User joins a Agora channel**:  A user joins an Agora channel.
1. **Start an AI agent**: The user sends a request to your business server, which then makes an API call to the Conversational AI engine to start an agent. The agent joins the same channel as the user.
1. **Real-time interaction**: The user communicates with the AI agent through voice, leveraging the specified LLM, a text-to-speech service, and Agora's low-latency Software-Defined Real-Time Network (SDRTN®).
1. **Stop the AI agent**: When the user ends the conversation, the business server sends a request to stop the AI agent. The agent then leaves the Agora channel.
1. **User leaves the Agora channel**: The user disconnects from the session.

**Conversational AI Engine workflow**

![](https://docs-md.agora.io/images/conversational-ai/ai-agent-tech.svg)

## Prerequisites

Before you begin, make sure that you have:

- Implemented the [Voice Calling](https://docs-md.agora.io/en/voice-calling/get-started/get-started-sdk.md) or [Video Calling quickstart](https://docs-md.agora.io/en/video-calling/get-started/get-started-sdk.md).
- [Enabled Agora conversational AI](https://docs-md.agora.io/en/conversational-ai/get-started/manage-agora-account.md) for your project.
- The following information from Agora Console:
    - [App ID](https://docs-md.agora.io/en/conversational-ai/get-started/manage-agora-account.md): The string identifier for your project used to call the Conversational AI Engine RESTful API.
    - [Customer ID and Customer secret](https://docs-md.agora.io/en/conversational-ai/rest-api/restful-authentication.md): Used for HTTP authentication when calling the RESTful APIs.
    - A [temporary token](https://docs-md.agora.io/en/conversational-ai/get-started/manage-agora-account.md): The token is used by the agent for authentication when joining an Agora channel. 
- Obtained an API key and callback URL from a Large Language Model (LLM) provider such as [OpenAI](https://openai.com/index/openai-api/).
- Obtained an API key from a text-to-speech (TTS) provider such as [Microsoft Azure](https://azure.microsoft.com/en-us/products/ai-services/ai-speech).
- Implemented the [voice](https://docs-md.agora.io/en/voice-calling/get-started/get-started-sdk.md) or [video](https://docs-md.agora.io/en/video-calling/get-started/get-started-sdk.md) calling quickstart.

    > ℹ️ **Info**
    > For the best conversational experience, Agora recommends using Conversational AI Engine with specific Agora Video/Voice SDK versions. For details, [contact technical support](https://docs-md.agora.io/en/mailto:support@agora.io.md).

## Implementation

This section introduces the basic RESTful API requests you use to start and stop a Conversational AI agent. In a production environment, implement these requests on your business server.

### Start a conversational AI agent

Call the `join` endpoint to create an agent instance that joins an Agora channel. Pass in the `channel` name and `token` for agent authentication. To generate your base64-encoded credentials, see [RESTful authentication](https://docs-md.agora.io/en/conversational-ai/rest-api/restful-authentication.mdx.md).

**Node.js**
```js
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
```

**Curl**
```json
curl --request POST \
  --url https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/join \
  --header 'Authorization: Basic <your_base64_encoded_credentials>' \
  --header 'Content-Type: application/json' \
  --data '
{
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
}'
```

**Python**
```python
import requests
import json

url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/join"

headers = {
  "Authorization": "Basic <your_base64_encoded_credentials>",
  "Content-Type": "application/json"
}

data = {
  "name": "unique_name",
  "properties": {
      "channel": "<your_channel_name>",
      "token": "<your_rtc_token>",
      "agent_rtc_uid": "0",
      "remote_rtc_uids": ["*"],
      "enable_string_uid": False,
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
}

response = requests.post(url, headers=headers, data=json.dumps(data))
print(response.text)
```


For complete information on all request parameters, see [Start a conversational AI agent](https://docs-md.agora.io/en/conversational-ai/rest-api/join.md).

If the request is successful, you receive the following response:

```json
// 200 OK
{
  "agent_id": "1NT29X10YHxxxxxWJOXLYHNYB",
  "create_ts": 1737111452,
  "status": "RUNNING"
}
```

Store the `agent_id` for use in subsequent API calls to [query](https://docs-md.agora.io/en/conversational-ai/rest-api/query.md), [update](https://docs-md.agora.io/en/conversational-ai/rest-api/update.md), and [stop](https://docs-md.agora.io/en/conversational-ai/rest-api/leave.md) the AI agent.

### Stop the conversational AI agent

To end the conversation with the AI agent, call the `leave` endpoint. This causes the agent to leave the Agora channel.

**Node.js**
```js
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
```

**Curl**
```bash
curl --request post \
  --url https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/leave \
  --header 'Authorization: Basic <your_base64_encoded_credentials>'
```

**Python**
```python
import requests

url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/leave"

headers = {
  "Authorization": "Basic <your_base64_encoded_credentials>",
  "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)
print(response.text)
```


If the request is successful, the server responds with a `200 OK` status and an empty JSON object.

```json
// 200 OK
{}
```

> ℹ️ **Info**
> The number of Peak Concurrent Users (PCU) allowed to call the server API under a single App ID is limited to 20. If you need to increase this limit, please [contact technical support](https://docs-md.agora.io/en/mailto:support@agora.io.md).

## Reference

This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

### API reference

- [Start a conversational AI agent](https://docs-md.agora.io/en/conversational-ai/rest-api/join.md)
- [Stop a conversational AI agent](https://docs-md.agora.io/en/conversational-ai/rest-api/leave.md)
- [Update agent configuration](https://docs-md.agora.io/en/conversational-ai/rest-api/update.md)
- [Query agent status](https://docs-md.agora.io/en/conversational-ai/rest-api/query.md)
- [Retrieve a list of agents](https://docs-md.agora.io/en/conversational-ai/rest-api/list.md)









// HTTP basic authentication example in node.js using the <Vg k="VSDK" /> Server RESTful API
const https = require('https')
// Customer ID
const customerKey = "Your customer ID"
// Customer secret
const customerSecret = "Your customer secret"
// Concatenate customer key and customer secret and use base64 to encode the concatenated string
const plainCredential = customerKey + ":" + customerSecret
// Encode with base64
encodedCredential = Buffer.from(plainCredential).toString('base64')
authorizationField = "Basic " + encodedCredential

// Set request parameters
const options = {
  hostname: 'api.agora.io',
  port: 443,
  path: '/dev/v2/projects',
  method: 'GET',
  headers: {
    'Authorization':authorizationField,
    'Content-Type': 'application/json'
  }
}

// Create request object and send request
const req = https.request(options, res => {
  console.log(`Status code: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.end()




### start converstational const axios = require("axios");

const url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/join";

const headers = {
  "Authorization": "Basic <your_base64_encoded_credentials>"
};

const data = {
  name: "unique_name",
  properties: {
    channel: "channel_name",
    token: "token",
    agent_rtc_uid: "1001",
    remote_rtc_uids: ["1002"],
    idle_timeout: 120,
    advanced_features: {
      enable_aivad: true
    },
    llm: {
      url: "https://api.openai.com/v1/chat/completions",
      api_key: "<your_llm_key>",
      system_messages: [
        {
          role: "system",
          content: "You are a helpful chatbot."
        }
      ],
      max_history: 32,
      greeting_message: "Hello, how can I assist you today?",
      failure_message: "Please hold on a second.",
      params: {
        model: "gpt-4o-mini"
      }
    },
    tts: {
      vendor: "microsoft",
      params: {
        key: "<your_tts_api_key>",
        region: "eastus",
        voice_name: "en-US-AndrewMultilingualNeural"
      }
    },
    asr: {
      language: "en-US"
    }
  }
};

axios
  .post(url, data, { headers })
  .then(response => {
    console.log("Status:", response.status);
    console.log("Response:", response.data);
  })
  .catch(error => {
    console.error("Error:", error.response ? error.response.data : error.message);
  });

