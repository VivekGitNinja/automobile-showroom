'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Phone, RefreshCw, ShieldCheck, ChevronRight, User, Sparkles, Calendar, ArrowUpRight, Crown } from 'lucide-react'
import BookingModal from '../BookingModal'
import { API_BASE_URL } from '../../lib/api'

interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  options?: string[]
  cta?: { label: string; action: 'booking' | 'whatsapp' }
  timestamp: string
}

interface FaqItem {
  question: string
  answer: string
  keywords?: string[]
}

interface FaqCategory {
  label: string
  faqs: FaqItem[]
}

interface FlatFaq {
  category: string
  q: string
  a: string
  keywords: string[]
}

const FALLBACK_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971508919441'

export default function FaqChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [inputQuery, setInputQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [faqs, setFaqs] = useState<FlatFaq[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [whatsappNumber, setWhatsappNumber] = useState(FALLBACK_WHATSAPP)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  const waLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`

  const handleReset = useCallback(() => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Welcome to Apex Luxury Automobiles Dubai. I am your personal VIP Automotive Concierge. How may I assist your acquisition today?',
        options: categories.length > 0 ? categories : ['General Enquiries'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }, [categories])

  useEffect(() => {
    // Staff-editable FAQ set (categories + questions + answers + keywords)
    fetch(`${API_BASE_URL}/faqs`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          const flatFaqs: FlatFaq[] = []
          const catLabels: string[] = []
          res.data.forEach((cat: FaqCategory & { id: string }) => {
            if (cat.label) catLabels.push(cat.label)
            cat.faqs.forEach((f: FaqItem) => {
              flatFaqs.push({
                category: cat.label,
                q: f.question,
                a: f.answer,
                keywords: Array.isArray(f.keywords) ? f.keywords : [],
              })
            })
          })
          setFaqs(flatFaqs)
          setCategories(catLabels)
        }
      })
      .catch(() => {})

    // Sales-team contact details come from Site Settings (admin-editable)
    fetch(`${API_BASE_URL}/settings`)
      .then((res) => res.json())
      .then((res) => {
        const num = res?.data?.whatsappNumber || res?.whatsappNumber
        if (num && typeof num === 'string') setWhatsappNumber(num)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isOpen && !initialized.current) {
      initialized.current = true
      handleReset()
    }
  }, [isOpen, handleReset])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // ------------------------------------------------------------------
  // Rule-based matcher — NO LLM. Answers come only from the staff-managed
  // FAQ set: exact question hits, staff-defined keywords, category names,
  // then word-overlap scoring. Unmatched questions route to a human.
  // ------------------------------------------------------------------
  const findBestAnswer = (userText: string): { faq?: FlatFaq; score: number } => {
    const lower = userText.toLowerCase().trim()
    if (!lower) return { score: 0 }

    const tokens = lower.split(/[^a-z0-9]+/).filter((t) => t.length > 2)
    let best: FlatFaq | undefined
    let bestScore = 0

    for (const item of faqs) {
      const q = item.q.toLowerCase()
      let score = 0

      if (q === lower) score += 10
      if (q.includes(lower) || lower.includes(q)) score += 6

      for (const kw of item.keywords || []) {
        const k = kw.toLowerCase().trim()
        if (k && (lower.includes(k) || k.includes(lower))) score += 5
      }

      if (item.category && lower.includes(item.category.toLowerCase())) score += 2

      const qTokens = q.split(/[^a-z0-9]+/).filter((t) => t.length > 2)
      const overlap = tokens.filter((t) => qTokens.includes(t)).length
      score += overlap

      if (score > bestScore) {
        bestScore = score
        best = item
      }
    }

    return { faq: best, score: bestScore }
  }

  const processResponse = (userText: string, optionsMode?: { type: 'category'; label: string }) => {
    setIsTyping(true)

    let matchedAnswer = ''
    let cta: { label: string; action: 'booking' | 'whatsapp' } | undefined = undefined
    let options: string[] | undefined = undefined

    if (optionsMode?.type === 'category') {
      const catFaqs = faqs.filter((f) => f.category === optionsMode.label)
      if (catFaqs.length > 0) {
        options = catFaqs.map((f) => f.q)
        matchedAnswer = `Here are the questions we can answer under "${optionsMode.label}":`
      } else {
        matchedAnswer = 'I do not have scripted answers for this topic yet. Our VIP Sales Director can assist you directly — would you like to connect on WhatsApp?'
        cta = { label: 'Chat on WhatsApp', action: 'whatsapp' }
      }
    } else {
      const lower = userText.toLowerCase()
      const { faq: match, score } = findBestAnswer(userText)

      // Vehicle-specific prices/specs are deliberately NOT answered by the bot
      // (the spec requires routing such queries to a human unless reliably sourced).
      const vehiclePriceQuery = /(price|cost|how much|quote).*(car|vehicle|model|this|it)|(car|vehicle|model).*(price|cost)/.test(lower)

      if (vehiclePriceQuery && (!match || score < 6)) {
        matchedAnswer = 'Vehicle pricing is tailored to each individual acquisition. Our VIP Sales Director will gladly prepare a personal quotation — would you like to connect on WhatsApp or book a private viewing?'
        cta = { label: 'Request a Callback', action: 'whatsapp' }
      } else if (match && score >= 3) {
        matchedAnswer = match.a
      } else if (/view|book|schedule|appointment|test drive|visit/.test(lower)) {
        matchedAnswer = 'Our private showroom viewing includes private lounge access and test drive evaluation. You can select your preferred date and time directly below.'
        cta = { label: 'Book Private Viewing', action: 'booking' }
      } else {
        // Human fallback so no lead is lost
        matchedAnswer = 'I want to make sure you get an accurate answer, so I will hand this to our human concierge team. You can reach them instantly on WhatsApp, request a callback, or use the enquiry form — we respond promptly during showroom hours.'
        cta = { label: 'Chat with Our Team', action: 'whatsapp' }
      }
    }

    setTimeout(() => {
      setIsTyping(false)
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: matchedAnswer,
        options,
        cta,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMsg])
    }, 800)
  }

  const handleSelectOption = (optionText: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: optionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])

    // If the option is a category label (not a question), show its question menu
    const isCategory = categories.includes(optionText)
    processResponse(optionText, isCategory ? { type: 'category', label: optionText } : undefined)
  }

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputQuery.trim()) return

    const userText = inputQuery.trim()
    setInputQuery('')

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    processResponse(userText)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[999]">
        {/* Floating Trigger Badge */}
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-3.5 px-6 py-4 rounded-full bg-[#080808]/95 border border-[#C9A227]/40 text-white font-mono font-bold text-xs uppercase tracking-[0.15em] shadow-[0_0_30px_rgba(201,162,39,0.3)] backdrop-blur-2xl group"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#C9A227] text-black flex items-center justify-center shadow-md">
                <Crown className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-[#C9A227] font-mono tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> VIP Concierge
              </span>
              <span className="text-xs font-serif font-bold text-white tracking-wide">Live Assistant</span>
            </div>
          </motion.button>
        )}

        {/* Chatbot Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="relative w-[370px] max-w-[calc(100vw-3rem)] sm:w-[440px] h-[620px] max-h-[calc(100vh-6rem)] rounded-3xl bg-[#060606]/95 backdrop-blur-3xl border border-[#C9A227]/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-xs"
            >
              {/* Header */}
              <div className="p-4 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-[#C9A227]/50 flex items-center justify-center bg-[#C9A227]/10 shadow-md">
                    <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-white text-base">Apex VIP Concierge</h4>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest block">
                      Dubai Showroom · Private Desk
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-white/60">
                  <button onClick={handleReset} title="Reset Chat" className="p-2 hover:text-[#C9A227] transition">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsOpen(false)} title="Close Chat" className="p-2 hover:text-white transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Actions Header Bar */}
              <div className="px-4 py-2 bg-[#080808] border-b border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:border-[#C9A227] hover:text-[#C9A227] transition flex items-center gap-1.5 whitespace-nowrap text-[10px] font-mono uppercase tracking-wider"
                >
                  <Calendar className="w-3 h-3 text-[#C9A227]" />
                  <span>Book Viewing</span>
                </button>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white transition flex items-center gap-1.5 whitespace-nowrap text-[10px] font-mono uppercase tracking-wider"
                >
                  <Phone className="w-3 h-3" />
                  <span>WhatsApp VIP</span>
                </a>
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-1 text-[9px] font-mono text-white/40 uppercase tracking-wider">
                      <span>{m.sender === 'bot' ? 'VIP Concierge' : 'You'}</span>
                      <span>· {m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[88%] p-4 rounded-2xl leading-relaxed text-xs ${
                        m.sender === 'user'
                          ? 'bg-[#C9A227] text-black font-medium rounded-tr-none shadow-md'
                          : 'bg-[#0E0E0E] border border-white/10 text-white/90 rounded-tl-none shadow-md'
                      }`}
                    >
                      {m.text}

                      {/* Optional Interactive CTA inside Bot Bubble */}
                      {m.cta && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          {m.cta.action === 'booking' ? (
                            <button
                              onClick={() => setBookingModalOpen(true)}
                              className="w-full py-2 px-4 rounded-xl bg-[#C9A227] text-black font-bold font-mono text-[10px] uppercase tracking-widest flex items-center justify-between hover:bg-[#E5C158]"
                            >
                              <span>{m.cta.label}</span>
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 px-4 rounded-xl bg-emerald-600 text-white font-bold font-mono text-[10px] uppercase tracking-widest flex items-center justify-between hover:bg-emerald-500"
                            >
                              <span>{m.cta.label}</span>
                              <ArrowUpRight className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Scripted Quick Options */}
                    {m.options && (
                      <div className="mt-3 space-y-2 w-full">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] block mb-1">
                          Frequently Inquired Topics:
                        </span>
                        {m.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(opt)}
                            className="w-full text-left p-3 rounded-xl bg-[#090909] border border-white/10 hover:border-[#C9A227] hover:bg-[#C9A227]/10 text-white/80 hover:text-white transition-all duration-200 text-[11px] font-mono flex items-center justify-between group"
                          >
                            <span>{opt}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#C9A227] group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 p-3 bg-[#0E0E0E] border border-white/10 rounded-2xl rounded-tl-none w-fit text-[#C9A227] text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-ping" />
                    <span>VIP Concierge is processing...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-[#080808] border-t border-white/10">
                <form onSubmit={handleSendQuery} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask VIP Concierge..."
                    className="flex-1 px-4 py-3 rounded-xl bg-[#111111] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#C9A227] text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="p-3 rounded-xl bg-[#C9A227] text-black font-bold hover:bg-[#E5C158] transition-colors shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        vehicleName="VIP Concierge Private Appointment"
      />
    </>
  )
}
