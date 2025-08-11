import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collectionGroup,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ChallengeCard } from "@/components/ChallengeCard";
import { auth, db } from "@/firebaseConfig";

export default function HistoryScreen() {
  const [user, setUser] = useState<any | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [pastChallenges, setPastChallenges] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const challengesQuery = query(
          collectionGroup(db, "participants"),
          where("uid", "==", u.uid)
        );
        const unsubscribeChallenges = onSnapshot(challengesQuery, (snap) => {
          const refs = snap.docs.map((d) => d.ref.parent.parent!);
          Promise.all(
            refs.map((ref) => new Promise((resolve) => onSnapshot(ref, resolve)))
          ).then((results: any) => {
            const challengesData = results.map((r: any) => ({ id: r.id, ...r.data() }));
            setChallenges(challengesData);
          });
        });

        return () => {
          unsubscribeChallenges();
        };
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Filter past challenges
  useEffect(() => {
    const now = new Date();
    const past = challenges.filter(challenge => {
      // Challenge is past if it has an end date and that date has passed
      return challenge.endsAt && challenge.endsAt.toDate() < now;
    });
    setPastChallenges(past);
  }, [challenges]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>← Back</ThemedText>
        </Pressable>
        <ThemedText type="title" style={styles.title}>
          Challenge History
        </ThemedText>
      </View>
      
      {user ? (
        <View style={styles.challengesContainer}>
          {pastChallenges.length > 0 ? (
            <FlatList
              data={pastChallenges}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={({ item }) => (
                <ChallengeCard challenge={item} />
              )}
            />
          ) : (
            <ThemedText style={styles.emptyText}>
              You have no completed challenges yet.
            </ThemedText>
          )}
        </View>
      ) : (
        <View style={styles.signInContainer}>
          <ThemedText>You are not signed in.</ThemedText>
          <Pressable
            style={styles.signInButton}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <ThemedText style={styles.signInButtonText}>Sign In</ThemedText>
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#374151",
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  challengesContainer: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6b7280",
    fontSize: 16,
  },
  signInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  signInButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signInButtonText: {
    color: "white",
    fontWeight: "600",
  },
});