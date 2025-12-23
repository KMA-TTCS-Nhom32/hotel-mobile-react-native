import Ionicons from '@expo/vector-icons/Ionicons';
import { clsx } from 'clsx';
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  inputStyle,
  labelStyle,
  required = false,
  ...textInputProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={containerStyle} className='mb-4'>
      {label && (
        <Text
          style={labelStyle}
          className={clsx(
            'mb-2 text-sm font-medium text-neutral-darkest',
            error && 'text-error-main'
          )}
        >
          {label}
          {required && <Text className='text-error-main'> *</Text>}
        </Text>
      )}

      <View
        className={clsx(
          'flex-row items-center rounded-lg border bg-white px-3 py-3',
          isFocused ? 'border-primary-main' : 'border-neutral-light',
          error && 'border-error-main'
        )}
      >
        {leftIcon && <View className='mr-3'>{leftIcon}</View>}

        <TextInput
          {...textInputProps}
          style={[{ flex: 1, fontSize: 16, color: '#374151' }, inputStyle]}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={e => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          placeholderTextColor='#9CA3AF'
        />

        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility} className='ml-3'>
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color='#64748b'
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && <View className='ml-3'>{rightIcon}</View>}
      </View>

      {(error || helperText) && (
        <Text
          className={clsx(
            'mt-1 text-xs',
            error ? 'text-error-main' : 'text-neutral-dark'
          )}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};
