import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRegister } from '../../../context/RegisterContext';
import { Ionicons } from '@expo/vector-icons';

const phoneRegex = /^\+998\d{9}$/;

const Step2Schema = Yup.object().shape({
  phone: Yup.string()
    .matches(phoneRegex, 'Telefon raqam formati: +998XXXXXXXXX')
    .required('Telefon raqam majburiy'),
  email: Yup.string()
    .email('Elektron pochta formati noto\'g\'ri')
    .notRequired()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
});

const Step2ContactInfo: React.FC = () => {
  const { registerData, updateRegisterData, nextStep, prevStep } = useRegister();

  const handleNext = async (values: { phone: string; email: string | null }) => {
    try {
      updateRegisterData({ phone: values.phone, email: values.email || '' });
      
      // Show SMS sending confirmation
      Alert.alert(
        'SMS yuborildi',
        `${values.phone} raqamiga tasdiqlash kodi yuborildi`,
        [{ text: 'OK', onPress: () => nextStep() }]
      );
    } catch (error) {
      Alert.alert('Xatolik', 'SMS yuborishda xatolik yuz berdi');
    }
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
            <Text style={styles.subtitle}>Kontakt ma'lumotlarini kiriting</Text>
          </View>

          <Formik
            initialValues={{
              phone: registerData.phone || '+998',
              email: registerData.email || '',
            }}
            validationSchema={Step2Schema}
            onSubmit={handleNext}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
              <View style={styles.formContainer}>
                {/* Phone */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Telefon raqam</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.phone && errors.phone && styles.inputError
                    ]}
                    placeholder="+998XXXXXXXXX"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                  />
                  {touched.phone && errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Elektron pochta (shart emas)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.email && errors.email && styles.inputError
                    ]}
                    placeholder="example@gmail.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                {/* Buttons */}
                <View style={styles.buttonsRow}>
                  <TouchableOpacity style={[styles.navButton, styles.backButton]} onPress={prevStep}>
                    <Ionicons name="chevron-back" size={20} color="#3B82F6" />
                    <Text style={styles.backButtonText}>Orqaga</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.navButton, styles.nextButton, !isValid && styles.nextButtonDisabled]}
                    onPress={() => handleSubmit()}
                    disabled={!isValid}
                  >
                    <Text style={styles.nextButtonText}>Keyingi</Text>
                    <Ionicons name="chevron-forward" size={20} color="white" />
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
  label: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, backgroundColor: '#F9FAFB', color: '#1F2937' },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errorText: { color: '#EF4444', fontSize: 14, marginTop: 6, marginLeft: 4 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  navButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 },
  backButton: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1 },
  backButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600', marginLeft: 4 },
  nextButton: { backgroundColor: '#3B82F6' },
  nextButtonDisabled: { backgroundColor: '#D1D5DB' },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginRight: 8 },
});

export default Step2ContactInfo;

