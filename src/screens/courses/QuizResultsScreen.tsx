import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { Theme, RootStackParamList } from '../../types';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils';
import { useQuizResults, useThemeTest } from '../../hooks/useQuiz';

const { width } = Dimensions.get('window');

export default function QuizResultsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  // Get route params
  const { testId, userId, themeId, mavzu } = (route.params as RootStackParamList["QuizResults"]) || {};
  
  // API hooks
  const { data: quizResults, isLoading: resultsLoading, error: resultsError } = useQuizResults(userId, themeId);
  const { data: testData, isLoading: testLoading } = useThemeTest(testId);
  
  // Get the latest (first) result from API - index 0
  const latestResult = quizResults?.[0];
  const totalQuestions = testData?.questionCount || 0;
  
  // Calculate statistics
  const score = latestResult?.score || 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const correctAnswers = score;
  const wrongAnswers = totalQuestions - score;
  
  // Find wrong question numbers by comparing user answers with correct answers
  const wrongQuestionNumbers: number[] = [];
  if (latestResult && testData) {
    // Get all question numbers
    const allQuestions = Array.from({ length: totalQuestions }, (_, i) => i + 1);
    
    // Find answered questions
    const answeredQuestions = latestResult.answers.map(a => a.questionNumber);
    
    // Find unanswered questions
    const unansweredQuestions = allQuestions.filter(q => !answeredQuestions.includes(q));
    
    // Find incorrect answers by comparing with correct answers
    const incorrectAnswers = latestResult.answers.filter(userAnswer => {
      const correctAnswerKey = testData.answerKeys.find(ak => ak.questionNumber === userAnswer.questionNumber);
      return correctAnswerKey && correctAnswerKey.correctAnswer !== userAnswer.answer;
    }).map(a => a.questionNumber);
    
    wrongQuestionNumbers.push(...incorrectAnswers, ...unansweredQuestions);
  }
  
  const resultsData = {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    percentage,
    wrongQuestionNumbers: wrongQuestionNumbers.sort((a, b) => a - b),
    mavzu: mavzu || "Test"
  };
  
  // Show loading state
  if (resultsLoading || testLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Natijalar yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Show error state
  if (resultsError || !latestResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Natijalar topilmadi</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Orqaga qaytish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleGoBack = () => {
    // Navigate back to lesson detail or home
    navigation.goBack();
  };

  const handleRetry = () => {
    // Navigate back to quiz screen to retry
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{resultsData.mavzu}</Text>
          <Text style={styles.headerSubtitle}>Natija</Text>
        </View>
        
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Percentage Circle */}
        <View style={styles.percentageContainer}>
          <View style={styles.percentageCircle}>
            <Text style={styles.percentageText}>{resultsData.percentage}%</Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>To'g'ri:</Text>
            <Text style={styles.statsValue}>{resultsData.correctAnswers} ta</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Noto'g'ri:</Text>
            <Text style={styles.statsValue}>{resultsData.wrongAnswers} ta</Text>
          </View>
        </View>

        {/* Wrong Answers Section */}
        <View style={styles.wrongAnswersSection}>
          <Text style={styles.wrongAnswersTitle}>
            Xato ishlangan yoki ishlanmagan misol nomerlari:
          </Text>
          
          <View style={styles.wrongNumbersContainer}>
            {resultsData.wrongQuestionNumbers.map((number, index) => (
              <View key={index} style={styles.wrongNumberBadge}>
                <Text style={styles.wrongNumberText}>{number}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.encouragementText}>
            Ushbu misollari qayta hal qilishni tavsiya qilamiz!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.retryButton]}
            onPress={handleRetry}
          >
            <Ionicons name="refresh" size={20} color={theme.colors.primary} />
            <Text style={styles.retryButtonText}>Qayta urinish</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.finishButton]}
            onPress={handleGoBack}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.finishButtonText}>Yakunlash</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    minHeight: 60,
  },
  headerButton: {
    padding: SPACING.xs,
    minWidth: 40,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'white',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  percentageContainer: {
    marginBottom: SPACING.xl,
  },
  percentageCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statsContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: BORDER_RADIUS.base,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statsLabel: {
    fontSize: FONT_SIZES.lg,
    color: theme.colors.text,
    fontWeight: '500',
  },
  statsValue: {
    fontSize: FONT_SIZES.lg,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  wrongAnswersSection: {
    backgroundColor: theme.colors.card,
    borderRadius: BORDER_RADIUS.base,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wrongAnswersTitle: {
    fontSize: FONT_SIZES.base,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: SPACING.base,
    lineHeight: 22,
  },
  wrongNumbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.base,
  },
  wrongNumberBadge: {
    backgroundColor: theme.colors.error + '20',
    borderColor: theme.colors.error,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  wrongNumberText: {
    fontSize: FONT_SIZES.sm,
    color: theme.colors.error,
    fontWeight: '600',
  },
  encouragementText: {
    fontSize: FONT_SIZES.base,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.base,
    width: '100%',
    marginTop: 'auto',
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.base,
    gap: SPACING.xs,
  },
  retryButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.base,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: theme.colors.primary,
  },
  finishButtonText: {
    fontSize: FONT_SIZES.base,
    color: 'white',
    fontWeight: '600',
  },
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: SPACING.base,
    fontSize: FONT_SIZES.base,
    color: theme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    backgroundColor: theme.colors.background,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: SPACING.base,
    textAlign: 'center',
  },
});
