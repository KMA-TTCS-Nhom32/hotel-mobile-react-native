/**
 * Promotion Section Component
 * Displays promotion/discount code input (static UI for now)
 */

import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

interface PromotionSectionProps {
  promotionCode?: string;
  onApply: (code: string) => void;
}

export const PromotionSection: React.FC<PromotionSectionProps> = ({
  promotionCode,
  onApply,
}) => {
  const [code, setCode] = React.useState(promotionCode || '');
  const [isApplied, setIsApplied] = React.useState(false);

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim());
      setIsApplied(true);
    }
  };

  const handleRemove = () => {
    setCode('');
    setIsApplied(false);
    onApply('');
  };

  return (
    <View className='rounded-2xl border border-neutral-light bg-white p-4'>
      <Text className='mb-3 text-base font-semibold text-neutral-darkest'>
        Promotion Code
      </Text>

      <View className='flex-row gap-2'>
        <View className='flex-1 flex-row items-center rounded-lg border border-neutral-light bg-white px-3'>
          <AntDesign name='tag' size={18} color='#9CA3AF' />
          <TextInput
            value={code}
            onChangeText={text => {
              setCode(text);
              setIsApplied(false);
            }}
            placeholder='Enter promotion code'
            placeholderTextColor='#9CA3AF'
            className='ml-2 flex-1 py-3 text-base text-neutral-darkest'
            autoCapitalize='characters'
            editable={!isApplied}
          />
          {isApplied && (
            <Pressable onPress={handleRemove} className='ml-2'>
              <AntDesign name='close-circle' size={18} color='#9CA3AF' />
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={isApplied ? handleRemove : handleApply}
          disabled={!code.trim() && !isApplied}
          className='rounded-lg bg-primary-main px-6 py-3 active:opacity-80 disabled:opacity-50'
        >
          <Text className='font-semibold text-white'>
            {isApplied ? 'Remove' : 'Apply'}
          </Text>
        </Pressable>
      </View>

      {isApplied && (
        <View className='mt-3 flex-row items-center gap-2 rounded-lg bg-success-lighter p-3'>
          <AntDesign name='check-circle' size={16} color='#10b981' />
          <Text className='text-sm text-success-dark'>
            Promotion code applied successfully
          </Text>
        </View>
      )}
    </View>
  );
};
