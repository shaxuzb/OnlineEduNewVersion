import React, { FC, memo, useMemo } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LinearGradient from "react-native-linear-gradient";
import { ChatMessage, Theme } from "@/src/types";

interface MessageItemProps {
  msg: ChatMessage;
  styles: any;
  theme: Theme;
}

const SENT_GRADIENT: string[] = ["#3a5dde", "#5e84e6"];

const MessageItem: FC<MessageItemProps> = ({ msg, styles, theme }) => {
  const timeStr = useMemo(
    () =>
      msg.createdAt.toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [msg.createdAt],
  );

  const gradientColors = useMemo<string[]>(
    () =>
      msg.senderType === 0
        ? [theme.colors.inputBackground, theme.colors.inputBackground]
        : SENT_GRADIENT,
    [msg.senderType, theme.colors.inputBackground],
  );

  const isSent = msg.senderType === 0;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0.5, y: 1.0 }}
      end={{ x: 0.5, y: 0.0 }}
      style={[
        styles.messageContainer,
        isSent ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <View style={styles.messageContent}>
        <Text
          style={[
            styles.messageText,
            isSent ? styles.sentMessageText : styles.receivedMessageText,
          ]}
        >
          {msg.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timeText,
              isSent ? styles.sentTimeText : styles.receivedTimeText,
            ]}
          >
            {timeStr}
          </Text>
          {isSent && (
            <Ionicons
              name="checkmark-done"
              size={14}
              color={msg.isRead ? theme.colors.success : theme.colors.textMuted}
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const areEqual = (prev: MessageItemProps, next: MessageItemProps) =>
  prev.msg.id === next.msg.id &&
  prev.msg.text === next.msg.text &&
  prev.msg.isRead === next.msg.isRead &&
  prev.msg.senderType === next.msg.senderType &&
  prev.msg.createdAt?.getTime?.() === next.msg.createdAt?.getTime?.() &&
  prev.theme === next.theme &&
  prev.styles === next.styles;

export default memo(MessageItem, areEqual);
