import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../types';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils';

export default function StatistikaScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Mock statistics data
  const overallProgress = 64;
  const courseStats = [
    { name: 'Algebra', percentage: 62, color: theme.colors.primary },
    { name: 'Geometriya', percentage: 74, color: theme.colors.success },
    { name: 'Milliy Sertifikat', percentage: 56, color: theme.colors.warning },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistika</Text>
        <View style={styles.headerIndicator}>
          <View style={styles.dotIndicator} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pie Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.pieChart}>
            <View style={styles.pieChartContainer}>
              {/* Simple 3D-style pie chart representation */}
              <View style={styles.pieBase}>
                {/* Blue segment (completed) */}
                <View style={[styles.pieSegment, styles.blueSegment]} />
                {/* Light blue segment */}
                <View style={[styles.pieSegment, styles.lightBlueSegment]} />
                {/* Gray segment (remaining) */}
                <View style={[styles.pieSegment, styles.graySegment]} />
                {/* Dark segment for 3D effect */}
                <View style={[styles.pieSegment, styles.darkSegment]} />
              </View>
            </View>
          </View>
          
          <Text style={styles.progressTitle}>Umumiy o'zlashtirish</Text>
          <Text style={styles.progressPercentage}>{overallProgress}%</Text>
        </View>

        {/* Course Statistics */}
        <View style={styles.courseStatsSection}>
          {courseStats.map((course, index) => (
            <TouchableOpacity key={course.name} style={styles.courseStatItem}>
              <View style={styles.courseStatLeft}>
                <Text style={styles.courseStatName}>{course.name} ({course.percentage}%)</Text>
              </View>
              <View style={styles.courseStatRight}>
                <View style={styles.handPointer}>
                  <Ionicons name="hand-left" size={20} color={theme.colors.warning} />
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  backButton: {
    padding: SPACING.xs,
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerIndicator: {
    width: 40,
    alignItems: 'flex-end',
    paddingRight: SPACING.xs,
  },
  dotIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.card,
  },
  chartSection: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
  },
  pieChart: {
    marginBottom: SPACING.lg,
  },
  pieChartContainer: {
    width: 150,
    height: 150,
    position: 'relative',
  },
  pieBase: {
    width: 150,
    height: 150,
    borderRadius: 75,
    position: 'relative',
    backgroundColor: theme.colors.divider,
    overflow: 'hidden',
  },
  pieSegment: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 75,
  },
  blueSegment: {
    backgroundColor: theme.colors.primary,
    left: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    transform: [{ rotate: '20deg' }],
  },
  lightBlueSegment: {
    backgroundColor: theme.colors.primaryLight,
    left: '25%',
    width: '25%',
    height: '50%',
    top: '25%',
    borderRadius: 0,
    transform: [{ rotate: '45deg' }],
  },
  graySegment: {
    backgroundColor: theme.colors.divider,
    right: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  darkSegment: {
    backgroundColor: theme.colors.text,
    bottom: -10,
    left: '25%',
    width: '50%',
    height: 20,
    borderRadius: 50,
    opacity: 0.3,
  },
  progressTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  courseStatsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  courseStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.base,
    borderRadius: BORDER_RADIUS.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  courseStatLeft: {
    flex: 1,
  },
  courseStatName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: theme.colors.text,
  },
  courseStatRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handPointer: {
    marginRight: SPACING.xs,
  },
});
