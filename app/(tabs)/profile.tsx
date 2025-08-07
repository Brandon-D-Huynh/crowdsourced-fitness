import { router } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/firebaseConfig';

export default function ProfileScreen() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
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
          <ThemedText type="title">Profile</ThemedText>
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