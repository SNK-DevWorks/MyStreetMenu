'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  MessageCircle,
  Mail,
  Headset,
  CheckCheck,
  ExternalLink,
  MapPin,
  Utensils,
  QrCode,
  CreditCard,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

const WhatsappIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.94 9.94 0 0 0 1.341 5.011L2 22l5.12-1.336a9.945 9.945 0 0 0 4.887 1.282h.005c5.506 0 9.989-4.478 9.99-9.985A9.957 9.957 0 0 0 12.012 2zm5.836 14.168c-.244.688-1.427 1.312-1.97 1.365-.542.052-1.242.247-4.103-.896-3.663-1.463-6.02-5.184-6.204-5.43-.183-.245-1.488-1.982-1.488-3.78 0-1.799.944-2.684 1.28-3.05.336-.367.732-.458.977-.458.244 0 .488.002.7.013.224.012.527-.086.824.627.305.733 1.037 2.533 1.129 2.716.092.183.153.4.03.642-.122.244-.183.398-.366.611-.183.214-.385.477-.55.641-.183.183-.374.382-.16.749.214.367.95 1.564 2.04 2.534 1.401 1.248 2.583 1.636 2.95 1.819.367.183.58.153.793-.092.214-.244.916-1.069 1.16-1.435.244-.367.488-.305.824-.183.336.122 2.135 1.007 2.502 1.19.367.183.611.275.702.428.092.153.092.885-.152 1.573z" />
  </svg>
);

const GmailIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

interface OptionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ size?: number; className?: string }>;
  response: string;
  actionLabel?: string;
  actionUrl?: string;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  options?: OptionItem[];
  actionBtn?: { label: string; url?: string; actionType?: string };
}

const SUPPORT_OPTIONS: OptionItem[] = [
  {
    id: 'gmap-help',
    title: 'Google Maps & Location',
    subtitle: 'Set or update exact shop location link',
    icon: MapPin,
    response: 'To update your shop location:\n1. Open Google Maps & search for your shop.\n2. Tap "Share" and click "Copy Link".\n3. Go to Vendor Settings > Shop Information.\n4. Paste the link into the "Google Maps Link" field and click Save!',
    actionLabel: 'Go to Shop Settings',
  },
  {
    id: 'menu-help',
    title: 'Menu & Items Help',
    subtitle: 'Add items, categories, or prices',
    icon: Utensils,
    response: 'Managing your digital menu is easy:\n• Go to "Menu > Menu Items" to add new dishes with photos and pricing.\n• Toggle availability instantly if an item is out of stock.\n• Changes reflect live on your public QR menu!',
    actionLabel: 'Manage Menu Items',
  },
  {
    id: 'qr-poster',
    title: 'QR Code & Posters',
    subtitle: 'Print QR cards or get custom posters',
    icon: QrCode,
    response: 'We offer instant QR code downloads and custom poster designs!\n• Go to "QR Menu" tab to view ready-to-print cards.\n• Click "Request Custom Poster" to get a high-res printable poster designed by SNK DevWorks.',
    actionLabel: 'View QR Menu',
  },
  {
    id: 'billing-help',
    title: 'Subscriptions & Billing',
    subtitle: 'Manage your active plan & invoices',
    icon: CreditCard,
    response: 'MyStreetMenu offers flexible vendor subscription plans.\n• Active plan status & renewal dates are visible under Settings.\n• For invoice requests or custom enterprise plans, contact our billing desk directly.',
    actionLabel: 'Contact Billing Desk',
  },
  {
    id: 'whatsapp-direct',
    title: 'WhatsApp Live Chat',
    subtitle: 'Connect with SNK DevWorks (+91 78907 00156)',
    icon: MessageCircle,
    response: 'Need urgent help? Connect directly with our lead support engineer on WhatsApp (+91 78907 00156). We typically reply within 5 minutes!',
    actionLabel: 'Open WhatsApp Chat',
    actionUrl: 'https://wa.me/917890700156?text=Hi%20SNK%20DevWorks,%20I%20need%20support%20with%20MyStreetMenu',
  },
  {
    id: 'email-direct',
    title: 'Email Desk Support',
    subtitle: 'Send query to snkdevworks@gmail.com',
    icon: Mail,
    response: 'You can email our technical support team at snkdevworks@gmail.com. We review and resolve queries within 1-2 hours.',
    actionLabel: 'Send Email Now',
    actionUrl: 'mailto:snkdevworks@gmail.com?subject=Support%20Request%20-%20MyStreetMenu',
  },
];

