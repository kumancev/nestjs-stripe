import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export default class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-08-16',
    });
  }

  public async createCustomer(name: string, email: string) {
    return await this.stripe.customers.create({
      name,
      email,
    });
  }
}
