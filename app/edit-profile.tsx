
import { ThemedDropdown } from '@/components/ThemedDropdown';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth, db } from '@/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';

const fitnessGoals = [
  'Build Muscle',
  'Improve Endurance',
  'Lose Weight',
  'Increase Flexibility',
  'Improve Power',
  'General Fitness',
];

export default function EditProfileScreen() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setDisplayName(data.displayName || '');
          setUsername(data.username || '');
          setBio(data.bio || '');
          setFitnessGoal(data.fitnessGoal || '');
        }
      }
    };
    fetchProfile();
  }, []);

  const onUpdateProfile = async () => {
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
        router.back();
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
      <ThemedText type="title" style={styles.title}>Edit your profile</ThemedText>
      
      <View style={styles.fieldContainer}>
        <ThemedText style={styles.header}>Display Name</ThemedText>
        <ThemedTextInput
          placeholder="e.g., Jane Doe"
          value={displayName}
          onChangeText={setDisplayName}
        />
      </View>

      <View style={styles.fieldContainer}>
        <ThemedText style={styles.header}>Username</ThemedText>
        <ThemedTextInput
          placeholder="e.g., @janedoe"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.fieldContainer}>
        <ThemedText style={styles.header}>Bio</ThemedText>
        <ThemedTextInput
          placeholder="Tell us about yourself (Optional)"
          value={bio}
          onChangeText={setBio}
          multiline
        />
      </View>

      <View style={styles.fieldContainer}>
        <ThemedText style={styles.header}>Primary Fitness Goal</ThemedText>
        <ThemedDropdown
          options={fitnessGoals}
          onSelect={setFitnessGoal}
          placeholder="Select your primary fitness goal"
        />
      </View>

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
      <Button title={loading ? 'Updating...' : 'Update Profile'} onPress={onUpdateProfile} disabled={loading} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
});
