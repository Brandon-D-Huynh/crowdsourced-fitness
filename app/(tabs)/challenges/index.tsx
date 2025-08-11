import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
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
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categoryOptions = [
    'General',
    'Cardio/Endurance',
    'Strength/Resistance',
    'Mind-Body/Flexibility',
    'Sports/Activities',
    'Habit/Lifestyle',
  ];

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
        
        // Filter out past challenges
        const now = new Date();
        const activeChallenges = data.filter(challenge => {
          // Show challenge if no end date or end date is in the future/today
          return !challenge.endsAt || challenge.endsAt.toDate() >= now;
        });
        
        setItems(activeChallenges);
        setLoading(false);
      },
      (err) => {
        console.warn("Challenges snapshot error", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(challenge => {
        const titleMatch = challenge.title?.toLowerCase().includes(query);
        const tagMatch = challenge.tags?.some((tag: string) => 
          tag.toLowerCase().includes(query)
        );
        return titleMatch || tagMatch;
      });
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(challenge => challenge.difficulty === difficultyFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(challenge => challenge.category === categoryFilter);
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, difficultyFilter, categoryFilter]);

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
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search challenges by title or tags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterGroup}>
          <ThemedText style={styles.filterLabel}>Difficulty:</ThemedText>
          <View style={styles.filterButtons}>
            {['all', 'easy', 'medium', 'hard'].map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.filterButton,
                  difficultyFilter === level && styles.activeFilterButton
                ]}
                onPress={() => setDifficultyFilter(level as any)}
              >
                <ThemedText style={[
                  styles.filterButtonText,
                  difficultyFilter === level && styles.activeFilterButtonText
                ]}>
                  {level === 'all' ? 'All' : level}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
        
        <View style={styles.filterGroup}>
          <ThemedText style={styles.filterLabel}>Category:</ThemedText>
          <View style={styles.filterButtons}>
            <Pressable
              style={[
                styles.filterButton,
                categoryFilter === 'all' && styles.activeFilterButton
              ]}
              onPress={() => setCategoryFilter('all')}
            >
              <ThemedText style={[
                styles.filterButtonText,
                categoryFilter === 'all' && styles.activeFilterButtonText
              ]}>
                All
              </ThemedText>
            </Pressable>
            {categoryOptions.map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.filterButton,
                  categoryFilter === category && styles.activeFilterButton
                ]}
                onPress={() => setCategoryFilter(category)}
              >
                <ThemedText style={[
                  styles.filterButtonText,
                  categoryFilter === category && styles.activeFilterButtonText
                ]}>
                  {category}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <FlatList
          data={filteredItems}
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
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 16,
    gap: 12,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  activeFilterButton: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  activeFilterButtonText: {
    color: "white",
  },
});
