import type { Image as ImageType } from '@ahomevilla-hotel/node-sdk';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';

import { cn } from '@/utils/helpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageGalleryModalProps {
  images: ImageType[];
  visible: boolean;
  initialIndex?: number;
  onClose: () => void;
}

/**
 * Reusable fullscreen image gallery modal with dark background
 * Supports swipe gestures, landscape rotation, and fullscreen viewing
 */
export function ImageGalleryModal({
  images,
  visible,
  initialIndex = 0,
  onClose,
}: ImageGalleryModalProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isLandscape, setIsLandscape] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x /
        (isLandscape ? SCREEN_HEIGHT : SCREEN_WIDTH)
    );
    setActiveIndex(slideIndex);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const toggleLandscape = () => {
    setIsLandscape(!isLandscape);
  };

  // Reset state when modal opens
  const handleModalShow = () => {
    setActiveIndex(initialIndex);
    setIsLandscape(false);
    // Scroll to initial index after a small delay to ensure FlatList is ready
    setTimeout(() => {
      if (initialIndex > 0) {
        flatListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }
    }, 100);
  };

  // Get dimensions based on orientation
  const containerWidth = isLandscape ? SCREEN_HEIGHT : SCREEN_WIDTH;
  const containerHeight = isLandscape ? SCREEN_WIDTH : SCREEN_HEIGHT;

  return (
    <Modal
      visible={visible}
      animationType='fade'
      transparent={false}
      onShow={handleModalShow}
      onRequestClose={onClose}
    >
      <StatusBar style='light' />
      <View className='flex-1 items-center justify-center bg-black'>
        <View
          className='bg-black'
          style={{
            transform: [{ rotate: isLandscape ? '90deg' : '0deg' }],
            width: containerWidth,
            height: containerHeight,
          }}
        >
          {/* Header Controls */}
          <View
            className={cn(
              'absolute z-10 bg-black/50',
              isLandscape
                ? 'left-0 right-0 top-0 py-8 pl-16 pr-12'
                : 'left-0 right-0 top-4 px-4 pb-4 pt-12'
            )}
          >
            <View className='flex-row items-center justify-between'>
              {/* Close Button */}
              <Pressable
                onPress={onClose}
                className='h-10 w-10 items-center justify-center rounded-full bg-white/20 active:bg-white/30'
              >
                <Ionicons name='close' size={24} color='white' />
              </Pressable>

              {/* Image Counter */}
              <View className='rounded-full bg-black/70 px-4 py-2'>
                <Text className='text-sm font-medium text-white'>
                  {activeIndex + 1} / {images.length}
                </Text>
              </View>

              {/* Landscape Toggle */}
              <Pressable
                onPress={toggleLandscape}
                className='h-10 w-10 items-center justify-center rounded-full bg-white/20 active:bg-white/30'
              >
                <Ionicons
                  name={isLandscape ? 'contract' : 'expand'}
                  size={24}
                  color='white'
                />
              </Pressable>
            </View>
          </View>

          {/* Image Gallery */}
          <View className='flex-1'>
            <FlatList
              ref={flatListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              keyExtractor={(item, index) => `fullscreen-${item.url}-${index}`}
              getItemLayout={(_, index) => ({
                length: containerWidth,
                offset: containerWidth * index,
                index,
              })}
              onScrollToIndexFailed={() => {
                // Handle scroll failure gracefully
              }}
              renderItem={({ item }) => (
                <View
                  className='items-center justify-center'
                  style={{ width: containerWidth, height: containerHeight }}
                >
                  <Image
                    source={{ uri: item.url }}
                    style={{
                      width: containerWidth,
                      height: containerHeight,
                    }}
                    resizeMode='contain'
                  />
                </View>
              )}
            />
          </View>

          {/* Bottom Controls */}
          {images.length > 1 && (
            <View className='absolute bottom-0 left-0 right-0 bg-black/50 pb-8 pt-4'>
              {/* Image Indicators */}
              <View className='flex-row items-center justify-center gap-2 px-4'>
                {images.map((_, index) => (
                  <Pressable
                    key={index}
                    onPress={() => scrollToIndex(index)}
                    className={`h-1.5 rounded-full ${
                      index === activeIndex
                        ? 'w-8 bg-white'
                        : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
