import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CourseDetailScreen() {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kurs Detayı</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Course Info */}
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>React Native Asoslari</Text>
          <Text style={styles.instructor}>John Doe</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.statText}>4.8 (1250 baholash)</Text>
            </View>
          </View>
        </View>

        {/* Course Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kurs haqida</Text>
          <Text style={styles.description}>
            Bu kurs React Native asoslarini o'rganishga yo'naltirilgan. 
            Siz mobil ilovalar yaratishning eng zamonaviy usullarini o'rganasiz 
            va amaliy loyihalar ustida ishlab, tajribangizni oshirasiz.
          </Text>
        </View>

        {/* What you'll learn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nima o'rganasiz</Text>
          <View style={styles.learningItem}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.learningText}>React Native asoslari</Text>
          </View>
          <View style={styles.learningItem}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.learningText}>Navigation va routing</Text>
          </View>
          <View style={styles.learningItem}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.learningText}>State management</Text>
          </View>
          <View style={styles.learningItem}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.learningText}>API bilan ishlash</Text>
          </View>
        </View>

        {/* Enroll Button */}
        <TouchableOpacity style={styles.enrollButton}>
          <Text style={styles.enrollButtonText}>Kursni boshlash</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 20,
    paddingTop: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  courseInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  instructor: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    color: '#6b7280',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  learningText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  enrollButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
