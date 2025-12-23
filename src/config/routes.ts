export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  HOME: '/(tabs)',
  BOOKINGS: '/(tabs)/bookings',
  OFFERS: '/(tabs)/offers',
  PROMOTIONS: '/(tabs)/promotions',
  ACCOUNT: {
    INDEX: '/(tabs)/account',
    EDIT_PROFILE: '/account/edit-profile',
  },
  BRANCHES: {
    DETAIL: (idOrSlug: string) => `/branches/${idOrSlug}` as const,
  },
  ROOMS: {
    DETAIL: (id: string) => `/rooms/${id}` as const,
    FILTERED: '/rooms',
  },
  PAYMENT: {
    INDEX: '/payment',
    QR_CONFIRMATION: '/payment/qr-confirmation',
    SUCCESS: '/payment/success',
  },
} as const;

const stripLeadingSlash = (obj: any): any => {
  if (typeof obj === 'string') return obj.replace(/^\//, '');
  if (typeof obj === 'function')
    return (...args: any[]) => obj(...args).replace(/^\//, '');
  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, stripLeadingSlash(v)])
    );
  }
  return obj;
};

export const ROUTES_WITHOUT_SLASH = stripLeadingSlash(ROUTES);
