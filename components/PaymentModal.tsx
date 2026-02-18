import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Invoice } from '../types';
import { config } from '../services/config';

interface PaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'card' | 'paypal' | null;

const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    zip: ''
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const detectCardType = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    return 'Card';
  };

  const validateCard = () => {
    const num = cardDetails.number.replace(/\s/g, '');
    if (num.length < 13 || num.length > 19) {
      setError('Invalid card number');
      return false;
    }
    if (!cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) {
      setError('Invalid expiry date (MM/YY)');
      return false;
    }
    if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
      setError('Invalid CVV');
      return false;
    }
    if (!cardDetails.name.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    return true;
  };

  const processCardPayment = async () => {
    if (!validateCard()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('wpm_auth_token')}`
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          method: 'card',
          amount: invoice.amount,
          cardDetails: {
            number: cardDetails.number.replace(/\s/g, ''),
            expiry: cardDetails.expiry,
            cvv: cardDetails.cvv,
            name: cardDetails.name,
            zip: cardDetails.zip
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      onSuccess();
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayPalPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE_URL}/payments/paypal/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('wpm_auth_token')}`
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: invoice.amount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'PayPal payment failed');
      }

      // Redirect to PayPal approval URL
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('PayPal approval URL not received');
      }
    } catch (err: any) {
      setError(err.message || 'PayPal payment initialization failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCardInputChange = (field: string, value: string) => {
    if (field === 'number') {
      value = formatCardNumber(value);
    } else if (field === 'expiry') {
      value = formatExpiry(value);
    } else if (field === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4);
    }

    setCardDetails(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
            <p className="text-sm text-gray-500 mt-1">
              Invoice #{invoice.id.substring(0, 8)} • KES {invoice.amount.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!paymentMethod ? (
            // Payment Method Selection
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 mb-4">Select Payment Method</h4>
              
              <button
                onClick={() => setPaymentMethod('card')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition-all flex items-center gap-3"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CreditCard size={24} className="text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">Credit/Debit Card</div>
                  <div className="text-sm text-gray-500">Visa, Mastercard</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('paypal')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition-all flex items-center gap-3"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0070ba">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.174 1.351.96 3.3.869 4.51l-.01.07v.05c-.003.24-.02 1.13-.02 1.13h3.48c.85 0 1.56.6 1.69 1.43l1.4 8.75c.12.75-.42 1.43-1.18 1.43h-4.18c-.24 0-.45-.1-.6-.3l-3.1-4.1c-.1-.1-.2-.2-.4-.2h-2.5c-.3 0-.5.2-.6.5l-1.8 5.4c-.1.3-.4.5-.7.5z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">PayPal</div>
                  <div className="text-sm text-gray-500">Pay with your PayPal account</div>
                </div>
              </button>
            </div>
          ) : paymentMethod === 'card' ? (
            // Card Payment Form
            <div className="space-y-4">
              <button
                onClick={() => setPaymentMethod(null)}
                className="text-sm text-brand-600 hover:text-brand-700 mb-2"
                disabled={isProcessing}
              >
                ← Back to payment methods
              </button>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Lock size={14} />
                  <span>Secure payment encrypted with SSL</span>
                </div>
                <div className="text-xs text-gray-500">
                  Card type: {detectCardType(cardDetails.number) || 'Card'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => handleCardInputChange('number', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => handleCardInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code (Optional)
                </label>
                <input
                  type="text"
                  value={cardDetails.zip}
                  onChange={(e) => handleCardInputChange('zip', e.target.value)}
                  placeholder="12345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  disabled={isProcessing}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={processCardPayment}
                disabled={isProcessing}
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Pay KES {invoice.amount.toLocaleString()}
                  </>
                )}
              </button>
            </div>
          ) : (
            // PayPal Payment
            <div className="space-y-4">
              <button
                onClick={() => setPaymentMethod(null)}
                className="text-sm text-brand-600 hover:text-brand-700 mb-2"
                disabled={isProcessing}
              >
                ← Back to payment methods
              </button>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={processPayPalPayment}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Redirecting to PayPal...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.174 1.351.96 3.3.869 4.51l-.01.07v.05c-.003.24-.02 1.13-.02 1.13h3.48c.85 0 1.56.6 1.69 1.43l1.4 8.75c.12.75-.42 1.43-1.18 1.43h-4.18c-.24 0-.45-.1-.6-.3l-3.1-4.1c-.1-.1-.2-.2-.4-.2h-2.5c-.3 0-.5.2-.6.5l-1.8 5.4c-.1.3-.4.5-.7.5z"/>
                    </svg>
                    Continue with PayPal
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

