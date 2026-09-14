export type PurchaseStackParamList = {
  PurchaseScreen: undefined;
  PurchasePrice: undefined;
  Checkout: undefined;
  CreditCardScreen: { paymentType: string | number };
  OTPCardVerification: { orderId: number; phoneNumber: string };
};
