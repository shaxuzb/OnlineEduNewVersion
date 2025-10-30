import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { ChatMessage, MessageGroup, Theme } from "../../types";
import { useChat, useSendMessage } from "@/src/hooks/useChat";
import { COLORS } from "@/src/utils";
import MessageInput from "./components/MessageInput";
import MessageHeaderItem from "./components/MessageHeaderItem";

export default function ChatScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const route = useRoute();
  const { userId } = route.params as any;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [message, setMessage] = useState("");
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const handleChangeInput = useCallback((e: any) => {
    setMessage(e);
  }, []);
  const mutation = useSendMessage();
  const { data = [], isLoading, isFetching, refetch } = useChat(userId);

  // ✅ isRead so‘rov yuborish
  // const markAsRead = useCallback((id: number) => {
  //   // bu yerda API chaqirasiz
  //   console.log("Marked as read:", id);
  //   // misol: api.markAsRead(id)
  // }, []);

  // // ✅ viewability config
  // const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  // // ✅ message ko‘ringanda ishlaydi
  // const onViewableItemsChanged = useRef(
  //   ({ viewableItems }: { viewableItems: any }) => {
  //     viewableItems.forEach(({ item }: { item: MessageGroup }) => {
  //       item.messages.forEach((msg: ChatMessage) => {
  //         if (!msg.isRead && msg.senderType !== 0) {
  //           markAsRead(msg.id);
  //         }
  //       });
  //     });
  //   }
  // ).current;

  // Date helpers
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Bugun";
    if (date.toDateString() === yesterday.toDateString()) return "Kecha";
    return date.toLocaleDateString("uz-UZ", { day: "numeric", month: "long" });
  };

  // Group messages by date
  const messageGroups: MessageGroup[] = useMemo(() => {
    const groups: Record<string, ChatMessage[]> = {};
    data?.forEach((item) => {
      const createdAt = new Date(item.createdAt);
      const dateKey = formatDate(createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push({ ...item, createdAt });
    });

    return Object.keys(groups).map((date) => ({
      date,
      messages: groups[date]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .reverse(),
    }));
  }, [data]);

  const sendMessage = () => {
    if (!message.trim()) return;
    mutation.mutate(
      { userId, text: message.trim(), attachmentUrl: "" },
      { onSuccess: () => setMessage("") }
    );
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setShowScrollToBottom(false);
  };

  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    const isScrolledUp = contentOffset.y > 50;
    setShowScrollToBottom(isScrolledUp);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={navigation.goBack}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => refetch()}
          >
            <Ionicons name="reload" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {(isLoading || isFetching) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messageGroups}
          keyExtractor={(_, i) => `group-${i}`}
          renderItem={({ item }) => (
            <MessageHeaderItem
              item={item}
              styles={styles}
              theme={theme}
              userId={userId}
            />
          )}
          style={styles.messagesList}
          onScroll={handleScroll}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          inverted
        />

        {/* Scroll to Bottom */}
        {showScrollToBottom && (
          <Animated.View style={styles.scrollToBottomContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.scrollToBottomButton}
              onPress={scrollToBottom}
            >
              <Ionicons name="chevron-down" size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>
        )}
        {/* Input */}
        <MessageInput
          handleChangeInput={handleChangeInput}
          message={message}
          sendMessage={sendMessage}
          styles={styles}
          theme={theme}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      padding: 12,
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
    chatContainer: { flex: 1, backgroundColor: theme.colors.background },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
      backgroundColor: "rgba(255, 255, 255, 0.06)",
    },
    messagesList: { flex: 1, paddingHorizontal: 16 },
    dateHeader: { alignItems: "center", marginVertical: 12 },
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
      elevation: 1,
    },
    messageText: { fontSize: 16, lineHeight: 20 },
    sentMessageText: { color: "white" },
    receivedMessageText: { color: theme.colors.text },
    messageFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: 4,
    },
    timeText: { fontSize: 11, marginRight: 4 },
    sentTimeText: { color: "rgba(255,255,255,0.7)" },
    receivedTimeText: { color: theme.colors.textMuted },
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
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: theme.colors.inputBackground,
      paddingHorizontal: 12,
      paddingVertical: 0,
      borderRadius: 12,
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: Platform.OS === "ios" ? 0 : 8, // iOSda SafeArea ishlaydi
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
      marginLeft: 8,
      marginBottom: 4,
      height: 36,
      width: 36,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
    },
  });
