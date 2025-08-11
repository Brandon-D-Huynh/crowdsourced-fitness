import { ThemedTextInput } from '@/components/ThemedTextInput';
import { router } from 'expo-router';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Button, StyleSheet, View, ScrollView } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ImagePickerComponent } from '@/components/ImagePicker';
import { auth, db } from '@/firebaseConfig';

export default function NewChallengeScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | '' > ('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const [endsAtInput, setEndsAtInput] = useState(''); // YYYY-MM-DD
  const [imageUrl, setImageUrl] = useState('');

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

      const tags = Array.from(
        new Set(
          tagsInput
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
            .map((t) => t.replace(/\s+/g, '-')),
        ),
      );

      let startsAt: Timestamp | null = null;
      if (startsAtInput.trim()) {
        const m = startsAtInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
          const [_, y, mo, d] = m;
          const dt = new Date(Number(y), Number(mo) - 1, Number(d), 0, 0, 0);
          startsAt = Timestamp.fromDate(dt);
        }
      }

      let endsAt: Timestamp | null = null;
      if (endsAtInput.trim()) {
        const m = endsAtInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
          const [_, y, mo, d] = m;
          const dt = new Date(Number(y), Number(mo) - 1, Number(d), 23, 59, 59); // End of day
          endsAt = Timestamp.fromDate(dt);
        }
      }

      await addDoc(collection(db, 'challenges'), {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        category,
        tags,
        imageUrl: imageUrl || null,
        startsAt: startsAt ?? null,
        endsAt: endsAt ?? null,
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="title">New Challenge</ThemedText>
        
        <ImagePickerComponent 
          onImageUploaded={setImageUrl}
          currentImageUrl={imageUrl}
          placeholder="Add a cover image for your challenge"
        />
        
        <ThemedTextInput placeholder="Title" value={title} onChangeText={setTitle} />
        <ThemedTextInput
          style={{ height: 100 }}
          placeholder="Description"
          multiline
          value={description}
          onChangeText={setDescription}
        />
        
        <ThemedText type="subtitle">Difficulty</ThemedText>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['easy', 'medium', 'hard'] as const).map((d) => (
          <Button
            key={d}
            title={d}
            onPress={() => setDifficulty(d)}
            color={difficulty === d ? '#2563eb' : undefined}
          />
        ))}
      </View>

      <ThemedText type="subtitle">Category</ThemedText>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {categoryOptions.map((c) => (
          <Button
            key={c}
            title={c}
            onPress={() => setCategory(c)}
            color={category === c ? '#2563eb' : undefined}
          />
        ))}
      </View>

      <ThemedText type="subtitle">Tags</ThemedText>
      <ThemedTextInput
        placeholder="Comma-separated, e.g., 5k, running, morning"
        value={tagsInput}
        onChangeText={setTagsInput}
      />

      <ThemedText type="subtitle">Start date</ThemedText>
      <ThemedTextInput
        placeholder="YYYY-MM-DD"
        value={startsAtInput}
        onChangeText={setStartsAtInput}
      />

      <ThemedText type="subtitle">End date</ThemedText>
      <ThemedTextInput
        placeholder="YYYY-MM-DD"
        value={endsAtInput}
        onChangeText={setEndsAtInput}
      />

        {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
        <Button title={loading ? 'Creating…' : 'Create'} onPress={onCreate} disabled={loading} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  scrollContent: { gap: 12, paddingBottom: 32 },
});