import { Pressable, Text, View } from 'react-native';

interface SelectionBadgeProps {
  label: string;
  value: string | number;
  subLabel?: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onPress: () => void;
}

/**
 * Reusable selection badge for duration, options, etc.
 * Similar to amenity badge but interactive and slightly bigger
 */
export function SelectionBadge({
  label,
  value,
  subLabel,
  isSelected,
  isDisabled = false,
  onPress,
}: SelectionBadgeProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`min-w-[90px] flex-1 rounded-xl border-2 px-4 py-3 ${
        isDisabled
          ? 'border-neutral-light bg-neutral-lighter'
          : isSelected
            ? 'border-primary-main bg-primary-lighter'
            : 'border-neutral-main bg-background-primary active:border-primary-light active:bg-primary-lighter/50'
      }`}
    >
      <View className='items-center gap-1'>
        <Text
          className={`text-xl font-bold ${
            isDisabled
              ? 'text-text-tertiary'
              : isSelected
                ? 'text-primary-main'
                : 'text-text-primary'
          }`}
        >
          {value}
        </Text>
        <Text
          className={`text-sm ${
            isDisabled
              ? 'text-text-tertiary'
              : isSelected
                ? 'text-primary-main'
                : 'text-text-secondary'
          }`}
        >
          {label}
        </Text>
        {subLabel && (
          <Text
            className={`text-xs ${
              isDisabled
                ? 'text-text-tertiary'
                : isSelected
                  ? 'text-primary-dark'
                  : 'text-text-tertiary'
            }`}
          >
            {subLabel}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

interface SelectionBadgeListProps {
  items: {
    value: number;
    label: string;
    subLabel?: string;
    disabled?: boolean;
  }[];
  selectedValue?: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
}

/**
 * List of selection badges in a flex-wrap layout
 */
export function SelectionBadgeList({
  items,
  selectedValue,
  onSelect,
  disabled = false,
}: SelectionBadgeListProps) {
  return (
    <View className='flex-row flex-wrap gap-2'>
      {items.map(item => (
        <SelectionBadge
          key={item.value}
          value={item.value}
          label={item.label}
          subLabel={item.subLabel}
          isSelected={item.value === selectedValue}
          isDisabled={disabled || item.disabled}
          onPress={() => onSelect(item.value)}
        />
      ))}
    </View>
  );
}
