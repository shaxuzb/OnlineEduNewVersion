import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useRegister } from '../../../context/RegisterContext';
import { useTheme } from '../../../context/ThemeContext';
import { Theme } from '../../../types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SuccessScreen: React.FC = () => {
  const { login } = useAuth();
  const { registerData, resetRegistration } = useRegister();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    // Auto-login with registered credentials
    await login(registerData.login || registerData.email, registerData.password);
    resetRegistration();
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          { transform: [{ scale: scaleValue }] }
        ]}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
        </View>

        {/* Congratulation Message */}
        <Text style={styles.title}>
          Tabriklayman, {registerData.firstName}!
        </Text>

        <Text style={styles.subtitle}>
          Siz muvaffaqiyatli ro'yxatdan o'tdingiz
        </Text>

        {/* User Info Summary */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ism:</Text>
            <Text style={styles.infoValue}>
              {registerData.firstName} {registerData.lastName} {registerData.middleName}
            </Text>
          </View>
          
          {registerData.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{registerData.email}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefon:</Text>
            <Text style={styles.infoValue}>{registerData.phone}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Login:</Text>
            <Text style={styles.infoValue}>{registerData.login}</Text>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Kirish</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: width * 0.9,
  },
  iconContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: theme.colors.success + '20',
    borderRadius: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SuccessScreen;
