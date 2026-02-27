import { Platform } from "react-native";

let VideoPlayerScreen: any;

if (Platform.OS === "ios") {
  VideoPlayerScreen = require("./VideoPlayerScreen.ios").default;
} else {
  VideoPlayerScreen = require("./VideoPlayerScreen.android").default;
}

export default VideoPlayerScreen;
