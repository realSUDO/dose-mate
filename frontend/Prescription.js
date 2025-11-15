import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, ScrollView } from 'react-native';

export default function Prescription({ user, onComplete }) {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', instructions: '' }
  ]);

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', instructions: '' }]);
  };

  const handleMedicationChange = (index, field, value) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const handlePDFUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('filename', file.name);

        const response = await fetch(`http://localhost:3000/api/upload-pdf/${user._id || user.id || 'test-user'}`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (result.success) {
          alert(`PDF processed! ${result.vectorCount} chunks stored.`);
        } else {
          alert('Upload failed: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed');
      }
    };
    input.click();
  };

  const handleSave = async () => {
    try {
      // Filter out empty medications
      const validMedications = medications.filter(med => med.name.trim());
      
      if (validMedications.length === 0) {
        alert('Please add at least one medication');
        return;
      }

      // Update user with medications
      const response = await fetch(`http://192.168.1.8:3000/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...user,
          currentMedications: validMedications
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('✅ Medications saved:', updatedUser);
        onComplete(updatedUser);
      } else {
        alert('Failed to save medications');
      }
    } catch (error) {
      console.error('Error saving medications:', error);
      alert('Network error');
    }
  };

  if (showManualEntry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowManualEntry(false)}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>💊 Add Medications</Text>
          </View>

          <ScrollView style={styles.form}>
            {medications.map((med, index) => (
              <View key={index} style={styles.medicationCard}>
                <Text style={styles.cardTitle}>Medication {index + 1}</Text>
                
                <Text style={styles.label}>Medicine Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Aspirin"
                  value={med.name}
                  onChangeText={(value) => handleMedicationChange(index, 'name', value)}
                />

                <Text style={styles.label}>Dosage</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 100mg"
                  value={med.dosage}
                  onChangeText={(value) => handleMedicationChange(index, 'dosage', value)}
                />

                <Text style={styles.label}>Frequency</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Twice daily"
                  value={med.frequency}
                  onChangeText={(value) => handleMedicationChange(index, 'frequency', value)}
                />

                <Text style={styles.label}>Instructions</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Take with food"
                  value={med.instructions}
                  onChangeText={(value) => handleMedicationChange(index, 'instructions', value)}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={handleAddMedication}>
              <Text style={styles.addButtonText}>+ Add Another Medication</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>💊 Add Your Prescriptions</Text>
          <Text style={styles.subtitle}>How would you like to add your medications?</Text>
        </View>

        <View style={styles.main}>
          <TouchableOpacity 
            style={[styles.optionButton, styles.uploadButton]}
            onPress={handlePDFUpload}
          >
            <Text style={styles.iconText}>📄</Text>
            <Text style={styles.optionText}>Upload PDF</Text>
            <Text style={styles.optionSubtext}>Upload prescription image or PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => setShowManualEntry(true)}
          >
            <Text style={styles.iconText}>⌨️</Text>
            <Text style={styles.optionText}>Manual Entry</Text>
            <Text style={styles.optionSubtext}>Type medication details manually</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionButton, styles.skipButton]}
            onPress={() => onComplete(user)}
          >
            <Text style={styles.iconText}>⏭️</Text>
            <Text style={styles.optionText}>Skip for Now</Text>
            <Text style={styles.optionSubtext}>Add medications later</Text>
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
  backButton: {
    fontSize: 18,
    color: '#007AFF',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  optionButton: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(17, 24, 39, 0.1)',
  },
  uploadButton: {
    backgroundColor: 'rgba(224, 247, 250, 0.9)',
  },
  skipButton: {
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
  },
  iconText: {
    fontSize: 48,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  optionSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  medicationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(17, 24, 39, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.5)',
  },
  addButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  footer: {
    paddingTop: 20,
  },
  saveButton: {
    backgroundColor: '#41c8d4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
