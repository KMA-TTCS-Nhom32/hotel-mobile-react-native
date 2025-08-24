import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeArea?: boolean;
  padding?: boolean;
  backgroundColor?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  safeArea = true,
  padding = true,
  backgroundColor = 'white',
}) => {
  const content = (
    <View
      style={[
        {
          flex: 1,
          backgroundColor,
        },
        padding && { paddingHorizontal: 16 },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (safeArea) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
};
