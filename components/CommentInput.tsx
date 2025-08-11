import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { auth, db } from '@/firebaseConfig';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';

interface CommentInputProps {
  challengeId: string;
  parentId?: string;
  initialText?: string;
  placeholder?: string;
  onSubmit?: (text: string) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  showCancel?: boolean;
}

export function CommentInput({ 
  challengeId,
  parentId,
  initialText = '',
  placeholder = 'Add a comment...',
  onSubmit,
  onCancel,
  submitLabel = 'Post',
  showCancel = false
}: CommentInputProps) {
  const [text, setText] = useState(initialText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleSubmit = async () => {
    if (!text.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        // Custom submit handler (for editing)
        await onSubmit(text.trim());
      } else {
        // Default behavior (for new comments)
        const userDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
        const userData = userDoc.data();
        const authorName = userData?.displayName || currentUser.email || 'Anonymous';

        const commentData = {
          text: text.trim(),
          authorId: currentUser.uid,
          authorName,
          authorAvatar: userData?.avatar || null,
          createdAt: serverTimestamp(),
          parentId: parentId || null,
          reactions: {
            likes: [],
            hearts: [],
            fires: [],
            claps: []
          },
          replyCount: 0,
          isEdited: false
        };

        await addDoc(collection(db, 'challenges', challengeId, 'comments'), commentData);

        // If this is a reply, increment the parent's reply count
        if (parentId) {
          const parentCommentRef = doc(db, 'challenges', challengeId, 'comments', parentId);
          await updateDoc(parentCommentRef, {
            replyCount: increment(1)
          });
        }
      }
      
      setText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setText(initialText);
    onCancel?.();
  };

  if (!currentUser) {
    return (
      <View style={styles.signInPrompt}>
        <ThemedText style={styles.signInText}>
          Sign in to join the conversation
        </ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          placeholderTextColor="#9ca3af"
        />
        <View style={styles.buttonContainer}>
          {showCancel && (
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </Pressable>
          )}
          <Pressable
            style={[
              styles.button,
              styles.submitButton,
              (!text.trim() || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!text.trim() || isSubmitting}
          >
            <ThemedText style={[
              styles.submitButtonText,
              (!text.trim() || isSubmitting) && styles.submitButtonTextDisabled
            ]}>
              {isSubmitting ? 'Posting...' : submitLabel}
            </ThemedText>
          </Pressable>
        </View>
      </View>
      <View style={styles.footer}>
        <ThemedText style={styles.charCount}>
          {text.length}/500
        </ThemedText>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginVertical: 8,
  },
  inputContainer: {
    padding: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 44,
    maxHeight: 120,
    textAlignVertical: 'top',
    color: '#374151',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2563eb',
  },
  submitButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#9ca3af',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  signInPrompt: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  signInText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});