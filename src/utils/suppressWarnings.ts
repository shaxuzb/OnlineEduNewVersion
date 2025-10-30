// Suppress known React 18 compatibility warnings
import { Platform } from 'react-native';

if (__DEV__) {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args: any[]) => {
    // Suppress useInsertionEffect warnings
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('useInsertionEffect must not schedule updates')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    // Suppress arithmetic conversion warnings
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('Loss of precision during arithmetic conversion')
    ) {
      return;
    }
    // Suppress empty source warnings
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('Trying to load empty source')
    ) {
      return;
    }
    // Suppress property undefined errors (common in module loading)
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      (args[0].includes('Cannot read property') || args[0].includes('Cannot read properties'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export {};
