import React, { useCallback, useMemo } from "react";
import DeviceInfo from "react-native-device-info";
import {
  BottomTabBarButtonProps,
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../../context/ThemeContext";
import { useSession } from "../../hooks/useSession";
import { useAuth } from "../../context/AuthContext";
import { useGeo } from "../../hooks/useGeo";
import { useChatUnread } from "../../hooks/useChat";
import { useAppIconBadge } from "../../hooks/useAppIconBadge";
import { usePaymentNotificationCount } from "../../hooks/usePaymentNotificationCount";
import { modalService } from "../../components/modals/modalService";
import { moderateScale } from "react-native-size-matters";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import EmptyScreen from "../../screens/empty";
import LinearGradient from "react-native-linear-gradient";
import SaveScreen from "../../screens/save/SaveScreen";
import { CoursesStackNavigator } from "../CoursesStackNavigator";
import StatistikaScreen from "../../screens/statistics/StatistikaScreen";
import { MainTabParamList } from "../mainTabTypes";
import { RootStackParamList } from "../rootTypes";

const Tab = createBottomTabNavigator<MainTabParamList>();
const isTablet = DeviceInfo.isTablet();

type TabRoute = RouteProp<MainTabParamList, keyof MainTabParamList>;
type TabPressEvent = { preventDefault: () => void };
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_ICONS: Record<keyof MainTabParamList, IoniconName> = {
  Courses: "grid",
  Statistika: "pie-chart",
  Payment: "add-circle",
  Save: "bookmark",
  ChatTab: "chatbubble-ellipses-sharp",
};

const MainTabNavigator = React.memo(() => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { isSuperAdmin } = useSession();
  const { plan } = useAuth();
  const { countryCode } = useGeo();
  const { data: unreadState } = useChatUnread();
  const unreadChatCount = unreadState?.totalUnreadMessages ?? 0;
  const { data: paymentNotificationCount = 0 } =
    usePaymentNotificationCount();

  useAppIconBadge(unreadChatCount + paymentNotificationCount);

  const handleShowPremiumModal = useCallback(() => {
    modalService.open();
  }, []);

  const hasStatisticsAccess = Boolean(
    plan &&
      plan.plan.subscriptionFeatures.find((item) => item.code === "STATISTICS"),
  );

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.tabBarBackground,
      borderWidth: moderateScale(2),
      borderTopWidth: moderateScale(2),
      borderColor: theme.colors.border,
      borderTopLeftRadius: moderateScale(20),
      borderTopEndRadius: moderateScale(20),
      paddingTop: 0,
      paddingBottom: 60,
      borderBottomWidth: moderateScale(0),
    }),
    [theme.colors.tabBarBackground, theme.colors.border],
  );

  const tabBarButton = useCallback((props: BottomTabBarButtonProps) => {
    const filteredProps = Object.fromEntries(
      Object.entries(props).filter(([, value]) => value !== null),
    ) as BottomTabBarButtonProps;
    return <TouchableOpacity activeOpacity={1} {...filteredProps} />;
  }, []);

  const handleChatTabPress = useCallback(
    (event: TabPressEvent) => {
      event.preventDefault();
      navigation.navigate("Chat");
    },
    [navigation],
  );

  const screenOptions = useCallback(
    ({ route }: { route: TabRoute }): BottomTabNavigationOptions => ({
      tabBarIcon: ({ color, size }) => (
        <Ionicons
          name={TAB_ICONS[route.name]}
          size={size + 5}
          color={color}
        />
      ),
      tabBarActiveTintColor: theme.colors.tabBarActive,
      tabBarInactiveTintColor: theme.colors.tabBarInactive,
      tabBarStyle,
      tabBarButton,
      tabBarVariant: "uikit" as const,
      headerShown: false,
      lazy: true,
      freezeOnBlur: true,
    }),
    [
      tabBarButton,
      tabBarStyle,
      theme.colors.tabBarActive,
      theme.colors.tabBarInactive,
    ],
  );

  return (
    <Tab.Navigator detachInactiveScreens screenOptions={screenOptions}>
      <Tab.Screen
        name="Courses"
        component={CoursesStackNavigator}
        options={{
          tabBarLabel: "Kurslar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size + 5} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: +moderateScale(10).toFixed(0),
          },
        }}
      />
      <Tab.Screen
        name="Statistika"
        component={StatistikaScreen}
        listeners={{
          tabPress: (event) => {
            if (!hasStatisticsAccess) {
              event.preventDefault();
              handleShowPremiumModal();
            }
          },
        }}
        options={{
          tabBarLabel: "Statistika",
          tabBarLabelStyle: {
            fontSize: +moderateScale(10).toFixed(0),
          },
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: "relative" }}>
              <Ionicons name="stats-chart" size={size} color={color} />

              {!isSuperAdmin && !hasStatisticsAccess && (
                <View style={{ position: "absolute", top: -6, right: -6 }}>
                  <FontAwesome6 name="crown" size={14} color="gold" />
                </View>
              )}
            </View>
          ),
        }}
      />
      {!isSuperAdmin && countryCode === "UZ" && (
        <Tab.Screen
          name="Payment"
          component={EmptyScreen}
          listeners={() => ({
            tabPress: (event) => {
              event.preventDefault();
              navigation.navigate("PurchaseGroup", {
                screen: "PurchaseScreen",
              });
            },
          })}
          options={{
            tabBarLabel: "Sotib olish",
            tabBarLabelStyle: {
              fontSize: +moderateScale(10).toFixed(0),
            },

            tabBarIcon: () => (
              <LinearGradient
                colors={["#3a5dde", "#5e84e6"]}
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 150,
                  justifyContent: "center",
                  alignItems: "center",
                  bottom: 18,
                }}
              >
                <FontAwesome6 name="plus" size={34} color="white" />
              </LinearGradient>
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Save"
        component={SaveScreen}
        options={{
          tabBarLabel: "Saqlanganlar",
          headerTitle: "Saqlanganlar",
          headerShown: true,
          headerTitleAlign: "center",
          headerTintColor: "white",
          tabBarLabelStyle: {
            fontSize: +moderateScale(10).toFixed(0),
          },
          headerStyle: {
            backgroundColor: isTablet ? "#3a5dde" : undefined,
          },
          headerBackground() {
            return (
              <LinearGradient
                colors={["#3a5dde", "#5e84e6"]}
                start={{ x: 0.5, y: 1.0 }}
                end={{ x: 0.5, y: 0.0 }}
                style={{ flex: 1 }}
              />
            );
          },
          headerTitleStyle: {
            fontSize: +moderateScale(18).toFixed(0),
          },
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={EmptyScreen}
        options={{
          tabBarLabel: "Chat",
          freezeOnBlur: true,
          tabBarLabelStyle: {
            fontSize: +moderateScale(10).toFixed(0),
          },
          tabBarBadge: unreadChatCount > 0 ? unreadChatCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#e74c3c",
            color: "white",
            fontWeight: "700",
          },
        }}
        listeners={{
          tabPress: handleChatTabPress,
        }}
      />
    </Tab.Navigator>
  );
});

export default MainTabNavigator;
