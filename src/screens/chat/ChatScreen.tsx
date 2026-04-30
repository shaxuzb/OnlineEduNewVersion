import { useTheme } from "@/src/context/ThemeContext";
import { useChat, useReadMessage, useSendMessage } from "@/src/hooks/useChat";
import { useCurrentUserId } from "@/src/hooks/useQuiz";
import { ChatMessage, Theme } from "@/src/types";
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
  InteractionManager,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MessageInput from "./components/MessageInput";
import MessageItem from "./components/MessageItem";
import { COLORS } from "@/src/utils";
import { lightColors } from "@/src/constants/theme";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { moderateScale } from "react-native-size-matters";

interface ChatSection {
  date: string;
  data: ChatMessage[];
}

export default function ChatScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const userId = useCurrentUserId();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [message, setMessage] = useState("");
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const sectionListRef = useRef<SectionList<ChatMessage, ChatSection>>(null);
  const isAtBottomRef = useRef(true);
  const markedUpToIdRef = useRef(0);
  const pendingReadUpToIdRef = useRef<number | null>(null);
  const isReadFlushInProgressRef = useRef(false);
  const previousMessageCountRef = useRef(0);
  const canTrackReadRef = useRef(false);
  const initialPositionHandledRef = useRef(false);
  const showScrollToBottomRef = useRef(false);

  const handleChangeInput = useCallback((e: any) => {
    setMessage(e);
  }, []);

  const mutation = useSendMessage();
  const readMutation = useReadMessage(Number(userId), 0);
  const { data = [], isLoading, refetch } = useChat(Number(userId));
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Bugun";
    if (date.toDateString() === yesterday.toDateString()) return "Kecha";
    return date.toLocaleDateString("uz-UZ", { day: "numeric", month: "long" });
  };

  const messageSections: ChatSection[] = useMemo(() => {
    const normalizedMessages = (data || [])
      .map((item) => ({
        ...item,
        createdAt:
          item.createdAt instanceof Date
            ? item.createdAt
            : new Date(item.createdAt as unknown as string),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const sections: ChatSection[] = [];
    normalizedMessages.forEach((msg) => {
      const dateKey = formatDate(msg.createdAt);
      const lastSection = sections[sections.length - 1];
      if (!lastSection || lastSection.date !== dateKey) {
        sections.push({ date: dateKey, data: [msg] });
        return;
      }
      lastSection.data.push(msg);
    });

    return sections;
  }, [data]);

  const unreadMarker = useMemo(() => {
    for (
      let sectionIndex = 0;
      sectionIndex < messageSections.length;
      sectionIndex += 1
    ) {
      const section = messageSections[sectionIndex];
      for (
        let itemIndex = section.data.length - 1;
        itemIndex >= 0;
        itemIndex -= 1
      ) {
        const item = section.data[itemIndex];
        if (item.senderType === 1 && !item.isRead) {
          return { messageId: item.id, sectionIndex, itemIndex };
        }
      }
    }
    return null;
  }, [messageSections]);
  const unreadMarkerMessageId = unreadMarker?.messageId;

  const totalMessages = useMemo(
    () =>
      messageSections.reduce((sum, section) => sum + section.data.length, 0),
    [messageSections],
  );

  const scrollToLatest = useCallback(
    (animated = true) => {
      if (!messageSections.length || !messageSections[0]?.data.length) return;
      sectionListRef.current?.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
        animated,
        viewOffset: 0,
      });
    },
    [messageSections],
  );

  const flushPendingRead = useCallback(() => {
    if (!userId || isReadFlushInProgressRef.current) return;

    const pendingUpToId = pendingReadUpToIdRef.current;
    if (pendingUpToId == null || pendingUpToId <= markedUpToIdRef.current) {
      return;
    }

    pendingReadUpToIdRef.current = null;
    isReadFlushInProgressRef.current = true;

    readMutation.mutate(
      { upToMessageId: pendingUpToId },
      {
        onSuccess: () => {
          markedUpToIdRef.current = Math.max(
            markedUpToIdRef.current,
            pendingUpToId,
          );
        },
        onSettled: () => {
          isReadFlushInProgressRef.current = false;
          if (
            pendingReadUpToIdRef.current != null &&
            pendingReadUpToIdRef.current > markedUpToIdRef.current
          ) {
            flushPendingRead();
          }
        },
      },
    );
  }, [readMutation, userId]);

  const scheduleMarkAsRead = useCallback(
    (messageId: number) => {
      if (messageId <= markedUpToIdRef.current) return;
      pendingReadUpToIdRef.current = Math.max(
        pendingReadUpToIdRef.current ?? 0,
        messageId,
      );
      flushPendingRead();
    },
    [flushPendingRead],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item?: ChatMessage }> }) => {
      if (!canTrackReadRef.current) return;
      viewableItems.forEach(({ item }) => {
        if (!item) return;
        if (!item.isRead && item.senderType === 1) {
          scheduleMarkAsRead(item.id);
        }
      });
    },
    [scheduleMarkAsRead],
  );

  const sendMessage = useCallback(() => {
    if (!message.trim()) return;

    mutation.mutate(
      { userId: Number(userId), text: message.trim(), attachmentUrl: "" },
      {
        onSuccess: () => {
          setMessage("");
          if (isAtBottomRef.current) {
            requestAnimationFrame(() => scrollToLatest(false));
          }
        },
      },
    );
  }, [message, mutation, scrollToLatest, userId]);

  const scrollToBottom = useCallback(() => {
    scrollToLatest(true);
    showScrollToBottomRef.current = false;
    setShowScrollToBottom(false);
  }, [scrollToLatest]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    const isScrolledUp = contentOffset.y > 50;
    isAtBottomRef.current = !isScrolledUp;
    if (showScrollToBottomRef.current !== isScrolledUp) {
      showScrollToBottomRef.current = isScrolledUp;
      setShowScrollToBottom(isScrolledUp);
    }
  }, []);

  const keyExtractor = useCallback((item: ChatMessage) => String(item.id), []);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <>
        {unreadMarkerMessageId === item.id && (
          <View style={styles.unreadMarkerContainer}>
            <View style={styles.unreadMarkerLine} />
            <View style={styles.unreadMarkerChip}>
              <Animated.Text style={styles.unreadMarkerText}>
                {"O'qilmagan xabarlar"}
              </Animated.Text>
            </View>
            <View style={styles.unreadMarkerLine} />
          </View>
        )}
        <MessageItem msg={item} styles={styles} theme={theme} />
      </>
    ),
    [styles, theme, unreadMarkerMessageId],
  );

  const renderSectionFooter = useCallback(
    ({ section }: { section: ChatSection }) => (
      <View style={styles.dateHeader}>
        <View style={styles.dateHeaderChip}>
          <Animated.Text style={styles.dateText}>{section.date}</Animated.Text>
        </View>
      </View>
    ),
    [styles],
  );

  useEffect(() => {
    canTrackReadRef.current = false;
    const task = InteractionManager.runAfterInteractions(() => {
      canTrackReadRef.current = true;
    });

    return () => {
      canTrackReadRef.current = false;
      task.cancel();
    };
  }, []);

  useEffect(() => {
    if (!totalMessages) {
      previousMessageCountRef.current = 0;
      initialPositionHandledRef.current = false;
      return;
    }

    if (!initialPositionHandledRef.current) {
      initialPositionHandledRef.current = true;

      if (unreadMarker) {
        isAtBottomRef.current = false;
        showScrollToBottomRef.current = true;
        setShowScrollToBottom(true);
        requestAnimationFrame(() => {
          sectionListRef.current?.scrollToLocation({
            sectionIndex: unreadMarker.sectionIndex,
            itemIndex: unreadMarker.itemIndex,
            animated: false,
            viewPosition: 0.2,
          });
        });
      } else {
        isAtBottomRef.current = true;
        showScrollToBottomRef.current = false;
        requestAnimationFrame(() => scrollToLatest(false));
      }

      previousMessageCountRef.current = totalMessages;
      return;
    }

    const prevCount = previousMessageCountRef.current;
    if (totalMessages > prevCount && isAtBottomRef.current) {
      requestAnimationFrame(() => scrollToLatest(false));
    }
    previousMessageCountRef.current = totalMessages;
  }, [totalMessages, unreadMarker, scrollToLatest]);

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
  }, [navigation, refetch]);

  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? -20 : -40}
    >
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        <SectionList
          ref={sectionListRef}
          sections={messageSections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionFooter={renderSectionFooter}
          style={styles.messagesList}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          inverted
          stickySectionHeadersEnabled={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={4}
          updateCellsBatchingPeriod={40}
          removeClippedSubviews={Platform.OS === "android"}
          onScrollToIndexFailed={() => {
            requestAnimationFrame(() => {
              if (unreadMarker && !isAtBottomRef.current) {
                sectionListRef.current?.scrollToLocation({
                  sectionIndex: unreadMarker.sectionIndex,
                  itemIndex: unreadMarker.itemIndex,
                  animated: false,
                  viewPosition: 0.2,
                });
                return;
              }
              scrollToLatest(false);
            });
          }}
        />

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
    dateHeaderChip: {
      backgroundColor: theme.colors.divider,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    dateText: {
      fontSize: moderateScale(10),
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    unreadMarkerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: moderateScale(10),
      paddingHorizontal: moderateScale(6),
    },
    unreadMarkerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.divider,
      opacity: 0.65,
    },
    unreadMarkerChip: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      borderRadius: moderateScale(14),
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(4),
      marginHorizontal: moderateScale(8),
    },
    unreadMarkerText: {
      fontSize: moderateScale(10),
      fontWeight: "600",
      color: theme.colors.warning,
    },
    messageContainer: {
      marginVertical: 4,
      maxWidth: "80%",
      borderRadius: moderateScale(14),
    },
    messageContent: {
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
    sentTimeText: { color: theme.colors.textSecondary },
    receivedTimeText: { color: theme.colors.textMuted },
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
      marginBottom: Platform.OS === "ios" ? 0 : 8,
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
