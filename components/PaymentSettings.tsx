import React, { useState, useEffect } from 'react';
import { Save, CreditCard, Building2, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { config } from '../services/config';
import { useToast } from '../context/ToastContext';

interface PaymentConfig {
  stripe: {
    enabled: boolean;
    publishableKey: string;
    secretKey?: string;
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    clientSecret?: string;
    mode: 'sandbox' | 'live';
  };
  bankAccount: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    swiftCode: string;
    routingNumber: string;
  };
}

const PaymentSettings: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<PaymentConfig>({
    stripe: {
      enabled: false,
      publishableKey: '',
      secretKey: ''
    },
    paypal: {
      enabled: false,
      clientId: '',
      clientSecret: '',
      mode: 'sandbox'
    },
    bankAccount: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      swiftCode: '',
      routingNumber: ''
    }
  });

  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/payments/config`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('wpm_auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConfig({
          stripe: {
            enabled: data.stripe?.enabled || false,
            publishableKey: data.stripe?.publishableKey || '',
            secretKey: ''
          },
          paypal: {
            enabled: data.paypal?.enabled || false,
            clientId: data.paypal?.clientId || '',
            clientSecret: '',
            mode: data.paypal?.mode || 'sandbox'
          },
          bankAccount: data.bankAccount || {
            accountName: '',
            accountNumber: '',
            bankName: '',
            swiftCode: '',
            routingNumber: ''
          }
        });
      }
    } catch (error) {
      console.error('Error loading payment config:', error);
      addToast('Failed to load payment configuration', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/payments/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('wpm_auth_token')}`
        },
        body: JSON.stringify({
          stripe: {
            enabled: config.stripe.enabled,
            publishableKey: config.stripe.publishableKey,
            secretKey: config.stripe.secretKey || undefined
          },
          paypal: {
            enabled: config.paypal.enabled,
            clientId: config.paypal.clientId,
            clientSecret: config.paypal.clientSecret || undefined,
            mode: config.paypal.mode
          },
          bankAccount: config.bankAccount
        })
      });

      if (response.ok) {
        addToast('Payment configuration saved successfully', 'success');
        // Clear secret fields after saving
        setConfig(prev => ({
          ...prev,
          stripe: { ...prev.stripe, secretKey: '' },
          paypal: { ...prev.paypal, clientSecret: '' }
        }));
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save configuration');
      }
    } catch (error: any) {
      addToast(error.message || 'Failed to save payment configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CreditCard className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payment Gateway Configuration</h3>
            <p className="text-sm text-gray-500">Configure payment methods for your clients</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Stripe Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="stripe-enabled"
                  checked={config.stripe.enabled}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    stripe: { ...prev.stripe, enabled: e.target.checked }
                  }))}
                  className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                />
                <label htmlFor="stripe-enabled" className="font-semibold text-gray-900">
                  Enable Stripe (Visa & Mastercard)
                </label>
              </div>
            </div>
            
            {config.stripe.enabled && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stripe Publishable Key
                  </label>
                  <input
                    type="text"
                    value={config.stripe.publishableKey}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      stripe: { ...prev.stripe, publishableKey: e.target.value }
                    }))}
                    placeholder="pk_test_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stripe Secret Key {!showSecrets && '(hidden)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={config.stripe.secretKey}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        stripe: { ...prev.stripe, secretKey: e.target.value }
                      }))}
                      placeholder="sk_test_..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Lock size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only enter if you want to update. Leave blank to keep existing key.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PayPal Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="paypal-enabled"
                  checked={config.paypal.enabled}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    paypal: { ...prev.paypal, enabled: e.target.checked }
                  }))}
                  className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                />
                <label htmlFor="paypal-enabled" className="font-semibold text-gray-900">
                  Enable PayPal
                </label>
              </div>
            </div>
            
            {config.paypal.enabled && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PayPal Client ID
                  </label>
                  <input
                    type="text"
                    value={config.paypal.clientId}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      paypal: { ...prev.paypal, clientId: e.target.value }
                    }))}
                    placeholder="Your PayPal Client ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PayPal Client Secret {!showSecrets && '(hidden)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={config.paypal.clientSecret}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        paypal: { ...prev.paypal, clientSecret: e.target.value }
                      }))}
                      placeholder="Your PayPal Client Secret"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Lock size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only enter if you want to update. Leave blank to keep existing secret.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PayPal Mode
                  </label>
                  <select
                    value={config.paypal.mode}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      paypal: { ...prev.paypal, mode: e.target.value as 'sandbox' | 'live' }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="live">Live (Production)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Bank Account Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={18} className="text-gray-600" />
              <h4 className="font-semibold text-gray-900">Bank Account Details</h4>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Bank account information for manual transfers or display to clients
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={config.bankAccount.accountName}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, accountName: e.target.value }
                  }))}
                  placeholder="Your Account Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={config.bankAccount.accountNumber}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, accountNumber: e.target.value }
                  }))}
                  placeholder="1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={config.bankAccount.bankName}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, bankName: e.target.value }
                  }))}
                  placeholder="Bank Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SWIFT Code
                </label>
                <input
                  type="text"
                  value={config.bankAccount.swiftCode}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, swiftCode: e.target.value }
                  }))}
                  placeholder="SWIFTCODE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Routing Number (Optional)
                </label>
                <input
                  type="text"
                  value={config.bankAccount.routingNumber}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, routingNumber: e.target.value }
                  }))}
                  placeholder="Routing Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => loadConfig()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-0.5" size={18} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Payment Gateway Setup</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Stripe: Get your keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard</a></li>
              <li>PayPal: Get your credentials from <a href="https://developer.paypal.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">PayPal Developer Dashboard</a></li>
              <li>Bank Account: Used for manual transfers and invoice display</li>
              <li>Secret keys are encrypted and stored securely</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;

