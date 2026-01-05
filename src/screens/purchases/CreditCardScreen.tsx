import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { useTheme } from "@/src/context/ThemeContext";
import { usePurchase } from "@/src/context/PurchaseContext";
import { numberSpacing } from "@/src/utils";
import { $axiosPrivate } from "@/src/services/AxiosService";
import { lightColors } from "@/src/constants/theme";
import { Theme } from "@/src/types";
import CreditCardInput from "./components/CreditCardInput";

const ValidationScheme = Yup.object().shape({
  number: Yup.string().required("Telefon raqam majburiy"),
  expire: Yup.string().required("sdasdsa"),
});
export default function CreditCardScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { selectedItems, submitPurchase } = usePurchase();
  const [loading, setLoading] = useState(false);

  const { scopeTypeId, paymentType } = route.params;
  const totalPrice = useMemo(
    () =>
      numberSpacing(selectedItems.reduce((acc, item) => acc + item.price, 0)),
    [selectedItems]
  );
  const handleSendSms = async (orderId: any) => {
    try {
      const { data } = await $axiosPrivate.post(
        "transactions/subscribe/card/send-sms",
        {
          orderId: orderId,
        }
      );
      setLoading(false);
      (navigation as any).navigate("OTPCardVerification", {
        orderId: orderId,
        phoneNumber: (data as any).phone,
      });
      // router.navigate({
      //   pathname: "/(root)/(purchases)/checkout/creditcard/otpverification",
      //   params: {
      //     orderId: orderId,
      //     phoneNumber: (data as any).phone,
      //   },
      // });
      Toast.show({
        type: "success", // 'success' | 'error' | 'info'
        text1: "SMS yuborildi!",
        text2: `Tasdiqlash kodi yuborildi`,
      });
    } catch (error: any) {
      setLoading(false);
      if (error.status === 400) {
        return Toast.show({
          type: "error", // 'success' | 'error' | 'info'
          text1: "SMS yuborilgan",
          text2: "SMS allaqachon yuborilgan",
        });
      }
      Toast.show({
        type: "error", // 'success' | 'error' | 'info'
        text1: "Xatolik",
        text2: "SMS yuborishda xatolik yuz berdi",
      });
    }
  };
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data = await submitPurchase({
        values: {
          scopeTypeId: Number(scopeTypeId),
          paymentType: paymentType.toString(),
          card: {
            expire: values.expire.split("/").join(""),
            number: values.number.split(" ").join(""),
          },
        },
      });
      if (data as any) {
        handleSendSms((data as any).id);
      }
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Sotib olishda xatolik yuz berdi!",
      });
    }
  };
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Ionicons name="cart-outline" size={38} color="white" />
      ),
      freezeOnBlur: true,
      headerRight: () => (
        <Pressable
          android_ripple={{
            foreground: true,
            color: lightColors.ripple,
            borderless: true,
            radius: 22,
          }}
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => navigation.navigate("Chat")}
        >
          <Ionicons name="chatbox" size={24} color="white" />
        </Pressable>
      ),
    });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        style={{
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{totalPrice} UZS</Text>
        </View>
        <Formik
          initialValues={{
            number: "",
            expire: "",
          }}
          validationSchema={ValidationScheme}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, values, errors, touched }) => {
            console.log(values);

            return (
              <View>
                <CreditCardInput
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />

                <View
                  style={{
                    marginTop: 30,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: theme.colors.text,
                      }}
                    >
                      To'lov miqdori
                    </Text>
                    <Text
                      style={{
                        flexGrow: 1,
                        height: 14,
                        marginHorizontal: 5,
                        borderBottomColor: theme.colors.text,
                        borderBottomWidth: 1,
                        borderStyle: "dashed",
                      }}
                    ></Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: theme.colors.text,
                      }}
                    >
                      {totalPrice} UZS
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: theme.colors.text,
                      }}
                    >
                      Komissiya
                    </Text>
                    <Text
                      style={{
                        flexGrow: 1,
                        height: 14,
                        marginHorizontal: 5,
                        borderBottomColor: theme.colors.text,
                        borderBottomWidth: 1,
                        borderStyle: "dashed",
                      }}
                    ></Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: theme.colors.text,
                      }}
                    >
                      0 UZS
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: theme.colors.text,
                        fontWeight: "700",
                      }}
                    >
                      Jami to'lov
                    </Text>
                    <Text
                      style={{
                        flexGrow: 1,
                        height: 14,
                        marginHorizontal: 5,
                        borderBottomColor: theme.colors.text,
                        borderBottomWidth: 1,
                        borderStyle: "dashed",
                      }}
                    ></Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: theme.colors.text,
                      }}
                    >
                      {totalPrice} UZS
                    </Text>
                  </View>
                </View>
                <Pressable
                  android_ripple={{
                    foreground: true,
                    color: lightColors.ripple,
                  }}
                  onPress={() => handleSubmit(values)}
                  style={styles.payButton}
                  disabled={loading}
                >
                  <Text style={styles.payButtonText}>
                    {loading ? (
                      <ActivityIndicator
                        color="white"
                        style={{ width: 24, height: 24 }}
                      />
                    ) : (
                      "To‘lovni amalga oshirish"
                    )}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    headerSelectTotal: {
      fontSize: 13,
      fontWeight: "500",
      color: "white",
    },
    greetingSection: {
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 20,
    },
    greeting: {
      fontSize: 26,
      fontWeight: "500",
      color: theme.colors.text,
    },
    section: {
      paddingHorizontal: 16,
      gap: 14,
      marginBottom: 24,
    },
    formContainer: { width: "100%" },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
    },
    inputError: {
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.error + "15",
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      marginTop: 6,
      marginLeft: 4,
    },
    payButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 32,
      alignItems: "center",
    },
    payButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
    },
  });
