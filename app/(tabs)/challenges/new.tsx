import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import { router } from 'expo-router';

export default function NewChallengeScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCreate = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!difficulty) {
      setError('Please select a difficulty');
      return;
    }
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid ?? 'anonymous';
      await addDoc(collection(db, 'challenges'), {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        createdBy: uid,
        createdAt: serverTimestamp(),
      });
      router.replace('/(tabs)/challenges');
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">New Challenge</ThemedText>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['easy','medium','hard'] as const).map((d) => (
          <Button key={d} title={d} onPress={() => setDifficulty(d)} color={difficulty === d ? '#2563eb' : undefined} />
        ))}
      </View>
      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
      <Button title={loading ? 'Creating…' : 'Create'} onPress={onCreate} disabled={loading} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
});
