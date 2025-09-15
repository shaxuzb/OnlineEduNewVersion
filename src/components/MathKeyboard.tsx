import React, { useState } from 'react';
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

type KeyboardTab = 'numbers' | 'functions' | 'abc';

const MathKeyboard: React.FC<MathKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onClear,
  visible = true,
}) => {
  const [activeTab, setActiveTab] = useState<KeyboardTab>('numbers');
  
  if (!visible) return null;

  // Numbers and operators tab
  const numbersKeys = [
    ['x', 'n', '7', '8', '9', '÷', 'e', 'i', 'π'],
    ['<', '>', '4', '5', '6', '×', '²', '³', '√'],
    ['(', ')', '1', '2', '3', '-', '∫', '∂', '∀'],
    ['↑', '', '0', '.', '=', '+', '<', '>', '⌫'],
  ];

  // Functions tab
  const functionsKeys = [
    ['sin', 'ln', 'abs', '→', '∃', '∈', 'U', '°', 'e'],
    ['cos', 'log', '|□|', '←', '∀', '∃', '∩', '∫', 'π'],
    ['tan', 'exp', '⟦□⟧', '↔', '|', 'C', '⊂', 'd', '∞'],
    ['↑', '', ';', ':', '', '', '<', '>', '⌫'],
  ];

  // ABC tab
  const abcKeys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ''],
    ['↑', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '', '⌫'],
  ];

  const getCurrentKeys = () => {
    switch (activeTab) {
      case 'numbers':
        return numbersKeys;
      case 'functions':
        return functionsKeys;
      case 'abc':
        return abcKeys;
      default:
        return numbersKeys;
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      onBackspace();
    } else if (key === 'C') {
      onClear();
    } else if (key === '↑') {
      // Shift key - could be used for uppercase/special functions
      return;
    } else if (key && key.trim() !== '') {
      onKeyPress(key);
    }
  };

  const getKeyStyle = (key: string) => {
    if (key === '⌫') {
      return [styles.key, styles.backspaceKey];
    }
    if (key === 'C') {
      return [styles.key, styles.clearKey];
    }
    if ('0123456789'.includes(key)) {
      return [styles.key, styles.numberKey];
    }
    if ('+-×÷=<>()'.includes(key)) {
      return [styles.key, styles.operatorKey];
    }
    if (['sin', 'cos', 'tan', 'log', 'ln', 'exp', 'abs'].includes(key)) {
      return [styles.key, styles.functionKey];
    }
    if (['π', 'e', '∞', '²', '³', '√', '∫', '∂', '∀', '∃', '∈', '∩', '⊂'].includes(key)) {
      return [styles.key, styles.specialKey];
    }
    if (key === '↑') {
      return [styles.key, styles.shiftKey];
    }
    return [styles.key, styles.letterKey];
  };

  const getKeyTextStyle = (key: string) => {
    if (key === '⌫' || key === 'C') {
      return [styles.keyText, styles.specialText];
    }
    if ('+-×÷=<>()'.includes(key)) {
      return [styles.keyText, styles.operatorText];
    }
    if (['sin', 'cos', 'tan', 'log', 'ln', 'exp', 'abs'].includes(key)) {
      return [styles.keyText, styles.functionText];
    }
    if (['π', 'e', '∞', '²', '³', '√', '∫', '∂', '∀', '∃', '∈', '∩', '⊂'].includes(key)) {
      return [styles.keyText, styles.specialText];
    }
    return styles.keyText;
  };

  const renderKey = (key: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={getKeyStyle(key)}
      onPress={() => handleKeyPress(key)}
      activeOpacity={0.7}
      disabled={key === '' || key.trim() === ''}
    >
      {key === '⌫' ? (
        <Ionicons name="backspace-outline" size={16} color="white" />
      ) : key === '↑' ? (
        <Ionicons name="arrow-up" size={16} color="#666" />
      ) : (
        <Text style={getKeyTextStyle(key)}>{key}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tab Headers */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'numbers' && styles.activeTab]}
          onPress={() => setActiveTab('numbers')}
        >
          <Text style={[styles.tabText, activeTab === 'numbers' && styles.activeTabText]}>123</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'functions' && styles.activeTab]}
          onPress={() => setActiveTab('functions')}
        >
          <Text style={[styles.tabText, activeTab === 'functions' && styles.activeTabText]}>f(x)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'abc' && styles.activeTab]}
          onPress={() => setActiveTab('abc')}
        >
          <Text style={[styles.tabText, activeTab === 'abc' && styles.activeTabText]}>abc</Text>
        </TouchableOpacity>
      </View>
      
      {/* Keyboard Grid */}
      <View style={styles.keyboardGrid}>
        {getCurrentKeys().map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((key, keyIndex) => renderKey(key, keyIndex))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2D2D2D', // Dark theme like reference
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingBottom: SPACING.base,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  tab: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0066CC', // Blue accent like reference
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#AAA',
  },
  activeTabText: {
    color: 'white',
  },
  keyboardGrid: {
    padding: SPACING.xs,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  key: {
    flex: 1,
    height: 42,
    marginHorizontal: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444', // Dark keys like reference
    borderWidth: 1,
    borderColor: '#555',
  },
  numberKey: {
    backgroundColor: '#444',
  },
  letterKey: {
    backgroundColor: '#444',
  },
  operatorKey: {
    backgroundColor: '#FF9500', // Orange operators like reference
  },
  functionKey: {
    backgroundColor: '#0066CC', // Blue functions
  },
  clearKey: {
    backgroundColor: '#FF3B30', // Red clear
  },
  backspaceKey: {
    backgroundColor: '#666', // Gray backspace
  },
  specialKey: {
    backgroundColor: '#0066CC', // Blue special symbols
  },
  shiftKey: {
    backgroundColor: '#666',
  },
  keyText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  operatorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  functionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  specialText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MathKeyboard;
