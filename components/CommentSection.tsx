import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { ThemedText } from './ThemedText';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { auth, db } from '@/firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  runTransaction
} from 'firebase/firestore';

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

interface CommentSectionProps {
  challengeId: string;
}

export function CommentSection({ challengeId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!challengeId) return;

    const commentsRef = collection(db, 'challenges', challengeId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allComments: Comment[] = [];
      snapshot.forEach((doc) => {
        allComments.push({ id: doc.id, ...doc.data() } as Comment);
      });

      // Organize comments with their replies
      const topLevelComments = allComments.filter(comment => !comment.parentId);
      const replies = allComments.filter(comment => comment.parentId);

      // Attach replies to their parent comments
      const commentsWithReplies = topLevelComments.map(comment => {
        const commentReplies = replies
          .filter(reply => reply.parentId === comment.id)
          .sort((a, b) => a.createdAt?.toDate() - b.createdAt?.toDate());
        
        return {
          ...comment,
          replies: commentReplies
        };
      });

      setComments(commentsWithReplies);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching comments:', error);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [challengeId]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleReaction = async (commentId: string, reactionType: string) => {
    if (!currentUser) return;

    try {
      const commentRef = doc(db, 'challenges', challengeId, 'comments', commentId);
      
      await runTransaction(db, async (transaction) => {
        const commentDoc = await transaction.get(commentRef);
        if (!commentDoc.exists()) return;

        const commentData = commentDoc.data() as Comment;
        const reactionArray = commentData.reactions[reactionType as keyof typeof commentData.reactions] || [];
        const userReacted = reactionArray.includes(currentUser.uid);

        const updates: any = {};
        
        if (userReacted) {
          // Remove reaction
          updates[`reactions.${reactionType}`] = arrayRemove(currentUser.uid);
        } else {
          // Add reaction
          updates[`reactions.${reactionType}`] = arrayUnion(currentUser.uid);
        }

        transaction.update(commentRef, updates);
      });
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View>
      <CommentItem
        comment={item}
        challengeId={challengeId}
        onReply={handleReply}
        onReaction={handleReaction}
      />
      {replyingTo === item.id && (
        <View style={styles.replyInputContainer}>
          <CommentInput
            challengeId={challengeId}
            parentId={item.id}
            placeholder={`Reply to ${item.authorName}...`}
            onSubmit={() => setReplyingTo(null)}
            showCancel={true}
            onCancel={() => setReplyingTo(null)}
            submitLabel="Reply"
          />
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>
        No comments yet. Be the first to share your thoughts!
      </ThemedText>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText type="subtitle" style={styles.headerTitle}>
        Comments ({comments.length})
      </ThemedText>
      <CommentInput challengeId={challengeId} />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading comments...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  replyInputContainer: {
    marginLeft: 20,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 32,
  },
});