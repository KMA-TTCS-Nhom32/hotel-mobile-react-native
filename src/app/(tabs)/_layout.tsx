import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { TAB_THEME } from '@/config/theme';
import { useCommonTranslation, useLanguage } from '@/i18n/hooks';

// Modern tab icon component with vector icons
const TabIcon = ({
  name,
  color,
  focused,
  size = 24,
}: {
  name: string;
  color: string;
  focused: boolean;
  size?: number;
}) => {
  const getIconName = (iconName: string, isFocused: boolean) => {
    const iconMap: Record<string, { focused: string; unfocused: string }> = {
      home: {
        focused: 'home',
        unfocused: 'home-outline',
      },
      promotions: {
        focused: 'pricetag',
        unfocused: 'pricetag-outline',
      },
      bookings: {
        focused: 'calendar',
        unfocused: 'calendar-outline',
      },
      offers: {
        focused: 'gift',
        unfocused: 'gift-outline',
      },
      account: {
        focused: 'person',
        unfocused: 'person-outline',
      },
    };

    return iconMap[iconName]?.[isFocused ? 'focused' : 'unfocused'] || 'apps';
  };

  return (
    <Ionicons
      name={getIconName(name, focused) as keyof typeof Ionicons.glyphMap}
      size={size}
      color={color}
    />
  );
};

export default function TabLayout() {
  const { t } = useCommonTranslation();
  const { currentLanguage } = useLanguage();

  const isEnglish = currentLanguage === 'en';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_THEME.activeColor,
        tabBarInactiveTintColor: TAB_THEME.inactiveColor,
        tabBarStyle: {
          backgroundColor: TAB_THEME.backgroundColor,
          borderTopWidth: 1,
          borderTopColor: TAB_THEME.borderColor,
          height: Platform.OS === 'ios' ? 100 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: isEnglish ? 12 : 11,
          fontWeight: '500',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: TAB_THEME.headerBackgroundColor,
          borderBottomWidth: 1,
          borderBottomColor: TAB_THEME.borderColor,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: TAB_THEME.headerTitleColor,
        },
        headerTintColor: TAB_THEME.headerTintColor,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name='home' color={color} size={size} focused={focused} />
          ),
          headerTitle: t('headers.home'),
        }}
      />
      <Tabs.Screen
        name='promotions'
        options={{
          title: t('navigation.promotions'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name='promotions'
              color={color}
              size={size}
              focused={focused}
            />
          ),
          headerTitle: t('headers.promotions'),
        }}
      />
      <Tabs.Screen
        name='bookings'
        options={{
          title: t('navigation.bookings'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name='bookings'
              color={color}
              size={size}
              focused={focused}
            />
          ),
          headerTitle: t('headers.bookings'),
        }}
      />
      <Tabs.Screen
        name='offers'
        options={{
          title: t('navigation.offers'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name='offers'
              color={color}
              size={size}
              focused={focused}
            />
          ),
          headerTitle: t('headers.offers'),
        }}
      />
      <Tabs.Screen
        name='account'
        options={{
          title: t('navigation.account'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name='account'
              color={color}
              size={size}
              focused={focused}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
