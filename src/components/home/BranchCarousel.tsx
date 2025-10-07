import type { Branch } from '@ahomevilla-hotel/node-sdk';
import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import { BranchCard } from '@/components/home/BranchCard';
import { useCommonTranslation, useLanguage } from '@/i18n/hooks';

interface BranchCarouselProps {
  branches: Branch[];
  onBranchPress?: (branch: Branch) => void;
}

export const BranchCarousel: React.FC<BranchCarouselProps> = ({
  branches,
  onBranchPress,
}) => {
  const { t } = useCommonTranslation();
  const { currentLanguage } = useLanguage();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const CARD_WIDTH = SCREEN_WIDTH * 0.85;
  const CARD_HEIGHT = 200;

  if (!branches || branches.length === 0) {
    return null;
  }

  return (
    <View className='py-4'>
      <View className='mb-4 px-4'>
        <Text className='text-lg font-bold text-neutral-darkest'>
          {t('home.latestBranches')}
        </Text>
        <Text className='text-sm text-neutral-dark'>
          {t('home.discoverLocations')}
        </Text>
      </View>

      <Carousel
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        data={branches}
        renderItem={({ item }) => (
          <View className='mx-2'>
            <BranchCard
              branch={item}
              onPress={onBranchPress}
              height={CARD_HEIGHT}
              lng={currentLanguage}
            />
          </View>
        )}
        loop={branches.length > 1}
        autoPlay={branches.length > 1}
        autoPlayInterval={5000}
        style={{ width: SCREEN_WIDTH }}
        mode='parallax'
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
      />
    </View>
  );
};
