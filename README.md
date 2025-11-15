# 💊 DoseMate - AI-Powered Medication Assistant

> **Your intelligent companion for medication management with voice AI and prescription processing**

![DoseMate Banner](https://img.shields.io/badge/DoseMate-AI%20Healthcare-blue?style=for-the-badge&logo=medical-cross)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?style=flat&logo=react)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb)](https://mongodb.com/)
[![Agora](https://img.shields.io/badge/Agora-Voice%20AI-FF6B35?style=flat)](https://agora.io/)

## 🌟 Introduction

DoseMate is a revolutionary healthcare application that combines **voice AI technology**, **document processing**, and **personalized medication management** to help users manage their prescriptions safely and effectively. Built for hackathons and real-world healthcare applications, DoseMate demonstrates the power of AI in making healthcare more accessible.

### 🎯 The Problem We Solve

- **Medication Confusion**: Patients often forget dosages, timing, and instructions
- **Complex Prescriptions**: Multiple medications with different schedules
- **Accessibility**: Elderly or visually impaired users need voice-first interfaces
- **Document Management**: Paper prescriptions are hard to track and reference

### 💡 Our Solution

DoseMate provides an **AI-powered voice assistant** that:
- Understands your prescription documents through **PDF processing**
- Answers medication questions in **real-time voice conversations**
- Provides **personalized guidance** based on your specific prescriptions
- Offers **professional-grade audio quality** with noise suppression

---

## 🚀 Features

### 🗣️ **Voice AI Assistant**
- **Real-time voice conversations** with personalized AI agent
- **Gemini 2.0-flash LLM** for intelligent responses
- **Cartesia TTS** for natural voice synthesis
- **Agora RTC** for seamless voice communication
- **AI Noise Suppression** for crystal-clear audio

### 📄 **Smart Document Processing**
- **PDF prescription upload** and text extraction
- **Content safety validation** ensures medical relevance
- **RAG (Retrieval-Augmented Generation)** pipeline
- **Intelligent context retrieval** for accurate responses
- **HuggingFace embeddings** for document understanding

### 👤 **Personalized Experience**
- **User profiles** with medical history and preferences
- **Medication tracking** with dosage and frequency information
- **Emergency contact management** for safety
- **Multi-language support** (English/Hindi)

### 🛡️ **Safety & Security**
- **Healthcare domain restrictions** - only medical topics
- **Content filtering** and sanitization
- **Medical disclaimers** on all responses
- **PII protection** and data privacy
- **Professional medical guidance** recommendations

---

## 🏗️ Project Structure

```
dosemate/
├── 📱 frontend/                 # React Native (Expo) Application
│   ├── App.js                  # Main application component
│   ├── Form.js                 # User profile form
│   ├── Prescription.js         # Prescription management
│   ├── LoginSignup.js          # Authentication (legacy)
│   └── public/external/        # AI Denoiser WASM files
│
├── 🖥️ backend/                  # Node.js Express Server
│   ├── server.js               # Main server with API endpoints
│   ├── models/                 # MongoDB data models
│   │   └── User.js             # User schema definition
│   └── services/               # Business logic services
│       ├── ragService.js       # PDF processing & context retrieval
│       └── contentSafety.js    # Content filtering & validation
│
├── 📋 Configuration Files
│   ├── .env.example            # Environment variables template
│   ├── .gitignore              # Git ignore rules
│   └── package.json            # Dependencies and scripts
│
└── 📚 Documentation
    └── README.md               # This file
```

---

## 🛠️ Technology Stack

### **Frontend**
- **React Native** with Expo for cross-platform development
- **Agora RTC SDK** for real-time voice communication
- **AI Denoiser Extension** for noise suppression
- **React Hooks** for state management

### **Backend**
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **PDF-Parse** for document text extraction
- **HuggingFace Transformers** for embeddings

### **AI & Voice**
- **Google Gemini 2.0-flash** for conversational AI
- **Cartesia TTS** for natural voice synthesis
- **Agora Conversational AI Engine** for voice processing
- **Content Safety Service** for healthcare compliance

### **Infrastructure**
- **MongoDB Atlas** for cloud database
- **HuggingFace Inference API** for embeddings
- **Agora Cloud** for voice infrastructure
- **Local WASM** files for AI noise suppression

---

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account
- Agora.io account with App ID and credentials
- Google AI Studio API key (Gemini)
- Cartesia API key for TTS

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/realSUDO/dose-mate.git
   cd dose-mate
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and credentials
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the backend server**
   ```bash
   cd ../backend
   npm start
   ```

6. **Start the frontend application**
   ```bash
   cd ../frontend
   npm start
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dosemate

# Agora Voice AI
AGORA_APP_ID=your_agora_app_id
AGORA_CUSTOMER_ID=your_customer_id
AGORA_CUSTOMER_SECRET=your_customer_secret
AGORA_TOKEN=your_channel_token

# AI Services
GEMINI_API_KEY=your_gemini_api_key
CARTESIA_API_KEY=your_cartesia_api_key

# Optional: HuggingFace for enhanced embeddings
HUGGINGFACE_API_KEY=your_hf_token
```

---

## 🎮 Usage

### 1. **User Onboarding**
- Fill out the profile form with name, age, and preferences
- Add emergency contact information
- Choose preferred language (English/Hindi)

### 2. **Prescription Management**
- Upload prescription PDF documents
- Or manually enter medication details
- System validates medical content for safety

### 3. **Voice Interaction**
- Click "Talk to Me" to start voice conversation
- Ask questions about your medications:
  - *"How many times do I take my medication?"*
  - *"What are the side effects of Metformin?"*
  - *"When should I take my blood pressure medicine?"*

### 4. **AI Responses**
- Get personalized answers based on your prescriptions
- Receive short, direct responses
- Always includes medical disclaimers for safety

---

## 🏆 Key Achievements

### **Technical Innovation**
- ✅ **Complete RAG Pipeline** - PDF to AI context in real-time
- ✅ **Voice AI Integration** - Seamless conversation experience
- ✅ **Content Safety** - Healthcare-focused with guardrails
- ✅ **Professional Audio** - AI noise suppression for clarity
- ✅ **Scalable Architecture** - Microservices-ready design

### **Healthcare Impact**
- ✅ **Accessibility** - Voice-first interface for all users
- ✅ **Safety** - Medical disclaimers and professional guidance
- ✅ **Personalization** - Context-aware responses
- ✅ **Document Digitization** - Paper to digital conversion
- ✅ **Medication Adherence** - Easy access to prescription info

### **User Experience**
- ✅ **Intuitive Interface** - Simple, clean design
- ✅ **Real-time Processing** - Instant PDF analysis
- ✅ **Multi-language** - English and Hindi support
- ✅ **Error Handling** - Graceful fallbacks and recovery
- ✅ **Professional Quality** - Hospital-grade audio processing

---

## 🔮 Future Enhancements

- **📱 Mobile App** - Native iOS and Android applications
- **🔔 Smart Reminders** - Medication timing notifications
- **📊 Analytics Dashboard** - Medication adherence tracking
- **🏥 Healthcare Integration** - Connect with hospital systems
- **🌍 Multi-language** - Support for more languages
- **📈 Health Insights** - Medication effectiveness tracking

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Agora.io** for voice AI infrastructure
- **Google AI** for Gemini LLM capabilities
- **Cartesia** for natural TTS voices
- **HuggingFace** for embedding models
- **MongoDB** for database services
- **Healthcare Community** for inspiration and guidance

---

## 📞 Contact & Support

- **GitHub**: [realSUDO/dose-mate](https://github.com/realSUDO/dose-mate)
- **Issues**: [Report bugs or request features](https://github.com/realSUDO/dose-mate/issues)
- **Discussions**: [Join the community](https://github.com/realSUDO/dose-mate/discussions)

---

<div align="center">

**Made with ❤️ for better healthcare accessibility**

*DoseMate - Making medication management simple, safe, and accessible for everyone*

</div>
