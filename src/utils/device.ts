import { Dimensions, Platform, StatusBar } from 'react-native';

/**
 * Get device dimensions
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const screenData = Dimensions.get('screen');

  return {
    window: { width, height },
    screen: screenData,
    isLandscape: width > height,
    isPortrait: height > width,
  };
};

/**
 * Check if device is a tablet
 */
export const isTablet = (): boolean => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  const minDimension = Math.min(width, height);

  // Generally, tablets have a minimum dimension > 600 and aspect ratio < 1.6
  return minDimension > 600 && aspectRatio < 1.6;
};

/**
 * Check if device is iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Check if device is Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Get platform-specific value
 */
export const platformSelect = <T>(values: {
  ios: T;
  android: T;
  default?: T;
}): T => {
  return Platform.select(values) || values.default || values.ios;
};

/**
 * Get status bar height
 */
export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'ios') {
    return 20; // Default iOS status bar height
  }
  return StatusBar.currentHeight || 0;
};

/**
 * Check if device has notch (rough estimation)
 */
export const hasNotch = (): boolean => {
  if (Platform.OS === 'ios') {
    const { height, width } = Dimensions.get('window');
    const screenHeight = Dimensions.get('screen').height;

    // iPhone X and newer have different screen ratios
    return (
      height === 812 ||
      width === 812 || // iPhone X, XS
      height === 896 ||
      width === 896 || // iPhone XR, XS Max
      height === 844 ||
      width === 844 || // iPhone 12, 12 Pro
      height === 926 ||
      width === 926 || // iPhone 12 Pro Max
      screenHeight !== height // General check for devices with dynamic island/notch
    );
  }

  // For Android, this is harder to detect accurately
  const statusBarHeight = StatusBar.currentHeight || 0;
  return statusBarHeight > 24;
};

/**
 * Responsive font size based on screen width
 */
export const responsiveFontSize = (size: number): number => {
  const { width } = Dimensions.get('window');
  const baseWidth = 375; // iPhone 6/7/8 width as base
  const scale = width / baseWidth;

  return Math.round(size * scale);
};

/**
 * Responsive dimension based on screen width
 */
export const responsiveWidth = (percentage: number): number => {
  const { width } = Dimensions.get('window');
  return (percentage * width) / 100;
};

/**
 * Responsive dimension based on screen height
 */
export const responsiveHeight = (percentage: number): number => {
  const { height } = Dimensions.get('window');
  return (percentage * height) / 100;
};
