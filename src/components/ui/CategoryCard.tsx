import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryCardProps {
  title: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconText?: string;
  backgroundColor?: string;
  showPointer?: boolean;
  onPress: () => void;
}

export default function CategoryCard({
  title,
  iconName,
  iconText,
  backgroundColor = '#3b82f6',
  showPointer = false,
  onPress,
}: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
      <View style={[styles.categoryIconContainer, { backgroundColor }]}>
        {iconName ? (
          <Ionicons name={iconName} size={24} color="white" />
        ) : (
          <Text style={styles.iconText}>{iconText}</Text>
        )}
      </View>
      <Text style={styles.categoryLabel}>{title}</Text>
      {showPointer && (
        <Ionicons 
          name="hand-left" 
          size={20} 
          color="#fbbf24" 
          style={styles.pointingIcon} 
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#1f2937',
    textAlign: 'center',
  },
  pointingIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
});
