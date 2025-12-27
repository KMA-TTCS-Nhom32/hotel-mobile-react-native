import {
  CancelPaymentRequestDto,
  CreatePaymentRequestDto,
} from '@ahomevilla-hotel/node-sdk';
import axios from 'axios';

import { ENDPOINTS, privateRequest } from '@/config/api';

import { IPaymentService } from './IPaymentService';

export class PaymentService implements IPaymentService {
  async createPayment(data: CreatePaymentRequestDto): Promise<any> {
    const response = await privateRequest.post(
      `${ENDPOINTS.CREATE_PAYMENT}`,
      data
    );
    return response.data;
  }

  async cancelPayment(data: CancelPaymentRequestDto): Promise<any> {
    const response = await privateRequest.post(
      `${ENDPOINTS.CANCEL_PAYMENT}`,
      data
    );
    return response.data;
  }

  async getPaymentStatus(paymentLinkId: string): Promise<any> {
    const response = await privateRequest.get(
      ENDPOINTS.GET_PAYMENT_STATUS.replace(':paymentLinkId', paymentLinkId)
    );
    return response.data;
  }

  async getBankList(): Promise<any> {
    const res = await axios({
      method: 'GET',
      url: `${process.env.NEXT_PUBLIC_LISTS_BANK_URL}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  }
}
