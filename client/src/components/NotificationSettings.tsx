import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { notificationService } from "../services/notificationService";

const NotificationSettings: React.FC = () => {
  const { theme } = useTheme();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setIsEnabled(Notification.permission === 'granted');
    }
  };

const handleToggleNotifications = async () => {
  if (isEnabled) {
    // Disable notifications
    setIsEnabled(false);
    console.log('Notifications disabled');
  } else {
    // Enable notifications
    const granted = await notificationService.requestPermission();
    setIsEnabled(granted);
    setPermission(granted ? 'granted' : 'denied');
    
    if (granted) {
      // Show welcome notification
      await notificationService.showNotification('🔔 TaskFlow Notifications Enabled', {
        body: 'You will now receive reminders for upcoming task deadlines!',
        icon: '/favicon.ico',
        tag: 'notifications-enabled' // Prevent duplicates
      });
    } else {
      notificationService.showPermissionGuide();
    }
  }
};

  const getPermissionText = () => {
    switch (permission) {
      case 'granted': return 'Enabled';
      case 'denied': return 'Blocked by browser';
      case 'default': return 'Click to enable';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{
      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: theme === 'dark' ? '#f9fafb' : '#111827',
          margin: 0
        }}>
          🔔 Browser Notifications
        </h3>
        <button
          onClick={handleToggleNotifications}
          disabled={permission === 'denied'}
          style={{
            padding: '8px 16px',
            backgroundColor: isEnabled ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: permission === 'denied' ? 'not-allowed' : 'pointer',
            opacity: permission === 'denied' ? 0.5 : 1,
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {isEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>
      
      <p style={{
        fontSize: '14px',
        color: theme === 'dark' ? '#d1d5db' : '#6b7280',
        margin: 0
      }}>
        Status: {getPermissionText()}
        {permission === 'denied' && (
          <span style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>
            Please enable notifications in your browser settings
          </span>
        )}
      </p>

      {isEnabled && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
          borderRadius: '6px',
          border: `1px solid ${theme === 'dark' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'}`
        }}>
          <p style={{
            fontSize: '12px',
            color: theme === 'dark' ? '#86efac' : '#16a34a',
            margin: 0
          }}>
            ✅ You will receive notifications for:
            <br/>• Overdue tasks
            <br/>• Tasks due in 1 hour  
            <br/>• Tasks due tomorrow
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;