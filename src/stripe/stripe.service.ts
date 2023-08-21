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

  public async charge(
    amount: number,
    paymentMethodId: string,
    customerId: string,
  ) {
    return this.stripe.paymentIntents.create({
      amount,
      customer: customerId,
      payment_method: paymentMethodId,
      currency: this.configService.get('STRIPE_CURRENCY'),
      confirm: true,
    });
  }

  public async createCheckoutSession(req: any, res) {
    console.log('REQUEST >>> ', req);

    const prices = await this.stripe.prices.list({
      lookup_keys: [req],
      expand: ['data.product'],
    });
    console.log('PRICES >>> ', prices);
    const session = await this.stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: prices.data[0].id,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `http://localhost:3000/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/cancel.html`,
    });

    res.redirect(303, session.url);
  }

  public async createPortalSession(req, res) {
    // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    // Typically this is stored alongside the authenticated user in your database.

    const session_id = req;
    const checkoutSession =
      await this.stripe.checkout.sessions.retrieve(session_id);

    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = 'http://localhost:3000/';

    const portalSession = await this.stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer as string,
      return_url: returnUrl,
    });

    res.redirect(303, portalSession.url);
  }

  public async handleWebhookEvent(
    body: any,
    signature: string,
  ): Promise<boolean> {
    const endpointSecret = 'whsec_12345'; // Replace with your actual endpoint secret

    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret,
      );

      switch (event.type) {
        case 'customer.subscription.trial_will_end':
          // Handle the event
          break;
        case 'customer.subscription.deleted':
          // Handle the event
          break;
        case 'customer.subscription.created':
          // Handle the event
          break;
        case 'customer.subscription.updated':
          // Handle the event
          break;
        default:
          console.log(`Unhandled event type ${event.type}.`);
      }

      return true;
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return false;
    }
  }
}
