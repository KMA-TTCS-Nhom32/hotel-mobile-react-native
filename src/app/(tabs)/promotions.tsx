import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Card } from '@/components/ui';

export default function PromotionsScreen() {
  return (
    <Screen>
      <ScrollView className='flex-1'>
        {/* Header */}
        <View className='px-4 py-6'>
          <Text className='mb-2 text-2xl font-bold text-primary-main'>
            🎯 Special Promotions
          </Text>
          <Text className='text-base text-neutral-dark'>
            Exclusive deals and limited-time offers
          </Text>
        </View>

        {/* Featured Promotion */}
        <View className='mb-6 px-4'>
          <Card
            title='🔥 Flash Sale'
            subtitle='Limited time offer - ends soon!'
            variant='elevated'
          >
            <View className='mb-4 rounded-lg border-2 border-accent-light bg-accent-lightest p-4'>
              <Text className='mb-2 text-xl font-bold text-accent-darkest'>
                50% OFF
              </Text>
              <Text className='mb-3 text-base text-accent-dark'>
                On selected luxury hotels worldwide
              </Text>
              <Button
                title='Claim Offer'
                variant='primary'
                onPress={() => console.log('Claim offer pressed')}
                fullWidth
              />
            </View>
          </Card>
        </View>

        {/* Promotion Categories */}
        <View className='mb-6 px-4'>
          <Card title='🏷️ Browse by Category' variant='outlined'>
            <View className='gap-3'>
              <View className='rounded-lg bg-luxury-lightest p-4'>
                <Text className='mb-1 font-semibold text-luxury-darkest'>
                  Luxury Hotels
                </Text>
                <Text className='mb-3 text-sm text-luxury-dark'>
                  Premium accommodations with exclusive amenities
                </Text>
                <Button
                  title='View Luxury Deals'
                  variant='luxury'
                  onPress={() => console.log('Luxury deals pressed')}
                  fullWidth
                />
              </View>

              <View className='rounded-lg bg-success-lightest p-4'>
                <Text className='mb-1 font-semibold text-success-darkest'>
                  Budget-Friendly
                </Text>
                <Text className='mb-3 text-sm text-success-dark'>
                  Great value hotels without compromising comfort
                </Text>
                <Button
                  title='Find Budget Deals'
                  variant='outline'
                  onPress={() => console.log('Budget deals pressed')}
                  fullWidth
                />
              </View>

              <View className='rounded-lg bg-primary-lightest p-4'>
                <Text className='mb-1 font-semibold text-primary-darkest'>
                  Business Travel
                </Text>
                <Text className='mb-3 text-sm text-primary-dark'>
                  Perfect for work trips and corporate stays
                </Text>
                <Button
                  title='Business Offers'
                  variant='secondary'
                  onPress={() => console.log('Business offers pressed')}
                  fullWidth
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Active Promotions */}
        <View className='mb-6 px-4'>
          <Card title='⏰ Active Promotions' variant='outlined'>
            <View className='gap-4'>
              <View className='flex-row items-center justify-between rounded-lg border border-warning-light bg-warning-lightest p-3'>
                <View className='flex-1'>
                  <Text className='font-medium text-warning-darkest'>
                    Weekend Getaway
                  </Text>
                  <Text className='text-sm text-warning-dark'>
                    25% off weekend bookings
                  </Text>
                </View>
                <Text className='font-bold text-warning-darkest'>25% OFF</Text>
              </View>

              <View className='flex-row items-center justify-between rounded-lg border border-error-light bg-error-lightest p-3'>
                <View className='flex-1'>
                  <Text className='font-medium text-error-darkest'>
                    Last Minute Deals
                  </Text>
                  <Text className='text-sm text-error-dark'>
                    Book within 24hrs for instant savings
                  </Text>
                </View>
                <Text className='font-bold text-error-darkest'>40% OFF</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
