import { useTheme } from "@/src/context/ThemeContext";
import { useChat, useSendMessage } from "@/src/hooks/useChat";
import { useCurrentUserId } from "@/src/hooks/useQuiz";
import { ChatMessage, MessageGroup, Theme } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MessageHeaderItem from "./components/MessageHeaderItem";
import MessageInput from "./components/MessageInput";
import { COLORS } from "@/src/utils";
import { lightColors } from "@/src/constants/theme";
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from "react-native-keyboard-controller";
import { moderateScale } from "react-native-size-matters";

export default function ChatScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const userId = useCurrentUserId();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [message, setMessage] = useState("");
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const handleChangeInput = useCallback((e: any) => {
    setMessage(e);
  }, []);
  const mutation = useSendMessage();
  const { data = [], isLoading, isFetching, refetch } = useChat(Number(userId));

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
      { userId: Number(userId), text: message.trim(), attachmentUrl: "" },
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
  useEffect(() => {
    navigation.setOptions({
      title: "Habarlar",
      freezeOnBlur: true,
      headerTitleStyle: {
        fontSize: +moderateScale(18).toFixed(0),
      },
      headerRight: () => (
        <Pressable
          android_ripple={{
            foreground: true,
            color: lightColors.ripple,
            borderless: true,
            radius: moderateScale(30),
          }}
          style={{
            width: moderateScale(40),
            height: moderateScale(40),
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => refetch()}
        >
          <Ionicons name="reload" size={moderateScale(18)} color="white" />
        </Pressable>
      ),
    });
  }, [navigation]);
  return (
    <KeyboardProvider>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 50}
      >
        <SafeAreaView style={styles.container} edges={["bottom"]}>
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
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: false,
              });
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
                <Ionicons
                  name="chevron-down"
                  size={moderateScale(18)}
                  color="white"
                />
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
    </KeyboardProvider>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
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
    messagesList: { flex: 1, paddingHorizontal: moderateScale(8) },
    dateHeader: { alignItems: "center", marginVertical: 12 },
    dateText: {
      backgroundColor: theme.colors.divider,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: moderateScale(10),
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    messageContainer: {
      marginVertical: 4,
      maxWidth: "80%",
      borderRadius: moderateScale(14),
    },
    messageContent:{
      padding: moderateScale(10),
      
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
    messageText: { fontSize: moderateScale(14), lineHeight: 20 },
    sentMessageText: { color: theme.colors.text },
    receivedMessageText: { color: "white" },
    messageFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: 4,
    },
    timeText: { fontSize: moderateScale(9), marginRight: 4 },
    sentTimeText: { color: "rgba(255,255,255,0.7)" },
    receivedTimeText: { color: "rgba(255,255,255,0.7)" },
    scrollToBottomContainer: {
      position: "absolute",
      bottom: 120,
      right: 16,
      zIndex: 1000,
    },
    scrollToBottomButton: {
      width: moderateScale(36),
      height: moderateScale(36),
      borderRadius: moderateScale(20),
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: theme.colors.inputBackground,
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(0),
      borderRadius: moderateScale(12),
      marginHorizontal: moderateScale(16),
      marginTop: moderateScale(8),
      marginBottom: Platform.OS === "ios" ? 0 : 8, // iOSda SafeArea ishlaydi
    },
    textInputFull: {
      flex: 1,
      paddingHorizontal: moderateScale(14),
      paddingVertical: moderateScale(10),
      fontSize: moderateScale(14),
      color: theme.colors.text,
      maxHeight: 100,
    },
    sendButton: {
      marginLeft: moderateScale(6),
      marginBottom: moderateScale(2),
      height: moderateScale(34),
      width: moderateScale(34),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: moderateScale(18),
    },
  });
