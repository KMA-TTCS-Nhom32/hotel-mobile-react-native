/**
 * Location Map Preview Component - Web Implementation
 * Shows a static placeholder with a link to Google Maps (web fallback)
 */

import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import type { Location } from '@/types/location';

interface LocationMapPreviewProps {
  /** Location data with coordinates and Place ID */
  location: Location | null | undefined;
  /** Label/name for the location */
  label?: string;
  /** Custom height for the map preview (default: 200) */
  height?: number;
}

/**
 * LocationMapPreview Component (Web)
 * Shows a static placeholder with a button to open Google Maps
 */
export const LocationMapPreview: React.FC<LocationMapPreviewProps> = ({
  location,
  label,
  height = 200,
}) => {
  // Don't render if location is invalid
  if (!location?.latitude || !location?.longitude) {
    return null;
  }

  const { latitude, longitude, google_place_id } = location;

  // Parse coordinates
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const handleOpenMaps = () => {
    // On web, open Google Maps in a new tab
    const url = google_place_id
      ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(google_place_id)}`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <View className='w-full px-4'>
      <View
        className='items-center justify-center overflow-hidden rounded-2xl bg-gray-200'
        style={{ height, width: '100%' }}
      >
        <MaterialIcons name='map' size={48} color='#9ca3af' />
        <Text className='mt-2 text-center text-sm text-gray-500'>
          {label || 'View Location'}
        </Text>
        <Pressable
          onPress={handleOpenMaps}
          className='mt-3 rounded-full bg-primary-main px-6 py-2'
        >
          <View className='flex-row items-center gap-2'>
            <MaterialIcons name='directions' size={16} color='white' />
            <Text className='font-medium text-white'>Open in Google Maps</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};
