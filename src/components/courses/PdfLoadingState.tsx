import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type PdfLoadingStateProps = {
  color: string;
  backgroundColor: string;
};

const PdfLoadingState = React.memo(
  ({ color, backgroundColor }: PdfLoadingStateProps) => (
    <View style={[styles.container, { backgroundColor }]} pointerEvents="none">
      <ActivityIndicator size="large" color={color} />
      <Text style={[styles.text, { color }]}>PDF yuklanmoqda...</Text>
    </View>
  ),
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PdfLoadingState;
