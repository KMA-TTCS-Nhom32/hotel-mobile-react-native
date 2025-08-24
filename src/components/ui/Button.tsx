import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import React from 'react';
import {
  ActivityIndicator,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-lg px-4 py-3',
  {
    variants: {
      variant: {
        primary: 'bg-primary-main active:bg-primary-dark',
        secondary: 'bg-secondary-lighter active:bg-secondary-light',
        outline:
          'border border-primary-main bg-transparent active:bg-primary-lightest',
        ghost: 'bg-transparent active:bg-neutral-lighter',
        danger: 'bg-error-main active:bg-error-dark',
        luxury: 'bg-luxury-main active:bg-luxury-dark',
      },
      size: {
        sm: 'px-3 py-2',
        md: 'px-4 py-3',
        lg: 'px-6 py-4',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

const textVariants = cva('text-center font-medium', {
  variants: {
    variant: {
      primary: 'text-primary-foreground',
      secondary: 'text-secondary-darkest',
      outline: 'text-primary-main',
      ghost: 'text-neutral-darkest',
      danger: 'text-error-foreground',
      luxury: 'text-luxury-foreground',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant,
  size,
  fullWidth,
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        style,
        {
          opacity: isDisabled ? 0.6 : 1,
        },
      ]}
      className={clsx(buttonVariants({ variant, size, fullWidth }))}
      activeOpacity={0.8}
    >
      {leftIcon && !loading && <View className='mr-2'>{leftIcon}</View>}

      {loading ? (
        <ActivityIndicator
          size='small'
          color={
            variant === 'primary' || variant === 'danger' ? 'white' : '#374151'
          }
        />
      ) : (
        <>
          <Text
            style={textStyle}
            className={clsx(textVariants({ variant, size }))}
          >
            {title}
          </Text>
          {rightIcon && <View className='ml-2'>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};
