import { ThemedTextInput } from '@/components/ThemedTextInput';
import { Link, router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/firebaseConfig';

const getFriendlyErrorMessage = (error: any) => {
  switch (error.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    default:
      return error.message;
  }
};

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch (e: any) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome back</ThemedText>
      <ThemedTextInput
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <ThemedTextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
      <Button title={loading ? 'Signing in…' : 'Sign In'} onPress={onSignIn} disabled={loading} />
      <View style={{ height: 12 }} />
      <Link href="/(auth)/sign-up">
        <ThemedText type="link">Create an account</ThemedText>
      </Link>
      <Link href="/(auth)/forgot-password">
        <ThemedText type="link">Forgot Password?</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
});
