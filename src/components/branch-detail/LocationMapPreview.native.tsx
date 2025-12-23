/**
 * Location Map Preview Component - Native Implementation
 * Displays an interactive map preview using react-native-maps
 */

import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { showLocation } from 'react-native-map-link';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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
 * LocationMapPreview Component (Native)
 * Shows an interactive map using react-native-maps with a button to open in external map apps
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

  const handleOpenMaps = async () => {
    try {
      await showLocation({
        latitude: lat,
        longitude: lng,
        title: label,
        googlePlaceId: google_place_id
          ? decodeURIComponent(google_place_id)
          : undefined,
        dialogTitle: 'Open in Maps',
        dialogMessage: 'Choose your preferred map app',
        cancelText: 'Cancel',
        alwaysIncludeGoogle: true,
      });
    } catch (error) {
      console.error('Error opening maps:', error);
    }
  };

  return (
    <View className='w-full px-4'>
      <View
        className='overflow-hidden rounded-2xl bg-gray-100'
        style={{ height, width: '100%' }}
      >
        {/* Interactive Map using react-native-maps */}
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: lat,
              longitude: lng,
            }}
            title={label}
            pinColor='#f97316'
          />
        </MapView>

        {/* Floating "Open in Maps" button */}
        <View className='absolute bottom-3 left-0 right-0 items-center'>
          <Pressable
            onPress={handleOpenMaps}
            className='rounded-full bg-white/95 px-6 py-3 shadow-lg active:opacity-80'
          >
            <View className='flex-row items-center gap-2'>
              <MaterialIcons name='directions' size={20} color='#f97316' />
              <Text className='font-medium text-primary-main'>
                Open in Maps
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
