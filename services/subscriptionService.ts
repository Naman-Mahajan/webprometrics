/**
 * Subscription & Payment Service
 * Handles trial, payment, and subscription management
 */

import { api } from './api';

export interface TrialRequest {
  planId: 'starter' | 'agency' | 'enterprise';
  trialDays?: number;
  billingCycle: 'monthly' | 'yearly';
}

export interface PaymentCheckoutRequest {
  planId: 'starter' | 'agency' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  trialPeriodDays?: number;
}

export interface PaymentConfirmRequest {
  paymentIntentId: string;
  transactionId: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trialStartsAt?: string;
  trialEndsAt?: string;
  trialDaysRemaining?: number;
  startDate?: string;
  nextBillingDate?: string;
  amount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  description: string;
  features: string[];
}

/**
 * Create a 7-day trial subscription
 */
export const createTrialSubscription = async (
  request: TrialRequest
): Promise<{ success: boolean; subscriptionId: string; subscription: Subscription }> => {
  const response = await api.post('/subscriptions/create-trial', request);
  return response;
};

/**
 * Create a payment checkout session
 */
export const createPaymentCheckout = async (
  request: PaymentCheckoutRequest
): Promise<{ success: boolean; paymentIntentId: string; sessionUrl: string }> => {
  const response = await api.post('/payments/create-checkout', request);
  return response;
};

/**
 * Confirm payment and activate subscription
 */
export const confirmPayment = async (
  request: PaymentConfirmRequest
): Promise<{ success: boolean; subscription: Subscription; message: string }> => {
  const response = await api.post('/payments/confirm', request);
  return response;
};

/**
 * Get current subscription status
 */
export const getCurrentSubscription = async (): Promise<{ subscription: Subscription | null }> => {
  const response = await api.get('/subscriptions/current');
  return response;
};

/**
 * Cancel active subscription
 */
export const cancelSubscription = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/subscriptions/cancel', {});
  return response;
};

/**
 * Upgrade or downgrade plan
 */
export const changePlan = async (
  newPlanId: 'starter' | 'agency' | 'enterprise',
  billingCycle: 'monthly' | 'yearly'
): Promise<{ success: boolean; subscription: Subscription; message: string }> => {
  const response = await api.post('/subscriptions/change-plan', {
    newPlanId,
    billingCycle
  });
  return response;
};

/**
 * Check if trial has expired
 */
export const checkTrialExpiry = async (): Promise<{
  expired: boolean;
  trialActive?: boolean;
  daysRemaining?: number;
  trialEndsAt?: string;
  message: string;
}> => {
  const response = await api.post('/subscriptions/check-trial-expiry', {});
  return response;
};

/**
 * Get pricing plans configuration
 */
export const getPricingPlans = (): PricingPlan[] => {
  return [
    {
      id: 'starter',
      name: 'Starter',
      price: 2500,
      period: 'monthly',
      description: 'Perfect for freelancers managing a few clients.',
      features: [
        '5 Clients',
        'Google Ads & Facebook Ads',
        'Standard Templates',
        'PDF Export',
        'Email Support',
        '30-day Money-back Guarantee'
      ]
    },
    {
      id: 'agency',
      name: 'Agency',
      price: 7500,
      period: 'monthly',
      description: 'For growing agencies needing more power.',
      features: [
        '20 Clients',
        'All 50+ Integrations',
        'White-label Reports',
        'Custom Domain',
        'Client Portal',
        'Priority Support',
        '30-day Money-back Guarantee'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 0,
      period: 'monthly',
      description: 'For large teams requiring tailored solutions.',
      features: [
        'Unlimited Clients',
        'API Access',
        'Dedicated Account Manager',
        'SSO & Advanced Security',
        'Custom Onboarding',
        '24/7 Support',
        'SLA Guarantee'
      ]
    }
  ];
};

/**
 * Calculate effective price based on billing cycle
 */
export const calculatePrice = (
  monthlyPrice: number,
  billingCycle: 'monthly' | 'yearly'
): number => {
  if (billingCycle === 'yearly') {
    // 17% discount for yearly
    return Math.floor(monthlyPrice * 12 * 0.83);
  }
  return monthlyPrice;
};

/**
 * Format price for display
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Check if user has access based on subscription/trial status
 */
export const hasAccess = (subscription: Subscription | null | undefined): boolean => {
  if (!subscription) {
    return false;
  }

  if (subscription.status === 'trial') {
    // Check if trial is still active
    if (subscription.trialEndsAt) {
      return new Date() < new Date(subscription.trialEndsAt);
    }
    return true;
  }

  return subscription.status === 'active';
};

/**
 * Get trial days remaining
 */
export const getTrialDaysRemaining = (subscription: Subscription | null): number => {
  if (!subscription || subscription.status !== 'trial' || !subscription.trialEndsAt) {
    return 0;
  }

  const now = new Date();
  const trialEnd = new Date(subscription.trialEndsAt);
  const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return Math.max(0, daysRemaining);
};

/**
 * Get plan details from plan ID
 */
export const getPlanDetails = (planId: string): PricingPlan | undefined => {
  return getPricingPlans().find(plan => plan.id === planId);
};
