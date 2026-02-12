# RevenueCat Setup Guide

## Product Identifiers

Configure these product identifiers in your RevenueCat dashboard and app store:

- **Lifetime**: `savvy_lifetime` - $35.99
- **Annual**: `savvy_annual:p1y` - $24.99/year
- **Monthly**: `savvy_monthly:p1m` - $4.99/month

## Google Play Setup

**Google Play API Key**: `goog_IHFQLPCJgsqyVfavgMAiFJfewIA`

### Steps to configure in RevenueCat:

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Navigate to your project settings
3. Select **Google Play Store** settings
4. Add the Google Play API Key: `goog_IHFQLPCJgsqyVfavgMAiFJfewIA`
5. Configure the in-app products with the identifiers above

## App Configuration

### Get RevenueCat SDK API Keys

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Navigate to **Project Settings** → **API Keys**
3. Copy your **Android SDK Public Key** and **iOS SDK Public Key**
4. Add them to `.env` file:

```env
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_revenuecat_android_sdk_key
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_revenuecat_ios_sdk_key
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=Savvy Pro
EXPO_PUBLIC_REVENUECAT_DUMMY=false
```

**Important:** These are **RevenueCat SDK keys**, not the Google Play API key. The Google Play API key (`goog_IHFQLPCJgsqyVfavgMAiFJfewIA`) goes into the RevenueCat Dashboard, not the app.

## Testing

- Set `EXPO_PUBLIC_REVENUECAT_DUMMY=true` for local development without RevenueCat
- Set `EXPO_PUBLIC_REVENUECAT_DUMMY=false` for production builds with real RevenueCat

## Complete Setup Checklist

- [ ] Configure Google Play API Key in RevenueCat Dashboard
- [ ] Create in-app products in Google Play Console (savvy_monthly:p1m, savvy_annual:p1y, savvy_lifetime)
- [ ] Create products in RevenueCat Dashboard with same IDs
- [ ] Create an Offering in RevenueCat with these products
- [ ] Get RevenueCat SDK API Keys and add to `.env`
- [ ] Set `EXPO_PUBLIC_REVENUECAT_DUMMY=false` in `.env`
- [ ] Build and test with `npx eas build --platform android`
