import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils';

const { width } = Dimensions.get('window');

interface QuizResultsData {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  wrongQuestionNumbers: number[];
  mavzu: string;
}

export default function QuizResultsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get results data from route params
  const resultsData = (route.params as QuizResultsData) || {
    totalQuestions: 11,
    correctAnswers: 9,
    wrongAnswers: 2,
    percentage: 85,
    wrongQuestionNumbers: [2, 12, 15, 23, 31, 42, 43, 51],
    mavzu: '1-mavzu'
  };

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
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
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
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
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
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statsContainer: {
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
    fontWeight: '500',
  },
  statsValue: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  wrongAnswersSection: {
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
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
    backgroundColor: '#ffebee',
    borderColor: '#ef5350',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  wrongNumberText: {
    fontSize: FONT_SIZES.sm,
    color: '#ef5350',
    fontWeight: '600',
  },
  encouragementText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
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
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: COLORS.primary,
  },
  finishButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontWeight: '600',
  },
});
