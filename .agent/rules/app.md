---
trigger: always_on
---

# Hotel Mobile App - Development Rules & Guidelines

## 📱 Tech Stack Overview

| Category | Technology | Version |
|----------|------------|---------|
| **Core** | React Native | 0.81.4 |
| **Framework** | Expo | ~54.0.10 |
| **Routing** | Expo Router | ~6.0.10 |
| **State Management** | Zustand | ^5.0.8 |
| **Server State** | TanStack React Query | ^5.85.5 |
| **Styling** | NativeWind + TailwindCSS | ^4.1.23 |
| **Forms** | React Hook Form + Zod | ^7.62.0 / ^4.1.11 |
| **i18n** | i18next + react-i18next | ^25.4.2 |
| **Backend SDK** | @ahomevilla-hotel/node-sdk | latest |
| **HTTP Client** | Axios | ^1.11.0 |
| **UI Components** | React Native Paper | ^5.14.5 |

---

## 🏗️ Project Structure

```
src/
├── app/              # Expo Router file-based routes
│   ├── (tabs)/       # Tab navigation group
│   ├── auth/         # Authentication screens
│   ├── branches/     # Branch detail screens
│   ├── payment/      # Payment flow screens
│   └── rooms/        # Room detail screens
├── components/       # Reusable UI components
├── config/           # App configuration (API, constants)
├── constants/        # Static values and enums
├── hooks/            # Custom React hooks
├── i18n/             # Internationalization files
├── screens/          # Screen components (used by routes)
├── services/         # API service layer
├── store/            # Zustand stores
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

---

## 🔌 Backend SDK Integration Rules

> [!IMPORTANT]
> **Always prioritize using types, DTOs, and interfaces from `@ahomevilla-hotel/node-sdk`** over creating local type definitions.

### ✅ Correct Usage

```typescript
// Use SDK types directly
import type {
  LoginDto,
  LoginResponseDto,
  User,
  Branch,
  Room,
  Booking,
  CreateBookingDto,
} from '@ahomevilla-hotel/node-sdk';

// Service implementation using SDK types
export class BookingService implements IBookingService {
  async createBooking(payload: CreateBookingDto): Promise<Booking> {
    const response = await privateRequest.post<Booking>(
      ENDPOINTS.BOOKINGS,
      payload
    );
    return response.data;
  }
}
```

### ❌ Incorrect Usage

```typescript
// DON'T create local types that duplicate SDK types
interface LocalUser {
  id: string;
  email: string;
  // ...duplicating SDK User type
}

// DON'T use `any` when SDK provides proper types
const login = async (data: any) => { ... }
```

### SDK Type Extension

When SDK types need frontend-specific properties, use TypeScript extension:

```typescript
// In src/types/sdk-extensions.d.ts
import type { Room } from '@ahomevilla-hotel/node-sdk';

export interface RoomWithUI extends Room {
  isSelected?: boolean;
  displayPrice?: string;
}
```

---

## 🗂️ Service Layer Pattern

Services follow the **Interface + Implementation + Singleton** pattern:

### File Structure

```
services/
└── auth/
    ├── IAuthService.ts      # Interface definition
    └── authService.ts       # Implementation + singleton export
```

### Interface Definition

```typescript
// IAuthService.ts
import type { LoginDto, LoginResponseDto, User } from '@ahomevilla-hotel/node-sdk';

export interface IAuthService {
  login(credentials: LoginDto): Promise<LoginResponseDto>;
  logout(): Promise<void>;
  getProfile(): Promise<User>;
}
```

### Implementation

```typescript
// authService.ts
import type { LoginDto, LoginResponseDto, User } from '@ahomevilla-hotel/node-sdk';
import { ENDPOINTS, privateRequest, publicRequest } from '@/config/api';
import { handleServiceError } from '@/utils/errors';
import type { IAuthService } from './IAuthService';

export class AuthService implements IAuthService {
  login = async (credentials: LoginDto): Promise<LoginResponseDto> => {
    try {
      const response = await publicRequest.post<LoginResponseDto>(
        ENDPOINTS.LOGIN,
        credentials
      );
      return response.data;
    } catch (error) {
      throw handleServiceError(error, 'Login failed');
    }
  };
  // ... other methods
}

// Export singleton instance
export const authService = new AuthService();
```

---

## 🔄 React Query Patterns

### Query Keys Convention

Define query keys as typed constants for type safety and consistency:

```typescript
export const AUTH_QUERY_KEYS = {
  isAuthenticated: ['auth', 'isAuthenticated'] as const,
  profile: ['auth', 'profile'] as const,
} as const;

