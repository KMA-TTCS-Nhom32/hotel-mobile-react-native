import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
  backgroundColor?: string;
  showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  style,
  backgroundColor = 'white',
  showBackButton = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          backgroundColor,
          paddingTop: insets.top,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        style,
      ]}
    >
      <View className='flex-row items-center justify-between'>
        <View className='flex-1 flex-row items-center'>
          {(leftIcon || showBackButton) && (
            <TouchableOpacity
              onPress={onLeftPress}
              className='-ml-2 mr-3 p-2'
              disabled={!onLeftPress}
            >
              {leftIcon ||
                (showBackButton && (
                  <Text className='text-lg text-orange-500'>←</Text>
                ))}
            </TouchableOpacity>
          )}

          <View className='flex-1'>
            <Text
              className='text-lg font-semibold text-neutral-900'
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text className='text-sm text-neutral-600' numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            className='-mr-2 ml-3 p-2'
            disabled={!onRightPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
