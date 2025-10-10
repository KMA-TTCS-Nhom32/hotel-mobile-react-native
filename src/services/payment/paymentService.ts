import {
  CancelPaymentRequestDto,
  CreatePaymentRequestDto,
} from '@ahomevilla-hotel/node-sdk';
import axios from 'axios';

import { ENDPOINTS, privateRequest } from '@/config/api';
import { handleServiceError } from '@/utils/errors';

import { IPaymentService } from './IPaymentService';

export class PaymentService implements IPaymentService {
  async createPayment(data: CreatePaymentRequestDto): Promise<any> {
    try {
      const response = await privateRequest.post(
        `${ENDPOINTS.CREATE_PAYMENT}`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleServiceError(error, 'Failed to create payment');
    }
  }

  async cancelPayment(data: CancelPaymentRequestDto): Promise<any> {
    try {
      const response = await privateRequest.post(
        `${ENDPOINTS.CANCEL_PAYMENT}`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleServiceError(error, 'Failed to cancel payment');
    }
  }

  async getPaymentStatus(paymentLinkId: string): Promise<any> {
    try {
      const response = await privateRequest.get(
        ENDPOINTS.GET_PAYMENT_STATUS.replace(':paymentLinkId', paymentLinkId)
      );
      return response.data;
    } catch (error) {
      throw handleServiceError(error, 'Failed to get payment status');
    }
  }

  async getBankList(): Promise<any> {
    try {
      const res = await axios({
        method: 'GET',
        url: `${process.env.NEXT_PUBLIC_LISTS_BANK_URL}`,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.data;
    } catch (error) {
      console.error('Failed to fetch bank list:', error);
      return []; // Return empty array on failure
    }
  }
}
