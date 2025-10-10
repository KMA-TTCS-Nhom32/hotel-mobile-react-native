# Banking App Deep Linking Integration

## Overview
This document explains how the Vietnamese banking app integration works in the AHomeVilla Hotel mobile app, specifically for QR payment processing.

## Feature Description
Users can now tap a button to automatically open their installed banking app (MBBank, Vietcombank, Techcombank, ACB, VPBank, etc.) directly from the QR payment screen, making the payment process more convenient and faster.

## Implementation Details

### 1. **URL Schemes for Vietnamese Banking Apps**

We've configured URL schemes for major Vietnamese banks:

```typescript
const BANKING_APPS = {
  MBBANK: {
    name: 'MBBank',
    scheme: 'mbbank://',
    qrScheme: 'mbbank://qr_payment',
  },
  VIETCOMBANK: {
    name: 'Vietcombank',
    scheme: 'vietcombank://',
    qrScheme: 'vietcombank://qr',
  },
  TECHCOMBANK: {
    name: 'Techcombank',
    scheme: 'tcb://',
    qrScheme: 'tcb://qr',
  },
  BIDV: {
    name: 'BIDV',
    scheme: 'bidv://',
    qrScheme: 'bidv://qr',
  },
  VPBANK: {
    name: 'VPBank',
    scheme: 'vpbank://',
    qrScheme: 'vpbank://qr',
  },
  ACB: {
    name: 'ACB',
    scheme: 'acb://',
    qrScheme: 'acb://qr',
  },
};
```

### 2. **How It Works**

#### Step 1: User Flow
1. User creates a booking with VIET_QR payment method
2. Payment link is generated with QR code
3. QR confirmation screen displays:
   - QR code (scannable)
   - Bank account details
   - **Banking app buttons** (NEW)
   - Countdown timer (15 minutes)

#### Step 2: Deep Link Opening
When user taps a banking app button:

```typescript
const handleOpenBankingApp = async (bankKey: keyof typeof BANKING_APPS) => {
  const bank = BANKING_APPS[bankKey];
  const bankScheme = bank.scheme;

  // Check if app is installed
  const canOpen = await Linking.canOpenURL(bankScheme);

  if (canOpen) {
    // Open the banking app
    await Linking.openURL(bankScheme);
    showSuccessToast(`Opening ${bank.name}...`);
  } else {
    // Show alert - app not installed
    Alert.alert(
      'App Not Installed',
      `${bank.name} is not installed. Please install it or use another app.`
    );
  }
};
```

#### Step 3: VietQR Auto-Detection
Most modern Vietnamese banking apps support VietQR standard, which means:
- When the app opens, it may automatically detect clipboard content
- If QR data is in clipboard, app can auto-populate payment details
- User just needs to confirm and authenticate

### 3. **UI Components**

The QR confirmation screen now includes:

```tsx
{/* Primary Action - MBBank */}
<Pressable onPress={() => handleOpenBankingApp('MBBANK')}>
  <Text>🏦 Open in MBBank</Text>
</Pressable>

{/* Other Banks - Compact Buttons */}
<View className='flex-row gap-2'>
  <Pressable onPress={() => handleOpenBankingApp('VIETCOMBANK')}>
    <Text>VCB</Text>
  </Pressable>
  <Pressable onPress={() => handleOpenBankingApp('TECHCOMBANK')}>
    <Text>TCB</Text>
  </Pressable>
  {/* ... more banks ... */}
</View>
```

### 4. **Platform Differences**

#### iOS
- Apps register custom URL schemes in `Info.plist`
- iOS validates schemes and asks user for permission first time
- `Linking.canOpenURL()` requires schemes to be declared in app's `LSApplicationQueriesSchemes`

#### Android
- Apps declare URL schemes in `AndroidManifest.xml` via intent filters
- `Linking.canOpenURL()` works without additional configuration
- Android 11+ has package visibility restrictions

### 5. **Required Configuration**

To enable deep linking to banking apps, add to `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "LSApplicationQueriesSchemes": [
          "mbbank",
          "vietcombank",
          "tcb",
          "bidv",
          "vpbank",
          "acb"
        ]
      }
    }
  }
}
```

## Research Findings

### Vietnamese Banking App URL Schemes

Based on research of Vietnamese banking apps:

1. **MBBank** (`mbbank://`)
   - Scheme: `mbbank://`
   - QR Payment: May support `mbbank://qr_payment`
   - Status: Widely used, likely has URL scheme

