import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import AgoraRTC from 'agora-rtc-sdk-ng';
import Form from './Form';

export default function App() {
  // User management state
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(true); // Show form initially
  
  // Original working voice states
  const [isInCall, setIsInCall] = useState(false);
  const [client, setClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [agentId, setAgentId] = useState(null);
  const [usersBeforeAgent, setUsersBeforeAgent] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [micStatus, setMicStatus] = useState('Not Ready');
  const [agentStatus, setAgentStatus] = useState('Not Started');

  // Your Agora credentials from environment
  const appId = process.env.EXPO_PUBLIC_AGORA_APP_ID || "4bfab6ca5f69421dac11a910f7287e15";
  const channel = process.env.EXPO_PUBLIC_AGORA_CHANNEL || "test-channel";
  const token = process.env.EXPO_PUBLIC_AGORA_TOKEN || "007eJxTYHg7NXxjrO+p5HCvO5tYbpf371vQsS5u/nH3k669T+47aSooMJgkpSUmmSUnmqaZWZoYGaYkJhsaJloaGqSZG1mYpxqatiuKZzYEMjK4HFnPwsgAgSA+D0NJanGJbnJGYl5eag4DAwDafSOD";
  const uid = Math.floor(Math.random() * 10000);

  useEffect(() => {
    initializeClient();
    return () => cleanup();
  }, []);

  // User management callback (not used yet)
  const handleUserCreated = (userData) => {
    console.log('User created:', userData);
    setUser(userData);
    setShowForm(false);
  };

  const initializeClient = () => {
    const agoraClient = AgoraRTC.createClient({ 
      mode: "rtc", 
      codec: "vp8",
      enableLogUpload: false // Disable stats collection to avoid CORS errors
    });
    setupEventListeners(agoraClient);
    setClient(agoraClient);
  };

  const setupEventListeners = (agoraClient) => {
    agoraClient.on("connection-state-changed", (curState, revState) => {
      console.log(`🔗 Connection: ${revState} -> ${curState}`);
      setConnectionStatus(curState);
    });

    agoraClient.on("user-joined", (user) => {
      console.log(`👤 User ${user.uid} joined (type: ${typeof user.uid})`);
      
      // If we have an agent running and this is a new user we haven't seen before
      if (agentId && !usersBeforeAgent.has(user.uid)) {
        console.log('🤖 AI Agent detected!');
        setAgentStatus('AI Agent Joined');
      }
    });

    agoraClient.on("user-published", async (user, mediaType) => {
      await agoraClient.subscribe(user, mediaType);
      console.log(`✅ Subscribed to ${user.uid} ${mediaType}`);
      
      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.setVolume(100);
        remoteAudioTrack.play();
        console.log(`🔊 Playing audio from user ${user.uid}`);
        
        // If agent is running and this user wasn't there before, it's likely the agent
        if (agentId && !usersBeforeAgent.has(user.uid)) {
          setAgentStatus('AI Agent Speaking');
        }
      }
    });

    agoraClient.on("user-unpublished", async (user) => {
      console.log(`📵 User ${user.uid} unpublished`);
      if (agentId && !usersBeforeAgent.has(user.uid)) {
        setAgentStatus('AI Agent Listening');
      }
    });

    agoraClient.on("user-left", (user) => {
      console.log(`👋 User ${user.uid} left`);
      if (agentId && !usersBeforeAgent.has(user.uid)) {
        setAgentStatus('AI Agent Left');
      }
    });
  };

  const createLocalAudioTrack = async () => {
    try {
      console.log("🎤 Requesting microphone access...");
      setMicStatus('Requesting...');
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      console.log("✅ Microphone access granted");
      setMicStatus('Ready');
      setLocalAudioTrack(audioTrack);
      return audioTrack;
    } catch (error) {
      console.error("❌ Microphone access failed:", error);
      setMicStatus('Failed');
      Alert.alert('Microphone Error', 'Please allow microphone access');
      throw error;
    }
  };

  const startAIAgent = async () => {
    try {
      setAgentStatus('Starting AI Agent...');
      
      // Create personalized context based on user data
      const userContext = user ? {
        name: user.name,
        age: user.age,
        language: user.preferences?.voicePreference || 'English',
        medications: user.currentMedications || [],
        conditions: user.medicalConditions || []
      } : null;
      
      const response = await fetch('http://192.168.1.8:3000/api/start-ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channel,
          token: token,
          uid: uid,
          userContext: userContext // Pass user context to backend
        })
      });

      const result = await response.json();
      console.log('AI Agent Result:', result);
      
      if (result.success && result.agent_id) {
        setAgentId(result.agent_id);
        setAgentStatus('AI Agent Started - Joining Channel...');
        Alert.alert('Success', `Hi ${user?.name || 'there'}! AI Agent started. You can now talk about your medications.`);
      } else {
        setAgentStatus('AI Agent Failed');
        Alert.alert('Error', `Failed to start AI agent: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('AI Agent Error:', error);
      setAgentStatus('AI Agent Error');
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const stopAIAgent = async () => {
    if (!agentId) return;
    
    try {
      await fetch('http://192.168.1.8:3000/api/stop-ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });
      
      setAgentId(null);
      console.log('AI Agent stopped');
    } catch (error) {
      console.error('Stop AI Agent Error:', error);
    }
  };

  const handleTalkToMe = async () => {
    if (isInCall) {
      // End call
      await stopAIAgent();
      
      if (localAudioTrack) {
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      
      if (client) {
        await client.leave();
      }
      
      setIsInCall(false);
      setUsersBeforeAgent(new Set());
      Alert.alert('Call Ended', 'Conversation ended');
      return;
    }

    try {
      // Start call
      await client.join(appId, channel, token, uid);
      
      // Track existing users before starting agent
      const existingUsers = new Set(client.remoteUsers.map(user => user.uid));
      existingUsers.add(uid); // Add our own UID
      setUsersBeforeAgent(existingUsers);
      console.log('Users before agent:', Array.from(existingUsers));
      
      const audioTrack = await createLocalAudioTrack();
      await client.publish([audioTrack]);
      
      console.log("Joined channel successfully!");
      setIsInCall(true);
      
      // Start AI agent after joining channel
      await startAIAgent();
      
    } catch (error) {
      console.error('Join error:', error);
      Alert.alert('Error', 'Failed to start voice call');
    }
  };

  const cleanup = async () => {
    if (localAudioTrack) {
      localAudioTrack.close();
    }
    if (client) {
      await client.leave();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Form (hidden initially since showForm=false) */}
      {showForm && (
        <View style={styles.formOverlay}>
          <Form onUserCreated={handleUserCreated} />
        </View>
      )}
      
      {/* User header with profile button */}
      {user && !showForm && (
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome, {user.name}! 💊</Text>
          <TouchableOpacity style={styles.profileButton} onPress={() => setShowForm(true)}>
            <Text style={styles.profileText}>Profile</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Original working interface */}
      <TouchableOpacity 
        style={[styles.circle, isInCall && styles.activeCircle]} 
        onPress={handleTalkToMe}
      >
        <Text style={styles.text}>
          {isInCall ? 'End Call' : 'Talk to Me'}
        </Text>
      </TouchableOpacity>
      
      {isInCall && (
        <View style={styles.statusContainer}>
          <Text style={styles.status}>🔗 Connection: {connectionStatus}</Text>
          <Text style={styles.status}>🎤 Microphone: {micStatus}</Text>
          <Text style={styles.status}>🤖 AI Agent: {agentStatus}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  profileText: {
    color: 'white',
    fontWeight: 'bold',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeCircle: {
    backgroundColor: '#FF3B30',
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  status: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
