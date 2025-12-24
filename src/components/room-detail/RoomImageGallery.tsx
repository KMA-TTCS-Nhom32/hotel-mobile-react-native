import type { Image as ImageType } from '@ahomevilla-hotel/node-sdk';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';

import { ImageGalleryModal } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 350;

interface RoomImageGalleryProps {
  thumbnail: ImageType;
  images: ImageType[];
}

/**
 * Room image gallery component with horizontal scrolling and fullscreen modal
 */
export function RoomImageGallery({ thumbnail, images }: RoomImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Combine thumbnail with images, ensuring thumbnail is first if not already in images
  const allImages = [
    thumbnail,
    ...images.filter(img => img.url !== thumbnail.url),
  ];

  const renderImage: ListRenderItem<ImageType> = ({ item }) => (
    <Pressable
      onPress={() => setIsModalVisible(true)}
      className='active:opacity-90'
    >
      <Image
        source={{ uri: item.url }}
        style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}
        contentFit='cover'
        transition={200}
      />
    </Pressable>
  );

  const onScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    setActiveIndex(slideIndex);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <View className='relative'>
        <FlatList
          data={allImages}
          renderItem={renderImage}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={false}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Image Counter - Bottom Right */}
        <View className='absolute bottom-6 right-4 rounded-full bg-black/60 px-3 py-1.5'>
          <Text className='text-xs font-medium text-white'>
            {activeIndex + 1} / {allImages.length}
          </Text>
        </View>

        {/* Expand Icon Hint - Top Right */}
        <Pressable onPress={() => setIsModalVisible(true)}>
          <View className='absolute bottom-6 left-4 rounded-full bg-black/30 p-2 backdrop-blur-md'>
            <MaterialIcons name='fullscreen' size={24} color='white' />
          </View>
        </Pressable>

        {/* Pagination Dots - Bottom Center (only if more than 1 image) */}
        {allImages.length > 1 && (
          <View className='absolute bottom-6 left-0 right-0 flex-row justify-center gap-1.5'>
            {allImages.map((_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full ${
                  index === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </View>
        )}
      </View>

      {/* Fullscreen Modal */}
      <ImageGalleryModal
        visible={isModalVisible}
        images={allImages}
        initialIndex={activeIndex}
        onClose={handleCloseModal}
      />
    </>
  );
}