export const BRANCH_QUERY_KEYS = {
  all: ['branches'] as const,
  list: (filters: BranchFilters) => ['branches', 'list', filters] as const,
  detail: (id: string) => ['branches', 'detail', id] as const,
} as const;
```

### Custom Hook Pattern

```typescript
// hooks/useBranches.ts
import { useQuery } from '@tanstack/react-query';
import type { Branch, PaginatedResponse } from '@ahomevilla-hotel/node-sdk';
import { branchService } from '@/services/branches/branchService';
import { BRANCH_QUERY_KEYS } from './queryKeys';

export const useBranches = (filters?: BranchFilters) => {
  return useQuery({
    queryKey: BRANCH_QUERY_KEYS.list(filters ?? {}),
    queryFn: () => branchService.getBranches(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### React Native Specific Setup

Configure focus and online managers for React Native:

```typescript
// In app/_layout.tsx or config/queryClient.ts
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';

// Focus management
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (Platform.OS !== 'web') {
      handleFocus(state === 'active');
    }
  });
  return () => subscription.remove();
});

// Online status management
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});
```

---

## 🧭 Expo Router Navigation

### File-based Routing

Routes are defined by file structure in `src/app/`:

```
app/
├── _layout.tsx           # Root layout
├── (tabs)/               # Tab group
│   ├── _layout.tsx       # Tab navigator config
│   ├── index.tsx         # Home tab (/)
│   ├── search.tsx        # Search tab
│   └── profile.tsx       # Profile tab
├── auth/
│   ├── login.tsx         # /auth/login
│   └── register.tsx      # /auth/register
├── rooms/
│   └── [id].tsx          # /rooms/:id (dynamic route)
└── branches/
    └── [branchId].tsx    # /branches/:branchId
```

### Navigation Patterns

```typescript
import { router, Link, useLocalSearchParams } from 'expo-router';

// Declarative navigation
<Link href="/rooms/123">View Room</Link>

// With params object
<Link href={{ pathname: '/rooms/[id]', params: { id: roomId } }}>
  View Room
</Link>

// Imperative navigation
router.push('/rooms/123');
router.navigate({ pathname: '/rooms/[id]', params: { id: roomId } });
router.replace('/auth/login'); // Replace current screen
router.back(); // Go back

// Reading dynamic params
const { id } = useLocalSearchParams<{ id: string }>();
```

### Typed Routes

Enable typed routes in `app.json`:

```json
{
  "expo": {
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

---

## 🎨 Styling with NativeWind

### Component Styling

```tsx
import { View, Text, Pressable } from 'react-native';

export function Button({ title, onPress, variant = 'primary' }) {
  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        'px-4 py-3 rounded-xl active:opacity-80',
        variant === 'primary' && 'bg-primary',
        variant === 'secondary' && 'bg-secondary'
      )}
    >
      <Text className="text-white font-semibold text-center">{title}</Text>
    </Pressable>
  );
}
```

### Custom Theme Colors

Defined in `tailwind.config.js` - always use semantic color names:

```tsx
// ✅ Good - uses theme tokens
<View className="bg-primary text-on-primary" />
<View className="bg-surface border-outline" />

// ❌ Avoid - hardcoded colors
<View className="bg-blue-500" />
```

---

## 📝 Form Handling

### React Hook Form + Zod Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { LoginDto } from '@ahomevilla-hotel/node-sdk';

// Schema matches SDK DTO
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}) satisfies z.ZodType<LoginDto>;

export function LoginForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginDto) => {
    // data is typed as LoginDto
  };

  return (/* ... */);
}
```

---

## 🌍 Internationalization

### Translation Hook Usage

```tsx
import { useTranslation } from 'react-i18next';

export function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('welcome.title')}</Text>
      <Text>{t('welcome.greeting', { name: user.name })}</Text>
    </View>
  );
}
```

### Translation File Structure

```
i18n/
├── index.ts              # i18n configuration
├── locales/
│   ├── en.json           # English translations
│   └── vi.json           # Vietnamese translations
```

---

## 🗃️ State Management with Zustand

### Store Pattern

```typescript
// store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@ahomevilla-hotel/node-sdk';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Usage Guidelines

| Use Zustand For | Use React Query For |
|-----------------|---------------------|
| UI state (modals, filters) | Server data (branches, rooms) |
| User preferences | API responses |
| Authentication tokens | Cached queries |
| Form draft data | Mutations |

---

## 📁 Path Aliases

Configured in `tsconfig.json`:

```typescript
// Use aliases for clean imports
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth/authService';
import type { BookingFilters } from '@/types/booking';
import { formatPrice } from '@/utils/formatters';
import { API_URL } from '@/config/api';
import { Colors } from '@/constants/Colors';
```

---