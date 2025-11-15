import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function Form({ onUserCreated, onNext, user }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [language, setLanguage] = useState('English');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [loading, setLoading] = useState(false);

  const languages = ['English', 'Hindi'];

  const handleSave = async () => {
    if (!name || !age) {
      alert('Please fill in name and age');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name,
        age: parseInt(age),
        medicalConditions: [],
        currentMedications: [],
        preferences: {
          aiPersonality: 'friendly',
          reminderFrequency: 'daily',
          voicePreference: language
        },
        emergencyContact
      };

      console.log('Form: User data created:', userData);

      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoading(false);
      if (onNext) {
        onNext(userData); // Go to prescription screen
      }

    } catch (error) {
      console.error('❌ Form: Error creating user:', error);
      setLoading(false);
      alert('Error creating user data');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💊 DoseMate Setup</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, showLanguageDropdown && styles.inputGroupActive]}>
            <Text style={styles.label}>Preferred Language</Text>
            <TouchableOpacity 
              style={styles.input}
              onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <Text style={styles.inputText}>{language}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            
            {showLanguageDropdown && (
              <View style={styles.dropdown}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setLanguage(lang);
                      setShowLanguageDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{lang}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save & Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  inputGroup: {
    gap: 8,
    position: 'relative',
    zIndex: 1,
  },
  inputGroupActive: {
    zIndex: 10000,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#6b7280',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginTop: 8,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    paddingTop: 32,
    paddingBottom: 16,
  },
  saveButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#41c8d4',
    shadowColor: '#41c8d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