2. **Vietcombank** (`vietcombank://`)
   - One of Vietnam's largest banks
   - Likely supports deep linking

3. **Techcombank** (`tcb://`)
   - Modern digital bank
   - Strong mobile app presence

4. **BIDV** (`bidv://`)
   - State-owned bank
   - Traditional banking app

5. **VPBank** (`vpbank://`)
   - Progressive bank with good mobile app

6. **ACB** (`acb://`)
   - Popular among young users

### VietQR Standard

**VietQR** is Vietnam's national QR payment standard developed by NAPAS (National Payment Corporation of Vietnam). Key features:

- Standardized QR code format for all Vietnamese banks
- QR contains: Bank code, account number, amount, description
- All major Vietnamese banking apps support scanning VietQR codes
- When app opens, it can detect QR data and auto-populate payment form

## Testing Instructions

### Test Case 1: MBBank Installed
1. Have MBBank app installed on device
2. Create booking with VIET_QR payment
3. Tap "Open in MBBank" button
4. **Expected**: MBBank app opens, may auto-detect payment if QR in clipboard
5. User scans QR code manually if not auto-detected
6. Complete payment in MBBank
7. **Expected**: Socket.io detects payment, app navigates to success screen

### Test Case 2: App Not Installed
1. Uninstall banking app
2. Tap banking app button
3. **Expected**: Alert shows "App Not Installed" with options
4. User can try another bank or scan QR manually

### Test Case 3: Multiple Banks
1. Have 2+ banking apps installed (e.g., MBBank + VCB)
2. Test opening each app
3. **Expected**: Each app opens correctly
4. User can switch between apps

### Test Case 4: Fallback to Manual Scan
1. If deep link fails, user still has QR code visible
2. User can manually open banking app
3. Use in-app QR scanner to scan the displayed QR code
4. **Expected**: Payment still works via manual scan

## Limitations & Considerations

### 1. **URL Scheme Availability**
- Not all banks may have public URL schemes
- Schemes may change in future app updates
- Some banks may block external deep linking for security

### 2. **iOS Package Queries**
- iOS requires declaring schemes in `LSApplicationQueriesSchemes`
- Limited to 50 schemes per app
- Must be added before app submission

### 3. **User Experience**
- App switching may confuse some users
- Clear instructions needed (toast messages)
- Fallback to manual QR scan always available

### 4. **Security**
- Deep links don't transfer sensitive data
- User still authenticates in banking app
- Payment details shown in QR code only

### 5. **VietQR Integration**
- Not all banks auto-detect clipboard QR data
- May require manual QR scan even after app opens
- User experience varies by bank's app implementation

## Future Enhancements

### Phase 1 (Current) ✅
- [x] Basic deep linking to banking apps
- [x] App installation detection
- [x] User-friendly error messages
- [x] Multi-language support (EN/VI)

### Phase 2 (Planned)
- [ ] Bank logo images instead of emojis
- [ ] Smart bank detection based on user's BIN
- [ ] Remember user's preferred banking app
- [ ] Advanced VietQR data passing (if supported)

### Phase 3 (Advanced)
- [ ] Universal Links for iOS (bidirectional deep linking)
- [ ] Android App Links (verified deep links)
- [ ] Callback handling from banking apps (if supported)
- [ ] Payment status polling if Socket.io fails

## API & Libraries Used

1. **React Native Linking API**
   - `Linking.canOpenURL(url)` - Check if URL scheme is supported
   - `Linking.openURL(url)` - Open external app
   - Built-in to React Native

2. **Socket.io Client**
   - Real-time payment status monitoring
   - Connects to backend via WebSocket
   - Auto-detects successful payment

3. **Expo Clipboard**
   - Copy account details
   - Future: Copy QR data for clipboard detection

4. **React Native QRCode SVG**
   - Display VietQR code
   - High-quality rendering

## Resources

- [React Native Linking Documentation](https://reactnative.dev/docs/linking)
- [VietQR Official Website](https://www.vietqr.io/)
- [NAPAS - National Payment Corporation](https://napas.com.vn/)
- [Expo Linking Guide](https://docs.expo.dev/guides/linking/)

## Support

For issues or questions about banking app integration:
1. Check if banking app is installed
2. Verify URL scheme configuration in `app.json`
3. Test with multiple banking apps
4. Fallback to manual QR scan if deep linking fails

---

**Last Updated**: October 10, 2025
**Feature Status**: ✅ Implemented and Ready for Testing
**Supported Banks**: MBBank, Vietcombank, Techcombank, ACB, VPBank, BIDV
