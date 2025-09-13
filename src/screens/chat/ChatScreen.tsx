import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { ChatMessage, MessageGroup, Theme } from "../../types";

export default function ChatScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Sample initial messages
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: "1",
        text: "Assalomu aleykum! Sizga qanday yordam bera olaman? Savolingiz bo'lsa yozib qoldiring.",
        timestamp: new Date(Date.now() - 86400000), // Yesterday
        isRead: true,
        isSent: false,
      },
      {
        id: "2",
        text: "Salom! Algebra bo'yicha yordam kerak edi.",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        isRead: true,
        isSent: true,
      },
      {
        id: "3",
        text: "Albatta! Qaysi mavzu bo'yicha savolingiz bor?",
        timestamp: new Date(Date.now() - 3300000), // 55 minutes ago
        isRead: false,
        isSent: false,
      },
      {
        id: "4",
        text: "Kvadrat tenglamalar haqida tushuntira olasizmi?",
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        isRead: false,
        isSent: true,
      },
      {
        id: "5",
        text: "Tabiiyki! Kvadrat tenglama bu ax² + bx + c = 0 ko'rinishdagi tenglama. Bu yerda a ≠ 0 bo'lishi kerak.",
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        isRead: false,
        isSent: false,
      },
    ];
    setMessages(initialMessages);
  }, []);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Bugun";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Kecha";
    } else {
      return date.toLocaleDateString("uz-UZ", {
        day: "numeric",
        month: "long",
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupMessagesByDate = (messages: ChatMessage[]): MessageGroup[] => {
    const groups: { [key: string]: ChatMessage[] } = {};

    messages.forEach((message) => {
      const dateKey = formatDate(message.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.keys(groups).map((date) => ({
      date,
      messages: groups[date].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    }));
  };

  const sendMessage = () => {
    if (message.trim().length > 0) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        timestamp: new Date(),
        isRead: true,
        isSent: true,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      
      // Auto scroll to bottom when sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setShowScrollToBottom(false);
  };

  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const isScrolledUp = contentOffset.y < contentSize.height - layoutMeasurement.height - 100;
    setShowScrollToBottom(isScrolledUp);

    // Mark messages as read when they become visible
    if (!isScrolledUp) {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          isRead: true,
        }))
      );
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    return (
      <View
        style={[
          styles.messageContainer,
          item.isSent ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        <Text style={[
          styles.messageText,
          item.isSent ? styles.sentMessageText : styles.receivedMessageText,
        ]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timeText,
            item.isSent ? styles.sentTimeText : styles.receivedTimeText,
          ]}>
            {formatTime(item.timestamp)}
          </Text>
          {item.isSent && (
            <View style={styles.checkContainer}>
              <Ionicons
                name="checkmark-done"
                size={14}
                color={item.isRead ? theme.colors.success : theme.colors.textMuted}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderDateHeader = ({ item }: { item: MessageGroup }) => {
    return (
      <View>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        {item.messages.map((message) => (
          <View key={message.id}>
            {renderMessage({ item: message })}
          </View>
        ))}
      </View>
    );
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity style={styles.headerRight}>
          <Ionicons name="ellipse" size={8} color="white" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messageGroups}
          keyExtractor={(item, index) => `group-${index}`}
          renderItem={renderDateHeader}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesListContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        />

        {/* Scroll to Bottom Button */}
        {showScrollToBottom && (
          <Animated.View style={styles.scrollToBottomContainer}>
            <TouchableOpacity
              style={styles.scrollToBottomButton}
              onPress={scrollToBottom}
            >
              <Ionicons name="chevron-down" size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInputFull}
            placeholder="Xabar yozing..."
            placeholderTextColor={theme.colors.placeholder}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
        </View>

        {/* Send Button - Only visible when there's text */}
        {message.trim().length > 0 && (
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Yuborish</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: 20,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesListContent: {
    paddingBottom: 20,
  },
  dateHeader: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateText: {
    backgroundColor: theme.colors.divider,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: 4,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentMessageText: {
    color: "white",
  },
  receivedMessageText: {
    color: theme.colors.text,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    marginRight: 4,
  },
  sentTimeText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  receivedTimeText: {
    color: theme.colors.textMuted,
  },
  checkContainer: {
    marginLeft: 4,
  },
  scrollToBottomContainer: {
    position: "absolute",
    bottom: 80,
    right: 16,
    zIndex: 1000,
  },
  scrollToBottomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: theme.colors.inputBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInputFull: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    position: "absolute",
    right: 24,
    bottom: 20,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  bottomNavItem: {
    alignItems: "center",
    paddingVertical: 4,
  },
  bottomNavText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  activeNavText: {
    color: theme.colors.primary,
  },
});
