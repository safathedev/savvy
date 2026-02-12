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

The app uses these environment variables (see `.env.example`):

```
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_android_api_key_here
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_ios_api_key_here
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=Savvy Pro
```

## Testing

- Set `EXPO_PUBLIC_REVENUECAT_DUMMY=true` for local development without RevenueCat
- Use real API keys and `EXPO_PUBLIC_REVENUECAT_DUMMY=false` for production builds
