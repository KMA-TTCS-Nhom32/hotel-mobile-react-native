import { clsx } from 'clsx';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

import type { InputTextareaProps } from './types';

/**
 * Form-aware textarea component that integrates with React Hook Form
 *
 * Usage:
 * ```tsx
 * <FormProvider {...form}>
 *   <InputTextarea
 *     name="description"
 *     label="Description"
 *     placeholder="Enter description"
 *     rows={4}
 *   />
 * </FormProvider>
 * ```
 */
export const InputTextarea = <
  TFieldValues extends Record<string, unknown> = Record<string, unknown>,
>({
  name,
  control,
  label,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  rows = 4,
  containerStyle,
  labelStyle,
  inputStyle,
  showCharCount = true,
  maxLength = 500,
  testID,
  ...textInputProps
}: InputTextareaProps<TFieldValues>) => {
  const [isFocused, setIsFocused] = useState(false);

  // Get form context if control is not provided
  const formContext = useFormContext<TFieldValues>();
  const formControl = control || formContext?.control;

  // Ensure we have control instance
  if (!formControl) {
    throw new Error(
      `InputTextarea: Could not find form control. Make sure to wrap your form in <FormProvider> or pass control prop.`
    );
  }

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

            {/* Textarea Container */}
            <View
              className={clsx(
                'rounded-lg border bg-white px-3 py-3',
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
              <TextInput
                {...textInputProps}
                style={[
                  {
                    fontSize: 16,
                    color: disabled ? '#9CA3AF' : '#374151',
                    minHeight: rows * 20,
                    textAlignVertical: 'top',
                  },
                  inputStyle,
                ]}
                value={currentValue}
                onChangeText={onChange}
                onBlur={() => {
                  setIsFocused(false);
                  onBlur();
                }}
                onFocus={e => {
                  setIsFocused(true);
                  textInputProps.onFocus?.(e);
                }}
                placeholder={placeholder}
                placeholderTextColor='#9CA3AF'
                editable={!disabled}
                multiline
                numberOfLines={rows}
                maxLength={maxLength}
              />
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
