import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility class for AsyncStorage operations with error handling
 */
export class Storage {
  /**
   * Store a value in AsyncStorage
   */
  static async setItem(key: string, value: any): Promise<boolean> {
    try {
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      return false;
    }
  }

  /**
   * Get a value from AsyncStorage
   */
  static async getItem<T = string>(
    key: string,
    defaultValue?: T
  ): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
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
   * Remove a value from AsyncStorage
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove multiple values from AsyncStorage
   */
  static async removeItems(keys: string[]): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error(`Failed to remove keys:`, keys, error);
      return false;
    }
  }

  /**
   * Clear all AsyncStorage data
   */
  static async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
      return false;
    }
  }

  /**
   * Get all keys from AsyncStorage
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
   * Check if a key exists in AsyncStorage
   */
  static async hasItem(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Failed to check if ${key} exists:`, error);
      return false;
    }
  }
}
