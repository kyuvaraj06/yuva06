import React from "react";
import { MessageSquareText } from "lucide-react";
import { useApp } from "../context/AppContext.tsx";

export const WhatsAppButton: React.FC = () => {
  const { language } = useApp();

  const phoneNumber = "+919876543210"; // Sample helpline number
  const message = encodeURIComponent(
    language === "en"
      ? "Vanakkam Tamil Agro Mart! I would like to inquire about organic farm produce."
      : "வணக்கம் தமிழ் அக்ரோ மார்ட்! இயற்கை விவசாய விளைபொருட்கள் பற்றி விசாரிக்க விரும்புகிறேன்."
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      id="whatsapp-floating-trigger"
      href={whatsappUrl}
      target="_blank"
      rel="no-referrer"
      className="fixed bottom-6 left-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
      title="Contact Tamil Agro Support"
    >
      <MessageSquareText className="w-6 h-6 animate-pulse group-hover:scale-105" />
      
      {/* Tooltip text */}
      <span className="absolute left-14 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-gray-800">
        {language === "en" ? "Chat and Support" : "உதவி மற்றும் அரட்டை"}
      </span>
      
      {/* Ripple effect rings */}
      <span className="absolute -inset-1 rounded-full border border-emerald-500 animate-ping opacity-25 pointer-events-none" />
    </a>
  );
};
