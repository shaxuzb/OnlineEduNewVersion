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
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRegister } from '../../../context/RegisterContext';
import { Ionicons } from '@expo/vector-icons';

// Validation schema
const Step1Schema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Ism kamida 2 ta harfdan iborat bo\'lishi kerak')
    .max(50, 'Ism 50 ta harfdan oshmasligi kerak')
    .required('Ism kiritish majburiy'),
  lastName: Yup.string()
    .min(2, 'Familya kamida 2 ta harfdan iborat bo\'lishi kerak')
    .max(50, 'Familya 50 ta harfdan oshmasligi kerak')
    .required('Familya kiritish majburiy'),
  middleName: Yup.string()
    .min(2, 'Sharif kamida 2 ta harfdan iborat bo\'lishi kerak')
    .max(50, 'Sharif 50 ta harfdan oshmasligi kerak')
    .required('Sharif kiritish majburiy'),
});

const Step1PersonalInfo: React.FC = () => {
  const { registerData, updateRegisterData, nextStep } = useRegister();

  const handleNext = (values: { firstName: string; lastName: string; middleName: string }) => {
    updateRegisterData(values);
    nextStep();
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Ro'yxatdan o'tish</Text>
            <Text style={styles.subtitle}>Shaxsiy ma'lumotlaringizni kiriting</Text>
          </View>

          <Formik
            initialValues={{
              firstName: registerData.firstName,
              lastName: registerData.lastName,
              middleName: registerData.middleName,
            }}
            validationSchema={Step1Schema}
            onSubmit={handleNext}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty }) => (
              <View style={styles.formContainer}>
                {/* First Name */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      touched.firstName && errors.firstName && styles.inputError
                    ]}
                    placeholder="Ism"
                    placeholderTextColor="#9CA3AF"
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  {touched.firstName && errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                </View>

                {/* Last Name */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      touched.lastName && errors.lastName && styles.inputError
                    ]}
                    placeholder="Familya"
                    placeholderTextColor="#9CA3AF"
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  {touched.lastName && errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                </View>

                {/* Middle Name */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      touched.middleName && errors.middleName && styles.inputError
                    ]}
                    placeholder="Sharif"
                    placeholderTextColor="#9CA3AF"
                    value={values.middleName}
                    onChangeText={handleChange('middleName')}
                    onBlur={handleBlur('middleName')}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  {touched.middleName && errors.middleName && (
                    <Text style={styles.errorText}>{errors.middleName}</Text>
                  )}
                </View>

                {/* Next Button */}
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    (!isValid || !dirty) && styles.nextButtonDisabled
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || !dirty}
                >
                  <Text style={styles.nextButtonText}>Keyingi</Text>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default Step1PersonalInfo;
