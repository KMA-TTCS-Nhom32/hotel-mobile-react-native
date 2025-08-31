import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Card } from '@/components/ui';

export default function OffersScreen() {
  return (
    <Screen>
      <ScrollView className='flex-1'>
        {/* Header */}
        <View className='px-4 py-6'>
          <Text className='mb-2 text-2xl font-bold text-primary-main'>
            🎁 Exclusive Offers
          </Text>
          <Text className='text-base text-neutral-dark'>
            Member-only deals and personalized recommendations
          </Text>
        </View>

        {/* VIP Offers */}
        <View className='mb-6 px-4'>
          <Card
            title='👑 VIP Member Exclusive'
            subtitle='Special privileges for our valued members'
            variant='elevated'
          >
            <View className='mb-4 rounded-lg border-2 border-luxury-main bg-luxury-lightest p-4'>
              <Text className='mb-2 text-lg font-bold text-luxury-darkest'>
                🌟 Premium Access
              </Text>
              <Text className='mb-3 text-luxury-dark'>
                • Free room upgrades when available
              </Text>
              <Text className='mb-3 text-luxury-dark'>
                • Late checkout until 2 PM
              </Text>
              <Text className='mb-4 text-luxury-dark'>
                • Complimentary breakfast for two
              </Text>
              <Button
                title='Activate VIP Benefits'
                variant='luxury'
                onPress={() => console.log('Activate VIP pressed')}
                fullWidth
              />
            </View>
          </Card>
        </View>

        {/* Personalized Offers */}
        <View className='mb-6 px-4'>
          <Card title='🎯 Just for You' variant='outlined'>
            <View className='gap-4'>
              <View className='rounded-lg border border-accent-light bg-accent-lightest p-4'>
                <View className='mb-2 flex-row items-start justify-between'>
                  <Text className='flex-1 font-semibold text-accent-darkest'>
                    Beach Resort Package
                  </Text>
                  <View className='rounded bg-accent-main px-2 py-1'>
                    <Text className='text-xs font-bold text-accent-foreground'>
                      SAVE 35%
                    </Text>
                  </View>
                </View>
                <Text className='mb-3 text-sm text-accent-dark'>
                  Based on your previous tropical destination bookings
                </Text>
                <Button
                  title='View Package'
                  variant='outline'
                  onPress={() => console.log('View package pressed')}
                  fullWidth
                />
              </View>

              <View className='rounded-lg border border-success-light bg-success-lightest p-4'>
                <View className='mb-2 flex-row items-start justify-between'>
                  <Text className='flex-1 font-semibold text-success-darkest'>
                    City Business Hotels
                  </Text>
                  <View className='rounded bg-success-main px-2 py-1'>
                    <Text className='text-xs font-bold text-success-foreground'>
                      20% OFF
                    </Text>
                  </View>
                </View>
                <Text className='mb-3 text-sm text-success-dark'>
                  Perfect for your upcoming business trips
                </Text>
                <Button
                  title='Explore Cities'
                  variant='outline'
                  onPress={() => console.log('Explore cities pressed')}
                  fullWidth
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Limited Time Offers */}
        <View className='mb-6 px-4'>
          <Card title='⏰ Limited Time' variant='outlined'>
            <View className='gap-3'>
              <View className='rounded-lg border border-warning-light bg-warning-lightest p-3'>
                <View className='flex-row items-center justify-between'>
                  <View className='flex-1'>
                    <Text className='font-medium text-warning-darkest'>
                      Flash Sale - 2 Hours Left!
                    </Text>
                    <Text className='text-sm text-warning-dark'>
                      Mountain resort stays
                    </Text>
                  </View>
                  <Text className='font-bold text-warning-darkest'>
                    45% OFF
                  </Text>
                </View>
              </View>

              <View className='rounded-lg border border-error-light bg-error-lightest p-3'>
                <View className='flex-row items-center justify-between'>
                  <View className='flex-1'>
                    <Text className='font-medium text-error-darkest'>
                      Today Only Special
                    </Text>
                    <Text className='text-sm text-error-dark'>
                      Luxury spa packages
                    </Text>
                  </View>
                  <Text className='font-bold text-error-darkest'>60% OFF</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Loyalty Program */}
        <View className='mb-6 px-4'>
          <Card title='⭐ Loyalty Rewards' variant='outlined'>
            <View className='rounded-lg border border-primary-light bg-primary-lightest p-4'>
              <Text className='mb-2 font-semibold text-primary-darkest'>
                Earn Points with Every Stay
              </Text>
              <Text className='mb-3 text-sm text-primary-dark'>
                Collect points and unlock exclusive rewards, free nights, and
                special perks.
              </Text>
              <View className='flex-row gap-3'>
                <Button
                  title='Join Program'
                  variant='primary'
                  onPress={() => console.log('Join program pressed')}
                  style={{ flex: 1 }}
                />
                <Button
                  title='Learn More'
                  variant='outline'
                  onPress={() => console.log('Learn more pressed')}
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
