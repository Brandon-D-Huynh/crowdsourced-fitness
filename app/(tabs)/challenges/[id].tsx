import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Button, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { auth, db } from '@/firebaseConfig';
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any | null>(null);
  const [joined, setJoined] = useState<boolean>(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const ref = doc(db, 'challenges', String(id));
    const unsub = onSnapshot(ref, (snap) => {
      setItem({ id: snap.id, ...snap.data() });
      setLoading(false);
    }, (err) => {
      console.warn('challenge detail error', err);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!id || !uid) { setJoined(false); return; }
    const pref = doc(db, 'challenges', String(id), 'participants', uid);
    const unsub = onSnapshot(pref, (snap) => setJoined(snap.exists()));
    return () => unsub();
  }, [id, auth.currentUser?.uid]);

  useEffect(() => {
    if (!id) return;
    const cref = collection(db, 'challenges', String(id), 'participants');
    const unsub = onSnapshot(cref, (snap) => setCount(snap.size));
    return () => unsub();
  }, [id]);

  const onJoin = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      router.push('/(auth)/sign-in');
      return;
    }
    const pref = doc(db, 'challenges', String(id), 'participants', uid);
    const cref = doc(db, 'challenges', String(id));
    await runTransaction(db, async (tx) => {
      const [pSnap, cSnap] = await Promise.all([tx.get(pref), tx.get(cref)]);
      if (!pSnap.exists()) {
        const current = (cSnap.data()?.participantsCount || 0) as number;
        tx.set(pref, { joinedAt: serverTimestamp() });
        tx.update(cref, { participantsCount: current + 1 });
      }
    });
  };

  const onLeave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      router.push('/(auth)/sign-in');
      return;
    }
    const pref = doc(db, 'challenges', String(id), 'participants', uid);
    const cref = doc(db, 'challenges', String(id));
    await runTransaction(db, async (tx) => {
      const [pSnap, cSnap] = await Promise.all([tx.get(pref), tx.get(cref)]);
      if (pSnap.exists()) {
        const current = (cSnap.data()?.participantsCount || 0) as number;
        tx.delete(pref);
        tx.update(cref, { participantsCount: Math.max(0, current - 1) });
      }
    });
  };

  if (loading) return (<ThemedView style={styles.center}><ActivityIndicator /></ThemedView>);
  if (!item) return (<ThemedView style={styles.center}><ThemedText>Not found</ThemedText></ThemedView>);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        <ThemedText type="title">{item.title}</ThemedText>
        {item.category && <ThemedText style={styles.badge}>{item.category}</ThemedText>}
        {item.difficulty && <ThemedText style={styles.badge}>{item.difficulty}</ThemedText>}
        {item.startsAt && <ThemedText>Starts: {item.startsAt.toDate ? item.startsAt.toDate().toISOString().slice(0,10) : String(item.startsAt)}</ThemedText>}
        {Array.isArray(item.tags) && item.tags.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {item.tags.map((t: string) => (
              <ThemedText key={t} style={styles.tag}>#{t}</ThemedText>
            ))}
          </View>
        )}
        {typeof count === 'number' && (
          <ThemedText>{count} participant{count === 1 ? '' : 's'}</ThemedText>
        )}
        {item.description && <ThemedText>{item.description}</ThemedText>}

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {joined ? (
            <Button title="Leave" onPress={onLeave} color="#ef4444" />
          ) : (
            <Button title="Join" onPress={onJoin} color="#16a34a" />
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { color: '#6b7280' },
  tag: { backgroundColor: '#eef2ff', color: '#4338ca', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
});
