import { Body, Controller, Post, Req, Res, Headers } from '@nestjs/common';
import StripeService from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Req() req, @Res() res) {
    await this.stripeService.createCheckoutSession(req.body.lookup_key, res);
  }

  @Post('create-portal-session')
  async createPortalSession(@Req() req, @Res() res) {
    await this.stripeService.createPortalSession(req.body.session_id, res);
  }

  @Post('webhook')
  async handleWebhook(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
    @Res() res,
  ) {
    const result = await this.stripeService.handleWebhookEvent(body, signature);
    if (result) {
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  }
}
