class NotificationService {
  private permission: NotificationPermission = 'default';
  private checkInterval: number | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.checkExistingPermission();
  }

  // Check existing permission without requesting
  private checkExistingPermission(): void {
    if (!this.isSupported) {
      console.log('This browser does not support notifications');
      this.permission = 'denied';
      return;
    }
    this.permission = Notification.permission;
  }

  // Request notification permission with better error handling
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('This browser does not support notifications');
      return false;
    }

    // If already granted, return true
    if (this.permission === 'granted') {
      return true;
    }

    // If previously denied/blocked, don't request again
    if (this.permission === 'denied') {
      console.log('Notification permission was previously denied. User must manually enable in browser settings.');
      this.showPermissionGuide();
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      
      if (this.permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Show a notification with better fallback
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    // Check current permission status first
    this.checkExistingPermission();
    
    if (this.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });
        return;
      } catch (error) {
        console.error('Error creating notification:', error);
        this.showFallbackNotification(title, options?.body);
      }
    } else if (this.permission === 'default') {
      // Only request permission if not previously denied
      const hasPermission = await this.requestPermission();
      if (hasPermission) {
        try {
          new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options
          });
          return;
        } catch (error) {
          console.error('Error creating notification after permission grant:', error);
        }
      }
    }
    
    // Fallback for denied permissions or errors
    this.showFallbackNotification(title, options?.body);
  }

  // Fallback for when notifications are blocked
  private showFallbackNotification(title: string, body?: string): void {
    // Create an in-app notification
    const notificationElement = document.createElement('div');
    notificationElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f56565;
      color: white;
      padding: 16px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
    `;
    
    notificationElement.innerHTML = `
      <strong>${title}</strong>
      ${body ? `<br>${body}` : ''}
      <br><small>🔔 Enable browser notifications for better experience</small>
    `;
    
    document.body.appendChild(notificationElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notificationElement)) {
        notificationElement.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (document.body.contains(notificationElement)) {
            document.body.removeChild(notificationElement);
          }
        }, 300);
      }
    }, 5000);

    // Add CSS animations if not already present
    this.addNotificationStyles();
  }

  private addNotificationStyles(): void {
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Check for upcoming deadlines
  checkUpcomingDeadlines(tasks: any[]): void {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const inOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const notifiedTasks = new Set<string>(); // Prevent duplicate notifications

    tasks.forEach(task => {
      if (task.dueDate && !task.completed && !notifiedTasks.has(task.id)) {
        const dueDate = new Date(task.dueDate);

        // Task is overdue
        if (dueDate < now) {
          this.showNotification('🚨 Task Overdue!', {
            body: `"${task.title}" is overdue!`,
            tag: `overdue-${task.id}`,
            requireInteraction: true
          });
          notifiedTasks.add(task.id);
        }
        // Task due in next hour
        else if (dueDate <= inOneHour && dueDate > now) {
          this.showNotification('⏰ Task Due Soon!', {
            body: `"${task.title}" is due in less than 1 hour!`,
            tag: `due-soon-${task.id}`,
            requireInteraction: true
          });
          notifiedTasks.add(task.id);
        }
        // Task due in next 24 hours
        else if (dueDate <= inOneDay && dueDate > inOneHour) {
          this.showNotification('📅 Task Due Tomorrow', {
            body: `"${task.title}" is due tomorrow!`,
            tag: `due-tomorrow-${task.id}`
          });
          notifiedTasks.add(task.id);
        }
      }
    });
  }

  // Start automatic deadline checking
  startDeadlineChecker(tasks: any[], checkIntervalMs: number = 60000): void {
    this.stopDeadlineChecker(); 
    
    this.checkInterval = window.setInterval(() => { 
      this.checkUpcomingDeadlines(tasks);
    }, checkIntervalMs);

    // Check immediately on start
    this.checkUpcomingDeadlines(tasks);
  }

  // Stop automatic checking
  stopDeadlineChecker(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Manual check for specific task
  async checkTaskDeadline(task: any): Promise<void> {
    if (!task.dueDate || task.completed) return;

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const timeUntilDue = dueDate.getTime() - now.getTime();

    if (timeUntilDue <= 0) {
      await this.showNotification('🚨 Task Overdue!', {
        body: `"${task.title}" is overdue!`,
        tag: `overdue-${task.id}`,
        requireInteraction: true
      });
    } else if (timeUntilDue <= 60 * 60 * 1000) { // 1 hour
      await this.showNotification('⏰ Task Due Soon!', {
        body: `"${task.title}" is due in less than 1 hour!`,
        tag: `due-soon-${task.id}`,
        requireInteraction: true
      });
    }
  }

  // Add a method to check permission status
  getPermissionStatus(): NotificationPermission {
    this.checkExistingPermission();
    return this.permission;
  }

  // Check if notifications are supported
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // Add a method to guide users on how to enable notifications
  showPermissionGuide(): void {
    const guide = `
To enable notifications:
1. Click the lock/tune icon (🔒) in the address bar
2. Click "Site settings" 
3. Find "Notifications" and change to "Allow"
4. Refresh the page
    `;
    console.log(guide);
    
    // Show a user-friendly message
    this.showFallbackNotification(
      'Notifications Blocked', 
      'Please enable notifications in your browser settings to get task reminders.'
    );
  }

  // Method to manually reset and request permission again
  async resetAndRequestPermission(): Promise<boolean> {
    this.permission = 'default';
    return await this.requestPermission();
  }
}

export const notificationService = new NotificationService();