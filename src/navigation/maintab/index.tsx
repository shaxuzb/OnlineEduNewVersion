import { Platform } from "react-native";

let MainTabNavigator: any;

if (Platform.OS === "ios") {
  MainTabNavigator = require("./MainTabNavigator.ios").default;
} else {
  MainTabNavigator = require("./MainTabNavigator.android").default;
}

export default MainTabNavigator;
