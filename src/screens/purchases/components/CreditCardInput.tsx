// components/CreditCardInput.tsx
import { useTheme } from "@/src/context/ThemeContext";
import { Theme } from "@/src/types";
import { useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
  Platform,
} from "react-native";

interface Props {
  autoFocus?: boolean;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  placeholderColor?: string;
  labels?: {
    number: string;
    expire: string;
  };
  placeholders?: {
    number: string;
    expire: string;
  };
  values: any;
  errors?: {
    number?: string;
    expire?: string;
  };
  touched?: {
    number?: boolean;
    expire?: boolean;
  };
  handleChange: any;
  handleBlur?: (field: string) => void;
}

const CreditCardInput = ({
  autoFocus,
  labelStyle,
  inputStyle,
  placeholderColor = "#94A3B8",
  labels = {
    number: "Karta raqami",
    expire: "Muddati (MM/YY)",
  },
  placeholders = {
    number: "0000 0000 0000 0000",
    expire: "MM/YY",
  },
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
}: Props) => {
  const numberInput = useRef<TextInput>(null);
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  useEffect(() => {
    if (autoFocus) numberInput.current?.focus();
  }, [autoFocus]);

  const formatCardNumber = (text: string) => {
    return text
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
  };

  const formatExpire = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <View style={styles.container}>
      {/* Card Number */}
      <View style={styles.inputBlock}>
        <Text style={[styles.inputLabel, labelStyle]}>{labels.number}</Text>
        <View style={[
          styles.inputWrapper,
          touched?.number && errors?.number && styles.inputWrapperError
        ]}>
          <TextInput
            ref={numberInput}
            keyboardType="numeric"
            style={[styles.input, inputStyle]}
            placeholderTextColor={placeholderColor}
            placeholder={placeholders.number}
            value={values.number}
            onChangeText={(text) => handleChange("number")(formatCardNumber(text))}
            onBlur={() => handleBlur?.("number")}
            autoCorrect={false}
            underlineColorAndroid="transparent"
            maxLength={19}
          />
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>💳</Text>
          </View>
        </View>
        {touched?.number && errors?.number && (
          <Text style={styles.errorText}>{errors.number}</Text>
        )}
      </View>

      {/* Expiry & CVC */}
      <View style={styles.extraContainer}>
        <View style={styles.halfInput}>
          <Text style={[styles.inputLabel, labelStyle]}>{labels.expire}</Text>
          <View style={[
            styles.inputWrapper,
            touched?.expire && errors?.expire && styles.inputWrapperError
          ]}>
            <TextInput
              keyboardType="numeric"
              style={[styles.input, inputStyle]}
              placeholderTextColor={placeholderColor}
              placeholder={placeholders.expire}
              value={values.expire}
              onChangeText={(text) => handleChange("expire")(formatExpire(text))}
              onBlur={() => handleBlur?.("expire")}
              autoCorrect={false}
              underlineColorAndroid="transparent"
              maxLength={5}
            />
            <View style={styles.calendarIcon}>
              <Text style={styles.cardIconText}>📅</Text>
            </View>
          </View>
          {touched?.expire && errors?.expire && (
            <Text style={styles.errorText}>{errors.expire}</Text>
          )}
        </View>

        {/* CVC Input (Optional) */}
        <View style={styles.halfInput}>
          {/* <Text style={[styles.inputLabel, labelStyle]}>CVC</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              keyboardType="numeric"
              style={[styles.input, inputStyle]}
              placeholderTextColor={placeholderColor}
              placeholder="123"
              secureTextEntry
              maxLength={3}
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <View style={styles.lockIcon}>
              <Text style={styles.cardIconText}>🔒</Text>
            </View>
          </View> */}
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      gap: 24,
    },
    inputBlock: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: isDark ? "#E2E8F0" : "#374151",
      marginBottom: 4,
    },
    inputWrapper: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#F9FAFB",
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: isDark ? "#475569" : "#E5E7EB",
      paddingHorizontal: 16,
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    inputWrapperError: {
      borderColor: "#EF4444",
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)",
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#111827",
      fontWeight: "500",
      paddingVertical: Platform.OS === "ios" ? 12 : 10,
      letterSpacing: 0.5,
    },
    errorText: {
      color: "#EF4444",
      fontSize: 13,
      marginTop: 6,
      marginLeft: 4,
    },
    extraContainer: {
      flexDirection: "row",
      gap: 16,
    },
    halfInput: {
      flex: 1,
      gap: 8,
    },
    cardIcon: {
      marginLeft: 8,
    },
    calendarIcon: {
      marginLeft: 8,
    },
    lockIcon: {
      marginLeft: 8,
    },
    cardIconText: {
      fontSize: 20,
    },
  });

export default CreditCardInput;