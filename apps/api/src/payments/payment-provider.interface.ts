export type AuthorizeInput = {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail?: string;
};

export type AuthorizeResult = {
  success: boolean;
  providerId: string;
  reference?: string;
  message?: string;
};

export interface PaymentProvider {
  readonly id: string;
  authorize(input: AuthorizeInput): Promise<AuthorizeResult>;
}
