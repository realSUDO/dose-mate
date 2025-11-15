import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

const PDFUpload = ({ userId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  
  console.log('PDFUpload component loaded with userId:', userId);

  const handleUpload = () => {
    console.log('Upload button clicked');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      
      try {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('filename', file.name);

        const response = await fetch(`http://localhost:3000/api/upload-pdf/${userId}`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (result.success) {
          Alert.alert('Success', `PDF processed! ${result.vectorCount} chunks stored.`);
          onUploadComplete && onUploadComplete(result);
        } else {
          Alert.alert('Error', result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Error', 'Upload failed');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={handleUpload}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          {uploading ? 'Processing PDF...' : '📄 Upload Prescription PDF'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PDFUpload;
