import { Injectable } from '@nestjs/common';
import {
  AuthorizeInput,
  AuthorizeResult,
  PaymentProvider,
} from '../payment-provider.interface';

@Injectable()
export class StubPaymentProvider implements PaymentProvider {
  readonly id = 'stub';

  async authorize(input: AuthorizeInput): Promise<AuthorizeResult> {
    return {
      success: true,
      providerId: this.id,
      reference: `stub_${input.orderId}`,
      message: 'Stub provider always succeeds (replace in production).',
    };
  }
}
