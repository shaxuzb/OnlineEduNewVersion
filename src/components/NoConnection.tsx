import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { SetStateAction, useRef } from "react";
import LottieView from "lottie-react-native";
import NetInfo from "@react-native-community/netinfo";
import { COLORS } from "../utils";
const windowWidth = Dimensions.get("window").width;
export default function NoConnection({
  setIsConnected,
}: {
  setIsConnected: React.Dispatch<SetStateAction<boolean>>;
}) {
  const animation = useRef<LottieView>(null);

  return (
    <View style={style.container}>
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: windowWidth - 50,
          height: windowWidth - 50,
        }}
        // Find more Lottie files at https://lottiefiles.com/featured
        source={require("../../assets/lotties/noconnection.json")}
      />
      <Text
        style={{
          fontSize: 23,
          color: "black",
          fontWeight: "600",
        }}
      >
        Internet aloqasi yo'q
      </Text>
      <Text style={{ textAlign: "center", marginTop: 10 }}>
        Internet aloqangizni tekshiring va keyinroq qayta urinib ko'ring.
      </Text>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          NetInfo.fetch().then((state) => {
            setIsConnected(!!state.isConnected); // bu state yuqoridan prop sifatida yuborilishi kerak
          });
        }}
        style={style.button}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "white",
          }}
        >
          Takrorlash{" "}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
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
