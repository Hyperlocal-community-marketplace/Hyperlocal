import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Loader2, MessageCircle, User as UserIcon } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { chatService } from '../../lib/chat';
import { shopService } from '../../lib/shop';
import { userService } from '../../lib/user';
import type { Conversation, Message, User } from '../../types';
import { toast } from 'sonner';

export function SellerChatPage() {
  const [searchParams] = useSearchParams();
  const [seller, setSeller] = useState(() => shopService.getCurrentSeller());
  const socket = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const sellerRef = useRef(seller);
  const sendingRef = useRef(false);

  // Keep seller ref updated
  useEffect(() => {
    sellerRef.current = seller;
    const currentSeller = shopService.getCurrentSeller();
    if (currentSeller && (!seller || currentSeller.id !== seller.id)) {
      setSeller(currentSeller);
    }
  }, [seller]);

  const handleReceiveMessage = useCallback((message: Message) => {
    if (message.conversationId === selectedConversation?.id) {
      setMessages((prev) => {
        // Check if message already exists by real ID
        const existingById = prev.find(m => m.id && m.id === message.id && typeof m.id === 'number');
        if (existingById) return prev;
        
        // Check if this is a duplicate of an optimistic message
        const optimisticIndex = prev.findIndex(m => {
          const isTempId = typeof m.id === 'string' && m.id.startsWith('temp-');
          return isTempId && 
                 m.text === message.text && 
                 m.sender === message.sender &&
                 Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000;
        });
        
        if (optimisticIndex !== -1) {
          // Replace optimistic message with real one
          const newMessages = [...prev];
          newMessages[optimisticIndex] = message;
          return newMessages;
        }
        
        // Check if message already exists by text and sender (fallback)
        const existingByContent = prev.find(m => 
          m.text === message.text && 
          m.sender === message.sender &&
          Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 2000
        );
        if (existingByContent) return prev;
        
        return [...prev, message];
      });
    }
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message.text }
          : conv
      )
    );
  }, [selectedConversation]);

  useEffect(() => {
    if (!seller) {
      setLoading(false);
      return;
    }
    if (loadingRef.current) return;

    const loadData = async () => {
      loadingRef.current = true;
      setLoading(true);
      
      try {
        const data = await chatService.getSellerConversations(seller.id);
        setConversations(data || []);
        if (data && data.length > 0) {
          const userPromises = data.map(async (conv) => {
            try {
              const userInfo = await userService.getUserInfo(conv.userId);
              return { [conv.userId]: userInfo };
            } catch {
              return {};
            }
          });
             const userData = await Promise.all(userPromises);
             setUsers(Object.assign({}, ...userData));
             const conversationId = searchParams.get('conversationId');
             if (conversationId) {
               const conv = data.find((c: Conversation) => c.id === Number(conversationId));
               if (conv) {
                 setSelectedConversation(conv);
               }
             }
           }
      } catch (error: any) {
        let errorMessage = 'Failed to load conversations';
        
        if (!error.response) {
          errorMessage = `Network error: ${error.message}. Make sure the backend server is running on http://localhost:3000`;
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again as a seller.';
        } else if (error.response.status === 403) {
          errorMessage = error.response.data?.message || 'You are not authorized to view these conversations';
        } else {
          errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load conversations';
        }
        
        toast.error(errorMessage);
        setConversations([]);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller?.id, searchParams]);

  useEffect(() => {
    if (!selectedConversation || !socket) return;
    loadMessages();
    socket.emit('join-conversation', String(selectedConversation.id));
    
    const errorHandler = (error: any) => {
      toast.error(error.message || 'Connection error occurred');
    };
    
    socket.on('receive-message', handleReceiveMessage);
    socket.on('error', errorHandler);
    
    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('error', errorHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id, socket]);

  const loadMessages = useCallback(async () => {
    if (!selectedConversation) return;
    try {
      const data = await chatService.getMessages(selectedConversation.id);
      setMessages(data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load messages');
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Early return if already sending
    if (sendingRef.current) return;
    
    const currentSeller = sellerRef.current || shopService.getCurrentSeller();
    if (!currentSeller) {
      toast.error('Please log in again');
      return;
    }
    
    const messageText = newMessage.trim();
    if (!messageText) return;
    if (!selectedConversation) {
      toast.error('Please select a conversation');
      return;
    }
    if (!socket) {
      toast.error('Connection not available. Please refresh the page.');
      return;
    }
    if (!socket.connected) {
      toast.error('Connection lost. Please refresh the page.');
      return;
    }

    // Set sending flag immediately and clear input
    sendingRef.current = true;
    setNewMessage('');

    try {
      const senderId = currentSeller.id;
      const messageData = {
        conversationId: Number(selectedConversation.id),
        sender: Number(senderId),
        text: messageText,
        senderRole: 'seller',
      };
      
      // Create optimistic message with unique temporary ID based on timestamp
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage: Message = {
        id: tempId,
        conversationId: selectedConversation.id,
        sender: senderId,
        senderRole: 'seller',
        text: messageText,
        createdAt: new Date().toISOString(),
      };
      
      // Add optimistic message
      setMessages((prev) => [...prev, optimisticMessage]);
      
      // Emit message
      socket.emit('send-message', messageData);
      
      // Reset sending flag after a delay
      setTimeout(() => {
        sendingRef.current = false;
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
      setNewMessage(messageText);
      sendingRef.current = false;
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else if (messagesEndRef.current) {
      const container = messagesEndRef.current.closest('.overflow-y-auto');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  const getUserName = (userId: number): string => {
    return users[userId]?.name || `User ${userId}`;
  };

  if (!seller) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Not logged in as seller</h3>
          <p className="text-gray-600 dark:text-gray-400">Please login as a seller to view messages</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex h-full">
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-primary/5">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Chat with your customers</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => {
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {getUserName(conv.userId)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {getUserName(selectedConversation.userId)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Customer</p>
                    </div>
                  </div>
                </div>
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {messages.map((message) => {
                  let isMe = false;
                  if (selectedConversation && seller) {
                    const isSelfConversation = selectedConversation.userId === selectedConversation.sellerId;
                    if (isSelfConversation && message.senderRole) {
                      isMe = message.senderRole === 'seller';
                    } else {
                      isMe = message.sender === selectedConversation.sellerId;
                    }
                  } else if (seller) {
                    isMe = message.sender === seller.id;
                  }
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isMe
                            ? 'bg-primary text-background-dark'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-background-dark/70' : 'text-gray-500'}`}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSendMessage(e);
                  return false;
                }} 
                className="p-4 border-t border-gray-200 dark:border-gray-700"
                noValidate
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!sendingRef.current && newMessage.trim() && socket) {
                          const form = e.currentTarget.closest('form');
                          if (form) {
                            form.requestSubmit();
                          }
                        }
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !socket || sendingRef.current}
                    className="px-6 py-2 bg-primary text-background-dark rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

