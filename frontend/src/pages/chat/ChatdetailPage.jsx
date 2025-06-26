import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  User,
  MapPin,
  Package,
  Calendar,
  MoreVertical,
  Phone,
  Info,
} from "lucide-react";
import Layout from "../../components/Layout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { requestsAPI } from "../../services/api";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";

export default function ChatDetailPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    socket,
    joinChat,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    onlineUsers,
  } = useSocket();

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    data: request,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["request", requestId],
    queryFn: async () => {
      const response = await requestsAPI.getRequest(requestId);
      return response.data;
    },
  });

  const {
    data: chatData,
    isLoading: chatLoading,
    refetch: refetchChat,
  } = useQuery({
    queryKey: ["chat", requestId],
    queryFn: async () => {
      const response = await requestsAPI.getRequestChat(requestId);
      return response.data;
    },
    enabled: !!requestId,
  });

  useEffect(() => {
    if (chatData?.messages) {
      setMessages(chatData.messages);
    }
  }, [chatData]);

  useEffect(() => {
    if (requestId && socket) {
      joinChat(requestId);

      const handleNewMessage = (data) => {
        if (data.chatId === chatData?._id) {
          setMessages((prev) => [...prev, data.message]);
          scrollToBottom();
        }
      };

      const handleUserTyping = (data) => {
        setTypingUsers((prev) => [
          ...prev.filter((id) => id !== data.userId),
          data.userId,
        ]);
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
        }, 3000);
      };

      const handleUserStopTyping = (data) => {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
      };

      socket.on("new_message", handleNewMessage);
      socket.on("user_typing", handleUserTyping);
      socket.on("user_stop_typing", handleUserStopTyping);

      return () => {
        socket.off("new_message", handleNewMessage);
        socket.off("user_typing", handleUserTyping);
        socket.off("user_stop_typing", handleUserStopTyping);
      };
    }
  }, [requestId, socket, chatData, joinChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatData?._id) {
      markAsRead(chatData._id);
    }
  }, [chatData, markAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    try {
      await sendMessage(requestId, message.trim());
      setMessage("");
      setIsTyping(false);
      stopTyping(chatData?._id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      startTyping(chatData?._id);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(chatData?._id);
    }, 1000);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const getOtherParticipant = () => {
    return chatData?.participants?.find((p) => p._id !== user?.id);
  };

  const otherParticipant = getOtherParticipant();
  const isOnline = onlineUsers.includes(otherParticipant?._id);

  if (isLoading || chatLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error || !request) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">
            Erreur lors du chargement de la conversation
          </p>
          <Button onClick={() => navigate("/chat")} className="mt-4">
            Retour aux messages
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-4 py-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => navigate("/chat")}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {otherParticipant?.avatar ? (
                        <img
                          src={otherParticipant.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div>
                    <h2 className="font-medium text-gray-900">
                      {otherParticipant
                        ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                        : "Utilisateur inconnu"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isOnline ? "En ligne" : "Hors ligne"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="small">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="small">
                  <Info className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="small">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Request Info */}
        <div className="bg-blue-50 border-b px-4 py-3">
          <div className="container mx-auto">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>
                    {request.departureCity} → {request.destinationCity}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>{request.itemType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>
                    {new Date(request.departureDate).toLocaleDateString(
                      "fr-FR",
                    )}
                  </span>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : request.status === "in_transit"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {request.status === "accepted" && "Acceptée"}
                {request.status === "in_transit" && "En transit"}
                {request.status === "completed" && "Terminée"}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, index) => {
                  const isOwnMessage = msg.sender._id === user?.id;
                  const showAvatar =
                    index === 0 ||
                    messages[index - 1].sender._id !== msg.sender._id;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} items-end space-x-2`}
                    >
                      {!isOwnMessage && (
                        <div className="w-8 h-8">
                          {showAvatar && (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              {msg.sender.avatar ? (
                                <img
                                  src={msg.sender.avatar}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-gray-500" />
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? "bg-primary text-white"
                            : "bg-white text-gray-900 border"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {formatMessageTime(msg.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t px-4 py-4">
          <div className="container mx-auto max-w-4xl">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center space-x-4"
            >
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Tapez votre message..."
                  value={message}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                disabled={!message.trim()}
                className="flex items-center"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    
  );
}
