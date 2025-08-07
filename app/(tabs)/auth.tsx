import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function AuthTabScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Auth</ThemedText>
      <Link href="/(auth)/sign-in" style={styles.link}>
        <ThemedText type="link">Sign In</ThemedText>
      </Link>
      <Link href="/(auth)/sign-up" style={styles.link}>
        <ThemedText type="link">Create Account</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  link: { paddingVertical: 8 },
});
