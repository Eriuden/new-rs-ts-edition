import { useState, useEffect, useRef } from 'react';
import { io, Socket } from "socket.io-client"
import axios from 'axios';

interface User {
  user_id: string;
  username: string;
  avatar?: string;
}

interface Message {
  message_id: string;
  content: string;
  sender: User;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  conv_id: string;
  participants: User[];
  lastMessage?: Message;
  lastMessageAt: string;
}

export const MessagingInterface: React.FC = ({user_id,
  }: User) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = {user_id};

  
  useEffect(() => {
    const token = localStorage.getItem('token'); // Adapter selon ton système d'auth
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  
  useEffect(() => {
    fetchConversations();
  }, []);

 
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (message: Message) => {
      if (selectedConversation && message.message_id === selectedConversation.conv_id) {
        setMessages(prev => [...prev, message]);
        markAsRead(selectedConversation.conv_id);
      }
      fetchConversations(); 
    });

    socket.on('user_typing', ( conversationId:string, user_id:string ) => {
      if (selectedConversation?.conv_id === conversationId && user_id !== currentUserId.user_id) {
        setIsTyping(true);
      }
    });

    socket.on('user_stop_typing', ( conversationId:string ) => {
      if (selectedConversation?.conv_id === conversationId) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, selectedConversation]);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des conversations', err);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await axios.get(`/api/messages/conversations/${conversationId}/messages`);
      setMessages(res.data);
      markAsRead(conversationId);
    } catch (err) {
      console.error('Erreur lors du chargement des messages', err);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await axios.put(`/api/messages/conversations/${conversationId}/read`);
    } catch (err) {
      console.error('Erreur lors du marquage comme lu', err);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.conv_id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const res = await axios.post(
        `/api/messages/conversations/${selectedConversation.conv_id}/messages`,
        { content: newMessage }
      );
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      handleStopTyping();
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message', err);
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedConversation) return;

    const recipient = selectedConversation.participants.find(p => p.user_id !== currentUserId.user_id);
    socket.emit('typing', {
      conversationId: selectedConversation.conv_id,
      recipientId: recipient?.user_id
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!socket || !selectedConversation) return;

    const recipient = selectedConversation.participants.find(p => p.user_id !== currentUserId.user_id);
    socket.emit('stop_typing', {
      conversationId: selectedConversation.conv_id,
      recipientId: recipient?user_id
    });
  };

  const getOtherParticipant = (conversation: Conversation): User => {
    return conversation.participants.find(p => p.user_id !== currentUserId.user_id)!;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{
        width: '320px',
        borderRight: '1px solid #ddd',
        overflowY: 'auto',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Messages</h2>
        </div>
        {conversations.map(conv => {
          const other = getOtherParticipant(conv);
          return (
            <div
              key={conv.conv_id}
              onClick={() => handleSelectConversation(conv)}
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: selectedConversation?.conv_id ? '#e3f2fd' : 'white',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#007bff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  {other.username[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{other.username}</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conv.lastMessage?.content || 'Aucun message'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #ddd',
              backgroundColor: 'white'
            }}>
              <h3 style={{ margin: 0 }}>{getOtherParticipant(selectedConversation).username}</h3>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: '#f5f5f5'
            }}>
              {messages.map(msg => (
                <div
                  key={msg.message_id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender.user_id === currentUserId.user_id ? 'flex-end' : 'flex-start',
                    marginBottom: '15px'
                  }}
                >
                  <div style={{
                    maxWidth: '60%',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    backgroundColor: msg.sender.user_id === currentUserId.user_id ? '#007bff' : 'white',
                    color: msg.sender === currentUserId ? 'white' : 'black',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    <div>{msg.content}</div>
                    <div style={{
                      fontSize: '11px',
                      marginTop: '5px',
                      opacity: 0.7
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                  {getOtherParticipant(selectedConversation).username} est en train d'écrire...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{
              padding: '20px',
              borderTop: '1px solid #ddd',
              backgroundColor: 'white',
              display: 'flex',
              gap: '10px'
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Écrivez un message..."
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '24px',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Envoyer
              </button>
            </form>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}>
            Sélectionnez une conversation pour commencer
          </div>
        )}
      </div>
    </div>
  );
};
