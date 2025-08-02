import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = "+491234567890"; // Ersetzen Sie dies durch Ihre WhatsApp-Nummer
  const message = encodeURIComponent("Hallo! Ich interessiere mich für Ihre Eventmanagement-Services.");

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 md:hidden bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
      aria-label="WhatsApp kontaktieren"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
};

export default WhatsAppButton;