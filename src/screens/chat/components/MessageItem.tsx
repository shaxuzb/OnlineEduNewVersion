import { View, Text } from "react-native";
import React, { FC, memo, useMemo } from "react";
import { ChatMessage, Theme } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import LinearGradient from "react-native-linear-gradient";
interface MessageItemProps {
  msg: ChatMessage;
  styles: any;
  theme: Theme;
}
const MessageItem: FC<MessageItemProps> = ({ msg, styles, theme }) => {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  const gradientColors = useMemo(
    () =>
      msg.senderType === 0
        ? [theme.colors.inputBackground, theme.colors.inputBackground]
        : ["#3a5dde", "#5e84e6"],
    [msg.senderType, theme.colors.inputBackground],
  );
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0.5, y: 1.0 }}
      end={{ x: 0.5, y: 0.0 }}
      style={[
        styles.messageContainer,
        msg.senderType === 0 ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <View style={styles.messageContent}>
        <Text
          style={[
            styles.messageText,
            msg.senderType === 0
              ? styles.sentMessageText
              : styles.receivedMessageText,
          ]}
        >
          {msg.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timeText,
              msg.senderType === 0
                ? styles.sentTimeText
                : styles.receivedTimeText,
            ]}
          >
            {formatTime(msg.createdAt)}
          </Text>
          {msg.senderType === 0 && (
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

const areEqual = (prev: MessageItemProps, next: MessageItemProps) => {
  const prevMsg = prev.msg;
  const nextMsg = next.msg;

  return (
    prevMsg.id === nextMsg.id &&
    prevMsg.text === nextMsg.text &&
    prevMsg.isRead === nextMsg.isRead &&
    prevMsg.senderType === nextMsg.senderType &&
    prevMsg.createdAt?.toString() === nextMsg.createdAt?.toString() &&
    prev.theme === next.theme &&
    prev.styles === next.styles
  );
};

export default memo(MessageItem, areEqual);
