import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase_client';
import '../styles/comment-section.css';
import { formatDistanceToNowStrict } from 'date-fns';

const shortLocale = {
  formatDistance: (token, count) => {
    switch (token) {
      case 'lessThanXSeconds':
      case 'xSeconds':
        return `${count}s`;
      case 'halfAMinute':
        return '30s';
      case 'lessThanXMinutes':
      case 'xMinutes':
        return `${count}m`;
      case 'aboutXHours':
      case 'xHours':
        return `${count}h`;
      case 'xDays':
        return `${count}d`;
      case 'aboutXMonths':
      case 'xMonths':
        return `${count}mo`;
      case 'aboutXYears':
      case 'xYears':
        return `${count}y`;
      default:
        return '';
    }
  }
};

function CommentSection({ entryId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      let { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entry_id', entryId)
        .order('timestamp', { ascending: true });
      if (error) setError('Failed to load comments');
      setComments(data || []);
      setLoading(false);
    }
    fetchComments();
  }, [entryId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    setError(null);

    const username = user.user_metadata?.username || user.email;
    const newCommentData = {
      entry_id: entryId,
      author: user.email,
      username: username,
      content: newComment.trim(),
      user_id: user.id,
      timestamp: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([newCommentData])
        .select();

      if (error) {
        console.error('Error posting comment:', error);
        setError('Failed to post comment: ' + error.message);
      } else {
        // Add the new comment to the state immediately
        const postedComment = data[0];
        setComments(prevComments => [...prevComments, postedComment]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="comment-section">
      <div className="comment-header-row">
        <h3>Comments</h3>
      </div>
      <div className="comments-list chat-style">
        {loading ? (
          <p className="loading-comments">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="no-comments chat-silent">Chat is silent...</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="chat-comment">
              <div className="chat-author-row">
                <span className="chat-author">{comment.username || comment.author}</span>
                <span className="chat-date">
                  {formatDistanceToNowStrict(new Date(comment.timestamp), {
                    addSuffix: false,
                    roundingMethod: 'floor',
                    locale: shortLocale
                  })}
                </span>
              </div>
              <div className="chat-bubble">
                <span className="chat-arrow">↳</span>
                <span className="chat-content">{comment.content}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="form-group">
          <textarea
            className="comment-input"
            placeholder="Write a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            rows="3"
            disabled={!user || submitting}
            required
          />
        </div>
        <button
          type="submit"
          className={user ? 'submit-btn' : 'login-btn'}
          disabled={submitting}
        >
          {submitting ? 'Posting...' : user ? 'Post Comment' : 'Login'}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default CommentSection; 