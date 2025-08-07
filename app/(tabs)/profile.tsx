import { router } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth, db } from '@/firebaseConfig';

interface Profile {
  displayName?: string;
  username?: string;
  bio?: string;
  fitnessGoal?: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const profileDoc = doc(db, 'profiles', u.uid);
        const unsubscribeProfile = onSnapshot(profileDoc, (doc) => {
          setProfile(doc.data() as Profile);
        });
        return () => unsubscribeProfile();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const onSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error', e);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {user ? (
        <View style={{ gap: 12 }}>
          <ThemedText type="title">{profile?.displayName ?? 'Profile'}</ThemedText>
          {profile?.username && <ThemedText type="subtitle">@{profile.username}</ThemedText>}
          {profile?.bio && <ThemedText>{profile.bio}</ThemedText>}
          {profile?.fitnessGoal && <ThemedText>Goal: {profile.fitnessGoal}</ThemedText>}

          <View style={{ height: 24 }} />

          <ThemedText>UID: {user.uid}</ThemedText>
          <ThemedText>Email: {user.email}</ThemedText>
          <Button title="Sign Out" onPress={onSignOut} />
        </View>
      ) : (
        <View style={{ gap: 12, alignItems: 'center' }}>
          <ThemedText>You are not signed in.</ThemedText>
          <Button title="Sign In" onPress={() => router.push('/(auth)/sign-in')} />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
});
