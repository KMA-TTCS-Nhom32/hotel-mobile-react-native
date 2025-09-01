import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Card, LanguageSwitcher } from '@/components/ui';

export default function AccountScreen() {
  return (
    <Screen>
      <ScrollView className='flex-1'>
        {/* Profile Section */}
        <View className='px-4 py-6'>
          <Card variant='elevated'>
            <View className='mb-4 items-center'>
              <View className='mb-3 h-20 w-20 items-center justify-center rounded-full bg-primary-main'>
                <Text className='text-3xl text-primary-foreground'>👤</Text>
              </View>
              <Text className='mb-1 text-xl font-bold text-text-primary'>
                John Doe
              </Text>
              <Text className='text-text-secondary'>john.doe@example.com</Text>
              <View className='mt-2 rounded-full bg-luxury-lightest px-3 py-1'>
                <Text className='text-sm font-medium text-luxury-darkest'>
                  VIP Member
                </Text>
              </View>
            </View>

            <Button
              title='Edit Profile'
              variant='outline'
              onPress={() => console.log('Edit profile pressed')}
              fullWidth
            />
          </Card>
        </View>

        {/* Quick Stats */}
        <View className='mb-6 px-4'>
          <Card title='📊 Your Stats' variant='outlined'>
            <View className='flex-row gap-4'>
              <View className='flex-1 items-center rounded-lg bg-success-lightest p-3'>
                <Text className='text-2xl font-bold text-success-darkest'>
                  12
                </Text>
                <Text className='text-sm text-success-dark'>Total Stays</Text>
              </View>
              <View className='flex-1 items-center rounded-lg bg-luxury-lightest p-3'>
                <Text className='text-2xl font-bold text-luxury-darkest'>
                  2,480
                </Text>
                <Text className='text-sm text-luxury-dark'>Points</Text>
              </View>
              <View className='flex-1 items-center rounded-lg bg-primary-lightest p-3'>
                <Text className='text-2xl font-bold text-primary-darkest'>
                  8
                </Text>
                <Text className='text-sm text-primary-dark'>Countries</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Account Options */}
        <View className='mb-6 px-4'>
          <Card title='⚙️ Account Settings' variant='outlined'>
            {/* Language Switcher */}
            <LanguageSwitcher />

            <View className='gap-3'>
              <Button
                title='🔒 Privacy & Security'
                variant='ghost'
                onPress={() => console.log('Privacy pressed')}
                fullWidth
              />
              <Button
                title='💳 Payment Methods'
                variant='ghost'
                onPress={() => console.log('Payment methods pressed')}
                fullWidth
              />
              <Button
                title='🔔 Notifications'
                variant='ghost'
                onPress={() => console.log('Notifications pressed')}
                fullWidth
              />
              <Button
                title='🌍 Language & Region'
                variant='ghost'
                onPress={() => console.log('Language pressed')}
                fullWidth
              />
            </View>
          </Card>
        </View>

        {/* Support */}
        <View className='mb-6 px-4'>
          <Card title='🛟 Help & Support' variant='outlined'>
            <View className='gap-3'>
              <Button
                title='❓ Help Center'
                variant='ghost'
                onPress={() => console.log('Help center pressed')}
                fullWidth
              />
              <Button
                title='💬 Contact Support'
                variant='ghost'
                onPress={() => console.log('Contact support pressed')}
                fullWidth
              />
              <Button
                title='📝 Feedback'
                variant='ghost'
                onPress={() => console.log('Feedback pressed')}
                fullWidth
              />
            </View>
          </Card>
        </View>

        {/* Loyalty Program */}
        <View className='mb-6 px-4'>
          <Card title='⭐ Loyalty Program' variant='outlined'>
            <View className='rounded-lg border border-luxury-light bg-luxury-lightest p-4'>
              <Text className='mb-2 font-semibold text-luxury-darkest'>
                VIP Status Benefits
              </Text>
              <Text className='mb-3 text-sm text-luxury-dark'>
                • Priority customer support • Room upgrades when available •
                Late checkout privileges • Exclusive member rates
              </Text>
              <Button
                title='View All Benefits'
                variant='luxury'
                onPress={() => console.log('View benefits pressed')}
                fullWidth
              />
            </View>
          </Card>
        </View>

        {/* Sign Out */}
        <View className='mb-8 px-4'>
          <Button
            title='Sign Out'
            variant='danger'
            onPress={() => console.log('Sign out pressed')}
            fullWidth
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
