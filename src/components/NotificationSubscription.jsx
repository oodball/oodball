import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

      const result = await notificationManager.subscribe(user.id);
      
      // Only update state if subscription was successful
      if (result) {
        setSubscriptionStatus(prev => ({
          ...prev,
          subscribed: true
        }));
        
        setSuccess('Successfully subscribed to notifications! You\'ll receive alerts when new food entries are posted.');
        
        // Double-check status after a short delay
        setTimeout(async () => {
          await checkSubscriptionStatus();
        }, 1500);
      }
      
    } catch (error) {
      console.error('Subscription failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error.message.includes('permission')) {
        setError('Please allow notifications in your browser settings to receive updates.');
      } else if (error.message.includes('Failed to save subscription to server')) {
        setError('Server error: Failed to save subscription. Please try again.');
      } else {
        setError(`Failed to subscribe: ${error.message}`);
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

      const result = await notificationManager.unsubscribe(user.id);
      
      // Only update state if unsubscription was successful
      if (result) {
        setSubscriptionStatus(prev => ({
          ...prev,
          subscribed: false
        }));
        
        setSuccess('Successfully unsubscribed from notifications.');
        
        // Double-check status after a short delay
        setTimeout(async () => {
          await checkSubscriptionStatus();
        }, 1500);
      }
      
    } catch (error) {
      console.error('Unsubscription failed:', error);
      setError('Failed to unsubscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show helpful message if notifications aren't supported
  if (!subscriptionStatus.supported) {
    return (
      <div className="notification-subscription">
        <div className="notification-header">
          <h3>🔔 Foodball Push Notifs</h3>
          <p>Level up! Follow me!</p>
        </div>
        <div className="notification-error">
          <span>⚠️ Push notifications aren't supported. Check Upgrade Details!</span>
        </div>
      </div>
    );
  }

  // Show login message if user is not logged in
  if (!user) {
    return (
      <div className="notification-subscription">
        <div className="notification-header">
          <h3>🔔 Foodball Push Notifs</h3>
          <p>Level up! Follow me!</p>
        </div>
        <div className="notification-unsubscribed">
          <p>Please log in to subscribe to notifications</p>
          <Link to="/login?redirect=/foodball" className="notification-btn subscribe-btn">
            LOG IN
          </Link>
        </div>
      </div>
    );
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
              <summary>How to Subscribe for IOS Mobile</summary>
              <div className="notification-details">
                <ul>
                  <li>Settings -> Apps -> Safari -> Turn off Block Popups</li>
                  <li>Go to oodball.com in Safari</li>
                  <li> more button -> Share Page -> add to Home Screen</li>
                  <li>Open app from the Home Screen -> login -> allow notifications</li>
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
