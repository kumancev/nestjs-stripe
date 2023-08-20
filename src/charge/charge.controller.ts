import { Body, Controller, Post, Req } from '@nestjs/common';
import CreateChargeDto from './dto/createCharge.dto';
import StripeService from '../stripe/stripe.service';

@Controller('charge')
export class ChargeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  async createCharge(@Body() charge: CreateChargeDto, @Req() request) {
    await this.stripeService.charge(
      charge.amount,
      charge.paymentMethodId,
      request.user.stripeCustomerId,
    );
  }
}
