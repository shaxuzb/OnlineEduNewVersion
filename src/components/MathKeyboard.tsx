import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils';

const { width } = Dimensions.get('window');

interface MathKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  visible?: boolean;
}

const MathKeyboard: React.FC<MathKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onClear,
  visible = true,
}) => {
  if (!visible) return null;

  const mathKeys = [
    // Row 1 - Numbers and basic operations
    [
      { key: '7', type: 'number' },
      { key: '8', type: 'number' },
      { key: '9', type: 'number' },
      { key: '÷', type: 'operator' },
      { key: 'C', type: 'clear' },
    ],
    // Row 2
    [
      { key: '4', type: 'number' },
      { key: '5', type: 'number' },
      { key: '6', type: 'number' },
      { key: '×', type: 'operator' },
      { key: '⌫', type: 'backspace' },
    ],
    // Row 3
    [
      { key: '1', type: 'number' },
      { key: '2', type: 'number' },
      { key: '3', type: 'number' },
      { key: '-', type: 'operator' },
      { key: '(', type: 'bracket' },
    ],
    // Row 4
    [
      { key: '0', type: 'number' },
      { key: '.', type: 'decimal' },
      { key: '=', type: 'operator' },
      { key: '+', type: 'operator' },
      { key: ')', type: 'bracket' },
    ],
    // Row 5 - Advanced math symbols
    [
      { key: '²', type: 'power' },
      { key: '³', type: 'power' },
      { key: '√', type: 'operator' },
      { key: 'π', type: 'constant' },
      { key: '∞', type: 'constant' },
    ],
    // Row 6 - More math symbols
    [
      { key: '±', type: 'operator' },
      { key: '%', type: 'operator' },
      { key: '/', type: 'operator' },
      { key: '∑', type: 'operator' },
      { key: '∫', type: 'operator' },
    ],
  ];

  const handleKeyPress = (keyData: { key: string; type: string }) => {
    switch (keyData.type) {
      case 'clear':
        onClear();
        break;
      case 'backspace':
        onBackspace();
        break;
      default:
        onKeyPress(keyData.key);
        break;
    }
  };

  const getKeyStyle = (type: string) => {
    switch (type) {
      case 'number':
        return [styles.key, styles.numberKey];
      case 'operator':
        return [styles.key, styles.operatorKey];
      case 'clear':
        return [styles.key, styles.clearKey];
      case 'backspace':
        return [styles.key, styles.backspaceKey];
      case 'power':
      case 'constant':
        return [styles.key, styles.specialKey];
      default:
        return styles.key;
    }
  };

  const getKeyTextStyle = (type: string) => {
    switch (type) {
      case 'operator':
      case 'clear':
      case 'backspace':
      case 'special':
        return [styles.keyText, styles.operatorText];
      case 'power':
      case 'constant':
        return [styles.keyText, styles.specialText];
      default:
        return styles.keyText;
    }
  };

  const renderKey = (keyData: { key: string; type: string }, index: number) => (
    <TouchableOpacity
      key={index}
      style={getKeyStyle(keyData.type)}
      onPress={() => handleKeyPress(keyData)}
      activeOpacity={0.7}
    >
      {keyData.key === '⌫' ? (
        <Ionicons name="backspace-outline" size={18} color={COLORS.white} />
      ) : (
        <Text style={getKeyTextStyle(keyData.type)}>{keyData.key}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matematik Klaviatura</Text>
      </View>
      
      <View style={styles.keyboardGrid}>
        {mathKeys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((keyData, keyIndex) => renderKey(keyData, keyIndex))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#dededeff',
    paddingBottom: SPACING.base,
  },
  header: {
    backgroundColor: '#f8f9fa',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: '#dededeff',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  keyboardGrid: {
    padding: SPACING.xs,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  key: {
    flex: 1,
    height: 45,
    marginHorizontal: 2,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  numberKey: {
    backgroundColor: COLORS.white,
  },
  operatorKey: {
    backgroundColor: COLORS.primary,
  },
  clearKey: {
    backgroundColor: '#e74c3c',
  },
  backspaceKey: {
    backgroundColor: '#f39c12',
  },
  specialKey: {
    backgroundColor: '#9b59b6',
  },
  keyText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  operatorText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
  },
  specialText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
  },
});

export default MathKeyboard;
