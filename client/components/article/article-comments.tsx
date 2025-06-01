"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ThumbsUp, Reply, Send } from "lucide-react";
import { getArticleComments, addComment } from "@/lib/api/news";
import type { Comment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { likeComment } from "@/lib/api/news";

interface ArticleCommentsProps {
  articleId: string;
  initialCommentCount: number;
}

export function ArticleComments({
  articleId,
  initialCommentCount,
}: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const data = await getArticleComments(articleId);
        setComments(data);
      } catch (err) {
        setError("Failed to load comments");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [articleId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);

      const comment = await addComment(articleId, {
        articleId,
        author: "Current User", // In a real app, this would be the logged-in user
        authorAvatar: "/placeholder.svg?height=40&width=40&text=Me",
        content: newComment,
      });

      setComments((prev) => [comment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleLike = async (commentId: string) => {
    try {
      const { likes } = await likeComment(commentId);

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likes,
              }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to like comment", err);
    } finally {
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="py-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="mb-6 flex items-center text-2xl font-bold">
        <MessageSquare className="mr-2 h-5 w-5" />
        Comments ({comments.length})
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage
              src="/placeholder.svg?height=40&width=40&text=Me"
              alt="Your avatar"
            />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2 min-h-[100px] w-full"
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage
                    src={comment.authorAvatar || "/placeholder.svg"}
                    alt={comment.author}
                  />
                  <AvatarFallback>
                    {comment.author.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{comment.author}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(comment.id)}
                    >
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      {comment.likes > 0 && <span>{comment.likes}</span>}
                    </Button>

                    {comment.replies && comment.replies.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        <Reply className="mr-1 h-4 w-4" />
                        {comment.replies.length}{" "}
                        {comment.replies.length === 1 ? "reply" : "replies"}
                      </Button>
                    )}
                  </div>

                  {/* Replies */}
                  {comment.replies &&
                    comment.replies.length > 0 &&
                    showReplies[comment.id] && (
                      <div className="mt-4 space-y-4 border-l-2 border-muted pl-4">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="flex items-start gap-3"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={reply.authorAvatar || "/placeholder.svg"}
                                alt={reply.author}
                              />
                              <AvatarFallback>
                                {reply.author.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-medium">
                                  {reply.author}
                                </h5>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(
                                    new Date(reply.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                              <p className="text-sm">{reply.content}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1"
                                onClick={() => handleLike(reply.id)}
                              >
                                <ThumbsUp className="mr-1 h-3 w-3" />
                                {reply.likes > 0 && (
                                  <span className="text-xs">{reply.likes}</span>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
