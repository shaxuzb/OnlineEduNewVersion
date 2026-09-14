export interface PaymentCardInput {
  number: string;
  expire: string;
}

export interface CreatePurchaseOrderRequest {
  scopeIds?: number;
  planId: number;
  paymentType: string;
  card?: PaymentCardInput;
}

export interface PurchaseOrderResponse {
  id: number;
  paymentUrl?: string;
  [key: string]: unknown;
}

export interface CardSmsResponse {
  phone: string;
  [key: string]: unknown;
}
