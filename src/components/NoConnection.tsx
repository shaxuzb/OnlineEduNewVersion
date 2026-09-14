import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useRef } from "react";
import LottieView from "lottie-react-native";
import { COLORS } from "../utils";
import { useTheme } from "../context/ThemeContext";

const windowWidth = Dimensions.get("window").width;

export default function NoConnection({
  onRetry,
}: {
  onRetry: () => void | Promise<void>;
}) {
  const theme = useTheme();
  const animation = useRef<LottieView>(null);

  return (
    <View
      style={[
        style.container,
        { backgroundColor: theme.theme.colors.background },
      ]}
    >
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: windowWidth - 50,
          height: windowWidth - 50,
        }}
        source={require("../../assets/lotties/noconnection.json")}
      />
      <Text
        style={{
          fontSize: 23,
          color: theme.theme.colors.text,
          fontWeight: "600",
        }}
      >
        Internet aloqasi yo'q
      </Text>
      <Text
        style={{
          textAlign: "center",
          marginTop: 10,
          color: theme.theme.colors.text,
        }}
      >
        Internet aloqangizni tekshiring va keyinroq qayta urinib ko'ring.
      </Text>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => void onRetry()}
        style={style.button}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "white",
          }}
        >
          Takrorlash
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: "100%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35,
  },
});
