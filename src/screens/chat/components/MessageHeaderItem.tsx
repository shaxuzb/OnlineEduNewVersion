import { View, Text, FlatList } from "react-native";
import React, { FC, useCallback, useRef } from "react";
import { MessageGroup, Theme } from "@/src/types";
import MessageItem from "./MessageItem";
import { useReadMessage } from "@/src/hooks/useChat";

interface MessageHeaderItemProps {
  item: MessageGroup;
  styles: any;
  theme: Theme;
  userId: any;
}

const MessageHeaderItem: FC<MessageHeaderItemProps> = ({
  item,
  styles,
  theme,
  userId,
}) => {
  const markedIdsRef = useRef<Set<number>>(new Set()); // ✅ qayta yuborilmasin
  const mutation = useReadMessage(userId, 0);
  const markAsRead = useCallback((id: number) => {
    if (markedIdsRef.current.has(id)) return; // ✅ agar oldin yuborilgan bo‘lsa, qayta yuborma
    markedIdsRef.current.add(id);
    mutation.mutate({ upToMessageId: id });
    // misol: api.markAsRead(id)
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      viewableItems.forEach((msg) => {
        if (!msg.item.isRead && msg.item.senderType === 1) {
          markAsRead(msg.item.id);
        }
      });
    }
  ).current;

  return (
    <View>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <FlatList
        data={item.messages}
        keyExtractor={(m) => m.id.toString()}
        renderItem={({ item }) => (
          <MessageItem msg={item} styles={styles} theme={theme} />
        )}
        style={styles.messagesList}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        inverted
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
};

export default MessageHeaderItem;