export const SupportView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Hi there! 👋 Welcome to SNK DevWorks 24x7 Customer Help Centre.\nSelect an issue topic below or type your question:',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: SUPPORT_OPTIONS,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const phone = '7890700156';
  const displayPhone = '+91 78907 00156';
  const email = 'snkdevworks@gmail.com';
  const whatsappUrl = `https://wa.me/91${phone}?text=Hi%20SNK%20DevWorks,%20I%20need%20help%20with%20my%20MyStreetMenu%20account.`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSelectOption = (option: OptionItem) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: option.title,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: option.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionBtn: option.actionLabel
          ? { label: option.actionLabel, url: option.actionUrl, actionType: option.id }
          : undefined,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Thanks for reaching out! We've received your query: "${userText}".\n\nOur SNK DevWorks team is available on WhatsApp (${displayPhone}) or Email (${email}) for instant resolution.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionBtn: {
          label: 'Chat on WhatsApp',
          url: whatsappUrl,
        },
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Chat reset. 👋 How can SNK DevWorks help you today?\nPlease choose a topic or type your query:',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: SUPPORT_OPTIONS,
      },
    ]);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 w-full bg-[#f8fafc] overflow-hidden font-sans relative">
      
      {/* Main Chat & Content Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#f1f5f9]">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} w-full`}
            >
              <div
                className={`max-w-[90%] md:max-w-[80%] p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                  isBot
                    ? 'bg-white text-slate-900 rounded-tl-xs border border-slate-200'
                    : 'bg-[#f67412] text-white rounded-tr-xs font-semibold'
                }`}
                style={
                  !isBot
                    ? { backgroundColor: '#f67412', color: '#ffffff' }
                    : { backgroundColor: '#ffffff', color: '#0f172a' }
                }
              >
                <p
                  className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed"
                  style={{ color: isBot ? '#0f172a' : '#ffffff' }}
                >
                  {msg.text}
                </p>

                {/* Action Button inside Bot Message */}
                {isBot && msg.actionBtn && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    {msg.actionBtn.url ? (
                      <a
                        href={msg.actionBtn.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#f67412] hover:bg-[#d96610] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs active:scale-95"
                        style={{ backgroundColor: '#f67412', color: '#ffffff' }}
                      >
                        <span>{msg.actionBtn.label}</span>
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (msg.actionBtn?.actionType === 'gmap-help') {
                            window.location.href = '/vendor/settings';
                          } else if (msg.actionBtn?.actionType === 'menu-help') {
                            window.location.href = '/vendor/menu/items';
                          } else if (msg.actionBtn?.actionType === 'qr-poster') {
                            window.location.href = '/vendor/qr-menu';
                          } else {
                            window.open(whatsappUrl, '_blank');
                          }
                        }}
                        className="inline-flex items-center gap-2 bg-[#f67412] hover:bg-[#d96610] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                        style={{ backgroundColor: '#f67412', color: '#ffffff' }}
                      >
                        <span>{msg.actionBtn.label}</span>
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* Flipkart Style Options Cards Grid */}
                {isBot && msg.options && msg.options.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Tap an issue to get instant help:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {msg.options.map((opt) => {
                        const IconComponent = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(opt)}
                            className="flex items-start gap-3 p-3 bg-white hover:bg-orange-50/60 border border-slate-200 hover:border-[#f67412] rounded-xl text-left transition-all active:scale-[0.98] group cursor-pointer shadow-xs"
                            style={{ backgroundColor: '#ffffff' }}
                          >
                            <div className="p-2 rounded-lg bg-orange-50 border border-orange-200 text-[#f67412] group-hover:bg-[#f67412] group-hover:text-white transition-colors shrink-0 mt-0.5">
                              <IconComponent size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-[13px] font-bold text-slate-900 group-hover:text-[#f67412] transition-colors truncate" style={{ color: '#0f172a' }}>
                                  {opt.title}
                                </h4>
                                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#f67412] group-hover:translate-x-0.5 transition-all shrink-0" />
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" style={{ color: '#64748b' }}>{opt.subtitle}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div
                  className={`mt-2.5 pt-1.5 border-t ${isBot ? 'border-slate-100 text-slate-500' : 'border-white/20 text-orange-100'} text-[10px] flex items-center justify-between font-medium`}
                  style={{ color: isBot ? '#64748b' : '#ffedd5' }}
                >
                  <span>{isBot ? 'SNK DevWorks Assistant' : 'You'}</span>
                  <span>{msg.time}</span>
                </div>
              </div>

              {!isBot && (
                <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1 mr-1 font-bold">
                  <span>Sent</span>
                  <CheckCheck size={13} className="text-[#f67412]" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-fit rounded-tl-xs shadow-xs">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[#f67412] rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-[#f67412] rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-[#f67412] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-xs text-slate-600 font-medium">SNK DevWorks is typing...</span>
          </div>
        )}

        {/* Quick Contact Bar */}
        <div className="pt-2">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Direct Support Channels:</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-98"
                title="Chat on WhatsApp (+91 78907 00156)"
              >
                <div className="flex items-center gap-2">
                  <WhatsappIcon className="w-4 h-4 fill-white" />
                  <span>WhatsApp ({phone})</span>
                </div>
                <ExternalLink size={13} />
              </a>

              <a
                href={`mailto:${email}?subject=MyStreetMenu%20Support`}
                className="flex items-center justify-between gap-2 text-xs font-bold text-white bg-[#ea4335] hover:bg-[#d93025] px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-98"
                title="Send Email to snkdevworks@gmail.com"
              >
                <div className="flex items-center gap-2">
                  <GmailIcon className="w-4 h-4 fill-white" />
                  <span>Email ({email})</span>
                </div>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Flipkart Style Fixed Input Box at Bottom */}
      <div className="p-3 md:p-4 bg-white border-t border-slate-200 shrink-0 z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-300 rounded-xl focus-within:border-[#f67412] focus-within:ring-2 focus-within:ring-[#f67412]/20 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question or issue here..."
              className="w-full px-4 py-3 bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400 font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-[#f67412] hover:bg-[#d96610] disabled:opacity-40 disabled:hover:bg-[#f67412] text-white p-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center cursor-pointer"
            title="Send Message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
};
