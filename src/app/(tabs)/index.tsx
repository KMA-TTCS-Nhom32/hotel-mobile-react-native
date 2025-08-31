import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Card } from '@/components/ui';

export default function HomeScreen() {
  return (
    <Screen>
      <ScrollView className='flex-1'>
        {/* Welcome Section */}
        <View className='px-4 py-6'>
          <Text className='mb-2 text-2xl font-bold text-primary-main'>
            Welcome to AHomeVilla
          </Text>
          <Text className='text-base text-neutral-dark'>
            Find your perfect stay with exclusive hotel deals
          </Text>
        </View>

        {/* Search Card */}
        <View className='mb-6 px-4'>
          <Card
            title='🔍 Find Hotels'
            subtitle='Search for the perfect accommodation'
            variant='elevated'
          >
            <Button
              title='Search Hotels'
              onPress={() => console.log('Search hotels pressed')}
              variant='primary'
              fullWidth
            />
          </Card>
        </View>

        {/* Featured Offers */}
        <View className='mb-6 px-4'>
          <Card
            title='✨ Featured Offers'
            subtitle="Don't miss these amazing deals"
            variant='outlined'
          >
            <View className='gap-3'>
              <View className='rounded-lg border border-luxury-light bg-luxury-lightest p-4'>
                <Text className='mb-1 font-semibold text-luxury-darkest'>
                  Premium Suite Deal
                </Text>
                <Text className='text-sm text-luxury-dark'>
                  Save up to 30% on luxury accommodations
                </Text>
              </View>

              <View className='rounded-lg border border-success-light bg-success-lightest p-4'>
                <Text className='mb-1 font-semibold text-success-darkest'>
                  Early Bird Special
                </Text>
                <Text className='text-sm text-success-dark'>
                  Book 30 days in advance and save 20%
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View className='mb-6 px-4'>
          <Card title='⚡ Quick Actions' variant='outlined'>
            <View className='flex-row gap-3'>
              <Button
                title='My Trips'
                variant='outline'
                onPress={() => console.log('My trips pressed')}
                style={{ flex: 1 }}
              />
              <Button
                title='Support'
                variant='secondary'
                onPress={() => console.log('Support pressed')}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
