import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, MessageCircle, Sparkles, User as UserIcon } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { chatService } from '../lib/chat';
import { authService } from '../lib/auth';
import { shopService } from '../lib/shop';
import { userService } from '../lib/user';
import type { Conversation, Message, Shop, User } from '../types';
import { toast } from 'sonner';

export function ChatPage() {
  const [searchParams] = useSearchParams();
  const user = authService.getCurrentUser();
  const seller = shopService.getCurrentSeller();
  const socket = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [shops, setShops] = useState<{ [key: number]: Shop }>({});
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (user) {
      loadUserConversations();
    } else if (seller) {
      loadSellerConversations();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, seller?.id, searchParams]);

  const loadMessages = useCallback(async () => {
    if (!selectedConversation) return;
    try {
      const data = await chatService.getMessages(selectedConversation.id);
      setMessages(data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load messages');
      setMessages([]);
    }
  }, [selectedConversation?.id]);

  const handleReceiveMessage = useCallback((message: Message) => {
    if (message.conversationId === selectedConversation?.id) {
      setMessages((prev) => {
        // Check if message already exists by ID
        if (message.id) {
          const existingById = prev.find(m => m.id === message.id);
          if (existingById) return prev;
        }
        
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
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (!socket || !selectedConversation) return;
    loadMessages();
    socket.emit('join-conversation', String(selectedConversation.id));
    
    const messageHandler = (message: Message) => {
      handleReceiveMessage(message);
    };
    const errorHandler = (error: any) => {
      toast.error(error.message || 'Connection error occurred');
    };
    socket.on('receive-message', messageHandler);
    socket.on('error', errorHandler);
    return () => {
      socket.off('receive-message', messageHandler);
      socket.off('error', errorHandler);
    };
  }, [selectedConversation?.id, socket, handleReceiveMessage, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const loadUserConversations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      
      // Safety timeout for conversation loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError('Loading conversations took too long. Please refresh the page.');
      }, 15000);
      
      const data = await chatService.getUserConversations(user.id);
      clearTimeout(timeoutId);
      setConversations(data || []);
      setLoading(false);
      
      const shopPromises = (data || []).map(async (conv) => {
        try {
          const shop = await shopService.getShopInfo(conv.sellerId);
          return { [conv.sellerId]: shop };
        } catch {
          return {};
        }
      });
      const shopData = await Promise.all(shopPromises);
      setShops(Object.assign({}, ...shopData));

      const conversationId = searchParams.get('conversationId');
      if (conversationId) {
        const convIdNum = Number(conversationId);
        const conv = data.find(c => {
          const cId = typeof c.id === 'string' ? Number(c.id) : c.id;
          return cId === convIdNum;
        });
        if (conv) {
          setSelectedConversation(conv);
        } else {
          setTimeout(async () => {
            try {
              const retryData = await chatService.getUserConversations(user.id);
              setConversations(retryData);
              const retryConv = retryData.find(c => {
                const cId = typeof c.id === 'string' ? Number(c.id) : c.id;
                return cId === convIdNum;
              });
              if (retryConv) {
                setSelectedConversation(retryConv);
              } else {
                toast.error('Conversation not found. Please try again.');
              }
            } catch (err) {
              toast.error('Failed to load conversation');
            }
          }, 1000);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load conversations';
      toast.error(errorMessage);
      setError(errorMessage);
      setConversations([]);
      setLoading(false);
    }
  };

  const loadSellerConversations = async () => {
    if (!seller) return;
    try {
      setLoading(true);
      setError(null);
      
      // Safety timeout for conversation loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError('Loading conversations took too long. Please refresh the page.');
      }, 15000);
      
      const data = await chatService.getSellerConversations(seller.id);
      clearTimeout(timeoutId);
      setConversations(data || []);
      setLoading(false);
      
      const userPromises = (data || []).map(async (conv) => {
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
        const conv = data.find(c => c.id === Number(conversationId));
        if (conv) {
          setSelectedConversation(conv);
        } else {
          setTimeout(async () => {
            try {
              const retryData = await chatService.getSellerConversations(seller.id);
              setConversations(retryData);
              const retryConv = retryData.find(c => c.id === Number(conversationId));
              if (retryConv) {
                setSelectedConversation(retryConv);
              } else {
                toast.error('Conversation not found. Please try again.');
              }
            } catch (err) {
              // Error handled by toast
            }
          }, 500);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load conversations';
      toast.error(errorMessage);
      setError(errorMessage);
      setConversations([]);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Early return if already sending
    if (sendingRef.current) return;
    
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
    if (!user && !seller) {
      toast.error('Please log in to send messages');
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
      const senderId = user ? user.id : seller!.id;
      const messageData = {
        conversationId: Number(selectedConversation.id),
        sender: Number(senderId),
        text: messageText,
        senderRole: user ? 'user' : 'seller',
      };
      
      // Emit message and wait for server confirmation
      socket.emit('send-message', messageData);
      
      // Reset sending flag after a delay
      setTimeout(() => {
        sendingRef.current = false;
      }, 2000);
    } catch (error: any) {
      toast.error('Failed to send message');
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

  const getShopName = (sellerId: number) => {
    return shops[sellerId]?.name || `Shop ${sellerId}`;
  };

  const getUserName = (userId: number) => {
    return users[userId]?.name || `User ${userId}`;
  };

  if (!user && !seller) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Not logged in</h3>
          <p className="text-gray-600 dark:text-gray-400">Please login to view messages</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <MessageCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error loading conversations</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 gradient-text flex items-center gap-3">
            <MessageCircle className="h-10 w-10 text-primary" />
            Messages
          </h1>
          <p className="text-lg text-muted-foreground">
            {user ? 'Chat with sellers directly' : seller ? 'Chat with your customers' : 'Messages'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-primary/10">
              <h2 className="font-bold text-lg gradient-text flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Conversations
              </h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-80px)]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <Sparkles className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 hover:bg-primary/10 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-primary">
                        {user ? getShopName(conv.sellerId) : getUserName(conv.userId)}
                      </p>
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">{conv.lastMessage}</p>
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col shadow-xl overflow-hidden"
          >
            {selectedConversation ? (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-bold text-xl gradient-text">
                          {user ? getShopName(selectedConversation.sellerId) : getUserName(selectedConversation.userId)}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-background-light dark:bg-background-dark">
                  <AnimatePresence>
                    {messages.map((message) => {
                      let isMe = false;
                      if (selectedConversation) {
                        const isSelfConversation = selectedConversation.userId === selectedConversation.sellerId;
                        if (isSelfConversation && message.senderRole) {
                          if (user) {
                            isMe = message.senderRole === 'user';
                          } else if (seller) {
                            isMe = message.senderRole === 'seller';
                          }
                        } else {
                          if (user) {
                            isMe = message.sender === selectedConversation.userId;
                          } else if (seller) {
                            isMe = message.sender === selectedConversation.sellerId;
                          }
                        }
                      } else {
                        const currentUserId = user?.id ?? seller?.id;
                        isMe = currentUserId ? message.sender === currentUserId : false;
                      }
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-xl p-4 shadow-lg ${
                              isMe
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}
                            <p className={`text-xs mt-2 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
                <form 
                  onSubmit={handleSendMessage} 
                  className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-3"
                  noValidate
                >
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
                    className="flex-1 px-4 py-4 border-2 border-primary/20 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    autoComplete="off"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: sendingRef.current ? 1 : 1.05 }}
                    whileTap={{ scale: sendingRef.current ? 1 : 0.95 }}
                    className="bg-primary text-background-dark px-8 py-4 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newMessage.trim() || !socket || sendingRef.current}
                  >
                    <Send className="h-5 w-5" />
                  </motion.button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="inline-block p-8 bg-primary/10 rounded-full mb-6">
                    <MessageCircle className="h-16 w-16 text-primary" />
                  </div>
                  <p className="text-xl text-muted-foreground font-semibold">Select a conversation to start chatting</p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

