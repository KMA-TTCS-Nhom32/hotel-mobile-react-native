import type { Branch } from '@ahomevilla-hotel/node-sdk';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BranchCarousel } from '@/components/home/BranchCarousel';
import { ProvinceSection } from '@/components/home/ProvinceSection';
import { SearchBar } from '@/components/home/SearchBar';
import { useLatestBranches } from '@/hooks/useBranches';
import { useCommonTranslation } from '@/i18n/hooks';

const STICKY_THRESHOLD = 80;

export default function HomeScreen() {
  const { t } = useCommonTranslation();
  const [isSticky, setIsSticky] = useState(false);
  const scrollY = new Animated.Value(0);

  // Fetch latest branches
  const {
    data: latestBranches,
    isLoading,
    isError,
    error,
    refetch,
  } = useLatestBranches();

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: { nativeEvent: { contentOffset: { y: number } } }) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsSticky(offsetY > STICKY_THRESHOLD);
      },
    }
  );

  const handleBranchPress = (branch: Branch) => {
    console.log('Branch pressed:', branch.name);
    // TODO: Navigate to branch details
  };

  const handleSearchPress = () => {
    console.log('Search pressed');
    // TODO: Navigate to search screen
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isSticky ? 'bg-background-secondary' : 'bg-primary-main'}`}
      edges={['top']}
    >
      {/* Status Bar - changes style based on scroll position */}
      <StatusBar style={isSticky ? 'dark' : 'light'} />

      {/* Sticky Search Bar */}
      {isSticky && (
        <View className='pt-safe absolute left-0 right-0 top-0 z-10 bg-background-secondary'>
          <SearchBar onPress={handleSearchPress} isSticky />
        </View>
      )}

      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        // bounces={false}
        // overScrollMode='never'
        contentContainerStyle={{
          paddingTop: isSticky ? 60 : 0,
          flexGrow: 1,
        }}
      >
        {/* Search Bar Section */}
        <View className='bg-primary-main'>
          <SearchBar onPress={handleSearchPress} />
        </View>

        {/* Body Content with Rounded Top */}
        <View className='flex-1 rounded-t-3xl bg-background-secondary pt-4'>
          {/* Latest Branches Section */}
          <View className='mt-4'>
            {isLoading ? (
              <View className='items-center py-8'>
                <ActivityIndicator size='large' color='#f97316' />
                <Text className='mt-2 text-sm text-neutral-dark'>
                  {t('home.loadingBranches')}
                </Text>
              </View>
            ) : isError ? (
              <View className='items-center px-4 py-8'>
                <Ionicons
                  name='alert-circle-outline'
                  size={48}
                  color='#ef4444'
                />
                <Text className='mt-2 text-center text-sm text-neutral-dark'>
                  {error?.message || t('home.failedToLoadBranches')}
                </Text>
                <Text
                  className='mt-4 text-sm font-medium text-primary-main'
                  onPress={() => refetch()}
                >
                  {t('home.tapToRetry')}
                </Text>
              </View>
            ) : latestBranches && latestBranches.length > 0 ? (
              <BranchCarousel
                branches={latestBranches}
                onBranchPress={handleBranchPress}
              />
            ) : (
              <View className='items-center py-8'>
                <Ionicons name='business-outline' size={48} color='#a3a3a3' />
                <Text className='mt-2 text-sm text-neutral-dark'>
                  {t('home.noBranchesAvailable')}
                </Text>
              </View>
            )}
          </View>

          {/* Province Section */}
          <ProvinceSection onBranchPress={handleBranchPress} />

          {/* Bottom Padding */}
          <View className='pb-8' />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
