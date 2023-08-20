import { Module } from '@nestjs/common';
import StripeService from 'src/stripe/stripe.service';
import { ChargeController } from './charge.controller';

@Module({
  controllers: [ChargeController],
  providers: [StripeService],
})
export class ChargeModule {}
