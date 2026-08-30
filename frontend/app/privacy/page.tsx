import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Apex Luxury Automobiles',
  description: 'Privacy Policy and data protection guidelines for Apex Luxury Automobiles.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-36 sm:pt-40 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227] block mb-4 font-bold">
          Legal
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-6">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto font-light">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.05)] shadow-2xl prose prose-invert prose-headings:font-serif prose-headings:text-white prose-p:text-gray-400 prose-p:font-light prose-p:text-sm prose-p:leading-relaxed prose-a:text-[#C9A227]">
          
          <p>
            At Apex Luxury Automobiles ("we", "our", or "us"), we are committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or interact with our showroom located in Dubai, United Arab Emirates.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">1. Information Collection</h2>
          <p>
            We may collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our vehicles. The personal information that we collect depends on the context of your interactions with us and the website, the choices you make, and the products and features you use.
          </p>
          <ul className="list-disc pl-6 text-sm text-gray-400 font-light space-y-2 mb-6">
            <li><strong>Personal Details:</strong> Name, title, and contact information including email address, physical address, and telephone numbers.</li>
            <li><strong>Financial Information:</strong> Information required for vehicle financing, deposits, and transactions, processed securely through our partners.</li>
            <li><strong>Vehicle Preferences:</strong> Interest in specific makes, models, and custom configurations.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and usage details collected automatically when visiting our website.</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">2. Use of Information</h2>
          <p>
            We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and your consent. We use the information we collect or receive to:
          </p>
          <ul className="list-disc pl-6 text-sm text-gray-400 font-light space-y-2 mb-6">
            <li>Facilitate the purchase, sale, or sourcing of luxury vehicles.</li>
            <li>Communicate with you regarding your inquiries and concierge requests.</li>
            <li>Send administrative information, marketing communications, and exclusive invitations to private viewing events.</li>
            <li>Improve our website, services, and overall customer experience.</li>
            <li>Comply with UAE legal and regulatory requirements.</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">3. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work. This includes payment processors, financing partners, logistics companies, and marketing agencies.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">4. Cookies and Tracking</h2>
          <p>
            We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">5. Data Security</h2>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">6. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites or services that are not owned or controlled by Apex Luxury Automobiles. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">7. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personally identifiable information from anyone under 18 years of age.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">8. Changes to Policy</h2>
          <p>
            We may update this privacy notice from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">9. Contact Information</h2>
          <p>
            If you have questions or comments about this notice, you may email us at privacy@techzoetic.com or contact us by post at:
          </p>
          <div className="mt-4 p-6 bg-[#050505] rounded-xl border border-[rgba(255,255,255,0.05)]">
            <p className="text-[#C9A227] font-mono uppercase tracking-widest text-[10px] mb-2 font-bold">Apex Luxury Automobiles</p>
            <p className="text-sm text-gray-400 font-light m-0 leading-relaxed">
              Sheikh Zayed Road<br />
              Al Quoz Industrial 3<br />
              Dubai, United Arab Emirates
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
