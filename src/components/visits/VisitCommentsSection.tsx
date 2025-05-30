
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Reply, Send } from 'lucide-react';
import { useVisitComments } from '@/hooks/useVisitComments';
import { VisitComment } from '@/types/orders';
import { formatDistanceToNow } from 'date-fns';

interface VisitCommentsSectionProps {
  visitTaskId: string;
}

const VisitCommentsSection = ({ visitTaskId }: VisitCommentsSectionProps) => {
  const { comments, isLoading, isSubmitting, addComment } = useVisitComments(visitTaskId);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment(newComment);
      setNewComment('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    
    try {
      await addComment(replyText, parentId);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: VisitComment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {comment.author?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">
              {comment.author?.full_name || 'Unknown User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{comment.comment_text}</p>
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(comment.id)}
              className="h-6 px-2 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          
          {replyingTo === comment.id && (
            <div className="mt-2 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px]"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={isSubmitting || !replyText.trim()}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading comments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment about this visit..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !newComment.trim()}
            className="ml-auto flex"
          >
            <Send className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        </div>

        {/* Comments list */}
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No comments yet. Be the first to add one!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisitCommentsSection;
