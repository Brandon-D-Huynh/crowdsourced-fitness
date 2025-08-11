import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '@/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from 'firebase/storage';

interface ImagePickerComponentProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  placeholder?: string;
}

export function ImagePickerComponent({ 
  onImageUploaded, 
  currentImageUrl, 
  placeholder = "Add challenge image" 
}: ImagePickerComponentProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Wide aspect ratio for challenge cards
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    console.log('Starting upload for URI:', uri);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Convert URI to blob
      console.log('Fetching image from URI...');
      const response = await fetch(uri);
      console.log('Response status:', response.status);
      
      const blob = await response.blob();
      console.log('Blob created:', blob.size, 'bytes');

      // Create unique filename
      const timestamp = Date.now();
      const filename = `challenges/${timestamp}.jpg`;
      console.log('Upload filename:', filename);
      
      const storageRef = ref(storage, filename);
      console.log('Storage reference created');

      // Try simple upload first (better for web)
      console.log('Using simple upload method...');
      setUploadProgress(50); // Set progress to 50% during upload
      
      await uploadBytes(storageRef, blob);
      console.log('Upload completed successfully');
      setUploadProgress(100);
      
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL:', downloadURL);
      onImageUploaded(downloadURL);
      setUploading(false);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', `Failed to upload image: ${error.message || error}`);
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.label}>Challenge Image</ThemedText>
      <Pressable 
        style={styles.imageContainer} 
        onPress={pickImage}
        disabled={uploading}
      >
        {currentImageUrl ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: currentImageUrl }} style={styles.image} />
            <View style={styles.overlay}>
              <ThemedText style={styles.overlayText}>Tap to change</ThemedText>
            </View>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderIcon}>📷</ThemedText>
            <ThemedText style={styles.placeholderText}>
              {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : placeholder}
            </ThemedText>
          </View>
        )}
      </Pressable>
      {uploading && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  overlayText: {
    color: 'white',
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
});