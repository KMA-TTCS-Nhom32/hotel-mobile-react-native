import type { BranchDetail } from '@ahomevilla-hotel/node-sdk';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { showLocation } from 'react-native-map-link';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmenitiesSection } from '@/components/branch-detail/AmenitiesSection';
import { BookNowButton } from '@/components/branch-detail/BookNowButton';
import { BranchImageGallery } from '@/components/branch-detail/BranchImageGallery';
import { BranchInfoSection } from '@/components/branch-detail/BranchInfoSection';
import { LocationMapPreview } from '@/components/branch-detail/LocationMapPreview';
import { NearbyPlacesSection } from '@/components/branch-detail/NearbyPlacesSection';
import { RoomsSection } from '@/components/branch-detail/RoomsSection';
import { Screen } from '@/components/layout';
import { ErrorState, LoadingSpinner } from '@/components/ui';
import { useBranchDetail } from '@/hooks/useBranchDetail';
import { useCommonTranslation, useLanguage } from '@/i18n/hooks';
import type { Location } from '@/types/location';

/**
 * Branch Detail Screen
 * Displays comprehensive information about a hotel branch
 */
export default function BranchDetailScreen() {
  const router = useRouter();
  const { idOrSlug } = useLocalSearchParams<{ idOrSlug: string }>();
  const { t } = useCommonTranslation();

  const { currentLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  const {
    data: branch,
    isLoading,
    isError,
    error,
    refetch,
  } = useBranchDetail(idOrSlug);

  // Get translated data
  const getBranchDisplayData = (branch: BranchDetail, lng: string) => {
    const translation = branch.translations?.find(
      t => t.language === lng.toUpperCase()
    );

    return {
      name: translation?.name || branch.name,
      description: translation?.description || branch.description,
      address: translation?.address || branch.address,
      nearBy: (translation?.nearBy || branch.nearBy) as typeof branch.nearBy,
    };
  };

  const handleBookNow = () => {
    // TODO: Navigate to booking screen with branch pre-selected
    console.log('Book now clicked for branch:', branch?.id);
  };

  const handleContactPress = () => {
    if (branch?.phone) {
      Linking.openURL(`tel:${branch.phone}`);
    }
  };

  const handleDirectionsPress = async () => {
    console.log(
      'real name',
      displayData.name.replace('AHomeVilla', 'M Village')
    );
    if (branch?.location) {
      try {
        await showLocation({
          latitude: parseFloat(branch.location.latitude),
          longitude: parseFloat(branch.location.longitude),
          title: displayData.name.replace('AHomeVilla', 'M Village'),
          googlePlaceId: branch.location.google_place_id
            ? decodeURIComponent(branch.location.google_place_id)
            : undefined,
          dialogTitle: 'Open in Maps',
          dialogMessage: 'Choose your preferred map app',
          cancelText: 'Cancel',
          alwaysIncludeGoogle: true,
        });
      } catch (error) {
        console.error('Error opening maps:', error);
      }
    } else if (branch?.address) {
      // Fallback to address search
      const encodedAddress = encodeURIComponent(branch.address);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(url);
    }
  };

  if (isLoading) {
    return (
      <Screen backgroundColor='inherit'>
        <StatusBar style='dark' />
        <View className='h-screen w-screen items-center justify-center bg-inherit'>
          <LoadingSpinner size='large' />
        </View>
      </Screen>
    );
  }

  if (isError || !branch) {
    return (
      <Screen backgroundColor='inherit'>
        <StatusBar style='dark' />
        <ErrorState
          description={error?.message || t('branchDetail.failedToLoadBranch')}
          onRetry={refetch}
        />
      </Screen>
    );
  }

  const displayData = getBranchDisplayData(branch, currentLanguage);

  return (
    <Screen backgroundColor='#ffffff' safeArea={false} padding={false}>
      <StatusBar style='light' />

      {/* Header with back button - Overlay on image */}
      <View
        className='absolute left-0 right-0 z-10 flex-row items-center justify-between px-4'
        style={{ top: Math.max(insets.top, 12) }}
      >
        <Pressable
          onPress={() => router.back()}
          className='h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md active:opacity-70'
        >
          <Ionicons name='arrow-back' size={24} color='white' />
        </Pressable>

        <View className='flex-row gap-2'>
          <Pressable
            onPress={handleContactPress}
            className='h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md active:opacity-70'
          >
            <Ionicons name='call' size={20} color='white' />
          </Pressable>
          <Pressable
            onPress={handleDirectionsPress}
            className='h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md active:opacity-70'
          >
            <MaterialIcons name='directions' size={20} color='white' />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className='flex-1'
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Image Gallery */}
        <BranchImageGallery
          thumbnail={branch.thumbnail}
          images={branch.images}
        />

        {/* Content Sections */}
        <View className='-mt-4 rounded-t-3xl bg-background-primary pt-6'>
          {/* Branch Info */}
          <BranchInfoSection
            name={displayData.name}
            description={displayData.description}
            address={displayData.address}
            phone={branch.phone}
            rating={branch.rating}
            province={branch.province}
          />

          {/* Location Map Preview */}
          {branch.location && (
            <View className='mb-6'>
              <LocationMapPreview
                location={branch.location as Location}
                label={displayData.name.replace('AHomeVilla', 'M Village')}
                height={200}
              />
            </View>
          )}

          {/* Amenities */}
          {branch.amenities && branch.amenities.length > 0 && (
            <AmenitiesSection amenities={branch.amenities} />
          )}

          {/* Available Rooms */}
          {branch.rooms && branch.rooms.length > 0 && (
            <RoomsSection rooms={branch.rooms} />
          )}

          {/* Nearby Places */}
          {displayData.nearBy && displayData.nearBy.length > 0 && (
            <NearbyPlacesSection nearBy={displayData.nearBy} />
          )}

          {/* Bottom spacing for fixed button */}
          <View className='h-24' />
        </View>
      </ScrollView>

      {/* Fixed Book Now Button */}
      <BookNowButton onPress={handleBookNow} />
    </Screen>
  );
}
