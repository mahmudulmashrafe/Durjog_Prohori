import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000';

const useEarthquakeStore = create((set, get) => ({
  // State
  earthquakes: [],
  loading: false,
  error: null,
  lastUpdated: null,
  notifications: [], // For storing new earthquake notifications
  socket: null,
  
  // Socket connection
  initializeSocket: () => {
    if (get().socket) return; // Already initialized
    
    const socket = io(API_URL);
    console.log('Connecting to earthquake socket...');
    
    socket.on('connect', () => {
      console.log('Connected to earthquake socket');
    });
    
    socket.on('new_earthquakes', (data) => {
      console.log(`Received ${data.count} new earthquakes via socket`);
      set(state => ({
        earthquakes: [...data.data, ...state.earthquakes],
        lastUpdated: new Date(),
        notifications: [...data.data.map(eq => ({
          id: eq._id,
          title: `New Earthquake: ${eq.magnitude.toFixed(1)}`,
          message: eq.place,
          read: false,
          time: new Date(eq.time).toLocaleString(),
          data: eq
        })), ...state.notifications].slice(0, 50) // Keep only most recent 50 notifications
      }));
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from earthquake socket');
    });
    
    set({ socket });
  },
  
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
  
  // Actions
  fetchEarthquakes: async (limit) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/earthquakes${limit ? `?limit=${limit}` : ''}`);
      set({ 
        earthquakes: response.data.data, 
        loading: false,
        lastUpdated: new Date()
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch earthquakes', 
        loading: false 
      });
      return null;
    }
  },
  
  fetchRecentEarthquakes: async () => {
    return get().fetchEarthquakes(10);
  },
  
  fetchEarthquakesByMagnitude: async (min, max) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/earthquakes/magnitude/${min}/${max}`);
      set({ 
        earthquakes: response.data.data, 
        loading: false,
        lastUpdated: new Date()
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch earthquakes by magnitude', 
        loading: false 
      });
      return null;
    }
  },
  
  // Notifications management
  markNotificationAsRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(notification => 
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    }));
  },
  
  markAllNotificationsAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notification => ({ ...notification, read: true }))
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  }
}));

export default useEarthquakeStore; 