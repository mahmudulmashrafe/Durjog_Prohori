import { create } from 'zustand';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5000';

// Create a store for chat state management
const useChatStore = create((set, get) => ({
  // Chat data
  chats: [],
  activeChat: null,
  activeChatId: null,
  messages: [],
  newMessage: '',
  loading: false,
  error: null,
  socket: null,
  currentUser: null,

  // Initialize chat store with current user
  initialize: (user) => {
    set({ currentUser: user });
    get().connectSocket();
    get().fetchChats();
  },

  // Socket connection
  connectSocket: () => {
    try {
      const socket = io(API_URL);
      
      socket.on('connect', () => {
        console.log('Socket connected');
        const { currentUser } = get();
        if (currentUser && currentUser._id) {
          socket.emit('join', { userId: currentUser._id });
        }
      });
      
      socket.on('receive_message', (message) => {
        const { currentUser, activeChatId } = get();
        
        if (!currentUser) return;
        
        // Check if message is for current user
        if (message.receiver_id === currentUser._id || message.sender_id === currentUser._id) {
          // Add message to state if the chat is active
          const otherUserId = message.sender_id === currentUser._id 
            ? message.receiver_id 
            : message.sender_id;
            
          if (activeChatId && otherUserId === activeChatId) {
            get().addMessage(message);
          }
          
          // Update chat preview with last message
          get().updateChatPreview(message);
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      set({ socket });
      
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    } catch (err) {
      console.error('Failed to connect socket:', err);
      set({ error: 'Failed to connect to chat server' });
    }
  },

  // Disconnect socket
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  // Fetch all chats for the current user
  fetchChats: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    set({ loading: true, error: null });
    
    try {
      console.log('Fetching users...');
      const response = await axios.get(`${API_URL}/api/user/getAllUsers`);
      console.log('Fetched users:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }
      
      // Transform users into chat format - filter out current user
      const chats = response.data
        .filter(user => user._id !== currentUser._id)
        .map(user => ({
          _id: user._id,
          name: user.name || 'User',
          phone_number: user.phone_number || '',
          email: user.email || '',
          avatar: user.profileImage ? `/${user.profileImage}` : '👤',
          online: Math.random() > 0.5, // Random online status
          lastActive: user.updatedAt || new Date().toISOString(),
          lastMessage: 'Click to start a conversation',
          timestamp: new Date(),
          unread: 0
        }));
      
      // Fetch conversations from the new endpoint
      try {
        const conversationsResponse = await axios.get(
          `${API_URL}/api/chat/conversations?user_id=${currentUser._id}`
        );
        console.log('Chat conversations:', conversationsResponse.data);
        
        if (conversationsResponse.data && Array.isArray(conversationsResponse.data)) {
          // Update chat previews with latest messages
          const updatedChats = chats.map(chat => {
            const conversation = conversationsResponse.data.find(
              c => c.user_id === chat._id
            );
            
            if (conversation) {
              return {
                ...chat,
                lastMessage: conversation.lastMessage || chat.lastMessage,
                timestamp: conversation.timestamp ? new Date(conversation.timestamp) : chat.timestamp,
                unread: conversation.unreadCount || 0
              };
            }
            return chat;
          });
          
          set({ chats: updatedChats });
        } else {
          set({ chats });
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        set({ chats });
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      set({ error: 'Failed to load chats' });
      
      // Use mock data as fallback
      set({
        chats: [
          {
            _id: 'user1',
            name: 'Abdul Karim',
            avatar: '👨‍🔧',
            online: true,
            phone_number: '01712345678',
            lastMessage: 'How many people need evacuation?',
            timestamp: new Date(),
            unread: 0
          },
          {
            _id: 'user2',
            name: 'Rahul Ahmed',
            avatar: '👨‍💼',
            online: false,
            phone_number: '01812345678',
            lastMessage: 'The medical team is ready.',
            timestamp: new Date(Date.now() - 3600000),
            unread: 2
          }
        ]
      });
    } finally {
      set({ loading: false });
    }
  },

  // Open a chat with a user
  openChat: (chatId) => {
    const { chats, socket, currentUser } = get();
    const chat = chats.find(c => c._id === chatId);
    
    if (chat) {
      // Reset unread count
      set({ 
        activeChatId: chatId, 
        activeChat: chat,
        chats: chats.map(c => 
          c._id === chatId ? { ...c, unread: 0 } : c
        )
      });
      
      // Fetch messages
      get().fetchMessages(chatId);
    }
  },

  // Close active chat
  closeChat: () => {
    set({ activeChatId: null, activeChat: null, messages: [] });
  },

  // Fetch messages for a chat
  fetchMessages: async (chatId) => {
    const { currentUser } = get();
    if (!currentUser || !chatId) return;
    
    set({ loading: true, error: null });
    
    try {
      // Fetch messages using the new endpoint format
      const response = await axios.get(
        `${API_URL}/api/chat/getMessages?sender_id=${currentUser._id}&receiver_id=${chatId}`
      );
      console.log('Fetched messages:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        set({ messages: response.data });
      } else {
        set({ messages: [] });
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      set({ error: 'Failed to load messages', messages: [] });
    } finally {
      set({ loading: false });
    }
  },

  // Update message input
  setNewMessage: (message) => {
    set({ newMessage: message });
  },

  // Send a message
  sendMessage: async () => {
    const { currentUser, activeChatId, activeChat, newMessage, socket } = get();
    
    if (!newMessage.trim() || !activeChatId || !currentUser) return;
    
    // Create message object with new field names
    const messageObj = {
      sender_id: currentUser._id,
      receiver_id: activeChatId,
      message: newMessage,
      timestamp: new Date(),
      read: false
    };
    
    try {
      // Send message to API with new fields
      const response = await axios.post(`${API_URL}/api/chat/sendMessage`, messageObj);
      console.log('Message sent:', response.data);
      
      // Emit message via socket
      if (socket) {
        socket.emit('send_message', messageObj);
      }
      
      // Add message to state
      get().addMessage({...messageObj, _id: response.data._id});
      
      // Update chat preview
      get().updateChatPreview(messageObj);
      
      // Clear input
      set({ newMessage: '' });
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Add message locally even if API fails
      get().addMessage(messageObj);
      set({ newMessage: '' });
    }
  },

  // Add a message to the current conversation
  addMessage: (message) => {
    set(state => ({
      messages: [...state.messages, message]
    }));
  },

  // Update chat preview when a new message is received
  updateChatPreview: (message) => {
    const { currentUser, activeChatId } = get();
    if (!currentUser) return;
    
    const otherUserId = message.sender_id === currentUser._id 
      ? message.receiver_id 
      : message.sender_id;
    
    set(state => ({
      chats: state.chats.map(chat => {
        if (chat._id === otherUserId) {
          return {
            ...chat,
            lastMessage: message.message,
            timestamp: new Date(message.timestamp),
            unread: message.sender_id !== currentUser._id && activeChatId !== otherUserId 
              ? (chat.unread || 0) + 1 
              : chat.unread
          };
        }
        return chat;
      })
    }));
  },

  // Search chats
  searchChats: (query) => {
    const { chats } = get();
    
    if (!query.trim()) {
      return chats;
    }
    
    return chats.filter(chat =>
      chat.name?.toLowerCase().includes(query.toLowerCase()) ||
      chat.phone_number?.toLowerCase().includes(query.toLowerCase()) ||
      chat.email?.toLowerCase().includes(query.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(query.toLowerCase())
    );
  }
}));

export default useChatStore; 