import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ChallengeCard } from "@/components/ChallengeCard";
import { Link, router } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";


export default function ChallengesListScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [signedIn, setSignedIn] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => setSignedIn(!!u));
  }, []);

  useEffect(() => {
    const q = query(collection(db, "challenges"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: any[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setItems(data);
        setLoading(false);
      },
      (err) => {
        console.warn("Challenges snapshot error", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <ThemedText type="title" style={styles.headerTitle}>
            Challenges
          </ThemedText>
          <ThemedText type="subtitle" style={styles.headerSubtitle}>
            Join or create a challenge
          </ThemedText>
        </View>
        {signedIn ? (
          <Link href="/(tabs)/challenges/new" asChild>
            <Pressable style={styles.addButton}>
              <ThemedText style={styles.addButtonText}>+ New</ThemedText>
            </Pressable>
          </Link>
        ) : (
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <ThemedText style={styles.addButtonText}>Sign in to add</ThemedText>
          </Pressable>
        )}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <ChallengeCard challenge={item} />
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  headerSubtitle: { fontSize: 14, color: "#6b7280" },
  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
  },
  addButtonText: { color: "white", fontWeight: "600" },
  separator: { height: 12 },
});
