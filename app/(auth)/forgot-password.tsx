import { ThemedTextInput } from '@/components/ThemedTextInput';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { Button, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/firebaseConfig';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onResetPassword = async () => {
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Reset Password</ThemedText>
      {sent ? (
        <ThemedText>A password reset link has been sent to your email address.</ThemedText>
      ) : (
        <>
          <ThemedTextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
          <Button
            title={loading ? 'Sending…' : 'Send Reset Link'}
            onPress={onResetPassword}
            disabled={loading}
          />
        </>
      )}
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
