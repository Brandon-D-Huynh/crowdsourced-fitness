import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { auth, db } from '@/firebaseConfig';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { CommentInput } from './CommentInput';

interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: any;
  updatedAt?: any;
  parentId?: string;
  reactions: {
    likes: string[];
    hearts: string[];
    fires: string[];
    claps: string[];
  };
  replyCount: number;
  isEdited: boolean;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  challengeId: string;
  isReply?: boolean;
  onReply?: (commentId: string) => void;
  onReaction?: (commentId: string, reaction: string) => void;
}

export function CommentItem({ 
  comment, 
  challengeId, 
  isReply = false, 
  onReply,
  onReaction 
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const currentUser = auth.currentUser;
  const isOwner = currentUser?.uid === comment.authorId;

  const formatTime = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const now = new Date();
    const commentTime = timestamp.toDate();
    const diffMs = now.getTime() - commentTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return commentTime.toLocaleDateString();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'challenges', challengeId, 'comments', comment.id));
            } catch (error) {
              console.error('Error deleting comment:', error);
            }
          }
        }
      ]
    );
  };

  const handleEdit = async (newText: string) => {
    try {
      await updateDoc(doc(db, 'challenges', challengeId, 'comments', comment.id), {
        text: newText,
        updatedAt: new Date(),
        isEdited: true
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleReaction = (reactionType: string) => {
    onReaction?.(comment.id, reactionType);
  };

  const getReactionCount = (reactionType: string) => {
    return comment.reactions[reactionType as keyof typeof comment.reactions]?.length || 0;
  };

  const hasUserReacted = (reactionType: string) => {
    return currentUser && comment.reactions[reactionType as keyof typeof comment.reactions]?.includes(currentUser.uid);
  };

  if (isEditing) {
    return (
      <View style={[styles.container, isReply && styles.replyContainer]}>
        <CommentInput
          challengeId={challengeId}
          initialText={comment.text}
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
          submitLabel="Save"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      <View style={styles.commentCard}>
        <View style={styles.header}>
          <Image
            source={{
              uri: comment.authorAvatar || `https://avatar.iran.liara.run/username?username=${comment.authorName}`
            }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <ThemedText style={styles.authorName}>{comment.authorName}</ThemedText>
            <View style={styles.timeContainer}>
              <ThemedText style={styles.timestamp}>
                {formatTime(comment.createdAt)}
              </ThemedText>
              {comment.isEdited && (
                <ThemedText style={styles.editedLabel}>• edited</ThemedText>
              )}
            </View>
          </View>
        </View>

        <ThemedText style={styles.commentText}>{comment.text}</ThemedText>

        <View style={styles.actionsContainer}>
          <View style={styles.reactions}>
            {['likes', 'hearts', 'fires', 'claps'].map((reactionType) => {
              const count = getReactionCount(reactionType);
              const userReacted = hasUserReacted(reactionType);
              const emoji = {
                likes: '👍',
                hearts: '❤️',
                fires: '🔥',
                claps: '👏'
              }[reactionType];

              return (
                <Pressable
                  key={reactionType}
                  style={[
                    styles.reactionButton,
                    userReacted && styles.reactionButtonActive,
                    count === 0 && styles.reactionButtonEmpty
                  ]}
                  onPress={() => handleReaction(reactionType)}
                >
                  <ThemedText style={styles.reactionEmoji}>{emoji}</ThemedText>
                  {count > 0 && (
                    <ThemedText style={[
                      styles.reactionCount,
                      userReacted && styles.reactionCountActive
                    ]}>
                      {count}
                    </ThemedText>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actionButtons}>
            {!isReply && onReply && (
              <Pressable
                style={styles.actionButton}
                onPress={() => onReply(comment.id)}
              >
                <ThemedText style={styles.actionButtonText}>Reply</ThemedText>
              </Pressable>
            )}
            
            {isOwner && (
              <>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => setIsEditing(true)}
                >
                  <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={handleDelete}
                >
                  <ThemedText style={[styles.actionButtonText, styles.deleteButtonText]}>
                    Delete
                  </ThemedText>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {!isReply && comment.replyCount > 0 && (
          <Pressable
            style={styles.showRepliesButton}
            onPress={() => setShowReplies(!showReplies)}
          >
            <ThemedText style={styles.showRepliesText}>
              {showReplies ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </ThemedText>
          </Pressable>
        )}
      </View>

      {!isReply && showReplies && comment.replies && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              challengeId={challengeId}
              isReply={true}
              onReaction={onReaction}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  replyContainer: {
    marginLeft: 20,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
  },
  commentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  editedLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reactions: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    minWidth: 32,
    justifyContent: 'center',
  },
  reactionButtonActive: {
    backgroundColor: '#dbeafe',
  },
  reactionButtonEmpty: {
    backgroundColor: 'transparent',
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#6b7280',
  },
  reactionCountActive: {
    color: '#2563eb',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionButtonText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  showRepliesButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  showRepliesText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: 8,
  },
});