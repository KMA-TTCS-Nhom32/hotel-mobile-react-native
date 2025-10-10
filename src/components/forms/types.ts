import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import type { TextInputProps, ViewStyle, TextStyle } from 'react-native';

/**
 * Base props for all form components
 * Extends React Hook Form Controller requirements
 */
export interface BaseFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  /**
   * Field name - must match the field name in your Zod schema
   */
  name: TName;

  /**
   * React Hook Form control instance
   * Usually obtained from useFormContext()
   */
  control?: Control<TFieldValues>;

  /**
   * Field label displayed above the input
   */
  label?: string;

  /**
   * Helper text displayed below the input
   */
  helperText?: string;

  /**
   * Whether the field is required
   * Will show asterisk (*) in label
   */
  required?: boolean;

  /**
   * Whether the field is disabled
   */
  disabled?: boolean;

  /**
   * Container style for the entire field wrapper
   */
  containerStyle?: ViewStyle;

  /**
   * Style for the label text
   */
  labelStyle?: TextStyle;

  /**
   * Additional test ID for testing purposes
   */
  testID?: string;
}

/**
 * Props for InputText component
 */
export interface InputTextProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName>,
    Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'style'> {
  /**
   * Input placeholder text
   */
  placeholder?: string;

  /**
   * Whether this is a password input
   */
  isPassword?: boolean;

  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon component (will be overridden by password toggle if isPassword=true)
   */
  rightIcon?: React.ReactNode;

  /**
   * Style for the TextInput component
   */
  inputStyle?: TextStyle;

  /**
   * Whether to show character count
   */
  showCharCount?: boolean;

  /**
   * Maximum character count (for showCharCount)
   */
  maxLength?: number;
}

/**
 * Props for InputTextarea component
 */
export interface InputTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName>,
    Omit<
      TextInputProps,
      'value' | 'onChangeText' | 'onBlur' | 'style' | 'multiline'
    > {
  /**
   * Input placeholder text
   */
  placeholder?: string;

  /**
   * Number of rows (lines) for the textarea
   */
  rows?: number;

  /**
   * Style for the TextInput component
   */
  inputStyle?: TextStyle;

  /**
   * Whether to show character count
   */
  showCharCount?: boolean;

  /**
   * Maximum character count
   */
  maxLength?: number;
}

/**
 * Option for select components
 */
export interface SelectOption<T = string> {
  /**
   * Display label for the option
   */
  label: string;

  /**
   * Value stored when this option is selected
   */
  value: T;

  /**
   * Whether this option is disabled
   */
  disabled?: boolean;

  /**
   * Optional icon for the option
   */
  icon?: React.ReactNode;

  /**
   * Additional data for the option
   */
  data?: Record<string, unknown>;
}

/**
 * Props for InputSelect component
 */
export interface InputSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  /**
   * Array of selectable options
   */
  options: SelectOption<TFieldValues[TName]>[];

  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;

  /**
   * Whether multiple selections are allowed
   */
  multiple?: boolean;

  /**
   * Whether the select is searchable/filterable
   */
  searchable?: boolean;

  /**
   * Search placeholder text
   */
  searchPlaceholder?: string;

  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;

  /**
   * Style for the select input container
   */
  inputStyle?: ViewStyle;

  /**
   * Style for the dropdown modal
   */
  modalStyle?: ViewStyle;

  /**
   * Style for individual option items
   */
  optionStyle?: ViewStyle;

  /**
   * Custom render function for options
   */
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;

  /**
   * Maximum height for the dropdown list
   */
  maxDropdownHeight?: number;

  /**
   * Whether to show a "Clear" option
   */
  allowClear?: boolean;

  /**
   * Custom empty state component when no options available
   */
  emptyComponent?: React.ReactNode;
}

/**
 * Common form validation rules
 */
export interface FormValidationRules {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
}

/**
 * Form field state interface
 */
export interface FieldState {
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  error?: {
    type: string;
    message?: string;
  };
}
