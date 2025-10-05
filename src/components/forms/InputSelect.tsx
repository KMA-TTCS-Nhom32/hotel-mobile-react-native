import Ionicons from '@expo/vector-icons/Ionicons';
import { clsx } from 'clsx';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { InputSelectProps, SelectOption } from './types';

/**
 * Form-aware select input component with dropdown functionality
 *
 * Usage:
 * ```tsx
 * <FormProvider {...form}>
 *   <InputSelect
 *     name="country"
 *     label="Country"
 *     placeholder="Select a country"
 *     options={countries}
 *     required
 *   />
 * </FormProvider>
 * ```
 */
export const InputSelect = <
  TFieldValues extends Record<string, unknown> = Record<string, unknown>,
>({
  name,
  control,
  label,
  helperText,
  required = false,
  disabled = false,
  placeholder = 'Select...',
  options = [],
  multiple = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  leftIcon,
  containerStyle,
  labelStyle,
  inputStyle,
  modalStyle: _modalStyle,
  optionStyle,
  renderOption,
  maxDropdownHeight = 300,
  allowClear = false,
  emptyComponent,
  testID,
}: InputSelectProps<TFieldValues>) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Get form context if control is not provided
  const formContext = useFormContext<TFieldValues>();
  const formControl = control || formContext?.control;

  // Ensure we have control instance
  if (!formControl) {
    throw new Error(
      `InputSelect: Could not find form control. Make sure to wrap your form in <FormProvider> or pass control prop.`
    );
  }

  // Filter options based on search query
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Get display text for selected value(s)
  const getDisplayText = (value: unknown): string => {
    if (!value) return '';

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return '';
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option?.label || String(value[0]);
      }
      return `${value.length} items selected`;
    }

    const option = options.find(opt => opt.value === value);
    return option?.label || String(value);
  };

  // Handle option selection
  const handleOptionSelect = (
    option: SelectOption<TFieldValues[keyof TFieldValues]>,
    currentValue: unknown,
    onChange: (value: unknown) => void
  ) => {
    if (multiple) {
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      const isSelected = currentArray.includes(option.value);

      if (isSelected) {
        // Remove from selection
        const newValue = currentArray.filter(val => val !== option.value);
        onChange(newValue);
      } else {
        // Add to selection
        onChange([...currentArray, option.value]);
      }
    } else {
      // Single selection
      onChange(option.value);
      setIsModalVisible(false);
      setIsFocused(false);
      setSearchQuery('');
    }
  };

  // Handle clear selection
  const handleClear = (onChange: (value: unknown) => void) => {
    onChange(multiple ? [] : '');
  };

  // Check if option is selected
  const isOptionSelected = (
    option: SelectOption<TFieldValues[keyof TFieldValues]>,
    value: unknown
  ): boolean => {
    if (multiple && Array.isArray(value)) {
      return value.includes(option.value);
    }
    return value === option.value;
  };

  // Render option item
  const renderOptionItem = (
    item: SelectOption<TFieldValues[keyof TFieldValues]>,
    isSelected: boolean,
    onPress: () => void
  ) => {
    if (renderOption) {
      return (
        <TouchableOpacity onPress={onPress} disabled={item.disabled}>
          {renderOption(item as SelectOption, isSelected)}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={optionStyle}
        className={clsx(
          'flex-row items-center px-4 py-3',
          isSelected && 'bg-primary-lightest',
          item.disabled && 'opacity-50'
        )}
        onPress={onPress}
        disabled={item.disabled}
      >
        {item.icon && <View className='mr-3'>{item.icon}</View>}
        <Text
          className={clsx(
            'flex-1 text-base',
            isSelected
              ? 'font-medium text-primary-main'
              : 'text-neutral-darkest'
          )}
        >
          {item.label}
        </Text>
        {multiple && isSelected && (
          <Ionicons name='checkmark' size={20} color='#f97316' />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Controller
      name={name}
      control={formControl}
      render={({
        field: { onChange, value },
        fieldState: { error, isTouched },
      }) => {
        const hasError = !!error;
        const showError = hasError && isTouched;
        const displayText = getDisplayText(value);
        const hasValue = multiple
          ? Array.isArray(value) && value.length > 0
          : value !== undefined && value !== null && value !== '';

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

            {/* Select Input */}
            <TouchableOpacity
              style={inputStyle}
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
              onPress={() => {
                if (!disabled) {
                  setIsModalVisible(true);
                  setIsFocused(true);
                }
              }}
              disabled={disabled}
            >
              {/* Left Icon */}
              {leftIcon && <View className='mr-3'>{leftIcon}</View>}

              {/* Display Text */}
              <Text
                className={clsx(
                  'flex-1 text-base',
                  hasValue ? 'text-neutral-darkest' : 'text-neutral-main'
                )}
                numberOfLines={1}
              >
                {displayText || placeholder}
              </Text>

              {/* Clear Button */}
              {allowClear && hasValue && !disabled && (
                <TouchableOpacity
                  className='mr-2 p-1'
                  onPress={() => handleClear(onChange)}
                >
                  <Ionicons name='close-circle' size={18} color='#9CA3AF' />
                </TouchableOpacity>
              )}

              {/* Dropdown Arrow */}
              <Ionicons
                name={isModalVisible ? 'chevron-up' : 'chevron-down'}
                size={20}
                color='#6B7280'
              />
            </TouchableOpacity>

            {/* Error/Helper Text */}
            {(showError || helperText) && (
              <Text
                className={clsx(
                  'mt-1 text-xs',
                  showError ? 'text-error-main' : 'text-neutral-dark'
                )}
              >
                {showError ? error.message : helperText}
              </Text>
            )}

            {/* Dropdown Modal */}
            <Modal
              visible={isModalVisible}
              transparent
              animationType='fade'
              onRequestClose={() => {
                setIsModalVisible(false);
                setIsFocused(false);
                setSearchQuery('');
              }}
            >
              <TouchableOpacity
                className='flex-1 bg-black/50'
                activeOpacity={1}
                onPress={() => {
                  setIsModalVisible(false);
                  setIsFocused(false);
                  setSearchQuery('');
                }}
              >
                <View className='mx-4 mt-20 max-h-[80%] rounded-lg bg-white shadow-lg'>
                  {/* Modal Header with Search */}
                  <View className='border-b border-neutral-light px-4 py-3'>
                    {searchable ? (
                      <TextInput
                        className='text-base text-neutral-darkest'
                        placeholder={searchPlaceholder}
                        placeholderTextColor='#9CA3AF'
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                      />
                    ) : (
                      <Text className='text-center text-lg font-medium text-neutral-darkest'>
                        {label || 'Select Option'}
                      </Text>
                    )}
                  </View>

                  {/* Options List */}
                  <View style={{ maxHeight: maxDropdownHeight }}>
                    {filteredOptions.length > 0 ? (
                      <FlatList
                        data={filteredOptions}
                        keyExtractor={item => String(item.value)}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) =>
                          renderOptionItem(
                            item,
                            isOptionSelected(item, value),
                            () => handleOptionSelect(item, value, onChange)
                          )
                        }
                      />
                    ) : (
                      <View className='py-8'>
                        {emptyComponent || (
                          <Text className='text-center text-neutral-main'>
                            {searchQuery
                              ? 'No options found'
                              : 'No options available'}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Modal Footer */}
                  {multiple && (
                    <View className='border-t border-neutral-light px-4 py-3'>
                      <TouchableOpacity
                        className='rounded-lg bg-primary-main py-2'
                        onPress={() => {
                          setIsModalVisible(false);
                          setIsFocused(false);
                          setSearchQuery('');
                        }}
                      >
                        <Text className='text-center font-medium text-white'>
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        );
      }}
    />
  );
};
