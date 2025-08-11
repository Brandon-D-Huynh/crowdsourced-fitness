import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from './ThemedText';

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
  startsAt?: any;
  endsAt?: any;
}

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <Link href={`/(tabs)/challenges/${challenge.id}`} asChild>
      <Pressable style={styles.card}>
        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
          {challenge.title}
        </ThemedText>
        <View style={styles.badgeContainer}>
          {challenge.category && (
            <ThemedText style={[styles.badge, styles.categoryBadge]}>
              {challenge.category}
            </ThemedText>
          )}
          {challenge.difficulty && (
            <ThemedText
              style={[styles.badge, styles[`${challenge.difficulty}Badge`]]}
            >
              {challenge.difficulty}
            </ThemedText>
          )}
          {typeof challenge.participantsCount === "number" && (
            <ThemedText
              style={[styles.badge, styles.participantsBadge]}
            >
              {challenge.participantsCount} joined
            </ThemedText>
          )}
          {challenge.endsAt && (
            <ThemedText style={[styles.badge, styles.dateBadge]}>
              Ends: {new Date(challenge.endsAt.toDate()).toLocaleDateString()}
            </ThemedText>
          )}
        </View>
        {challenge.description && (
          <ThemedText numberOfLines={2} style={styles.cardDescription}>
            {challenge.description}
          </ThemedText>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
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
  dateBadge: { backgroundColor: "#fef2f2", color: "#dc2626" },
});