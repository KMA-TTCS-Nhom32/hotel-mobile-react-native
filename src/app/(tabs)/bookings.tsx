import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Card, EmptyState } from '@/components/ui';

export default function BookingsScreen() {
  const hasBookings = false; // Simulate no bookings for now

  if (!hasBookings) {
    return (
      <Screen>
        <EmptyState
          title='No Bookings Yet'
          description="You haven't made any hotel reservations. Start exploring amazing destinations and book your perfect stay!"
          icon={<Text style={{ fontSize: 64 }}>📋</Text>}
          actionLabel='Explore Hotels'
          onAction={() => console.log('Explore hotels pressed')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView className='flex-1'>
        {/* Header */}
        <View className='px-4 py-6'>
          <Text className='mb-2 text-2xl font-bold text-primary-main'>
            📋 My Bookings
          </Text>
          <Text className='text-base text-neutral-dark'>
            Manage your hotel reservations
          </Text>
        </View>

        {/* Upcoming Bookings */}
        <View className='mb-6 px-4'>
          <Card title='🎯 Upcoming Stays' variant='elevated'>
            <View className='rounded-lg border border-success-light bg-success-lightest p-4'>
              <Text className='mb-1 font-semibold text-success-darkest'>
                Grand Hotel Plaza
              </Text>
              <Text className='mb-2 text-sm text-success-dark'>
                Check-in: March 15, 2024
              </Text>
              <Text className='mb-3 text-sm text-success-dark'>
                Check-out: March 18, 2024
              </Text>
              <View className='flex-row gap-2'>
                <Button
                  title='View Details'
                  variant='outline'
                  onPress={() => console.log('View details pressed')}
                  style={{ flex: 1 }}
                />
                <Button
                  title='Contact Hotel'
                  variant='secondary'
                  onPress={() => console.log('Contact hotel pressed')}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Booking History */}
        <View className='mb-6 px-4'>
          <Card title='📚 Booking History' variant='outlined'>
            <View className='gap-3'>
              <View className='rounded-lg border border-neutral-light bg-neutral-lightest p-4'>
                <Text className='mb-1 font-medium text-neutral-darkest'>
                  Luxury Resort & Spa
                </Text>
                <Text className='mb-2 text-sm text-neutral-dark'>
                  February 10-14, 2024 • Completed
                </Text>
                <Button
                  title='Leave Review'
                  variant='ghost'
                  onPress={() => console.log('Leave review pressed')}
                />
              </View>

              <View className='rounded-lg border border-neutral-light bg-neutral-lightest p-4'>
                <Text className='mb-1 font-medium text-neutral-darkest'>
                  Business Hotel Downtown
                </Text>
                <Text className='mb-2 text-sm text-neutral-dark'>
                  January 5-7, 2024 • Completed
                </Text>
                <Button
                  title='Book Again'
                  variant='ghost'
                  onPress={() => console.log('Book again pressed')}
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View className='mb-6 px-4'>
          <Card title='⚡ Quick Actions' variant='outlined'>
            <View className='gap-3'>
              <Button
                title='🔍 Find New Hotels'
                variant='primary'
                onPress={() => console.log('Find hotels pressed')}
                fullWidth
              />
              <View className='flex-row gap-3'>
                <Button
                  title='Support'
                  variant='outline'
                  onPress={() => console.log('Support pressed')}
                  style={{ flex: 1 }}
                />
                <Button
                  title='FAQ'
                  variant='secondary'
                  onPress={() => console.log('FAQ pressed')}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
