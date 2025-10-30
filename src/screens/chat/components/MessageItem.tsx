import { View, Text } from "react-native";
import React, { FC, memo } from "react";
import { ChatMessage, Theme } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
interface MessageItemProps {
  msg: ChatMessage;
  styles: any;
  theme: Theme;
}
const MessageItem: FC<MessageItemProps> = ({ msg, styles, theme }) => {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  return (
    <View
      key={msg.id}
      style={[
        styles.messageContainer,
        msg.senderType === 0 ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
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
  );
};
export default memo(MessageItem);
