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
import { Link, router } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface Challenge {
  id: string;
  title: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
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
    const q = query(collection(db, "challenges"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: Challenge[] = snap.docs.map((d) => ({
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
            <Link href={`/(tabs)/challenges/${item.id}`} asChild>
              <Pressable style={styles.card}>
                <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                  {item.title}
                </ThemedText>
                <View style={styles.badgeContainer}>
                  {item.category && (
                    <ThemedText style={[styles.badge, styles.categoryBadge]}>
                      {item.category}
                    </ThemedText>
                  )}
                  {item.difficulty && (
                    <ThemedText
                      style={[styles.badge, styles[`${item.difficulty}Badge`]]}
                    >
                      {item.difficulty}
                    </ThemedText>
                  )}
                  {typeof item.participantsCount === "number" && (
                    <ThemedText
                      style={[styles.badge, styles.participantsBadge]}
                    >
                      {item.participantsCount} joined
                    </ThemedText>
                  )}
                </View>
                {item.description && (
                  <ThemedText numberOfLines={2} style={styles.cardDescription}>
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
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#000000" },
  cardDescription: { color: "#000000", fontSize: 14 },
  badgeContainer: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "500",
  },
  categoryBadge: { backgroundColor: "#e0f2fe", color: "#0369a1" },
  easyBadge: { backgroundColor: "#dcfce7", color: "#166534" },
  mediumBadge: { backgroundColor: "#fef3c7", color: "#92400e" },
  hardBadge: { backgroundColor: "#fee2e2", color: "#991b1b" },
  participantsBadge: { backgroundColor: "#f3e8ff", color: "#7e22ce" },
});
