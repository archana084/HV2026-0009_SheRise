import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  RotateCcw, 
  HelpCircle, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  Bot,
  User,
  Send,
  Loader2
} from 'lucide-react';


interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: 'Security & Blockchain' | 'Verification & QR' | 'Credential Management' | 'Platform FAQ';
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    category: 'Security & Blockchain',
    question: 'How does TrustCred protect my credential?',
    answer: "TrustCred uses blockchain technology to protect the integrity of academic credentials. A credential's blockchain-recorded information can be verified to detect unauthorized changes or tampering.",
  },
  {
    id: 2,
    category: 'Verification & QR',
    question: 'How can an employer verify my credential?',
    answer: "An employer can use the TrustCred verification portal to verify your credential. They can use the credential's verification information or QR code to check whether the credential is valid and authentic.",
  },
  {
    id: 3,
    category: 'Verification & QR',
    question: 'How does QR verification work?',
    answer: "Your credential can contain a QR code for quick verification. When an authorized person scans the QR code, TrustCred opens the verification information and checks the credential against the stored blockchain record.",
  },
  {
    id: 4,
    category: 'Security & Blockchain',
    question: 'Can someone forge my credential?',
    answer: "TrustCred prevents unauthorized credential issuance through its blockchain smart contract. Only approved college wallet addresses are authorized to issue credentials. If an unauthorized wallet tries to issue a credential, the smart contract rejects the transaction.",
  },
  {
    id: 5,
    category: 'Credential Management',
    question: 'Can I edit my academic credential?',
    answer: "Students cannot directly modify or issue their academic credentials. Credentials are issued through the authorized college process. If your credential contains incorrect information, you should contact the college that issued it.",
  },
  {
    id: 6,
    category: 'Credential Management',
    question: 'What if my credential information is incorrect?',
    answer: "Please contact the college that issued the credential and request a correction. Students should not be given direct permission to modify official academic credentials.",
  },
  {
    id: 7,
    category: 'Platform FAQ',
    question: 'Can the chatbot create a degree for me?',
    answer: "No. The TrustCred Assistant is only an informational tool. It cannot create, issue, modify, approve, or replace an academic credential.",
  },
  {
    id: 8,
    category: 'Platform FAQ',
    question: 'What is TrustCred?',
    answer: "TrustCred is a blockchain-based academic credential platform designed to help colleges issue credentials and allow students and employers to verify academic credentials securely.",
  },
  {
    id: 9,
    category: 'Security & Blockchain',
    question: 'Why does TrustCred use blockchain?',
    answer: "Blockchain provides a tamper-resistant record that can be used to verify credential information. This helps make unauthorized changes easier to detect and increases trust in the verification process.",
  },
  {
    id: 10,
    category: 'Security & Blockchain',
    question: 'What happens if someone tries to issue a credential without college authorization?',
    answer: "The TrustCred smart contract checks the wallet address of the person sending the transaction. If the wallet is not an approved college wallet, the credential issuance transaction is rejected.",
  },
];

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isFollowUp?: boolean;
}

export const StudentFaqChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeFaqId, setActiveFaqId] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialWelcomeText = "Hi! 👋 I'm the TrustCred AI Assistant. Ask any question below or select a guided topic to learn about credentials, verification, QR sharing, and security.";

  // Initialize conversation on mount or reset
  const initChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}-welcome`,
        sender: 'bot',
        text: initialWelcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setActiveFaqId(null);
    setSelectedCategory('All');
    setInputText('');
  };

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  const handleSendCustomMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isThinking) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: timeNow,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history: messages })
      });
      const data = await res.json();
      const replyText = data.reply || "I couldn't process your question right now.";
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: "TrustCred uses cryptographic SHA-256 hashes and Ethereum smart contracts to ensure credential validity.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSelectQuestion = (faq: FaqItem) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // User message
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: faq.question,
      timestamp: timeNow,
    };

    // Bot answer message
    const botMsg: ChatMessage = {
      id: `msg-bot-${Date.now() + 1}`,
      sender: 'bot',
      text: faq.answer,
      timestamp: timeNow,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setActiveFaqId(faq.id);
  };


  const handleReset = () => {
    initChat();
  };

  const filteredFaqs = selectedCategory === 'All' 
    ? FAQ_ITEMS 
    : FAQ_ITEMS.filter(f => f.category === selectedCategory);

  const categories = ['All', 'Security & Blockchain', 'Verification & QR', 'Credential Management', 'Platform FAQ'];

  return (
    <aside id="student-faq-chatbot-container" aria-label="Student Support Assistant" className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          id="student-faq-open-button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 border border-indigo-400/30"
          aria-label="Open Student FAQ Assistant"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-700 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold leading-tight">Student Assistant</span>
            <span className="block text-[10px] text-indigo-200 leading-tight">Guided FAQ & Security</span>
          </div>
          <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div
          id="student-faq-chat-window"
          className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between border-b border-indigo-950/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center text-white shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight text-white">TrustCred Assistant</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Official FAQ
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200 leading-tight">Guided Student Academic Advisor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                id="student-faq-restart-button"
                onClick={handleReset}
                title="Restart conversation"
                className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Restart FAQ Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                id="student-faq-close-button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : msg.isFollowUp
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold rounded-tl-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Category Pills & Question Selection Footer */}
          <div className="border-t border-slate-200 bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                Select a Question ({filteredFaqs.length})
              </span>
              <span className="text-[10px] text-slate-500">Click to view official answer</span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scrollable List of Questions */}
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
              {filteredFaqs.map((faq) => (
                <button
                  key={faq.id}
                  id={`faq-question-btn-${faq.id}`}
                  onClick={() => handleSelectQuestion(faq)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 border ${
                    activeFaqId === faq.id
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-medium'
                      : 'bg-slate-50 hover:bg-indigo-50/60 border-slate-200 text-slate-800 hover:border-indigo-200'
                  }`}
                >
                  <span className="line-clamp-2 leading-tight">
                    {faq.question}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* Live Custom Question Input (Groq AI) */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendCustomMessage(); }} 
              className="flex items-center gap-1.5 pt-2 border-t border-slate-100"
            >
              <input
                type="text"
                placeholder="Ask Groq AI any question..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isThinking}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isThinking}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shrink-0"
              >
                {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>

            {/* Safety/Information Badge */}
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1 text-slate-500">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Powered by Groq AI & TrustCred Security
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold">Groq AI Live</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
