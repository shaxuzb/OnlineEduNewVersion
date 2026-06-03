import React, { FC, memo, useRef } from "react";
import {
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";

interface MessageInputProps {
  message: string;
  handleChangeInput: (text: string) => void;
  sendMessage: () => void;
  styles: any;
  theme: any;
}

const MessageInput: FC<MessageInputProps> = ({
  handleChangeInput,
  message,
  sendMessage,
  styles,
  theme,
}) => {
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage();
    if (Platform.OS === "android") {
      inputRef.current?.focus();
    }
  };

  const canSend = message.trim().length > 0;

  return (
    <View style={styles.inputContainer}>
      <TextInput
        ref={inputRef}
        style={styles.textInputFull}
        placeholder="Xabar yozing..."
        placeholderTextColor={theme.colors.placeholder}
        value={message}
        onChangeText={handleChangeInput}
        multiline
        maxLength={1000}
        returnKeyType="default"
        blurOnSubmit={false}
        textAlignVertical="center"
        accessibilityLabel="Xabar maydoni"
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          !canSend && { opacity: 0, pointerEvents: "none" } as any,
        ]}
        onPress={handleSend}
        activeOpacity={0.8}
        accessibilityLabel="Yuborish"
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="send" size={moderateScale(16)} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default memo(MessageInput);
