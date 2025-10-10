import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type SegmentValue = {
  label: string;
  value: string;
};

type SegmentedControlProps = {
  values: SegmentValue[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
};

export const SegmentedControl = ({
  values,
  selectedValue,
  onChange,
  className = '',
}: SegmentedControlProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={`mb-2 ${className}`}
    >
      <View className="flex-row bg-neutral-lightest rounded-lg p-1">
        {values.map((item) => {
          const isSelected = item.value === selectedValue;
          return (
            <TouchableOpacity
              key={item.value}
              onPress={() => onChange(item.value)}
              className={`px-4 py-2 rounded-md ${
                isSelected ? 'bg-white shadow' : 'bg-transparent'
              }`}
              style={isSelected ? { elevation: 2 } : {}}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected ? 'text-primary-main' : 'text-neutral-dark'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};