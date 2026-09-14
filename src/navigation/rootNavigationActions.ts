import { CommonActions } from "@react-navigation/native";

export const buildMainTabsResetAction = () =>
  CommonActions.reset({
    index: 0,
    routes: [{ name: "MainTabs" }],
  });
