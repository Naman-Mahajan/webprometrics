import React, { useState } from 'react';
import { Check, ArrowRight, Zap, Shield, Headphones, X } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface PricingPageEnhancedProps {
  onNavigateToSignup: () => void;
  onNavigateToDashboard?: () => void;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  displayPrice: string;
  description: string;
  features: string[];
  cta: string;
  variant: 'outline' | 'primary';
  featured?: boolean;
  savings?: string;
}

const PricingPageEnhanced: React.FC<PricingPageEnhancedProps> = ({ 
  onNavigateToSignup,
  onNavigateToDashboard 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: selectedBillingCycle === 'yearly' ? 24000 : 2500,
      period: selectedBillingCycle,
      displayPrice: selectedBillingCycle === 'yearly' ? 'KES 24,000' : 'KES 2,500',
      description: 'Perfect for freelancers managing a few clients.',
      features: [
        '5 Clients',
        'Google Ads & Facebook Ads',
        'Standard Templates',
        'PDF Export',
        'Email Support',
        '30-day Money-back Guarantee'
      ],
      cta: 'Start with 7-Day Trial',
      variant: 'outline' as const
    },
    {
      id: 'agency',
      name: 'Agency',
      price: selectedBillingCycle === 'yearly' ? 75000 : 7500,
      period: selectedBillingCycle,
      displayPrice: selectedBillingCycle === 'yearly' ? 'KES 75,000' : 'KES 7,500',
      description: 'For growing agencies needing more power.',
      features: [
        '20 Clients',
        'All 50+ Integrations',
        'White-label Reports',
        'Custom Domain',
        'Client Portal',
        'Priority Support',
        '30-day Money-back Guarantee'
      ],
      cta: 'Start with 7-Day Trial',
      variant: 'primary' as const,
      featured: true,
      savings: selectedBillingCycle === 'yearly' ? 'Save 17%' : undefined
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 0,
      period: selectedBillingCycle,
      displayPrice: 'Custom',
      description: 'For large teams requiring tailored solutions.',
      features: [
        'Unlimited Clients',
        'API Access',
        'Dedicated Account Manager',
        'SSO & Advanced Security',
        'Custom Onboarding',
        '24/7 Support',
        'SLA Guarantee'
      ],
      cta: 'Contact Sales',
      variant: 'outline' as const
    }
  ];

  const handleStartTrial = async (plan: Plan) => {
    if (!isAuthenticated) {
      // Redirect to signup if not logged in
      onNavigateToSignup();
      return;
    }

    if (plan.id === 'enterprise') {
      // For enterprise, show contact form
      window.location.href = 'mailto:sales@webprometrics.com?subject=Enterprise%20Plan%20Inquiry';
      return;
    }

    setSelectedPlan(plan);
    setLoadingPlan(plan.id);

    try {
      // Create trial subscription (7 days)
      const response = await api.post('/subscriptions/create-trial', {
        planId: plan.id,
        trialDays: 7,
        billingCycle: selectedBillingCycle
      });

      if (response.success || response.subscriptionId) {
        // Show payment modal to confirm payment after trial
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Trial creation error:', error);
      // Fallback: show payment modal
      setShowPaymentModal(true);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlan || !user) return;

    setLoadingPlan(selectedPlan.id);

    try {
      // Create checkout session
      const response = await api.post('/payments/create-checkout', {
        planId: selectedPlan.id,
        billingCycle: selectedBillingCycle,
        amount: selectedPlan.price,
        trialPeriodDays: 7
      });

      if (response.sessionUrl) {
        // Redirect to payment gateway (Stripe/M-Pesa)
        window.location.href = response.sessionUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to start payment. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/20 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Pricing That <span className="text-brand-600">Scales</span> With You
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Start with 7 days free access to any plan. Full access. No credit card required for trial.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={selectedBillingCycle === 'monthly'}
                  onChange={() => setSelectedBillingCycle('monthly')}
                  className="mr-2"
                />
                <span className="text-gray-700 font-medium">Monthly</span>
              </label>
              <div className="relative">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedBillingCycle === 'yearly'}
                    onChange={() => setSelectedBillingCycle('yearly')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 font-medium">Yearly</span>
                </label>
                <span className="absolute -top-8 -right-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl transition-all duration-300 flex flex-col overflow-hidden ${
                  plan.featured
                    ? 'border-2 border-brand-500 shadow-2xl relative bg-white md:scale-105'
                    : 'border border-gray-200 shadow-sm bg-white hover:shadow-lg hover:border-gray-300'
                }`}
              >
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    🚀 Most Popular
                  </div>
                )}

                {plan.savings && (
                  <div className="bg-green-50 border-b border-green-200 px-8 py-2 text-center">
                    <span className="text-green-700 font-bold text-sm">{plan.savings}</span>
                  </div>
                )}

                <div className="p-8 flex flex-col flex-1">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>

                  <div className="mb-8 bg-gray-50 rounded-lg p-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">{plan.displayPrice}</span>
                      <span className="ml-2 text-gray-600">
                        {selectedBillingCycle === 'monthly' ? '/month' : '/year'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Then {selectedBillingCycle === 'monthly' ? 'KES ' + plan.price + '/month' : 'KES ' + (plan.price / 12).toFixed(0) + '/month'}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start">
                        <Check className={`w-5 h-5 ${plan.featured ? 'text-brand-600' : 'text-green-500'} mr-3 flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.variant}
                    className="w-full justify-center"
                    onClick={() => handleStartTrial(plan)}
                    disabled={loadingPlan === plan.id}
                    size="lg"
                  >
                    {loadingPlan === plan.id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-20 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-8 bg-gray-50 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Detailed Feature Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-6 font-semibold text-gray-900">Features</th>
                    <th className="text-center p-6 font-semibold text-gray-900">Starter</th>
                    <th className="text-center p-6 font-semibold text-gray-900">Agency</th>
                    <th className="text-center p-6 font-semibold text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Number of Clients', starter: '5', agency: '20', enterprise: 'Unlimited' },
                    { feature: 'Integrations', starter: '10+', agency: '50+', enterprise: '50+ + Custom' },
                    { feature: 'White-label Reports', starter: '❌', agency: '✅', enterprise: '✅' },
                    { feature: 'Custom Domain', starter: '❌', agency: '✅', enterprise: '✅' },
                    { feature: 'API Access', starter: '❌', agency: '❌', enterprise: '✅' },
                    { feature: 'Priority Support', starter: '❌', agency: '✅', enterprise: '✅' },
                    { feature: '24/7 Support', starter: '❌', agency: '❌', enterprise: '✅' },
                    { feature: 'SLA Guarantee', starter: '❌', agency: '❌', enterprise: '✅' }
                  ].map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-6 font-medium text-gray-900">{row.feature}</td>
                      <td className="text-center p-6 text-gray-600">{row.starter}</td>
                      <td className="text-center p-6 text-gray-600">{row.agency}</td>
                      <td className="text-center p-6 text-gray-600">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {[
              { icon: Zap, title: '7-Day Free Trial', desc: 'Full access to any plan. No payment required.' },
              { icon: Shield, title: '30-Day Money Back', desc: 'Not satisfied? Get a full refund within 30 days.' },
              { icon: Headphones, title: '24/7 Support', desc: 'Get help whenever you need it from our team.' }
            ].map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:shadow-lg transition-all">
                  <Icon className="w-12 h-12 text-brand-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Questions?</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'How does the 7-day trial work?',
                  a: "Start instantly with full access to your chosen plan. After 7 days, you'll be charged for your subscription. Cancel anytime."
                },
                {
                  q: 'What happens if I cancel during trial?',
                  a: "You won't be charged. Cancel anytime before day 7 and your access will end immediately."
                },
                {
                  q: 'Can I change plans after subscribing?',
                  a: 'Yes! Upgrade or downgrade anytime. We\'ll prorate charges accordingly.'
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'Credit cards, M-Pesa, and bank transfers. For Enterprise, we offer custom payment terms.'
                },
                {
                  q: 'Do you offer discounts for annual billing?',
                  a: 'Yes! Save 17% when you choose yearly billing instead of monthly.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-20 text-center bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Reporting?</h2>
            <p className="text-lg mb-8 opacity-95">
              Join 3,000+ agencies already saving 10+ hours per week with WebProMetrics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleStartTrial(plans[1])}
              >
                Get 7-Day Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = 'mailto:sales@webprometrics.com'}
              >
                Talk to Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Trial Confirmation
            </h3>
            <p className="text-gray-600 mb-6">
              You're getting 7 days free access to the {selectedPlan.name} plan.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Next step:</strong> We'll set up payment for after your trial ends. You can cancel anytime.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">7-Day Trial:</span>
                <span className="font-bold text-gray-900">FREE</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                <span className="text-gray-600">After trial:</span>
                <span className="font-bold text-gray-900">{selectedPlan.displayPrice}</span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full justify-center mb-3"
              onClick={handleProceedToPayment}
              disabled={loadingPlan === selectedPlan.id}
            >
              {loadingPlan === selectedPlan.id ? 'Processing...' : 'Start Free Trial'}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPageEnhanced;
