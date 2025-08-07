import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import { router } from 'expo-router';

export default function NewChallengeScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New fields
  const [category, setCategory] = useState('General');
  const categoryOptions = [
    'General',
    'Cardio/Endurance',
    'Strength/Resistance',
    'Mind-Body/Flexibility',
    'Sports/Activities',
    'Habit/Lifestyle',
  ] as const;

  const [tagsInput, setTagsInput] = useState('');
  const [startsAtInput, setStartsAtInput] = useState(''); // YYYY-MM-DD

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

      // Normalize tags
      const tags = Array.from(new Set(
        tagsInput
          .split(',')
          .map(t => t.trim().toLowerCase())
          .filter(Boolean)
          .map(t => t.replace(/\s+/g, '-'))
      ));

      // Parse startsAt (YYYY-MM-DD, local midnight)
      let startsAt: Timestamp | null = null;
      if (startsAtInput.trim()) {
        const m = startsAtInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
          const [_, y, mo, d] = m;
          const dt = new Date(Number(y), Number(mo) - 1, Number(d), 0, 0, 0);
          startsAt = Timestamp.fromDate(dt);
        }
      }

      await addDoc(collection(db, 'challenges'), {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        category,
        tags,
        startsAt: startsAt ?? null,
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

      <ThemedText type="subtitle">Category</ThemedText>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {categoryOptions.map((c) => (
          <Button key={c} title={c} onPress={() => setCategory(c)} color={category === c ? '#2563eb' : undefined} />
        ))}
      </View>

      <ThemedText type="subtitle">Tags</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Comma-separated, e.g., 5k, running, morning"
        value={tagsInput}
        onChangeText={setTagsInput}
      />

      <ThemedText type="subtitle">Start date/time</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={startsAtInput}
        onChangeText={setStartsAtInput}
      />

      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
      <Button title={loading ? 'Creating…' : 'Create'} onPress={onCreate} disabled={loading} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
});
