import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View
      style={style}
      className='flex-1 items-center justify-center px-6 py-12'
    >
      {icon && <View className='mb-6'>{icon}</View>}

      <Text className='mb-2 text-center text-xl font-semibold text-neutral-darkest'>
        {title}
      </Text>

      <Text className='mb-8 text-center leading-6 text-neutral-dark'>
        {description}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className='rounded-lg bg-primary-main px-6 py-3 active:bg-primary-dark'
        >
          <Text className='font-medium text-primary-foreground'>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
