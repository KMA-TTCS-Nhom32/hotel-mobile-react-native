/**
 * Location Map Preview Component
 * This file re-exports the platform-specific implementation
 * - On native (iOS/Android): Uses react-native-maps
 * - On web: Shows a static placeholder with Google Maps link
 */

export { LocationMapPreview } from './LocationMapPreview.native';
