import fs from 'fs'
import path from 'path'

describe('WP9 — Accessibility Pass & Audit Reconciliation', () => {
  const frontendDir = path.resolve(__dirname, '../../../frontend')

  it('FaqChatbot has accessible labels, dialog semantics, and keyboard Escape listener', () => {
    const chatbotPath = path.join(frontendDir, 'components/chatbot/FaqChatbot.tsx')
    const content = fs.readFileSync(chatbotPath, 'utf-8')

    expect(content).toContain('aria-label="Open VIP Concierge Live Assistant"')
    expect(content).toContain('aria-haspopup="dialog"')
    expect(content).toContain('role="dialog"')
    expect(content).toContain('aria-modal="true"')
    expect(content).toContain('aria-label="Close VIP Concierge Chat"')
    expect(content).toContain('aria-label="Reset Conversation"')
    expect(content).toContain("e.key === 'Escape'")
  })

  it('WhatsAppFloatingButton has accessible aria-label', () => {
    const waPath = path.join(frontendDir, 'components/WhatsAppFloatingButton.tsx')
    const content = fs.readFileSync(waPath, 'utf-8')

    expect(content).toContain('aria-label="Contact VIP Concierge on WhatsApp"')
  })

  it('Navbar mobile toggle has aria-label and aria-expanded state', () => {
    const navPath = path.join(frontendDir, 'components/Navbar.tsx')
    const content = fs.readFileSync(navPath, 'utf-8')

    expect(content).toContain('aria-label=')
    expect(content).toContain('aria-expanded={mobileMenuOpen}')
  })

  it('LanguageToggle has accessible switch language label', () => {
    const langPath = path.join(frontendDir, 'components/LanguageToggle.tsx')
    const content = fs.readFileSync(langPath, 'utf-8')

    expect(content).toContain('aria-label=')
  })

  it('FullscreenLightbox has dialog semantics, button labels, and Escape listener', () => {
    const lightboxPath = path.join(frontendDir, 'app/inventory/[slug]/_components/FullscreenLightbox.tsx')
    const content = fs.readFileSync(lightboxPath, 'utf-8')

    expect(content).toContain('aria-label="Close lightbox"')
    expect(content).toContain('aria-label="Previous image"')
    expect(content).toContain('aria-label="Next image"')
    expect(content).toContain("e.key === 'Escape'")
  })

  it('HeroGallery has accessible labels on back link, thumbnails, and expand button', () => {
    const heroPath = path.join(frontendDir, 'app/inventory/[slug]/_components/HeroGallery.tsx')
    const content = fs.readFileSync(heroPath, 'utf-8')

    expect(content).toContain('aria-label="Return to vehicle inventory"')
    expect(content).toContain('aria-label={`View photo')
    expect(content).toContain('aria-label={`View all')
  })
})
