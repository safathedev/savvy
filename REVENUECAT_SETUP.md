# RevenueCat Integration Guide for Savvy

This guide explains how RevenueCat is integrated into the Savvy app.

## Overview

Savvy uses RevenueCat for cross-platform subscription management with:
- **Lifetime purchase**: $10 one-time payment
- **Annual subscription**: $5/year auto-renewable
- **Entitlement**: "Savvy Pro"

## Configuration

### 1. Environment Variables

Create/update `.env` file with your RevenueCat API keys:

```env
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=test_iEqyrkEKEFVDiEAySmiYWqBYVSw
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_ios_api_key_here
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=Savvy Pro
EXPO_PUBLIC_REVENUECAT_DUMMY=false
```

**Important**: 
- Never commit `.env` to git (already in `.gitignore`)
- Use `.env.example` as a template
- Set `EXPO_PUBLIC_REVENUECAT_DUMMY=true` for testing without real purchases

### 2. RevenueCat Dashboard Setup

1. **Create Products** in RevenueCat Dashboard:
   - Product ID: `lifetime` (non-consumable in-app purchase)
   - Product ID: `yearly` (auto-renewable subscription)

2. **Create Entitlement**:
   - Name: `Savvy Pro`
   - Attach both products to this entitlement

3. **Create Offering**:
   - Make it the "Current Offering"
   - Add both packages (lifetime and yearly)

4. **Configure App**:
   - Add your app's bundle ID (iOS) and package name (Android)
   - Get API keys from Settings > API Keys

### 3. App Store / Google Play Setup

#### iOS (App Store Connect)
1. Create in-app purchases:
   - Product ID: `lifetime` (Non-Consumable)
   - Product ID: `yearly` (Auto-Renewable Subscription)
2. Set pricing
3. Submit for review

#### Android (Google Play Console)
1. Create in-app products:
   - Product ID: `lifetime` (In-app product)
   - Product ID: `yearly` (Subscription)
2. Set pricing
3. Activate products

## Implementation Details

### Core Files

#### `lib/revenuecat.ts`
Main integration file with:
- SDK initialization
- Purchase handling
- Restore purchases
- Customer info retrieval
- Entitlement checking

#### `app/paywall/index.tsx`
Paywall screen that:
- Loads offerings from RevenueCat
- Displays available packages
- Handles purchase flow
- Shows restore option

#### `lib/app-context.tsx`
App state management:
- Premium status tracking
- Cross-component state sharing

### Key Features

✅ **Automatic Initialization**: SDK initializes on app start
✅ **Cross-platform**: Same code works on iOS and Android
✅ **Offering Management**: Dynamically loads packages from RevenueCat
✅ **Error Handling**: Comprehensive error handling with user feedback
✅ **Restore Purchases**: Users can restore previous purchases
✅ **Entitlement Checking**: Verify premium access anywhere in the app

### Usage Examples

#### Check Premium Status
```typescript
import { checkSubscriptionStatus } from "@/lib/revenuecat";

const isPremium = await checkSubscriptionStatus();
```

#### Make Purchase
```typescript
import { purchasePackage } from "@/lib/revenuecat";

const { success, error } = await purchasePackage(selectedPackage);
if (success) {
  // Grant premium access
}
```

#### Restore Purchases
```typescript
import { restorePurchases } from "@/lib/revenuecat";

const { success, hasPremium } = await restorePurchases();
```

#### Get Customer Info
```typescript
import { getCustomerInfo } from "@/lib/revenuecat";

const customerInfo = await getCustomerInfo();
const entitlements = customerInfo?.entitlements.active;
```

## Testing

### Test Mode (Dummy Mode)
Set `EXPO_PUBLIC_REVENUECAT_DUMMY=true` to test without real purchases.
This simulates purchase flow without RevenueCat SDK.

### Sandbox Testing
1. Use RevenueCat's sandbox API keys
2. Test on real devices with sandbox accounts
3. Verify purchases in RevenueCat dashboard

### Production Testing
1. Create test accounts in App Store Connect / Google Play
2. Use production API keys in `.env`
3. Test full purchase flow
4. Verify entitlements sync correctly

## Best Practices

### 1. Error Handling
Always handle errors gracefully:
```typescript
try {
  const result = await purchasePackage(pkg);
  // Handle success
} catch (error) {
  // Show user-friendly error message
  Alert.alert("Purchase Failed", "Please try again.");
}
```

### 2. Loading States
Show loading indicators during async operations:
```typescript
const [isLoading, setIsLoading] = useState(false);

const handlePurchase = async () => {
  setIsLoading(true);
  try {
    await purchasePackage(pkg);
  } finally {
    setIsLoading(false);
  }
};
```

### 3. User Feedback
Provide clear feedback with haptics and alerts:
```typescript
import * as Haptics from "expo-haptics";

Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
Alert.alert("Success!", "Welcome to Savvy Premium!");
```

### 4. Entitlement Verification
Always verify entitlements server-side for critical features.
Client-side checks are for UX only.

## Troubleshooting

### "Could not load subscription options"
- Check API keys in `.env`
- Verify offerings are configured in RevenueCat dashboard
- Check network connection
- Review console logs for specific errors

### "Purchase failed"
- Verify products exist in App Store / Google Play
- Check product IDs match exactly
- Ensure app is properly configured in RevenueCat
- Test with sandbox account first

### Entitlements not active
- Check entitlement ID matches dashboard
- Verify products are attached to entitlement
- Allow time for receipt validation (can take 10-30 seconds)
- Check RevenueCat dashboard customer view

## Resources

- [RevenueCat Docs](https://www.revenuecat.com/docs)
- [React Native SDK](https://www.revenuecat.com/docs/getting-started/installation/reactnative)
- [Paywalls](https://www.revenuecat.com/docs/tools/paywalls)
- [Customer Center](https://www.revenuecat.com/docs/tools/customer-center)
- [Dashboard](https://app.revenuecat.com)

## Support

For issues:
1. Check console logs for error messages
2. Review RevenueCat dashboard for customer activity
3. Test in sandbox mode first
4. Contact RevenueCat support with specific error codes
