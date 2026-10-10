import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { checkoutParams, isBillingInterval, priceFor, subscriptionRow } from "./billing";
import { TRIAL_DAYS } from "./pro";

const prices = { month: "price_month", year: "price_year" };

describe("annual billing: choosing the price", () => {
  it("uses the monthly or annual price ID", () => {
    expect(priceFor("month", prices)).toBe("price_month");
    expect(priceFor("year", prices)).toBe("price_year");
  });
  it("offers no annual price until STRIPE_PRICE_PRO_ANNUAL is set", () => {
    expect(priceFor("year", { month: "price_month", year: null })).toBeNull();
  });
  it("only accepts month or year", () => {
    expect(isBillingInterval("year")).toBe(true);
    expect(isBillingInterval("week")).toBe(false);
    expect(isBillingInterval(undefined)).toBe(false);
  });
});

describe("annual billing: checkout session", () => {
  const input = { userId: "u1", email: "a@example.com", customerId: null, origin: "https://www.pellonutrition.com" };
  for (const price of ["price_month", "price_year"]) {
    it(`keeps the ${TRIAL_DAYS}-day free trial for ${price}`, () => {
      const p = checkoutParams({ ...input, price, hadTrial: false });
      expect(p.line_items).toEqual([{ price, quantity: 1 }]);
      expect(p.subscription_data?.trial_period_days).toBe(TRIAL_DAYS);
      expect(p.subscription_data?.trial_settings?.end_behavior?.missing_payment_method).toBe("cancel");
      expect(p.payment_method_collection).toBe("if_required");
      expect(p.mode).toBe("subscription");
      expect(p.subscription_data?.metadata?.supabase_user_id).toBe("u1");
    });
  }
  it("offers no second trial", () => {
    const p = checkoutParams({ ...input, price: "price_year", hadTrial: true });
    expect(p.subscription_data?.trial_period_days).toBeUndefined();
    expect(p.payment_method_collection).toBeUndefined();
  });
  it("reuses an existing Stripe customer", () => {
    const p = checkoutParams({ ...input, price: "price_year", hadTrial: true, customerId: "cus_1" });
    expect(p.customer).toBe("cus_1");
    expect(p.customer_email).toBeUndefined();
  });
});

function sub(over: Partial<Record<string, unknown>> & { interval?: "month" | "year"; periodEnd?: number }): Stripe.Subscription {
  const { interval = "year", periodEnd = 1_800_000_000, ...rest } = over;
  return {
    id: "sub_1", customer: "cus_1", status: "active", cancel_at_period_end: false, cancel_at: null,
    trial_start: null, trial_end: null, start_date: 1_790_000_000,
    items: { data: [{ current_period_end: periodEnd, price: { recurring: { interval } } }] },
    ...rest,
  } as unknown as Stripe.Subscription;
}

describe("webhook: subscription rows", () => {
  it("maps an annual subscription", () => {
    const { base, extra } = subscriptionRow(sub({}), "u1");
    expect(base.status).toBe("pro");
    expect(base.current_period_end).toBe(new Date(1_800_000_000 * 1000).toISOString());
    expect(extra.billing_interval).toBe("year");
    expect(extra.started_at).toBe(new Date(1_790_000_000 * 1000).toISOString());
  });
  it("moves the period end on at renewal", () => {
    const renewed = subscriptionRow(sub({ periodEnd: 1_831_536_000 }), "u1").base;
    expect(renewed.current_period_end).toBe(new Date(1_831_536_000 * 1000).toISOString());
    expect(renewed.status).toBe("pro");
  });
  it("keeps Pro until the period end after canceling, then ends it", () => {
    expect(subscriptionRow(sub({ cancel_at_period_end: true }), "u1").base).toMatchObject({ status: "pro", cancel_at_period_end: true });
    expect(subscriptionRow(sub({ status: "canceled" }), "u1").base.status).toBe("free");
  });
  it("treats trialing and past_due as Pro, unpaid and incomplete as free", () => {
    expect(subscriptionRow(sub({ status: "trialing", trial_start: 1 }), "u1").base).toMatchObject({ status: "pro", had_trial: true });
    expect(subscriptionRow(sub({ status: "past_due" }), "u1").base.status).toBe("pro");
    expect(subscriptionRow(sub({ status: "unpaid" }), "u1").base.status).toBe("free");
    expect(subscriptionRow(sub({ status: "incomplete_expired" }), "u1").base.status).toBe("free");
  });
  it("maps monthly subscriptions the same way", () => {
    expect(subscriptionRow(sub({ interval: "month" }), "u1").extra.billing_interval).toBe("month");
  });
});
