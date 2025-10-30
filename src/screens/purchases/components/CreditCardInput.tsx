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
  placeholderColor = "#999",
  labels = {
    number: "Karta raqam",
    expire: "Oy/yil",
  },
  placeholders = {
    number: "_ _ _ _  _ _ _ _  _ _ _ _  _ _ _ _",
    expire: "_ _ / _ _",
  },
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
}: Props) => {
  const numberInput = useRef<TextInput>(null);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  useEffect(() => {
    if (autoFocus) numberInput.current?.focus();
  }, [autoFocus]);

  // 🔹 Credit Card format (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (text: string) => {
    return text
      .replace(/\D/g, "") // remove non-digits
      .replace(/(.{4})/g, "$1 ") // add space every 4 digits
      .trim();
  };

  // 🔹 Expiry format (MM/YY)
  const formatExpire = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <View style={[styles.container, styles]}>
      {/* Card Number */}
      <View style={styles.inputBlock}>
        <Text style={[styles.inputLabel, labelStyle]}>{labels.number}</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={numberInput}
            keyboardType="numeric"
            style={[styles.input, inputStyle]}
            placeholderTextColor={placeholderColor}
            placeholder={placeholders.number}
            value={values.number}
            onChangeText={(text) =>
              handleChange("number")(formatCardNumber(text))
            }
            onBlur={() => handleBlur?.("number")}
            autoCorrect={false}
            underlineColorAndroid="transparent"
            maxLength={19} // 16 digits + 3 spaces
          />
        </View>
        {touched?.number && errors?.number && (
          <Text style={styles.errorText}>{errors.number}</Text>
        )}
      </View>

      {/* Expiry & CVC */}
      <View style={styles.extraContainer}>
        <View style={[styles.inputBlock, styles.halfInput]}>
          <Text style={[styles.inputLabel, labelStyle]}>{labels.expire}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              keyboardType="numeric"
              style={[styles.input, inputStyle]}
              placeholderTextColor={placeholderColor}
              placeholder={placeholders.expire}
              value={values.expire}
              onChangeText={(text) =>
                handleChange("expire")(formatExpire(text))
              }
              onBlur={() => handleBlur?.("expire")}
              autoCorrect={false}
              underlineColorAndroid="transparent"
              maxLength={5} // MM/YY
            />
          </View>
          {touched?.expire && errors?.expire && (
            <Text style={styles.errorText}>{errors.expire}</Text>
          )}
        </View>

        <View style={[styles.inputBlock, styles.halfInput]}></View>
      </View>
    </View>
  );
};

export default CreditCardInput;
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {},
    inputBlock: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 18,
      color: theme.colors.text,
      marginBottom: 8,
    },
    inputWrapper: {
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 14,
      height: 50,
      justifyContent: "center",
    },
    input: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "500",
      paddingVertical: Platform.OS === "ios" ? 8 : 6,
    },
    errorText: {
      color: "#ff4d4f",
      fontSize: 12,
      marginTop: 4,
    },
    extraContainer: {
      flexDirection: "row",
      gap: 12,
    },
    halfInput: {
      flex: 1,
    },
  });
