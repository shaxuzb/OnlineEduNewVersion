// src/components/MathLiveModalKeyboard.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export interface MathLiveModalRef {
  show: () => void;
  hide: () => void;
  updateValue: (newValue: string) => void;
}

interface MathLiveModalProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
}

const MathLiveModalKeyboard = forwardRef<MathLiveModalRef, MathLiveModalProps>(
  ({ value, onChange, onClose }, ref) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [internalValue, setInternalValue] = useState(value);
    const webViewRef = useRef<WebView>(null);
    const isWebViewReady = useRef(false);

    // HTML ni bir marta yaratish (faqat komponent mount bo'lganda)
    const mathliveHTML = useMemo(() => {
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathlive/dist/mathlive-static.css" />
        <script src="https://cdn.jsdelivr.net/npm/mathlive/dist/mathlive.min.js"></script>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            background-color: #1e1e1e;
            height: 100%;
            overflow: hidden;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            padding: 12px;
          }
          
          #math-field-container {
            background: #2d2d2d;
            border-radius: 6px;
            padding: 5px;
            margin-bottom: 5px;
            border: 1px solid #404040;
          }
          
          math-field {
            width: 100%;
            background: transparent;
            color: white;
             border-radius: 6px;
            padding: 4px 5px;
            font-size: 16px;
            --selection-color: #007AFF;
            --caret-color: #007AFF;
            --highlight-color: rgba(0, 122, 255, 0.3);
            --keyboard-background: #2d2d2d;
          }
          
          math-field::part(virtual-keyboard-toggle) {
            display: none !important;
          }
          
          .ml-keyboard {
            background: #2d2d2d !important;
            border-radius: 12px !important;
            border: 1px solid #404040 !important;
          }
          
          .loading {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #1e1e1e;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #404040;
            border-top-color: #007AFF;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 12px;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .loading-text {
            color: #fff;
            font-size: 16px;
          }
          
          .hidden {
            display: none;
          }
          math-field::part(menu-toggle) {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div id="math-field-container">
          <math-field 
            id="math-field"
            virtual-keyboard-mode="manual"
          ></math-field>
        </div>
        
        
        
        <script>
          (function() {
            try {
              const mf = document.getElementById('math-field');
              
              
              // MathLive sozlamalari
              mf.setOptions({
                virtualKeyboards: 'all',
                virtualKeyboardMode: 'manual',
                fontsDirectory: 'https://cdn.jsdelivr.net/npm/mathlive/dist/fonts',
                locale: 'uz',
                keypressVibration: true,
                smartFence: true,
              });
              
              // MathLive mount bo'lganda
              mf.addEventListener('mount', () => {
                
                // Klaviaturani ko'rsatish
                if (mf.mathVirtualKeyboard) {
                  mf.mathVirtualKeyboard.show();
                  
                  // Klaviatura ko'rsatilganda
                  setTimeout(() => {
                    window.ReactNativeWebView.postMessage('KEYBOARD_READY');
                  }, 500);
                } else {
                  window.ReactNativeWebView.postMessage('KEYBOARD_READY');
                }
              });
              
              // Input o'zgarishini kuzatish
              mf.addEventListener('input', () => {
                try {
                  const latex = mf.getValue();
                  window.ReactNativeWebView.postMessage('INPUT:' + latex);
                } catch (e) {
                  console.error('Input error:', e);
                }
              });
              
              // Enter tugmasi
              mf.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                  window.ReactNativeWebView.postMessage('ENTER_PRESSED');
                }
              });
              
              // Xatoliklarni ushlash
              window.onerror = function(msg, url, line) {
                window.ReactNativeWebView.postMessage('ERROR:' + msg);
              };
              window.ReactNativeWebView.postMessage('KEYBOARD_READY');
              
            } catch (e) {
              window.ReactNativeWebView.postMessage('ERROR:' + e.message);
            }
          })();
        </script>
      </body>
      </html>
    `;
    }, []); // Empty dependency array - faqat bir marta yaratiladi

    // Qiymatni WebView ga yuborish
    const updateWebViewValue = (newValue: string) => {
      if (webViewRef.current && isWebViewReady.current) {
        const safeValue = newValue.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        const script = `
          (function() {
            const mf = document.getElementById('math-field');
            if (mf) {
              mf.setValue('${safeValue}');
            }
          })();
        `;
        webViewRef.current.injectJavaScript(script);
      }
    };

    // External value o'zgarganda WebView ni yangilash
    useEffect(() => {
      setInternalValue(value);
      if (visible && isWebViewReady.current) {
        updateWebViewValue(value);
      }
    }, [value, visible]);

    useImperativeHandle(ref, () => ({
      show: () => {
        setVisible(true);
        setLoading(true);
        // WebView tayyor bo'lgach, qiymatni yangilash
        setTimeout(() => {
          if (isWebViewReady.current) {
            updateWebViewValue(internalValue);
          }
        }, 100);
      },
      hide: () => {
        setVisible(false);
        onClose?.();
      },
      updateValue: (newValue: string) => {
        setInternalValue(newValue);
        if (visible && isWebViewReady.current) {
          updateWebViewValue(newValue);
        }
      },
    }));

    const handleMessage = (event: any) => {
      const data = event.nativeEvent.data;

      if (data === "KEYBOARD_READY") {
        isWebViewReady.current = true;
        setLoading(false);
        // WebView tayyor bo'lgach, joriy qiymatni yuborish
        updateWebViewValue(internalValue);
      } else if (data === "ENTER_PRESSED") {
        setVisible(false);
        onClose?.();
      } else if (data.startsWith("INPUT:")) {
        const newValue = data.substring(6);
        setInternalValue(newValue);
        onChange(newValue);
      } else if (data.startsWith("ERROR:")) {
        console.error("MathLive error:", data.substring(6));
        setLoading(false);
      }
    };

    const handleClose = () => {
      setVisible(false);
      onClose?.();
    };


    const handleError = (syntheticEvent: any) => {
      const { nativeEvent } = syntheticEvent;
      console.error("WebView error:", nativeEvent);
      setLoading(false);
    };

    const handleHttpError = (syntheticEvent: any) => {
      const { nativeEvent } = syntheticEvent;
      console.error("WebView HTTP error:", nativeEvent);
      setLoading(false);
    };

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end", // Modal pastdan chiqadi
          }}
        >
          <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Matematik klaviatura</Text>
              <TouchableOpacity onPress={handleClose} style={styles.doneButton}>
                <Ionicons name="checkmark" size={28} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {/* WebView */}
            <View style={styles.webviewContainer}>
              <WebView
                ref={webViewRef}
                source={{ html: mathliveHTML }}
                onMessage={handleMessage}
                onError={handleError}
                onHttpError={handleHttpError}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                keyboardDisplayRequiresUserAction={false}
                scrollEnabled={false}
                originWhitelist={["*"]}
                mixedContentMode="always"
              />

              {/* Loading Indicator - faqat birinchi yuklanishda ko'rinadi */}
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingText}>
                    Matematik klaviatura yuklanmoqda...
                  </Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                      setLoading(true);
                      if (webViewRef.current) {
                        webViewRef.current.reload();
                      }
                    }}
                  >
                    <Text style={styles.retryText}>Qayta urinish</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    height: height * 0.5,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  doneButton: {
    padding: 8,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: "#1e1e1e",
  },
  webview: {
    flex: 1,
    backgroundColor: "#1e1e1e",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default MathLiveModalKeyboard;
