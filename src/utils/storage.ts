import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Checks if SecureStore is available (native iOS/Android only)
 * Falls back to AsyncStorage on web
 */
const isSecureStoreAvailable = Platform.OS !== 'web';

/**
 * Utility class for storage operations with encryption support
 *
 * Uses SecureStore (encrypted) for sensitive data on iOS/Android
 * Falls back to AsyncStorage on web
 *
 * SecureStore benefits:
 * - iOS: Uses Keychain Services (hardware-backed encryption)
 * - Android: Uses Android Keystore (hardware-backed encryption)
 */
export class Storage {
  /**
   * Store a value securely
   * Uses SecureStore on native, AsyncStorage on web
   */
  static async setItem(key: string, value: any): Promise<boolean> {
    try {
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);

      if (isSecureStoreAvailable) {
        await SecureStore.setItemAsync(key, stringValue);
      } else {
        await AsyncStorage.setItem(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      return false;
    }
  }

  /**
   * Get a value from secure storage
   */
  static async getItem<T = string>(
    key: string,
    defaultValue?: T
  ): Promise<T | null> {
    try {
      let value: string | null;

      if (isSecureStoreAvailable) {
        value = await SecureStore.getItemAsync(key);
      } else {
        value = await AsyncStorage.getItem(key);
      }

      if (value === null) return defaultValue || null;

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return defaultValue || null;
    }
  }

  /**
   * Remove a value from secure storage
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove multiple values from storage
   */
  static async removeItems(keys: string[]): Promise<boolean> {
    try {
      if (isSecureStoreAvailable) {
        // SecureStore doesn't have multiRemove, do it one by one
        await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key)));
      } else {
        await AsyncStorage.multiRemove(keys);
      }
      return true;
    } catch (error) {
      console.error(`Failed to remove keys:`, keys, error);
      return false;
    }
  }

  /**
   * Clear all storage data
   * Note: On native, this only clears AsyncStorage, not SecureStore
   * For security reasons, SecureStore items must be deleted individually
   */
  static async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Get all keys from AsyncStorage (not available for SecureStore)
   */
  static async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Check if a key exists in storage
   */
  static async hasItem(key: string): Promise<boolean> {
    try {
      let value: string | null;

      if (isSecureStoreAvailable) {
        value = await SecureStore.getItemAsync(key);
      } else {
        value = await AsyncStorage.getItem(key);
      }

      return value !== null;
    } catch (error) {
      console.error(`Failed to check if ${key} exists:`, error);
      return false;
    }
  }
}
