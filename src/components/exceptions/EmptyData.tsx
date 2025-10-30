import { View, Text } from "react-native";
import React, { memo } from "react";

function EmptyData() {
  return (
    <View>
      <Text>EmptyData</Text>
    </View>
  );
}
export default memo(EmptyData);
