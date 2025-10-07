import type { Image as ImageType } from '@ahomevilla-hotel/node-sdk';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';

import { ImageGalleryModal } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 320;

interface BranchImageGalleryProps {
  thumbnail: ImageType | null;
  images: ImageType[];
}

/**
 * Image gallery with swipeable images and indicators
 */
export function BranchImageGallery({
  thumbnail,
  images,
}: BranchImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Combine thumbnail and images
  const allImages = thumbnail
    ? [thumbnail, ...images.filter(img => img.url !== thumbnail.url)]
    : images;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    setActiveIndex(slideIndex);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const openGalleryModal = () => {
    setIsModalVisible(true);
  };

  const closeGalleryModal = () => {
    setIsModalVisible(false);
  };

  if (allImages.length === 0) {
    return (
      <View className='bg-background-tertiary' style={{ height: IMAGE_HEIGHT }}>
        <View className='flex-1 items-center justify-center'>
          <Text className='text-base text-text-secondary'>
            No images available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ height: IMAGE_HEIGHT }}>
      {/* Swipeable Image Gallery */}
      <FlatList
        ref={flatListRef}
        data={allImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        renderItem={({ item }) => (
          <Pressable onPress={openGalleryModal}>
            <View style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}>
              <Image
                source={{ uri: item.url }}
                style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}
                resizeMode='cover'
              />
              {/* Gradient Overlay */}
              <View className='absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60' />
            </View>
          </Pressable>
        )}
      />

      {/* Expand Icon Hint */}
      <Pressable onPress={openGalleryModal}>
        <View className='absolute bottom-6 left-4 rounded-full bg-black/50 p-2'>
          <Ionicons name='expand' size={20} color='white' />
        </View>
      </Pressable>

      {/* Image Indicators */}
      {allImages.length > 1 && (
        <View className='absolute bottom-6 left-0 right-0 flex-row items-center justify-center gap-2'>
          {allImages.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => scrollToIndex(index)}
              className={`h-1.5 rounded-full ${
                index === activeIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </View>
      )}

      {/* Image Counter */}
      <View className='absolute bottom-6 right-4 rounded-full bg-black/50 px-3 py-1.5'>
        <Text className='text-xs font-medium text-white'>
          {activeIndex + 1} / {allImages.length}
        </Text>
      </View>

      {/* Fullscreen Image Gallery Modal */}
      <ImageGalleryModal
        images={allImages}
        visible={isModalVisible}
        initialIndex={activeIndex}
        onClose={closeGalleryModal}
      />
    </View>
  );
}
