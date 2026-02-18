// Collaboration & Team Communication Service

export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions: string[]; // User IDs mentioned
  createdAt: string;
  updatedAt?: string;
  replies: Comment[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'report_shared' | 'comment_reply' | 'report_ready' | 'task_assigned';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  reportId?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

const COMMENTS_KEY = 'wpm_comments';
const NOTIFICATIONS_KEY = 'wpm_notifications';
const TASKS_KEY = 'wpm_tasks';

export const CollaborationService = {
  // Comments
  getComments(reportId: string): Comment[] {
    const all = this.getAllComments();
    return all.filter(c => c.reportId === reportId);
  },

  getAllComments(): Comment[] {
    const stored = localStorage.getItem(COMMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  addComment(comment: Omit<Comment, 'id' | 'createdAt' | 'replies'>): Comment {
    const comments = this.getAllComments();
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}`,
      createdAt: new Date().toISOString(),
      replies: []
    };
    comments.push(newComment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));

    // Create notifications for mentions
    if (comment.mentions.length > 0) {
      comment.mentions.forEach(userId => {
        this.createNotification({
          userId,
          type: 'mention',
          title: 'You were mentioned',
          message: `${comment.userName} mentioned you in a comment`,
          link: `/reports/${comment.reportId}`
        });
      });
    }

    return newComment;
  },

  addReply(commentId: string, reply: Omit<Comment, 'id' | 'createdAt' | 'replies'>): Comment[] {
    const comments = this.getAllComments();
    const updated = comments.map(c => {
      if (c.id === commentId) {
        const newReply: Comment = {
          ...reply,
          id: `reply_${Date.now()}`,
          createdAt: new Date().toISOString(),
          replies: []
        };
        return { ...c, replies: [...c.replies, newReply] };
      }
      return c;
    });
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));

    // Notify original commenter
    const originalComment = comments.find(c => c.id === commentId);
    if (originalComment) {
      this.createNotification({
        userId: originalComment.userId,
        type: 'comment_reply',
        title: 'New reply to your comment',
        message: `${reply.userName} replied to your comment`,
        link: `/reports/${reply.reportId}`
      });
    }

    return updated;
  },

  deleteComment(commentId: string): Comment[] {
    const comments = this.getAllComments();
    const filtered = comments.filter(c => c.id !== commentId);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(filtered));
    return filtered;
  },

  // Notifications
  getNotifications(userId: string): Notification[] {
    const all = this.getAllNotifications();
    return all.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getAllNotifications(): Notification[] {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  createNotification(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Notification {
    const notifications = this.getAllNotifications();
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifications.push(newNotification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    return newNotification;
  },

  markAsRead(notificationId: string): Notification[] {
    const notifications = this.getAllNotifications();
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  markAllAsRead(userId: string): Notification[] {
    const notifications = this.getAllNotifications();
    const updated = notifications.map(n =>
      n.userId === userId ? { ...n, isRead: true } : n
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  getUnreadCount(userId: string): number {
    const notifications = this.getNotifications(userId);
    return notifications.filter(n => !n.isRead).length;
  },

  // Tasks
  getTasks(userId?: string): Task[] {
    const all = this.getAllTasks();
    return userId ? all.filter(t => t.assignedTo === userId) : all;
  },

  getAllTasks(): Task[] {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  createTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const tasks = this.getAllTasks();
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

    // Notify assigned user
    this.createNotification({
      userId: task.assignedTo,
      type: 'task_assigned',
      title: 'New task assigned',
      message: `You have been assigned a new task: ${task.title}`,
      link: task.reportId ? `/reports/${task.reportId}` : '/tasks'
    });

    return newTask;
  },

  updateTask(taskId: string, updates: Partial<Task>): Task[] {
    const tasks = this.getAllTasks();
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const modified = { ...t, ...updates };
        if (updates.status === 'completed' && !t.completedAt) {
          modified.completedAt = new Date().toISOString();
        }
        return modified;
      }
      return t;
    });
    localStorage.setItem(TASKS_KEY, JSON.stringify(updated));
    return updated;
  },

  deleteTask(taskId: string): Task[] {
    const tasks = this.getAllTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
    return filtered;
  },

  // Real-time collaboration status (mock)
  getActiveUsers(reportId: string): string[] {
    // Mock: In production, use WebSockets or Server-Sent Events
    return [];
  },

  broadcastPresence(userId: string, reportId: string) {
    // Mock: Broadcast user presence
    console.log(`User ${userId} active on report ${reportId}`);
  },

  // Parse mentions from text (@username)
  parseMentions(text: string, availableUsers: { id: string, name: string }[]): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex) || [];
    const mentioned = matches.map(m => m.substring(1).toLowerCase());
    
    return availableUsers
      .filter(u => mentioned.includes(u.name.toLowerCase().replace(/\s+/g, '')))
      .map(u => u.id);
  }
};
