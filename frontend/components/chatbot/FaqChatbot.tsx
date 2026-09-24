'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { MessageSquare, X, Send, Phone, RefreshCw, ShieldCheck, ChevronRight, User, Sparkles, Calendar, ArrowUpRight, Crown, GripVertical } from 'lucide-react'
import BookingModal from '../BookingModal'
import CallbackModal from '../CallbackModal'
import { API_BASE_URL } from '../../lib/api'

interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  options?: string[]
  cta?: { label: string; action: 'booking' | 'whatsapp' | 'callback' }
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
  const [callbackModalOpen, setCallbackModalOpen] = useState(false)
  const [inputQuery, setInputQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [faqs, setFaqs] = useState<FlatFaq[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [whatsappNumber, setWhatsappNumber] = useState(FALLBACK_WHATSAPP)
  const [windowDimensions, setWindowDimensions] = useState({ width: 1440, height: 900 })
  const dragControls = useDragControls()
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
      const onResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }
  }, [])

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

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
    let cta: { label: string; action: 'booking' | 'whatsapp' | 'callback' } | undefined = undefined
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

      // Vehicle-specific prices/specs are deliberately NOT answered by the bot (PRD H11)
      // (the spec requires routing such queries to a human unless reliably sourced).
      const vehiclePriceQuery = /(price|cost|how much|quote|pricing|aed|worth|valuation)/i.test(lower)

      if (vehiclePriceQuery) {
        matchedAnswer = 'Vehicle pricing is tailored to each individual acquisition and market specification. Our VIP Sales Concierge will prepare a personal quotation — would you like to request a callback or connect on WhatsApp?'
        cta = { label: 'Request a Callback', action: 'callback' }
      } else if (match && score >= 3) {
        matchedAnswer = match.a
      } else if (/view|book|schedule|appointment|test drive|visit/.test(lower)) {
        matchedAnswer = 'Our private showroom viewing includes private lounge access and test drive evaluation. You can select your preferred date and time directly below.'
        cta = { label: 'Book Private Viewing', action: 'booking' }
      } else {
        // Human fallback so no lead is lost
        matchedAnswer = 'I want to make sure you get an accurate answer, so I will hand this to our human concierge team. You can request a callback directly below or connect instantly on WhatsApp.'
        cta = { label: 'Request a Callback', action: 'callback' }
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
      {/* ── Apple-Style Draggable Floating Concierge Puck ── */}
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={!isOpen}
        dragMomentum={false}
        dragElastic={0.08}
        dragConstraints={{
          left: -Math.max(windowDimensions.width - 90, 200),
          right: 10,
          top: -Math.max(windowDimensions.height - 110, 200),
          bottom: 10,
        }}
        onDragStart={() => {
          isDraggingRef.current = true
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false
          }, 150)
        }}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[998] select-none"
      >
        {/* Apple Dynamic Floating Orb - Logo Only */}
        {!isOpen && (
          <div className="relative group">
            {/* Apple Hover Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/90 backdrop-blur-md border border-white/20 text-[10px] font-mono tracking-widest text-[#C9A227] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl">
              VIP Concierge
            </div>

            <motion.button
              type="button"
              onClick={() => {
                if (!isDraggingRef.current) {
                  setIsOpen(true)
                }
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              whileDrag={{ scale: 1.15, cursor: 'grabbing' }}
              aria-label="Open VIP Concierge Live Assistant"
              className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#08080a]/85 backdrop-blur-3xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.25)] ring-1 ring-white/10 flex items-center justify-center cursor-grab active:cursor-grabbing hover:border-[#C9A227]/40 hover:shadow-[0_0_25px_rgba(201,162,39,0.35)] transition-all duration-300"
            >
              {/* Inner Metallic Gold Crown Orb */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9E7D1A] via-[#C9A227] to-[#F5DE88] text-black flex items-center justify-center shadow-[0_2px_12px_rgba(201,162,39,0.4)]">
                <Crown className="w-5 h-5 text-black drop-shadow-sm" />
              </div>

              {/* Micro Status Beacon */}
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#08080a] animate-pulse" />
            </motion.button>
          </div>
        )}

        {/* Chatbot Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="VIP Concierge Live Assistant"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-[370px] max-w-[calc(100vw-2rem)] sm:w-[440px] h-[620px] max-h-[calc(100vh-6rem)] rounded-[32px] bg-[#08080a]/90 backdrop-blur-3xl border border-white/20 shadow-[0_24px_70px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col overflow-hidden text-xs"
            >
              {/* iOS Drag Handle on top of open modal */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing select-none touch-none"
                title="Drag to reposition window"
              >
                <div className="w-10 h-1.5 rounded-full bg-white/25 hover:bg-white/50 transition-colors" />
              </div>

              {/* Header */}
              <div className="px-5 py-3 bg-black/40 border-b border-white/10 flex items-center justify-between">
                <div
                  onPointerDown={(e) => dragControls.start(e)}
                  className="flex items-center gap-3 cursor-grab active:cursor-grabbing select-none flex-1"
                >
                  <div className="w-9 h-9 rounded-full border border-[#C9A227]/40 flex items-center justify-center bg-[#C9A227]/10 shadow-[0_2px_12px_rgba(201,162,39,0.25)]">
                    <Crown className="w-4 h-4 text-[#C9A227]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-white text-sm tracking-wide">Apex VIP Concierge</h4>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <span className="text-[9px] text-white/50 font-mono uppercase tracking-widest block">
                      Dubai Showroom · Private Desk
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleReset}
                    title="Reset Chat"
                    aria-label="Reset Conversation"
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition flex items-center justify-center"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close Chat"
                    aria-label="Close VIP Concierge Chat"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
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
                          ) : m.cta.action === 'callback' ? (
                            <div className="space-y-2">
                              <button
                                onClick={() => setCallbackModalOpen(true)}
                                className="w-full py-2.5 px-4 rounded-xl bg-[#C9A227] text-black font-bold font-mono text-[10px] uppercase tracking-widest flex items-center justify-between hover:bg-[#E5C158] transition-colors"
                              >
                                <span className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{m.cta.label}</span>
                                </span>
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-1.5 px-3 rounded-lg border border-white/10 text-[#A0A0A0] hover:text-white font-mono text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <span>Or connect on WhatsApp</span>
                              </a>
                            </div>
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
      </motion.div>

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        vehicleName="VIP Concierge Private Appointment"
      />

      <CallbackModal
        isOpen={callbackModalOpen}
        onClose={() => setCallbackModalOpen(false)}
        vehicleName="VIP Concierge Desk"
      />
    </>
  )
}
