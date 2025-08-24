import React from 'react';
import { ActivityIndicator, Text, View, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#ea580c', // primary-dark color
  text = 'Loading...',
  style,
  fullScreen = false,
}) => {
  const containerClass = fullScreen
    ? 'flex-1 items-center justify-center bg-white'
    : 'items-center justify-center py-8';

  return (
    <View style={style} className={containerClass}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className='mt-3 text-center text-neutral-dark'>{text}</Text>
      )}
    </View>
  );
};
