import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Link, router } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface Challenge {
  id: string;
  title: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
  participantsCount?: number;
  createdAt?: any;
  createdBy?: string;
}

export default function ChallengesListScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Challenge[]>([]);
  const [signedIn, setSignedIn] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => setSignedIn(!!u));
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data: Challenge[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setItems(data);
      setLoading(false);
    }, (err) => {
      console.warn('Challenges snapshot error', err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="title">Challenges</ThemedText>
        {signedIn ? (
          <Link href="/(tabs)/challenges/new" asChild>
            <Pressable style={styles.addButton}>
              <ThemedText style={{ color: 'white' }}>+ New</ThemedText>
            </Pressable>
          </Link>
        ) : (
          <Pressable style={styles.addButton} onPress={() => router.push('/(auth)/sign-in')}>
            <ThemedText style={{ color: 'white' }}>Sign in to add</ThemedText>
          </Pressable>
        )}
      </View>
      {loading ? (
        <ActivityIndicator />)
        : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <Link href={`/(tabs)/challenges/${item.id}`} asChild>
              <Pressable style={styles.card}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {item.category && (
                    <ThemedText style={styles.badge}>{item.category}</ThemedText>
                  )}
                  {item.difficulty && (
                    <ThemedText style={styles.badge}>{item.difficulty}</ThemedText>
                  )}
                  {typeof item.participantsCount === 'number' && (
                    <ThemedText style={styles.badge}>{item.participantsCount} joined</ThemedText>
                  )}
                </View>
                {item.description && (
                  <ThemedText numberOfLines={2}>
                    {item.description}
                  </ThemedText>
                )}
              </Pressable>
            </Link>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addButton: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  card: { padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, gap: 6 },
  badge: { textTransform: 'capitalize', color: '#6b7280' },
});
