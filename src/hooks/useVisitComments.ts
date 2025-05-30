
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { VisitComment } from '@/types/orders';

export const useVisitComments = (visitTaskId: string) => {
  const [comments, setComments] = useState<VisitComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('visit_comments')
        .select(`
          *,
          author:users!visit_comments_author_user_id_fkey(full_name)
        `)
        .eq('visit_task_id', visitTaskId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      // Organize comments into threads
      const commentsMap = new Map<string, VisitComment>();
      const rootComments: VisitComment[] = [];

      data?.forEach((comment) => {
        const commentWithReplies: VisitComment = {
          ...comment,
          replies: [],
        };
        commentsMap.set(comment.id, commentWithReplies);

        if (!comment.parent_comment_id) {
          rootComments.push(commentWithReplies);
        }
      });

      // Add replies to their parent comments
      data?.forEach((comment) => {
        if (comment.parent_comment_id) {
          const parent = commentsMap.get(comment.parent_comment_id);
          const child = commentsMap.get(comment.id);
          if (parent && child) {
            parent.replies?.push(child);
          }
        }
      });

      setComments(rootComments);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (commentText: string, parentCommentId?: string) => {
    setIsSubmitting(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('visit_comments')
        .insert({
          visit_task_id: visitTaskId,
          author_user_id: user.data.user.id,
          comment_text: commentText,
          parent_comment_id: parentCommentId,
        })
        .select(`
          *,
          author:users!visit_comments_author_user_id_fkey(full_name)
        `)
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Comment added successfully",
      });

      // Refresh comments to show the new one
      await fetchComments();

      return data;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (visitTaskId) {
      fetchComments();
    }
  }, [visitTaskId]);

  return {
    comments,
    isLoading,
    isSubmitting,
    addComment,
    refetch: fetchComments,
  };
};
