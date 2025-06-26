import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageCircle, Search, User, Clock, ArrowRight } from "lucide-react";
import Layout from "../../components/Layout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { requestsAPI } from "../../services/api";
import { useSocket } from "../../contexts/SocketContext";

export default function ChatPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { socket, onlineUsers } = useSocket();

  const {
    data: chats = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await requestsAPI.getChatRequests();
      return response.data;
    },
  });

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (data) => {
        refetch();
      };

      const handleMessageNotification = (data) => {
        refetch();
      };

      socket.on("new_message", handleNewMessage);
      socket.on("message_notification", handleMessageNotification);

      return () => {
        socket.off("new_message", handleNewMessage);
        socket.off("message_notification", handleMessageNotification);
      };
    }
  }, [socket, refetch]);

  const filteredChats = chats.filter((chat) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      chat.request?.description?.toLowerCase().includes(searchLower) ||
      chat.request?.departureCity?.toLowerCase().includes(searchLower) ||
      chat.request?.destinationCity?.toLowerCase().includes(searchLower) ||
      chat.participants?.some((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchLower),
      )
    );
  });

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Il y a quelques minutes";
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString("fr-FR");
    }
  };

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return "Aucun message";
    }
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage.content.length > 50) {
      return lastMessage.content.substring(0, 50) + "...";
    }
    return lastMessage.content;
  };

  const getUnreadCount = (chat) => {
    if (!chat.messages) return 0;
    return chat.messages.filter(
      (msg) => !msg.read && msg.sender._id !== chat.currentUserId,
    ).length;
  };

  const getOtherParticipant = (chat) => {
    return chat.participants?.find((p) => p._id !== chat.currentUserId);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">
            Erreur lors du chargement des conversations
          </p>
        </div>
      </Layout>
    );
  }

  return (
    
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">
              Vos conversations avec les transporteurs et expéditeurs
            </p>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <MessageCircle className="w-5 h-5" />
            <span>{chats.length} conversation(s)</span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        {filteredChats.length === 0 ? (
          <Card className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "Aucune conversation trouvée"
                : "Aucune conversation"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Essayez avec d'autres mots-clés"
                : "Vos conversations apparaîtront ici quand vous accepterez des demandes"}
            </p>
            {!searchTerm && (
              <Link
                to="/requests"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Voir les demandes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredChats.map((chat, index) => {
              const otherParticipant = getOtherParticipant(chat);
              const unreadCount = getUnreadCount(chat);
              const isOnline = onlineUsers.includes(otherParticipant?._id);

              return (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/chat/${chat.request._id}`}>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Avatar */}
                          <div className="relative">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              {otherParticipant?.avatar ? (
                                <img
                                  src={otherParticipant.avatar}
                                  alt=""
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            {isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-gray-900 truncate">
                                {otherParticipant
                                  ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                                  : "Utilisateur inconnu"}
                              </h3>
                              <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                  <span className="bg-primary text-white text-xs font-medium px-2 py-1 rounded-full">
                                    {unreadCount}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatLastMessageTime(
                                    chat.lastMessage || chat.updatedAt,
                                  )}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-2 truncate">
                              {chat.request?.departureCity} →{" "}
                              {chat.request?.destinationCity}
                            </p>

                            <p
                              className={`text-sm truncate ${unreadCount > 0 ? "font-medium text-gray-900" : "text-gray-500"}`}
                            >
                              {getLastMessage(chat)}
                            </p>
                          </div>
                        </div>

                        <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    
  );
}
