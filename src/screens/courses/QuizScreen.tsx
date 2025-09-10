import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils';

const { width, height } = Dimensions.get('window');

interface QuizAnswer {
  questionId: number;
  selectedOption: string | null;
  isConfirmed: boolean;
}

export default function QuizScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(11); // Based on the image showing "11"
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTestModal, setShowTestModal] = useState(false);

  // Get PDF data from route params
  const { pdfPath, title, mavzu } = (route.params as any) || {};
  
  const handleGoBack = () => {
    Alert.alert(
      'Testni tark etish',
      'Haqiqatan ham testni tark etmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { text: 'Chiqish', onPress: () => navigation.goBack() }
      ]
    );
  };

  const handleLoadComplete = (numberOfPages: number) => {
    setLoading(false);
  };

  const handleError = (error: any) => {
    setLoading(false);
    Alert.alert(
      'Xatolik',
      'PDF faylni ochishda xatolik yuz berdi. Fayl mavjudligini tekshiring.',
      [{ text: 'OK', onPress: handleGoBack }]
    );
    console.error('PDF Error:', error);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleConfirm = () => {
    if (!selectedOption) return;

    // Save the answer
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion,
      selectedOption,
      isConfirmed: true
    };

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion);
      return [...filtered, newAnswer];
    });

    // Auto move to next question after confirmation
    setTimeout(() => {
      if (currentQuestion < totalQuestions) {
        handleNext();
      } else {
        // Quiz completed
        Alert.alert(
          'Test tugadi!',
          `Siz ${totalQuestions} ta savoldan ${answers.length + 1} tasini javobladingiz.`,
          [{ text: 'Yakunlash', onPress: handleGoBack }]
        );
      }
    }, 500);
  };

  const handleEditAnswer = () => {
    // Allow editing confirmed answer
    setAnswers(prev => prev.filter(a => a.questionId !== currentQuestion));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
      // Load saved answer for next question
      const savedAnswer = answers.find(a => a.questionId === currentQuestion + 1);
      setSelectedOption(savedAnswer?.selectedOption || null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
      // Load saved answer for previous question
      const savedAnswer = answers.find(a => a.questionId === currentQuestion - 1);
      setSelectedOption(savedAnswer?.selectedOption || null);
    }
  };

  const handleFinishTest = () => {
    const answeredQuestions = answers.filter(a => a.isConfirmed).length;
    const wrongQuestionNumbers = Array.from({ length: totalQuestions }, (_, i) => i + 1)
      .filter(q => !answers.find(a => a.questionId === q)?.isConfirmed);
    const correctAnswers = totalQuestions - wrongQuestionNumbers.length;
    const wrongAnswers = wrongQuestionNumbers.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    Alert.alert(
      'Testni yakunlash',
      `Siz ${totalQuestions} ta savoldan ${answeredQuestions} tasiga javob berdingiz.\n\nTestni yakunlamoqchimisiz?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { 
          text: 'Ha, yakunlash', 
          style: 'destructive',
          onPress: () => {
            (navigation as any).navigate('QuizResults', {
              totalQuestions,
              correctAnswers,
              wrongAnswers,
              percentage,
              wrongQuestionNumbers,
              mavzu: mavzu || '1-mavzu',
            });
          }
        }
      ]
    );
  };

  const handleQuestionNumberPress = () => {
    setShowTestModal(true);
  };

  const handleTestSelect = (testNumber: number) => {
    setCurrentQuestion(testNumber);
    const savedAnswer = answers.find(a => a.questionId === testNumber);
    setSelectedOption(savedAnswer?.selectedOption || null);
    setShowTestModal(false);
  };

  const source = pdfPath ? { uri: `https://www.uscis.gov/sites/default/files/document/forms/i-9.pdf` } : undefined;
  const isAnswerSelected = selectedOption !== null;
  const currentAnswer = answers.find(a => a.questionId === currentQuestion);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{mavzu || '1-mavzu'}</Text>
          <Text style={styles.headerSubtitle}>Mashqlar</Text>
        </View>
        
        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            {currentQuestion}/{totalQuestions}
          </Text>
        </View>
      </View>

      {/* PDF Content */}
      <View style={styles.pdfContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Test yuklanmoqda...</Text>
          </View>
        )}
        
        {source ? (
          <Pdf
            source={source}
            onLoadComplete={handleLoadComplete}
            onError={handleError}
            style={styles.pdf}
            trustAllCerts={false}
            enablePaging={false}
            horizontal={false}
            spacing={0}
            password=""
            scale={1.2}
            minScale={1.0}
            maxScale={3.0}
            page={currentQuestion}
            renderActivityIndicator={() => (
              <ActivityIndicator size="large" color={COLORS.primary} />
            )}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="document-outline" size={64} color={COLORS.gray} />
            <Text style={styles.errorTitle}>Test topilmadi</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
              <Text style={styles.retryButtonText}>Orqaga qaytish</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quiz Controls */}
      <View style={styles.quizControls}>
        {/* Navigation and Answer Options Row */}
        <View style={styles.topControlsRow}>
          <TouchableOpacity 
            style={[styles.navButton, currentQuestion === 1 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentQuestion === 1}
          >
            <Ionicons name="chevron-back" size={20} color={currentQuestion === 1 ? COLORS.gray : COLORS.primary} />
            <Text style={[styles.navButtonText, currentQuestion === 1 && styles.navButtonTextDisabled]}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleQuestionNumberPress}>
            <Text style={styles.questionNumber}>{currentQuestion}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, currentQuestion === totalQuestions && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={currentQuestion === totalQuestions}
          >
            <Text style={[styles.navButtonText, currentQuestion === totalQuestions && styles.navButtonTextDisabled]}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color={currentQuestion === totalQuestions ? COLORS.gray : COLORS.primary} />
          </TouchableOpacity>
          
          {/* Answer Options */}
          {['A', 'B', 'C', 'D'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                selectedOption === option && styles.optionButtonSelected
              ]}
              onPress={() => {
                handleOptionSelect(option);
                // If this was a confirmed answer, allow editing by removing confirmation
                if (currentAnswer?.isConfirmed) {
                  handleEditAnswer();
                }
              }}
            >
              <Text style={[
                styles.optionButtonText,
                selectedOption === option && styles.optionButtonTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.choiceButton]}
            onPress={() => setSelectedOption(null)}
          >
            <Text style={styles.choiceButtonText}>Yechim</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton, !isAnswerSelected && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!isAnswerSelected}
          >
            <Text style={[styles.confirmButtonText, !isAnswerSelected && styles.confirmButtonTextDisabled]}>
              Tasdiqlash
            </Text>
            <Ionicons 
              name="hand-right" 
              size={20} 
              color={!isAnswerSelected ? COLORS.gray : "white"} 
              style={styles.handIcon} 
            />
          </TouchableOpacity>
        </View>

        {/* Finish Test Button */}
        <TouchableOpacity 
          style={styles.finishButton}
          onPress={handleFinishTest}
        >
          <Text style={styles.finishButtonText}>Testni yakunlash</Text>
          <Ionicons name="checkmark-circle" size={20} color="white" style={styles.finishIcon} />
        </TouchableOpacity>
      </View>

      {/* Test Navigation Popover */}
      {showTestModal && (
        <View style={styles.popoverOverlay} pointerEvents="box-none">
          <TouchableOpacity 
            style={styles.popoverBackground}
            activeOpacity={1}
            onPress={() => setShowTestModal(false)}
          />
          <View style={styles.popoverContainer}>
            <View style={styles.popoverHeader}>
              <Text style={styles.popoverTitle}>Testni tanlang</Text>
            </View>
            
            <ScrollView style={styles.popoverContent} showsVerticalScrollIndicator={false}>
              <View style={styles.testGrid}>
                {Array.from({ length: totalQuestions }, (_, index) => {
                  const testNumber = index + 1;
                  const isAnswered = answers.find(a => a.questionId === testNumber)?.isConfirmed;
                  const isCurrent = testNumber === currentQuestion;
                  
                  return (
                    <TouchableOpacity
                      key={testNumber}
                      style={[
                        styles.testGridItem,
                        isAnswered && styles.testGridItemAnswered,
                        isCurrent && styles.testGridItemCurrent
                      ]}
                      onPress={() => handleTestSelect(testNumber)}
                    >
                      <Text style={[
                        styles.testGridItemText,
                        (isAnswered || isCurrent) && styles.testGridItemTextActive
                      ]}>
                        {testNumber}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            
            <View style={styles.popoverArrow} />
          </View>
        </View>
      )}
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
  pageIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  pageText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '500',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: SPACING.base,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
  },
  pdf: {
    flex: 1,
    width: width,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.base,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.base,
    marginTop: SPACING.xl,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontWeight: '500',
  },
  quizControls: {
    backgroundColor: COLORS.white,
    paddingTop: SPACING.base,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: "black",
  },
  topControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginHorizontal: -SPACING.lg,
    marginTop: -SPACING.base,
    marginBottom: SPACING.base,
    borderRadius: BORDER_RADIUS.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    marginHorizontal: SPACING.xs,
  },
  navButtonTextDisabled: {
    color: COLORS.gray,
  },
  questionNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SPACING.sm,
  },
  optionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionButtonDisabled: {
    opacity: 0.6,
  },
  optionButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  optionButtonTextSelected: {
    color: COLORS.white,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.base,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  choiceButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
  confirmButtonTextDisabled: {
    color: "gray",
  },
  handIcon: {
    marginLeft: SPACING.xs,
  },
  finishButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.base,
    marginTop: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  finishIcon: {
    marginLeft: SPACING.xs,
  },
  // Popover styles
  popoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  popoverBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  popoverContainer: {
    position: 'absolute',
    bottom: 180, // Above the quiz controls
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  popoverHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    alignItems: 'center',
  },
  popoverTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  popoverContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    maxHeight: 220,
  },
  popoverArrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.white,
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  testGridItem: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: "black",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  testGridItemAnswered: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  testGridItemCurrent: {
    backgroundColor: '#ffd700',
    borderColor: '#ffd700',
  },
  testGridItemText: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  testGridItemTextActive: {
    color: COLORS.white,
  },
});
