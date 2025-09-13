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
import { useTheme } from '../../../context/ThemeContext';
import { Theme } from '../../../types';
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
  const { theme } = useTheme();
  const styles = createStyles(theme);

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
                    placeholderTextColor={theme.colors.placeholder}
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
                    placeholderTextColor={theme.colors.placeholder}
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
                    placeholderTextColor={theme.colors.placeholder}
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

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
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
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error + '10',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default Step1PersonalInfo;
