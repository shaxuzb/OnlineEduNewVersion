import DeviceInfo from "react-native-device-info";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "../../context/ThemeContext";
import { useSession } from "../../hooks/useSession";
import { useAuth } from "../../context/AuthContext";
import { useGeo } from "../../hooks/useGeo";
import { modalService } from "../../components/modals/modalService";
import { moderateScale } from "react-native-size-matters";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import EmptyScreen from "../../screens/empty";
import LinearGradient from "react-native-linear-gradient";
import SaveScreen from "../../screens/save/SaveScreen";
import { CoursesStackNavigator } from "../CoursesStackNavigator";
import StatistikaScreen from "../../screens/statistics/StatistikaScreen";
 
const Tab = createBottomTabNavigator();
const isTablet = DeviceInfo.isTablet();
 const MainTabNavigator = () => {
  const { theme } = useTheme();
  const { isSuperAdmin } = useSession();
  const { plan } = useAuth();
  const { countryCode } = useGeo();
  const handleShowPremiumModal = () => {
    modalService.open();
  };
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "Courses") {
            iconName = "grid";
          } else if (route.name === "Statistika") {
            iconName = "pie-chart";
          } else if (route.name === "Save") {
            iconName = "bookmark";
          } else if (route.name === "ChatTab") {
            iconName = "chatbubble-ellipses-sharp";
          }

          return <Ionicons name={iconName} size={size + 5} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderWidth: moderateScale(2),
          borderTopWidth: moderateScale(2),
          borderColor: theme.colors.border,
          borderTopLeftRadius: moderateScale(20),
          borderTopEndRadius: moderateScale(20),
          paddingTop: 0,
          borderBottomWidth: moderateScale(0),
        },
        tabBarButton: (props) => {
          const filteredProps = Object.fromEntries(
            Object.entries(props).filter(([, value]) => value !== null),
          );
          return <TouchableOpacity activeOpacity={1} {...filteredProps} />;
        },
        tabBarVariant: "uikit",
        headerShown: false,
        lazy: true,
      })}
    >
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
          tabPress: (e) => {
            if (
              !(
                plan &&
                plan.plan.subscriptionFeatures.find(
                  (item) => item.code === "STATISTICS",
                )
              )
            ) {
              e.preventDefault(); // ❌ screen ochilmasin
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

              {!(
                plan &&
                plan.plan.subscriptionFeatures.find(
                  (item) => item.code === "STATISTICS",
                )
              ) && (
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
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
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
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Chat");
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;