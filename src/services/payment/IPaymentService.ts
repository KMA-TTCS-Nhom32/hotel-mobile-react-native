import {
  CancelPaymentRequestDto,
  CreatePaymentRequestDto,
} from '@ahomevilla-hotel/node-sdk';

export interface IPaymentService {
  createPayment(data: CreatePaymentRequestDto): Promise<any>;
  cancelPayment(data: CancelPaymentRequestDto): Promise<any>;
  getPaymentStatus(paymentLinkId: string): Promise<any>;
  getBankList(): Promise<any>;
}
