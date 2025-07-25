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
    const username = user.user_metadata?.username || user.email;
    const { error } = await supabase.from('comments').insert([
      {
        entry_id: entryId,
        author: user.email,
        username: username, // Use username from metadata
        content: newComment,
        user_id: user.id,
      },
    ]);
    if (error) {
      console.log(error);
      setError('Failed to post comment: ' + error.message);
    }
    setNewComment('');
    // Refetch comments after posting
    // (fetchComments is not available here, so trigger effect by changing entryId or add a state to force reload)
    // For now, you can force a reload by updating a dummy state if needed
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
            disabled={!user}
            required
          />
        </div>
        <button
          type="submit"
          className={user ? 'submit-btn' : 'login-btn'}
        >
          {user ? 'Post Comment' : 'Login'}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default CommentSection; 