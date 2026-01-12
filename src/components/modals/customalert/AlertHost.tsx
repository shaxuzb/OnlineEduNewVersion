import React, { useEffect, useState, memo } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { alertService, AlertConfig } from "./alertService";

const AlertHost = () => {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  useEffect(() => {
    alertService.subscribe(setConfig);
    return () => alertService.unsubscribe();
  }, []);

  if (!config) return null;

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{config.title}</Text>

          {config.description && (
            <Text style={styles.desc}>{config.description}</Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancel}
              onPress={() => {
                config.onCancel?.();
                alertService.close();
              }}
            >
              <Text>Bekor qilish</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ok}
              onPress={() => {
                config.onOk?.();
                alertService.close();
              }}
            >
              <Text style={{ color: "#fff" }}>
                {config.okText ?? "OK"}
              </Text>
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
  },

  container: {
    width: "86%",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,

    // Android shadow
    elevation: 6,

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
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

  actions: {
    flexDirection: "row",
    marginTop: 22,
  },

  cancel: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  ok: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#ff3b30", // destructive color
    justifyContent: "center",
    alignItems: "center",
  },
});
