import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, memo } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { alertService, AlertConfig, AlertType } from "./alertService";

type AlertPreset = {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  iconBg: string;
  okBg: string;
  defaultTitle: string;
};

const ALERT_PRESETS: Record<AlertType, AlertPreset> = {
  default: {
    iconName: "information-circle",
    iconColor: "#2563EB",
    iconBg: "#DBEAFE",
    okBg: "#2563EB",
    defaultTitle: "Ma'lumot",
  },
  error: {
    iconName: "close-circle",
    iconColor: "#DC2626",
    iconBg: "#FEE2E2",
    okBg: "#DC2626",
    defaultTitle: "Xatolik",
  },
  warning: {
    iconName: "warning",
    iconColor: "#D97706",
    iconBg: "#FEF3C7",
    okBg: "#D97706",
    defaultTitle: "Ogohlantirish",
  },
  success: {
    iconName: "checkmark-circle",
    iconColor: "#16A34A",
    iconBg: "#DCFCE7",
    okBg: "#16A34A",
    defaultTitle: "Muvaffaqiyatli",
  },
};

const AlertHost = () => {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  useEffect(() => {
    alertService.subscribe(setConfig);
    return () => alertService.unsubscribe();
  }, []);

  if (!config) return null;

  const type = config.type ?? "default";
  const preset = ALERT_PRESETS[type];
  const title = config.title ?? preset.defaultTitle;
  const showCancel = config.showCancel ?? true;
  const hasSecondaryAction = Boolean(config.secondaryText && config.onSecondary);

  return (
    <Modal
      transparent
      animationType="fade"
      onRequestClose={() => alertService.close()}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconWrap, { backgroundColor: preset.iconBg }]}>
            <Ionicons
              name={
                (config.iconName as React.ComponentProps<typeof Ionicons>["name"]) ??
                preset.iconName
              }
              size={32}
              color={preset.iconColor}
            />
          </View>

          <Text style={styles.title}>{title}</Text>

          {config.description && <Text style={styles.desc}>{config.description}</Text>}

          {hasSecondaryAction && (
            <TouchableOpacity
              style={[styles.secondaryAction, { borderColor: preset.okBg }]}
              onPress={() => {
                config.onSecondary?.();
                alertService.close();
              }}
            >
              <Text style={[styles.secondaryText, { color: preset.okBg }]}>
                {config.secondaryText}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.actions}>
            {showCancel && (
              <TouchableOpacity
                style={styles.cancel}
                onPress={() => {
                  config.onCancel?.();
                  alertService.close();
                }}
              >
                <Text style={styles.cancelText}>{config.cancelText ?? "Bekor qilish"}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.ok, { backgroundColor: preset.okBg }]}
              onPress={() => {
                config.onOk?.();
                alertService.close();
              }}
            >
              <Text style={styles.okText}>{config.okText ?? "OK"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default memo(AlertHost);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  container: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  desc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
    textAlign: "center",
  },
  secondaryAction: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  secondaryText: {
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
  },
  cancel: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cancelText: {
    color: "#222",
    fontWeight: "600",
  },
  ok: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  okText: {
    color: "#fff",
    fontWeight: "700",
  },
});
