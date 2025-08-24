import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ErrorStateProps {
  title?: string;
  description: string;
  actionLabel?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description,
  actionLabel = 'Try again',
  onRetry,
  style,
}) => {
  return (
    <View
      style={style}
      className='flex-1 items-center justify-center px-6 py-12'
    >
      <View className='mb-6 h-16 w-16 items-center justify-center rounded-full bg-error-lightest'>
        <Text className='text-2xl text-error-main'>⚠️</Text>
      </View>

      <Text className='mb-2 text-center text-xl font-semibold text-neutral-darkest'>
        {title}
      </Text>

      <Text className='mb-8 text-center leading-6 text-neutral-dark'>
        {description}
      </Text>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className='rounded-lg bg-error-main px-6 py-3 active:bg-error-dark'
        >
          <Text className='font-medium text-error-foreground'>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
