import type { Branch, Province } from '@ahomevilla-hotel/node-sdk';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { BranchCard } from '@/components/home/BranchCard';
import { useBranchesByProvince } from '@/hooks/useBranches';
import { useProvinces } from '@/hooks/useProvinces';
import { useCommonTranslation, useLanguage } from '@/i18n/hooks';
import { findTranslation } from '@/utils/translations';

interface ProvinceSectionProps {
  onBranchPress?: (branch: Branch) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32; // Full width with padding

/**
 * Get province display name from translations
 * Backend returns translations array with only the requested language (from accept-language header)
 */
const getProvinceName = (province: Province, lng: string): string => {
  const translation = findTranslation(province.translations, lng);

  return translation?.name || province.name;
};

/**
 * Province section component
 * Displays provinces as horizontal chips, and branches for selected province
 */
export const ProvinceSection: React.FC<ProvinceSectionProps> = ({
  onBranchPress,
}) => {
  const { t } = useCommonTranslation();
  const { currentLanguage } = useLanguage();
  const [selectedProvinceSlug, setSelectedProvinceSlug] = useState<
    string | null
  >(null);

  // Fetch provinces (all in one page since there are typically few provinces)
  const {
    data: provincesData,
    isLoading: provincesLoading,
    isError: provincesError,
    refetch: refetchProvinces,
  } = useProvinces(1, 100);

  // Fetch branches for selected province
  const {
    data: branchesData,
    isLoading: branchesLoading,
    isError: branchesError,
    refetch: refetchBranches,
  } = useBranchesByProvince(selectedProvinceSlug || '');

  console.log(
    'branchesData',
    branchesData?.data.map(branch => branch.province.name)
  );

  const provinces = useMemo(
    () => provincesData?.data || [],
    [provincesData?.data]
  );
  const branches = useMemo(
    () => branchesData?.data || [],
    [branchesData?.data]
  );
  const selectedProvince = useMemo(
    () => provinces.find(p => p.slug === selectedProvinceSlug),
    [provinces, selectedProvinceSlug]
  );

  // Auto-select first province on initial load
  useEffect(() => {
    if (provinces.length > 0 && !selectedProvinceSlug) {
      setSelectedProvinceSlug(provinces[0].slug);
    }
  }, [provinces, selectedProvinceSlug]);

  return (
    <View className='mt-6'>
      {/* Section Header */}
      <View className='mb-4 px-4'>
        <Text className='text-lg font-bold text-neutral-darkest'>
          {t('home.browseByProvince')}
        </Text>
        <Text className='text-sm text-neutral-dark'>
          {t('home.selectDestination')}
        </Text>
      </View>

      {/* Province Chips */}
      {provincesLoading ? (
        <View className='items-center py-4'>
          <ActivityIndicator size='small' color='#f97316' />
          <Text className='mt-2 text-xs text-neutral-dark'>
            {t('home.loadingProvinces')}
          </Text>
        </View>
      ) : provincesError ? (
        <View className='items-center px-4 py-4'>
          <Ionicons name='alert-circle-outline' size={32} color='#ef4444' />
          <Text className='mt-2 text-center text-xs text-neutral-dark'>
            {t('home.failedToLoadProvinces')}
          </Text>
          <Text
            className='mt-2 text-xs font-medium text-primary-main'
            onPress={() => refetchProvinces()}
          >
            {t('home.tapToRetry')}
          </Text>
        </View>
      ) : provinces.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className='mb-4'
        >
          {provinces.map(province => {
            const isSelected = selectedProvinceSlug === province.slug;
            const displayName = getProvinceName(province, currentLanguage);

            return (
              <TouchableOpacity
                key={province.id}
                onPress={() =>
                  setSelectedProvinceSlug(isSelected ? null : province.slug)
                }
                className={`mr-2 rounded-full px-4 py-2 ${
                  isSelected
                    ? 'bg-primary-main'
                    : 'border border-neutral-light bg-white'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? 'text-white' : 'text-neutral-dark'
                  }`}
                >
                  {displayName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View className='items-center py-4'>
          <Text className='text-sm text-neutral-dark'>
            {t('home.noProvincesAvailable')}
          </Text>
        </View>
      )}

      {/* Branches for Selected Province */}
      {selectedProvinceSlug && (
        <View className='mt-2'>
          {/* Branches Header */}
          <View className='mb-3 px-4'>
            <Text className='text-base font-semibold text-neutral-darkest'>
              {t('home.branchesIn', {
                province: selectedProvince
                  ? getProvinceName(selectedProvince, currentLanguage)
                  : '',
              })}
            </Text>
          </View>

          {/* Branches List */}
          {branchesLoading ? (
            <View className='items-center py-6'>
              <ActivityIndicator size='large' color='#f97316' />
              <Text className='mt-2 text-sm text-neutral-dark'>
                {t('home.loadingBranches')}
              </Text>
            </View>
          ) : branchesError ? (
            <View className='items-center px-4 py-6'>
              <Ionicons name='alert-circle-outline' size={48} color='#ef4444' />
              <Text className='mt-2 text-center text-sm text-neutral-dark'>
                {t('home.failedToLoadBranches')}
              </Text>
              <Text
                className='mt-4 text-sm font-medium text-primary-main'
                onPress={() => refetchBranches()}
              >
                {t('home.tapToRetry')}
              </Text>
            </View>
          ) : branches.length > 0 ? (
            <View className='gap-3 px-4'>
              {branches.map(branch => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  onPress={onBranchPress}
                  width={CARD_WIDTH}
                  height={180}
                  lng={currentLanguage}
                />
              ))}
            </View>
          ) : (
            <View className='items-center py-6'>
              <Ionicons name='business-outline' size={48} color='#a3a3a3' />
              <Text className='mt-2 text-sm text-neutral-dark'>
                {t('home.noBranchesAvailable')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
