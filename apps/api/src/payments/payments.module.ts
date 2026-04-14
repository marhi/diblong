import { Global, Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { StubPaymentProvider } from './providers/stub-payment.provider';

@Global()
@Module({
  providers: [PaymentsService, StubPaymentProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
