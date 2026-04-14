import { Injectable } from '@nestjs/common';
import { AuthorizeInput, AuthorizeResult, PaymentProvider } from './payment-provider.interface';
import { StubPaymentProvider } from './providers/stub-payment.provider';

@Injectable()
export class PaymentsService {
  private readonly providers = new Map<string, PaymentProvider>();

  constructor(private readonly stub: StubPaymentProvider) {
    this.register(stub);
  }

  register(provider: PaymentProvider) {
    this.providers.set(provider.id, provider);
  }

  getDefault(): PaymentProvider {
    return this.stub;
  }

  get(id: string): PaymentProvider | undefined {
    return this.providers.get(id);
  }

  async authorizeWithDefault(input: AuthorizeInput): Promise<AuthorizeResult> {
    return this.getDefault().authorize(input);
  }
}
