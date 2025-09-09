import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { VersionInfo } from '../services/versionService';

const { height: screenHeight } = Dimensions.get('window');

interface UpdateNotificationSheetProps {
  visible: boolean;
  versionInfo: VersionInfo;
  onClose: () => void;
  onUpdateLater: () => void;
}

const UpdateNotificationSheet: React.FC<UpdateNotificationSheetProps> = ({
  visible,
  versionInfo,
  onClose,
  onUpdateLater,
}) => {
  const [slideAnim] = React.useState(new Animated.Value(screenHeight));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleUpdateNow = async () => {
    try {
      if (versionInfo.storeUrl) {
        const supported = await Linking.canOpenURL(versionInfo.storeUrl);
        if (supported) {
          await Linking.openURL(versionInfo.storeUrl);
          onClose();
        } else {
          console.error('Store URL ni ochib bo\'lmaydi:', versionInfo.storeUrl);
        }
      }
    } catch (error) {
      console.error('Store ochishda xatolik:', error);
    }
  };

  const handleUpdateLater = () => {
    onUpdateLater();
    onClose();
  };

  const getStoreName = () => {
    return Platform.OS === 'ios' ? 'App Store' : 'Google Play Store';
  };

  const getUpdateIcon = () => {
    return Platform.OS === 'ios' ? 'logo-apple' : 'logo-google-playstore';
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="cloud-download-outline" 
                  size={32} 
                  color="#4CAF50" 
                />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>Yangilanish mavjud</Text>
                <Text style={styles.subtitle}>
                  Ilovaning yangi versiyasi chiqdi
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Hozirgi versiya:</Text>
              <Text style={styles.versionValue}>{versionInfo.currentVersion}</Text>
            </View>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Yangi versiya:</Text>
              <Text style={[styles.versionValue, styles.newVersion]}>
                {versionInfo.storeVersion}
              </Text>
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Yangilanish afzalliklari:</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Yangi funksiyalar</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Xavfsizlik yaxshilanishlari</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Bug'lar tuzatildi</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={handleUpdateNow}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={getUpdateIcon()} 
                size={20} 
                color="#fff" 
                style={styles.buttonIcon}
              />
              <Text style={styles.updateButtonText}>
                {getStoreName()} da yangilash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.laterButton}
              onPress={handleUpdateLater}
              activeOpacity={0.6}
            >
              <Text style={styles.laterButtonText}>Keyinroq</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom indicator */}
          <View style={styles.bottomIndicator} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: screenHeight * 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  closeButton: {
    padding: 8,
    marginTop: -8,
    marginRight: -8,
  },
  versionContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  versionLabel: {
    fontSize: 14,
    color: '#666',
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  newVersion: {
    color: '#4CAF50',
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  buttonContainer: {
    gap: 12,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 16,
  },
});

export default UpdateNotificationSheet;
