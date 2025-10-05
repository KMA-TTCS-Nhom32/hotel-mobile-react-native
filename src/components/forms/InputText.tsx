import AntDesign from '@expo/vector-icons/AntDesign';
import { clsx } from 'clsx';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import type { InputTextProps } from './types';

/**
 * Form-aware text input component that integrates with React Hook Form
 *
 * Usage:
 * ```tsx
 * <FormProvider {...form}>
 *   <InputText
 *     name="email"
 *     label="Email Address"
 *     placeholder="Enter your email"
 *     required
 *   />
 * </FormProvider>
 * ```
 */
export const InputText = <
  TFieldValues extends Record<string, unknown> = Record<string, unknown>,
>({
  name,
  control,
  label,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  isPassword = false,
  leftIcon,
  rightIcon,
  containerStyle,
  labelStyle,
  inputStyle,
  showCharCount = false,
  maxLength,
  testID,
  ...textInputProps
}: InputTextProps<TFieldValues>) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Get form context if control is not provided
  const formContext = useFormContext<TFieldValues>();
  const formControl = control || formContext?.control;

  // Ensure we have control instance
  if (!formControl) {
    throw new Error(
      `InputText: Could not find form control. Make sure to wrap your form in <FormProvider> or pass control prop.`
    );
  }

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <Controller
      name={name}
      control={formControl}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error, isTouched },
      }) => {
        const hasError = !!error;
        const showError = hasError && isTouched;
        const currentValue = String(value || '');
        const charCount = currentValue.length;

        return (
          <View style={containerStyle} testID={testID}>
            {/* Label */}
            {label && (
              <Text
                style={labelStyle}
                className={clsx(
                  'mb-2 text-sm font-medium text-neutral-darkest',
                  showError && 'text-error-main'
                )}
              >
                {label}
                {required && <Text className='text-error-main'> *</Text>}
              </Text>
            )}

            {/* Input Container */}
            <View
              className={clsx(
                'flex-row items-center rounded-lg border bg-white px-3 py-3',
                // Focus state
                isFocused && !showError && 'border-primary-main',
                // Error state
                showError && 'border-error-main',
                // Default state
                !isFocused && !showError && 'border-neutral-light',
                // Disabled state
                disabled && 'bg-neutral-lighter opacity-60'
              )}
            >
              {/* Left Icon */}
              {leftIcon && <View className='mr-3'>{leftIcon}</View>}

              {/* Text Input */}
              <TextInput
                {...textInputProps}
                style={[
                  {
                    flex: 1,
                    fontSize: 16,
                    color: disabled ? '#9CA3AF' : '#374151',
                    minHeight: 20,
                  },
                  inputStyle,
                ]}
                value={currentValue}
                onChangeText={onChange}
                onBlur={onBlur}
                onFocus={e => {
                  setIsFocused(true);
                  textInputProps.onFocus?.(e);
                }}
                placeholder={placeholder}
                placeholderTextColor='#9CA3AF'
                editable={!disabled}
                secureTextEntry={isPassword && !isPasswordVisible}
                maxLength={maxLength}
                autoComplete={
                  isPassword ? 'password' : textInputProps.autoComplete
                }
                textContentType={
                  isPassword ? 'password' : textInputProps.textContentType
                }
              />

              {/* Password Toggle */}
              {isPassword && (
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  className='ml-3'
                  disabled={disabled}
                >
                  {/* <Text
                    className={clsx(
                      'text-sm font-medium',
                      disabled ? 'text-neutral-main' : 'text-primary-main'
                    )}
                  >
                    {isPasswordVisible ? 'Hide' : 'Show'}
                  </Text> */}
                  {isPasswordVisible ? (
                    <AntDesign name='eye' size={24} color='#f97316' />
                  ) : (
                    <AntDesign name='eye-invisible' size={24} color='#f97316' />
                  )}
                </TouchableOpacity>
              )}

              {/* Right Icon (only if not password) */}
              {rightIcon && !isPassword && (
                <View className='ml-3'>{rightIcon}</View>
              )}
            </View>

            {/* Bottom Section: Error, Helper Text, Character Count */}
            <View className='mt-1 flex-row items-center justify-between'>
              <View className='flex-1'>
                {/* Error Message */}
                {showError ? (
                  <Text className='text-xs text-error-main'>
                    {error.message}
                  </Text>
                ) : helperText ? (
                  /* Helper Text */
                  <Text className='text-xs text-neutral-dark'>
                    {helperText}
                  </Text>
                ) : null}
              </View>

              {/* Character Count */}
              {showCharCount && maxLength && (
                <Text
                  className={clsx(
                    'ml-2 text-xs',
                    charCount > maxLength * 0.9
                      ? 'text-warning-main'
                      : 'text-neutral-main'
                  )}
                >
                  {charCount}/{maxLength}
                </Text>
              )}
            </View>
          </View>
        );
      }}
    />
  );
};
