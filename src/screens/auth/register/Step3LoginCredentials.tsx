import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRegister } from '../../../context/RegisterContext';
import { Ionicons } from '@expo/vector-icons';

const Step3Schema = Yup.object().shape({
  login: Yup.string()
    .min(3, 'Login kamida 3 ta belgidan iborat bo\'lishi kerak')
    .max(20, 'Login 20 ta belgidan oshmasligi kerak')
    .matches(/^[a-zA-Z0-9_]+$/, 'Login faqat harflar, raqamlar va _ belgilaridan iborat bo\'lishi kerak')
    .required('Login majburiy'),
  password: Yup.string()
    .min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
    .matches(/[A-Z]/, 'Parol kamida bitta katta harf bo\'lishi kerak')
    .matches(/[a-z]/, 'Parol kamida bitta kichik harf bo\'lishi kerak')
    .matches(/[0-9]/, 'Parol kamida bitta raqam bo\'lishi kerak')
    .required('Parol majburiy'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Parollar bir xil emas')
    .required('Parolni takrorlash majburiy'),
});

const Step3LoginCredentials: React.FC = () => {
  const { registerData, updateRegisterData, prevStep, submitRegistration, isLoading } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (values: { login: string; password: string; confirmPassword: string }) => {
    updateRegisterData(values);
    await submitRegistration();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Ro'yxatdan o'tish</Text>
            <Text style={styles.subtitle}>Login va parol o'ylab toping</Text>
          </View>

          <Formik
            initialValues={{
              login: registerData.login,
              password: registerData.password,
              confirmPassword: registerData.confirmPassword,
            }}
            validationSchema={Step3Schema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
              <View style={styles.formContainer}>
                {/* Login */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      touched.login && errors.login && styles.inputError
                    ]}
                    placeholder="Login"
                    placeholderTextColor="#9CA3AF"
                    value={values.login}
                    onChangeText={handleChange('login')}
                    onBlur={handleBlur('login')}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {touched.login && errors.login && (
                    <Text style={styles.errorText}>{errors.login}</Text>
                  )}
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.passwordInput,
                        touched.password && errors.password && styles.inputError
                      ]}
                      placeholder="Parol"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? 'eye' : 'eye-off'} 
                        size={22} 
                        color="#9CA3AF" 
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.passwordInput,
                        touched.confirmPassword && errors.confirmPassword && styles.inputError
                      ]}
                      placeholder="Parolni takrorlang"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPassword}
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? 'eye' : 'eye-off'} 
                        size={22} 
                        color="#9CA3AF" 
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>

                {/* Buttons */}
                <View style={styles.buttonsRow}>
                  <TouchableOpacity 
                    style={[styles.navButton, styles.backButton]} 
                    onPress={prevStep}
                    disabled={isLoading}
                  >
                    <Ionicons name="chevron-back" size={20} color="#3B82F6" />
                    <Text style={styles.backButtonText}>Orqaga</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.navButton, 
                      styles.submitButton, 
                      (!isValid || isLoading) && styles.submitButtonDisabled
                    ]}
                    onPress={() => handleSubmit()}
                    disabled={!isValid || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Text style={styles.submitButtonText}>Yakunlash</Text>
                        <Ionicons name="checkmark" size={20} color="white" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  formContainer: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, backgroundColor: '#F9FAFB', color: '#1F2937' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#F9FAFB' },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1F2937' },
  eyeButton: { paddingHorizontal: 12, paddingVertical: 14 },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errorText: { color: '#EF4444', fontSize: 14, marginTop: 6, marginLeft: 4 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  navButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 },
  backButton: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1 },
  backButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600', marginLeft: 4 },
  submitButton: { backgroundColor: '#10B981' },
  submitButtonDisabled: { backgroundColor: '#D1D5DB' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginRight: 8 },
});

export default Step3LoginCredentials;
