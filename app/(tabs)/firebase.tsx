import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Button, ActivityIndicator } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function FirebaseTestScreen() {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ref = doc(db, 'tests', 'hello');
      // Write a timestamp each time
      await setDoc(ref, { message: 'Hello from Expo!', ts: Date.now() }, { merge: true });
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setValue(JSON.stringify(snap.data(), null, 2));
      } else {
        setValue('No document found');
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Optionally auto-run on first mount
    runTest();
  }, [runTest]);

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#CCE5FF', dark: '#123' }}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Firebase Smoke Test</ThemedText>
        <ThemedText>
          This screen writes a test doc to Firestore (collection "tests", id "hello") and reads it back.
        </ThemedText>
        <Button title="Run Test" onPress={runTest} />
        {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
        {error && (
          <ThemedText style={{ color: 'red', marginTop: 12 }}>Error: {error}</ThemedText>
        )}
        {value && (
          <ThemedText style={styles.code}>{value}</ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  code: {
    marginTop: 12,
    fontFamily: 'SpaceMono',
  },
});
