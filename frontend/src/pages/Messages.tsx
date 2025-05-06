import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

interface Message {
  id: string;
  content: string;
  sender: string | null;
  timestamp: string;
}

const Messages: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { account } = useWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (account) {
      // Connect to WebSocket server
      socketRef.current = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
        query: { address: account },
      });

      socketRef.current.on('message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [account]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // TODO: Fetch messages from the backend
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };

    fetchMessages();
  }, [jobId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !account) return;

    try {
      // TODO: Implement message sending to contract
      const message: Message = {
        id: Date.now().toString(), // Generate a unique ID
        content: newMessage,
        sender: account,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev: Message[]) => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          </div>

          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === account ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === account
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!account}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 