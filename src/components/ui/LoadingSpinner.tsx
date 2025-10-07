import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
  variant?: 'default' | 'modern';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#fb923c',
  text = 'Loading...',
  style,
  fullScreen = false,
  variant = 'modern',
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const containerClass = fullScreen
    ? 'flex-1 items-center justify-center'
    : 'items-center justify-center py-8';

  // Custom size mappings
  const spinnerSize = size === 'large' ? 32 : 24;
  const borderWidth = size === 'large' ? 3 : 2;

  if (variant === 'modern') {
    return (
      <View
        style={[style, { backgroundColor: 'inherit' }]}
        className={containerClass}
      >
        <View className='items-center justify-center rounded-full bg-white p-6 shadow-lg'>
          {/* Custom circular spinner */}
          <Animated.View
            style={{
              width: spinnerSize,
              height: spinnerSize,
              borderWidth,
              borderColor: color,
              borderTopColor: 'transparent',
              borderRadius: spinnerSize / 2,
              transform: [{ rotate: spin }],
            }}
          />
        </View>
        {text && (
          <Text
            className='mt-4 text-center text-sm font-medium'
            style={{ color: '#c2410c' }}
          >
            {text}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      style={[style, { backgroundColor: '#fef7ed' }]}
      className={containerClass}
    >
      <Animated.View
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          borderRadius: spinnerSize / 2,
          transform: [{ rotate: spin }],
        }}
      />
      {text && (
        <Text className='mt-3 text-center' style={{ color: '#64748b' }}>
          {text}
        </Text>
      )}
    </View>
  );
};
