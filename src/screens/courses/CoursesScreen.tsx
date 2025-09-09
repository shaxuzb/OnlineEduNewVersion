import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function CoursesScreen({ navigation }: any) {
  const handleCoursePress = () => {
    navigation.navigate('CourseDetail', { 
      course: {
        title: 'React Native Asoslari',
        instructor: 'John Doe',
        rating: 4.8,
        students: 1250,
        price: 299000,
        duration: '8 soat'
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kurslar</Text>
          
          {/* Search Bar */}
          <TouchableOpacity style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <Text style={styles.searchText}>Kurs qidirish...</Text>
            <Ionicons name="options" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <TouchableOpacity style={[styles.categoryButton, styles.categoryButtonActive]}>
            <Text style={[styles.categoryButtonText, styles.categoryButtonTextActive]}>
              Barchasi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.categoryButtonText}>Programming</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.categoryButtonText}>Design</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Courses List */}
        <View style={styles.coursesList}>
          <TouchableOpacity style={styles.courseItem} onPress={handleCoursePress}>
            <View style={styles.courseImage} />
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>React Native Asoslari</Text>
              <Text style={styles.courseInstructor}>John Doe</Text>
              
              <View style={styles.courseStats}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.statText}>4.8</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color="#6b7280" />
                  <Text style={styles.statText}>1250</Text>
                </View>
              </View>
              
              <View style={styles.courseFooter}>
                <Text style={styles.coursePrice}>299,000 so'm</Text>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={16} color="#6b7280" />
                  <Text style={styles.statText}>8 soat</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.courseItem} onPress={handleCoursePress}>
            <View style={[styles.courseImage, { backgroundColor: '#f59e0b' }]} />
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>JavaScript Mukammal Kurs</Text>
              <Text style={styles.courseInstructor}>Jane Smith</Text>
              
              <View style={styles.courseStats}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.statText}>4.9</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color="#6b7280" />
                  <Text style={styles.statText}>2100</Text>
                </View>
              </View>
              
              <View style={styles.courseFooter}>
                <Text style={styles.coursePrice}>399,000 so'm</Text>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={16} color="#6b7280" />
                  <Text style={styles.statText}>12 soat</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
  },
  searchText: {
    marginLeft: 12,
    flex: 1,
    color: '#6b7280',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryButtonText: {
    fontWeight: '500',
    color: '#1f2937',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  coursesList: {
    paddingHorizontal: 16,
  },
  courseItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseImage: {
    width: 128,
    height: 96,
    backgroundColor: '#3b82f6',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  courseInfo: {
    flex: 1,
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    color: '#1f2937',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coursePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
});
