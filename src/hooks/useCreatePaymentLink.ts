/**
 * useCreatePaymentLink Hook
 * React Query mutation for creating VietQR/MoMo payment links
 */

import type { CreatePaymentRequestDto } from '@ahomevilla-hotel/node-sdk';
import { useMutation } from '@tanstack/react-query';

import { PaymentService } from '@/services/payment/paymentService';
import { useAuth } from '@/store/authStore';

interface PaymentLinkParams {
  bookingCode: string;
  amount: number;
  description?: string;
  items?: any[];
}

interface PaymentLinkResponse {
  qrCode: string;
  accountName: string;
  accountNumber: string;
  bin: string;
  amount: number;
  orderCode: string;
  // Add other fields from backend response
}

interface UseCreatePaymentLinkOptions {
  onSuccess?: (paymentData: PaymentLinkResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for creating payment link for online payments (VIET_QR, MOMO)
 * Automatically includes user info from authStore
 */
export const useCreatePaymentLink = (options?: UseCreatePaymentLinkOptions) => {
  const { user } = useAuth();
  const paymentService = new PaymentService();

  return useMutation({
    mutationFn: async (params: PaymentLinkParams) => {
      const requestData: CreatePaymentRequestDto = {
        orderCode: Number(params.bookingCode),
        amount: params.amount / 100,
        description: params.description || `AHomeVilla-${params.bookingCode}`,
        cancelUrl: 'ahomevilla://payment/cancel',
        returnUrl: 'ahomevilla://payment/success',
        buyerName: user?.name,
        buyerEmail: user?.email,
        buyerPhone: user?.phone,
        items: params.items,
      };
      console.log('create payment request', requestData);
      const response = await paymentService.createPayment(requestData);

      // Extract the nested data object from the response
      // API returns: { code, data: {...payment details...}, desc, signature }
      // We only need the data object for the payment screen
      return response.data;
    },
    onSuccess: data => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error('Payment link creation error:', error);
      options?.onError?.(error);
    },
  });
};
