import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure Storage utility that uses:
 * - SecureStore (encrypted) on iOS/Android native
 * - AsyncStorage (fallback) on web
 *
 * SecureStore uses:
 * - iOS: Keychain Services (hardware-backed encryption)
 * - Android: Android Keystore (hardware-backed encryption)
 */

const isSecureStoreAvailable = Platform.OS !== 'web';

export const SecureStorage = {
  /**
   * Store a value securely
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.setItemAsync(key, value);
      } else {
        // Fallback for web
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`SecureStorage.setItem error for key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Retrieve a value securely
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isSecureStoreAvailable) {
        return await SecureStore.getItemAsync(key);
      } else {
        // Fallback for web
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`SecureStorage.getItem error for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Remove a value from secure storage
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.deleteItemAsync(key);
      } else {
        // Fallback for web
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`SecureStorage.removeItem error for key "${key}":`, error);
    }
  },

  /**
   * Check if a key exists in secure storage
   */
  hasItem: async (key: string): Promise<boolean> => {
    const value = await SecureStorage.getItem(key);
    return value !== null;
  },
};

/**
 * Zustand storage adapter for SecureStore
 * Compatible with createJSONStorage from zustand/middleware
 */
export const secureStorageAdapter = {
  getItem: async (name: string): Promise<string | null> => {
    return SecureStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    return SecureStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    return SecureStorage.removeItem(name);
  },
};
