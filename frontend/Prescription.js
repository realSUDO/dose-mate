import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, ScrollView } from 'react-native';

export default function Prescription({ user, onComplete }) {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [pdfUploaded, setPdfUploaded] = useState(false);
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

      console.log('📄 PDF selected:', file.name);

      try {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('filename', file.name);

        console.log('📡 Uploading to:', `http://localhost:3000/api/upload-pdf/${user._id || user.id || 'test-user'}`);

        const response = await fetch(`https://dosemate-backend-532131686372.us-central1.run.app/api/upload-pdf/${user._id || user.id || 'test-user'}`, {
          method: 'POST',
          body: formData,
        });

        console.log('📥 Upload response status:', response.status);
        const result = await response.json();
        console.log('📥 Upload result:', result);
        
        if (result.success) {
          setPdfUploaded(true);
          alert(`PDF processed! ${result.vectorCount} chunks stored. You can now proceed.`);
        } else {
          // Still enable Next button even if upload fails
          setPdfUploaded(true);
          alert('Upload failed but you can still proceed: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Upload error:', error);
        // Still enable Next button even if upload fails
        setPdfUploaded(true);
        alert('Upload failed but you can still proceed');
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
            <Text style={styles.optionText}>Upload Prescription PDF</Text>
            <Text style={styles.optionSubtext}>Upload your prescription document</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => setShowManualEntry(true)}
          >
            <Text style={styles.iconText}>⌨️</Text>
            <Text style={styles.optionText}>Manual Entry</Text>
            <Text style={styles.optionSubtext}>Type medication details manually</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={[
              styles.nextButtonSmall, 
              pdfUploaded ? styles.nextButtonEnabled : styles.nextButtonDisabled
            ]}
            onPress={() => pdfUploaded && onComplete(user)}
            disabled={!pdfUploaded}
          >
            <Text style={[styles.nextButtonText, !pdfUploaded && styles.disabledText]}>
              {pdfUploaded ? 'Next' : 'Upload PDF to Continue'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onComplete(user)}>
            <Text style={styles.skipText}>Skip for now</Text>
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
  bottomSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  nextButtonSmall: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 200,
    alignItems: 'center',
  },
  nextButtonEnabled: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(156, 163, 175, 0.6)',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    color: 'rgba(107, 114, 128, 0.8)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  nextButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  skipButton: {
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    opacity: 0.6,
  },
  disabledText: {
    color: 'rgba(107, 114, 128, 0.8)',
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
