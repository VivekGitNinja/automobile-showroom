'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, X, Send, Phone, RefreshCw, ShieldCheck, ChevronRight, User, Bot, Calendar } from 'lucide-react'
import BookingModal from '../BookingModal'

interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  options?: string[]
  timestamp: string
}

interface FaqItem {
  question: string
  answer: string
}

interface FaqCategory {
  label: string
  faqs: FaqItem[]
}

interface FlatFaq {
  category: string
  q: string
  a: string
}

export default function FaqChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [inputQuery, setInputQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  
  // Dynamic FAQs from DB
  const [faqs, setFaqs] = useState<FlatFaq[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  const handleReset = useCallback(() => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Welcome to Apex Luxury Automobiles Dubai! I am your VIP Concierge Assistant. How may I assist you today?',
        options: [
          '📅 Schedule Viewing',
          '💎 Crypto & Wire Payment',
          '✈️ Worldwide Air Freight',
          '🤝 Sell Your Supercar',
          '📍 Showroom Location & Hours',
        ],
        timestamp: 'Just now',
      },
    ])
  }, [])

  useEffect(() => {
    // Fetch dynamic FAQs from CMS backend
    fetch('/api/v1/faqs')
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          // Flatten categories into a list of FAQs with their category label for matching
          const flatFaqs: FlatFaq[] = []
          res.data.forEach((cat: FaqCategory) => {
            cat.faqs.forEach((f: FaqItem) => {
              flatFaqs.push({
                category: cat.label,
                q: f.question,
                a: f.answer
              })
            })
          })
          setFaqs(flatFaqs)
        }
      })
      .catch(err => console.error("Failed to load FAQs:", err))
  }, [])

  useEffect(() => {
    if (isOpen && !initialized.current) {
      initialized.current = true
      handleReset()
    }
  }, [isOpen, handleReset])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectOption = (optionText: string) => {
    let matchedAnswer = 'Our VIP Sales Concierge can assist you with this directly. Would you like to connect on WhatsApp or book a viewing?'
    const cleanOpt = optionText.replace(/^[^\w\s]+/, '').trim().toLowerCase()

    const match = faqs.find(
      (item) => item.q.toLowerCase().includes(cleanOpt) || cleanOpt.includes(item.category?.toLowerCase() || '')
    )

    if (match) {
      matchedAnswer = match.a
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: optionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: matchedAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg, botMsg])
  }

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputQuery.trim()) return

    const userText = inputQuery.trim()
    setInputQuery('')

    const lower = userText.toLowerCase()
    let matchedAnswer: string | null = null

    for (const item of faqs) {
      if (
        lower.includes(item.q.toLowerCase()) ||
        item.q.toLowerCase().split(' ').some((word: string) => word.length > 3 && lower.includes(word))
      ) {
        matchedAnswer = item.a
        break
      }
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: matchedAnswer || 'I could not find an exact scripted answer for your query. Connecting you directly with our VIP Sales Manager on WhatsApp...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg, botMsg])
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[999]">
        {/* Trigger Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-full bg-[#C9A227] text-[#050505] font-mono font-bold text-xs uppercase tracking-[0.15em] shadow-gold-glow hover:scale-105 transition-all duration-300 group"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            </div>
            <span>VIP Assistant</span>
          </button>
        )}

        {/* Chatbot Window */}
        {isOpen && (
          <div className="relative w-[360px] sm:w-[420px] h-[580px] rounded-3xl bg-black/95 backdrop-blur-2xl border border-[#C9A227]/30 shadow-2xl flex flex-col overflow-hidden text-xs">
            
            {/* Header */}
            <div className="p-4 bg-[#0a0a0a] border-b border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-[#C9A227] flex items-center justify-center bg-[#C9A227]/10 shadow-md">
                  <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-white text-base">Apex VIP Assistant</h4>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest block">Online • Dubai Concierge</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <button onClick={handleReset} title="Reset Chat" className="p-2 hover:text-white transition">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} title="Close Chat" className="p-2 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Action Pills Bar */}
            <div className="px-4 py-2 bg-black border-b border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none text-[10px] font-mono uppercase tracking-wider">
              <button
                onClick={() => setBookingModalOpen(true)}
                className="px-3 py-1.5 rounded-full bg-white/10 border border-white/30 text-white hover:bg-white hover:text-black transition flex items-center gap-1 whitespace-nowrap"
              >
                <Calendar className="w-3 h-3" />
                <span>Book Viewing</span>
              </button>
              <a
                href="https://wa.me/971508919441"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-[#C9A227] text-black font-bold hover:bg-[#D4AF37] transition flex items-center gap-1 whitespace-nowrap shadow-gold-glow"
              >
                <Phone className="w-3 h-3" />
                <span>WhatsApp Live</span>
              </a>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[rgba(255,255,255,0.1)] scrollbar-track-transparent">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  <div className="flex items-center gap-1.5 mb-1 text-[9px] font-mono text-gray-500 uppercase">
                    {m.sender === 'bot' ? (
                      <>
                        <Bot className="w-3 h-3 text-[#C9A227]" />
                        <span>Concierge Bot</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 text-gray-300" />
                        <span>You</span>
                      </>
                    )}
                    <span>• {m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#C9A227] text-[#050505] font-medium rounded-br-none shadow-md'
                        : 'bg-[#111111] border border-[#C9A227]/20 text-gray-200 rounded-bl-none shadow-md'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Scripted Options */}
                  {m.options && (
                    <div className="mt-3 space-y-2 w-full">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-1">Select a topic:</span>
                      {m.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(opt)}
                          className="w-full text-left p-3 rounded-xl bg-black border border-white/20 hover:border-[#C9A227] hover:bg-white/5 text-gray-200 transition text-[11px] font-mono flex items-center justify-between group"
                        >
                          <span>{opt}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#C9A227] group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-black border-t border-white/20">
              <form onSubmit={handleSendQuery} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#111111] border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A227] text-xs"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-[#C9A227] text-[#050505] hover:bg-[#D4AF37] transition shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        )}
      </div>

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        vehicleName="VIP Concierge Appointment"
      />
    </>
  )
}
