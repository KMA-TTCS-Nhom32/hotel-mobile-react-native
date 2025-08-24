import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Card } from '@/components/ui';

export default function Index() {
  return (
    <Screen>
      <ScrollView className='flex-1'>
        {/* Header */}
        <View className='items-center p-6'>
          <Text className='mb-2 text-3xl font-bold text-primary-main'>
            AHomeVilla
          </Text>
          <Text className='text-center text-base text-neutral-dark'>
            Professional Hotel Booking App with Unified Theme
          </Text>
        </View>

        {/* Theme Demo Section */}
        <View className='mb-6 px-4'>
          <Card
            title='🎨 Unified NativeWind Theme'
            subtitle='One approach: Tailwind config + NativeWind classes'
            variant='elevated'
          >
            <Text className='mb-4 text-neutral-darkest'>
              ✨ Clean & Simple approach:
            </Text>
            <Text className='mb-2 text-sm text-neutral-dark'>
              • All colors defined in tailwind.config.js
            </Text>
            <Text className='mb-2 text-sm text-neutral-dark'>
              • Used via NativeWind classes (e.g., text-primary-main)
            </Text>
            <Text className='mb-4 text-sm text-neutral-dark'>
              • No confusing multiple theme systems
            </Text>

            {/* Color Palette Demo */}
            <Text className='mb-3 font-semibold text-neutral-darkest'>
              Color Palette:
            </Text>

            <View className='mb-6 flex-row flex-wrap gap-3'>
              <View className='items-center'>
                <View className='mb-1 h-12 w-12 rounded-lg bg-primary-main' />
                <Text className='text-xs text-neutral-dark'>Primary</Text>
              </View>

              <View className='items-center'>
                <View className='mb-1 h-12 w-12 rounded-lg bg-accent-main' />
                <Text className='text-xs text-neutral-dark'>Accent</Text>
              </View>

              <View className='items-center'>
                <View className='mb-1 h-12 w-12 rounded-lg bg-luxury-main' />
                <Text className='text-xs text-neutral-dark'>Luxury</Text>
              </View>

              <View className='items-center'>
                <View className='mb-1 h-12 w-12 rounded-lg bg-success-main' />
                <Text className='text-xs text-neutral-dark'>Success</Text>
              </View>
            </View>

            {/* Button Examples */}
            <Text className='mb-3 font-semibold text-neutral-darkest'>
              Themed Buttons:
            </Text>

            <View className='gap-3'>
              <Button
                title='🏨 Book Hotel Room'
                onPress={() => console.log('Book hotel pressed')}
                variant='primary'
                fullWidth
              />

              <Button
                title='👑 Luxury Suite Experience'
                onPress={() => console.log('Luxury suite pressed')}
                variant='luxury'
                fullWidth
              />

              <Button
                title='📞 Contact Hotel'
                variant='outline'
                onPress={() => console.log('Contact pressed')}
                fullWidth
              />
            </View>
          </Card>
        </View>

        {/* Features Card */}
        <View className='mb-6 px-4'>
          <Card
            title='🚀 Clean Architecture'
            subtitle='Professional setup with unified approach'
            variant='elevated'
          >
            <View className='gap-2'>
              <Text className='text-neutral-darkest'>
                ✅ App folder in root (Expo Router convention)
              </Text>
              <Text className='text-neutral-darkest'>
                ✅ Single theme approach: NativeWind + Tailwind config
              </Text>
              <Text className='text-neutral-darkest'>
                ✅ Semantic color names (primary-main vs primary-500)
              </Text>
              <Text className='text-neutral-darkest'>
                ✅ Orange-based colors inspired by Vietnamese hotel apps
              </Text>
              <Text className='text-neutral-darkest'>
                ✅ Professional folder structure
              </Text>
              <Text className='text-neutral-darkest'>
                ✅ Development tools: ESLint, Prettier, Husky
              </Text>
            </View>

            <Button
              title="🎯 Perfect! Let's Build Features"
              onPress={() => console.log('Start building pressed')}
              variant='primary'
              fullWidth
              style={{ marginTop: 16 }}
            />
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
