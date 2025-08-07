
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth, db } from '@/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet } from 'react-native';

export default function CreateProfileScreen() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCreateProfile = async () => {
    setError(null);
    setLoading(true);

    if (!displayName.trim() || !username.trim()) {
      setError('Please fill out at least your display name and username.');
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'profiles', user.uid), {
          displayName,
          username,
          bio,
          fitnessGoal,
        });
        router.replace('/');
      } else {
        setError('No authenticated user found. Please sign in again.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Create your profile</ThemedText>
      <ThemedTextInput
        placeholder="Display Name (e.g., Jane Doe)"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <ThemedTextInput
        placeholder="Username (e.g., @janedoe)"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <ThemedTextInput
        placeholder="Bio (Optional)"
        value={bio}
        onChangeText={setBio}
        multiline
      />
      <ThemedTextInput
        placeholder="Primary Fitness Goal (e.g., Build Muscle)"
        value={fitnessGoal}
        onChangeText={setFitnessGoal}
      />
      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
      <Button title={loading ? 'Creating...' : 'Create Profile'} onPress={onCreateProfile} disabled={loading} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
});
