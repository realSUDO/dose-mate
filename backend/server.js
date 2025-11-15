require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const multer = require('multer');
const User = require('./models/User');
const ragService = require('./services/ragService');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for PDF uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User endpoints with MongoDB
app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    console.log('✅ User saved to MongoDB:', user.name);
    res.status(201).json(user);
  } catch (error) {
    console.error('❌ Error saving user:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    console.log('✅ User updated in MongoDB:', user.name);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PDF upload endpoint
app.post('/api/upload-pdf/:userId', upload.single('pdf'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { filename } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log(`📄 Processing PDF for user ${userId}: ${filename || req.file.originalname}`);
    
    const result = await ragService.processPDF(userId, req.file.buffer, {
      filename: filename || req.file.originalname,
      uploadDate: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'PDF processed successfully',
      ...result
    });
  } catch (error) {
    console.error('❌ PDF upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Your Agora credentials
const appId = process.env.AGORA_APP_ID;
const customerId = process.env.AGORA_CUSTOMER_ID;
const customerSecret = process.env.AGORA_CUSTOMER_SECRET;

// Start AI Agent
app.post('/api/start-ai-agent', async (req, res) => {
  try {
    const { channel, token, uid, userContext, query } = req.body;
    
    console.log('\n🚀 === STARTING AI AGENT ===');
    console.log('📍 Channel:', channel);
    console.log('🆔 UID:', uid);
    console.log('👤 User Context:', userContext);
    console.log('🔍 Query:', query);
    
    // Get RAG context if user has uploaded PDFs
    let ragContext = '';
    if (userContext && userContext._id && query) {
      try {
        const contextResults = await ragService.retrieveContext(userContext._id, query);
        if (contextResults.length > 0) {
          ragContext = '\n\nRelevant prescription information:\n' + 
            contextResults.map(ctx => `- ${ctx.text}`).join('\n');
          console.log('📚 RAG Context retrieved:', ragContext.substring(0, 200) + '...');
        }
      } catch (error) {
        console.log('⚠️ RAG context retrieval failed:', error.message);
      }
    }
    
    // Create personalized system message based on user context
    let systemMessage = "You are DoseMate, a helpful medication assistant. Keep responses very short and conversational.";
    let greetingMessage = "Hi! I'm DoseMate. How can I help you with your medications today?";
    
    if (userContext) {
      systemMessage = `You are DoseMate, a helpful medication assistant for ${userContext.name}, who is ${userContext.age} years old. ` +
        `They prefer ${userContext.language} language. ` +
        (userContext.medications.length > 0 ? `They are currently taking: ${userContext.medications.map(m => m.name).join(', ')}. ` : '') +
        (userContext.conditions.length > 0 ? `They have these medical conditions: ${userContext.conditions.join(', ')}. ` : '') +
        ragContext +
        `Keep responses very short, conversational, and personalized to ${userContext.name}.`;
      
      greetingMessage = `Hi ${userContext.name}! I'm DoseMate, your personal medication assistant. How can I help you today?`;
    }
    
    console.log('🤖 System Message:', systemMessage);
    console.log('👋 Greeting Message:', greetingMessage);
    console.log('🔑 App ID:', appId);
    console.log('👤 Customer ID:', customerId);
    console.log('🔐 Customer Secret:', customerSecret ? 'SET' : 'MISSING');
    console.log('🤖 Gemini API Key:', process.env.GEMINI_API_KEY ? 'SET' : 'MISSING');
    console.log('🎤 Cartesia API Key:', process.env.CARTESIA_API_KEY ? 'SET' : 'MISSING');
    
    // Create base64 credentials using customer ID and secret
    const credentials = Buffer.from(`${customerId}:${customerSecret}`).toString('base64');
    console.log('🔒 Credentials created:', credentials.substring(0, 20) + '...');
    
    const data = {
      name: `ai-agent-${Date.now()}`,
      properties: {
        channel: channel,
        token: token,
        agent_rtc_uid: Math.floor(Math.random() * 1000000).toString(),
        remote_rtc_uids: ["*"],
        enable_string_uid: false,
        idle_timeout: 300,
        llm: {
          url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
          system_messages: [
            {
              parts: [
                {
                  text: systemMessage
                }
              ],
              role: "user"
            }
          ],
          greeting_message: greetingMessage,
          failure_message: "Sorry, could you repeat that?",
          max_history: 10,
          params: {
            model: "gemini-2.0-flash"
          },
          style: "gemini"
        },
        asr: {
          language: "en-US",
          vendor: "ares"
        },
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
      }
    };

    console.log('Making API call to Agora...');
    console.log('Request body:', JSON.stringify(data, null, 2));
    
    const response = await fetch(`https://api.agora.io/api/conversational-ai-agent/v2/projects/${appId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    // Log everything for debugging
    if (!response.ok) {
      console.error('❌ API FAILED:');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Headers:', Object.fromEntries(response.headers.entries()));
      console.error('Error Response:', result);
    } else {
      console.log('✅ API SUCCESS - Agent should be working');
    }
    
    res.json({
      success: response.status === 200,
      status: response.status,
      ...result
    });

  } catch (error) {
    console.error('AI Agent Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stop AI Agent
app.post('/api/stop-ai-agent', async (req, res) => {
  try {
    const { agentId } = req.body;
    
    console.log('\n=== Stopping AI Agent ===');
    console.log('Agent ID:', agentId);
    
    const credentials = Buffer.from(`${customerId}:${customerSecret}`).toString('base64');

    const response = await fetch(`https://api.agora.io/api/conversational-ai-agent/v2/projects/${appId}/agents/${agentId}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Stop response status:', response.status);
    const result = await response.text();
    console.log('Stop response body:', result);

    res.json({
      success: response.status === 200,
      status: response.status,
      message: result || 'Agent stopped'
    });

  } catch (error) {
    console.error('Stop AI Agent Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to check if server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    appId: appId,
    customerId: customerId,
    timestamp: new Date().toISOString()
  });
});

// Test RAG service endpoint
app.get('/api/test-rag', async (req, res) => {
  try {
    // Test text chunking
    const testText = "This is a test prescription. Patient should take 2 tablets of aspirin daily. Take with food. Side effects may include nausea.";
    const chunks = ragService.chunkText(testText, 50, 10);
    
    res.json({
      success: true,
      message: 'RAG service initialized successfully',
      testChunks: chunks.length,
      sampleChunk: chunks[0]?.text || 'No chunks'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📱 App ID: ${appId}`);
  console.log(`👤 Customer ID: ${customerId}`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`\nReady to debug AI agent!\n`);
});
