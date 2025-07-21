import React, { useState, useEffect } from 'react';
import '../styles/comment-section.css';

// Comment service - this is where you'd switch from localStorage to API calls
const CommentService = {
  getComments: async (entryId) => {
    const savedComments = localStorage.getItem(`comments_${entryId}`);
    return savedComments ? JSON.parse(savedComments) : [];
  },
  addComment: async (entryId, comment) => {
    const existingComments = JSON.parse(localStorage.getItem(`comments_${entryId}`) || '[]');
    const newComment = {
      id: Date.now(),
      ...comment,
      timestamp: new Date().toISOString(),
    };
    const updatedComments = [...existingComments, newComment];
    localStorage.setItem(`comments_${entryId}`, JSON.stringify(updatedComments));
    return newComment;
  },
  deleteComment: async (entryId, commentId) => {
    // No longer used, but kept for future backend migration
    return { success: false };
  }
};

function CommentSection({ entryId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load comments from service
  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoading(true);
        const commentsData = await CommentService.getComments(entryId);
        setComments(commentsData);
      } catch (err) {
        setError('Failed to load comments');
        console.error('Error loading comments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadComments();
  }, [entryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;
    try {
      setIsLoading(true);
      const comment = await CommentService.addComment(entryId, {
        author: authorName,
        content: newComment,
      });
      setComments([...comments, comment]);
      setNewComment('');
      setError(null);
    } catch (err) {
      setError('Failed to post comment');
      console.error('Error posting comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-header-row">
        <h3>Comments</h3>
      </div>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {/* Comments List */}
      <div className="comments-list chat-style">
        {isLoading && comments.length === 0 ? (
          <p className="loading-comments">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="no-comments chat-silent">Chat is silent...</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="chat-comment">
              <div className="chat-author-row">
                <span className="chat-author">{comment.author}</span>
                <span className="chat-date">{new Date(comment.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="chat-bubble">
                <span className="chat-arrow">↳</span>
                <span className="chat-content">{comment.content}</span>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="author-input"
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comment-input"
            rows="3"
            required
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}

export default CommentSection; 