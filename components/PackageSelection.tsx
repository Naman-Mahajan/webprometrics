import React, { useState, useEffect } from 'react';
import { Check, CreditCard, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { config } from '../services/config';
import PaymentModal from './PaymentModal';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

interface PackageSelectionProps {
  onComplete?: () => void;
  showTrialExpired?: boolean;
}

const PackageSelection: React.FC<PackageSelectionProps> = ({ onComplete, showTrialExpired = false }) => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/packages`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      addToast('Failed to load packages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = async (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsProcessing(true);

    try {
      // Create subscription
      const response = await fetch(`${config.API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('wpm_auth_token')}`
        },
        body: JSON.stringify({
          packageId: pkg.id,
          paymentMethod: 'card' // Will be processed via payment modal
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create subscription');
      }

      const subscription = await response.json();
      setSubscriptionId(subscription.id);

      // Create invoice for payment
      const invoiceResponse = await fetch(`${config.API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('wpm_auth_token')}`
        },
        body: JSON.stringify({
          clientId: user?.id,
          amount: pkg.price,
          subscriptionId: subscription.id,
          items: [{
            description: `${pkg.name} - ${pkg.interval}`,
            amount: pkg.price
          }]
        })
      });

      if (invoiceResponse.ok) {
        const invoice = await invoiceResponse.json();
        // Show payment modal
        setShowPayment(true);
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (error: any) {
      addToast(error.message || 'Failed to select package', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (subscriptionId) {
      try {
        // Activate subscription after payment
        const response = await fetch(`${config.API_BASE_URL}/subscriptions/${subscriptionId}/activate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('wpm_auth_token')}`
          }
        });

        if (response.ok) {
          addToast('Subscription activated successfully!', 'success');
          // Refresh user data
          if (user) {
            const userResponse = await fetch(`${config.API_BASE_URL}/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('wpm_auth_token')}`
              }
            });
            if (userResponse.ok) {
              const updatedUser = await userResponse.json();
              updateProfile(updatedUser);
            }
          }
          setShowPayment(false);
          if (onComplete) {
            onComplete();
          }
        }
      } catch (error) {
        console.error('Error activating subscription:', error);
        addToast('Payment successful but failed to activate subscription', 'warning');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {showTrialExpired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Trial Period Expired</h3>
            <p className="text-sm text-red-700">Please select a package to continue using the application.</p>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select a package that fits your needs</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-xl border-2 p-6 shadow-sm transition-all ${
              selectedPackage?.id === pkg.id
                ? 'border-brand-500 shadow-md'
                : 'border-gray-200 hover:border-brand-300 hover:shadow-md'
            }`}
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  KES {pkg.price.toLocaleString()}
                </span>
                <span className="text-gray-500 ml-2">/{pkg.interval}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {pkg.features?.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPackage(pkg)}
              disabled={isProcessing || selectedPackage?.id === pkg.id}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                selectedPackage?.id === pkg.id
                  ? 'bg-brand-600 text-white cursor-not-allowed'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isProcessing && selectedPackage?.id === pkg.id ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Select Plan
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {showPayment && selectedPackage && subscriptionId && (
        <PaymentModal
          invoice={{
            id: `inv_${subscriptionId}`,
            clientName: user?.companyName || user?.name || 'Client',
            amount: selectedPackage.price,
            date: new Date().toLocaleDateString(),
            dueDate: new Date().toLocaleDateString(),
            status: 'Pending',
            items: [{
              description: `${selectedPackage.name} - ${selectedPackage.interval}`,
              amount: selectedPackage.price
            }]
          }}
          onClose={() => {
            setShowPayment(false);
            setSelectedPackage(null);
            setSubscriptionId(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default PackageSelection;

