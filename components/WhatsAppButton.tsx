import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  phoneNumber = '+25472589112',
  message = 'Hello! I would like to learn more about WebProMetrics.' 
}) => {
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 group"
      aria-label="Open WhatsApp chat"
    >
      {/* Background circle with animation */}
      <div className="absolute inset-0 bg-green-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 scale-100 group-hover:scale-110"></div>
      
      {/* Pulse animation ring */}
      <div className="absolute inset-0 rounded-full border-2 border-green-500 opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>

      {/* Main button */}
      <div className="relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group-hover:scale-110 transform">
        <MessageCircle className="w-7 h-7 text-white" fill="currentColor" />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
        Chat with us
        <div className="absolute top-full right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
      </div>

      {/* Badge for mobile notification */}
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse">
        !
      </div>
    </a>
  );
};

export default WhatsAppButton;
