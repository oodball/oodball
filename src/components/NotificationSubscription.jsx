import React, { useState, useEffect } from 'react';
import notificationManager from '../utils/NotificationManager';
import '../styles/notification-subscription.css';

function NotificationSubscription({ user }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    supported: false,
    permission: 'default',
    subscribed: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check subscription status on component mount
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const status = await notificationManager.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      setError('Failed to check notification status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      setError('Please log in to subscribe to notifications');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await notificationManager.subscribe(user.id);
      
      // Update state immediately for better UX
      setSubscriptionStatus(prev => ({
        ...prev,
        subscribed: true
      }));
      
      setSuccess('Successfully subscribed to notifications! You\'ll receive alerts when new food entries are posted.');
      
      // Double-check status after a short delay
      setTimeout(async () => {
        await checkSubscriptionStatus();
      }, 1000);
      
    } catch (error) {
      console.error('Subscription failed:', error);
      if (error.message.includes('permission')) {
        setError('Please allow notifications in your browser settings to receive updates.');
      } else {
        setError('Failed to subscribe to notifications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) {
      setError('Please log in to manage notifications');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await notificationManager.unsubscribe(user.id);
      
      // Update state immediately for better UX
      setSubscriptionStatus(prev => ({
        ...prev,
        subscribed: false
      }));
      
      setSuccess('Successfully unsubscribed from notifications.');
      
      // Double-check status after a short delay
      setTimeout(async () => {
        await checkSubscriptionStatus();
      }, 1000);
      
    } catch (error) {
      console.error('Unsubscription failed:', error);
      setError('Failed to unsubscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if notifications aren't supported
  if (!subscriptionStatus.supported) {
    return null;
  }

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`notification-subscription ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="notification-header" onClick={toggleCollapse}>
        <h3>
          🔔 Foodball Push Notifs
          <span className="collapse-indicator">
            {subscriptionStatus.subscribed && (isCollapsed ? '▼' : '▲')}
          </span>
        </h3>
        {!isCollapsed && <p>Level up! Follow me!</p>}
      </div>

      {!isCollapsed && (
        <>
          {loading && (
            <div className="notification-loading">
              <div className="loading-spinner"></div>
              <span>Checking notification status...</span>
            </div>
          )}

          {error && (
            <div className="notification-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          {success && (
            <div className="notification-success">
              <span>✅ {success}</span>
            </div>
          )}

          {!loading && (
            <div className="notification-controls">
              {subscriptionStatus.permission === 'denied' && (
                <div className="notification-denied">
                  <p>❌ Notifications are blocked. Please enable them in your browser settings:</p>
                  <ol>
                    <li>Click lock icon in address bar</li>
                    <li>Set notifications to "Allow"</li>
                    <li>Refresh page</li>
                  </ol>
                </div>
              )}

              {subscriptionStatus.permission !== 'denied' && (
                <>
                  {subscriptionStatus.subscribed ? (
                    <div className="notification-subscribed">
                      <p>Subscribed :)</p>
                      <button 
                        onClick={handleUnsubscribe}
                        className="notification-btn unsubscribe-btn"
                        disabled={loading}
                      >
                        UNSUBSCRIBE
                      </button>
                    </div>
                  ) : (
                    <div className="notification-unsubscribed">
                      <p>Unsubscribed :(</p>
                      <button 
                        onClick={handleSubscribe}
                        className="notification-btn subscribe-btn"
                        disabled={loading}
                      >
                        SUBSCRIBE
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="notification-info">
            <details>
              <summary>Upgrade Details</summary>
              <div className="notification-details">
                <ul>
                  <li>Instant Alerts for my very important literature</li>
                  <li>Unsubscribe anytime (if you dare)</li>
                </ul>
              </div>
            </details>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationSubscription;
