// Offline mode service - queues messages and manages offline state

class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.messageQueue = this.loadQueue();
    this.listeners = new Set();
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('🟢 Back online!');
      this.isOnline = true;
      this.notifyListeners('online');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('🔴 Gone offline!');
      this.isOnline = false;
      this.notifyListeners('offline');
    });
  }

  // Load queue from localStorage
  loadQueue() {
    try {
      const stored = localStorage.getItem('offline_message_queue');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading queue:', error);
      return [];
    }
  }

  // Save queue to localStorage
  saveQueue() {
    try {
      localStorage.setItem('offline_message_queue', JSON.stringify(this.messageQueue));
    } catch (error) {
      console.error('Error saving queue:', error);
    }
  }

  // Add message to queue
  queueMessage(conversationId, content, type = 'text', audioDuration = null) {
    const queuedMessage = {
      id: Date.now() + Math.random(), // Temporary ID
      conversationId,
      content,
      type,
      audioDuration,
      timestamp: new Date().toISOString(),
      status: 'queued',
    };

    this.messageQueue.push(queuedMessage);
    this.saveQueue();

    console.log('📦 Message queued:', queuedMessage);
    return queuedMessage;
  }

  // Process queued messages when back online
  async processQueue() {
    if (!this.isOnline || this.messageQueue.length === 0) {
      return;
    }

    console.log(`📤 Processing ${this.messageQueue.length} queued messages...`);

    const queue = [...this.messageQueue];
    this.messageQueue = [];
    this.saveQueue();

    // Notify listeners that processing started
    this.notifyListeners('processing-queue', queue.length);

    for (const message of queue) {
      try {
        // Emit the message through socket
        await this.sendQueuedMessage(message);
        console.log('✅ Sent queued message:', message.id);
      } catch (error) {
        console.error('❌ Failed to send queued message:', error);
        // Re-queue failed message
        this.messageQueue.push(message);
      }
    }

    this.saveQueue();
    this.notifyListeners('queue-processed');
  }

  // Send a queued message (to be called with socket instance)
  async sendQueuedMessage(message) {
    // This will be called from SocketContext with the actual socket
    return new Promise((resolve, reject) => {
      if (!this.socketEmitCallback) {
        reject(new Error('Socket emit callback not set'));
        return;
      }

      this.socketEmitCallback(message, (success) => {
        if (success) {
          resolve();
        } else {
          reject(new Error('Failed to send'));
        }
      });
    });
  }

  // Set socket emit callback
  setSocketEmitCallback(callback) {
    this.socketEmitCallback = callback;
  }

  // Get queued messages count
  getQueuedCount() {
    return this.messageQueue.length;
  }

  // Get all queued messages
  getQueue() {
    return [...this.messageQueue];
  }

  // Clear queue
  clearQueue() {
    this.messageQueue = [];
    this.saveQueue();
  }

  // Subscribe to connection status changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.listeners.forEach(listener => listener(event, data));
  }

  // Check if online
  checkOnlineStatus() {
    return this.isOnline;
  }
}

const offlineService = new OfflineService();

export default offlineService;
