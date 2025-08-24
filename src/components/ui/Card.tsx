import { clsx } from 'clsx';
import React from 'react';
import { Text, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  style,
  className,
  variant = 'default',
  padding = 'md',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'outlined':
        return 'border border-neutral-light bg-background-primary';
      case 'elevated':
        return 'bg-background-primary shadow-md shadow-black/10';
      default:
        return 'bg-background-primary';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  return (
    <View
      style={style}
      className={clsx(
        'rounded-xl',
        getVariantClasses(),
        getPaddingClasses(),
        className
      )}
    >
      {(title || subtitle) && (
        <View className='mb-3'>
          {title && (
            <Text className='mb-1 text-lg font-semibold text-text-primary'>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className='text-sm text-text-secondary'>{subtitle}</Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
};
