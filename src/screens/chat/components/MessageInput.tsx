import { TextInput, TouchableOpacity, View } from "react-native";
import React, { FC, memo } from "react";
import { Ionicons } from "@expo/vector-icons";
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
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInputFull}
        placeholder="Xabar yozing..."
        placeholderTextColor={theme.colors.placeholder}
        value={message}
        onChangeText={handleChangeInput}
        multiline
        maxLength={1000}
      />
      {message.trim().length > 0 && (
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(MessageInput);
