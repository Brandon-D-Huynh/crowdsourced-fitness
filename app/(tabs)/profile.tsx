import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collectionGroup,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, View, Image, FlatList } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { auth, db } from "@/firebaseConfig";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Profile {
  displayName?: string;
  username?: string;
  bio?: string;
  fitnessGoal?: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const cardBackgroundColor = useThemeColor({}, "card");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const profileDoc = doc(db, "profiles", u.uid);
        const unsubscribeProfile = onSnapshot(profileDoc, (doc) => {
          setProfile(doc.data() as Profile);
        });

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
          unsubscribeProfile();
          unsubscribeChallenges();
        };
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const onSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out error", e);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {user ? (
        <View style={styles.profileContainer}>
          <ThemedText type="title" style={styles.title}>
            Your Profile
          </ThemedText>
          <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
            <Image
              source={{
                uri: `https://avatar.iran.liara.run/username?username=${profile?.displayName}`,
              }}
              style={styles.avatar}
            />
            <ThemedText style={styles.displayName}>
              {profile?.displayName}
            </ThemedText>
            <ThemedText style={styles.username}>@{profile?.username}</ThemedText>
            <View style={styles.divider} />
            <ThemedText style={styles.bio}>{profile?.bio}</ThemedText>
            <View style={styles.goalContainer}>
              <ThemedText style={styles.goalLabel}>Primary Goal:</ThemedText>
              <ThemedText style={styles.goalText}>
                {profile?.fitnessGoal}
              </ThemedText>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Edit Profile"
              onPress={() => router.push("/edit-profile")}
            />
            <Button title="Sign Out" onPress={onSignOut} color="#FF3B30" />
          </View>
          <View style={styles.challengesContainer}>
            <ThemedText type="subtitle">Joined Challenges</ThemedText>
            {challenges.length > 0 ? (
              <FlatList
                data={challenges}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.challengeItem}>
                    <ThemedText>{item.title}</ThemedText>
                  </View>
                )}
              />
            ) : (
              <ThemedText>You have not joined any challenges yet.</ThemedText>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.signInContainer}>
          <ThemedText>You are not signed in.</ThemedText>
          <Button
            title="Sign In"
            onPress={() => router.push("/(auth)/sign-in")}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  profileContainer: { gap: 24, alignItems: "center" },
  signInContainer: { gap: 12, alignItems: "center" },
  title: { marginBottom: 16, textAlign: "center" },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },
  displayName: { fontSize: 24, fontWeight: "bold" },
  username: { fontSize: 18, color: "gray", marginBottom: 12 },
  divider: {
    height: 1,
    width: "80%",
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  bio: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 12,
    fontStyle: "italic",
  },
  goalContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  goalLabel: { fontSize: 16, fontWeight: "bold", marginRight: 8 },
  goalText: { fontSize: 16 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  challengesContainer: {
    width: "100%",
    marginTop: 24,
    alignItems: "center",
    gap: 12,
  },
  challengeItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
});

