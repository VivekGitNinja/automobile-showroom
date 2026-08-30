import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Apex Luxury Automobiles',
  description: 'Terms and Conditions of use for Apex Luxury Automobiles website and services.',
}

export default function TermsConditionsPage() {
  return (
    <div className="pt-36 sm:pt-40 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227] block mb-4 font-bold">
          Legal
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-6">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto font-light">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.05)] shadow-2xl prose prose-invert prose-headings:font-serif prose-headings:text-white prose-p:text-gray-400 prose-p:font-light prose-p:text-sm prose-p:leading-relaxed prose-a:text-[#C9A227]">
          
          <p>
            Welcome to Apex Luxury Automobiles. These terms and conditions outline the rules and regulations for the use of our website and concierge services. By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use Apex Luxury Automobiles' website if you do not accept all of the terms and conditions stated on this page.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you agree to be bound by these Terms and Conditions and all applicable laws and regulations of the United Arab Emirates. If you disagree with any part of these terms, you may not access our services.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">2. Use of Website</h2>
          <p>
            You are granted a limited license to access and use this website for your personal, non-commercial use. You must not:
          </p>
          <ul className="list-disc pl-6 text-sm text-gray-400 font-light space-y-2 mb-6">
            <li>Republish material from this website without prior consent.</li>
            <li>Sell, rent, or sub-license material from the website.</li>
            <li>Reproduce, duplicate, or copy material for commercial purposes.</li>
            <li>Engage in any data mining, data harvesting, or data extracting activities.</li>
            <li>Use this website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">3. Vehicle Listings & Information</h2>
          <p>
            While we strive to ensure that all information on our website is accurate, complete, and current, the vehicle specifications, pricing, availability, and descriptions are subject to change without notice. Apex Luxury Automobiles does not warrant that the vehicle descriptions or other content are error-free. The vehicles displayed are subject to prior sale. Final pricing and specifications will be confirmed by our concierge team during the purchasing process.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">4. Lead Submissions & Communications</h2>
          <p>
            By submitting an inquiry or providing your contact information, you consent to being contacted by our concierge team via email, phone, or WhatsApp regarding your inquiry. We reserve the right to refuse service, terminate accounts, or cancel requests at our sole discretion.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">5. Intellectual Property</h2>
          <p>
            Unless otherwise stated, Apex Luxury Automobiles and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved. This includes but is not limited to logos, text, images, graphics, audio, and the "look and feel" of the website. The brands, models, and logos of the vehicles displayed are the property of their respective manufacturers.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">6. Limitation of Liability</h2>
          <p>
            In no event shall Apex Luxury Automobiles, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website. Apex Luxury Automobiles shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this website.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">7. Governing Law & Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Emirate of Dubai and the federal laws of the United Arab Emirates applicable therein. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of Dubai.
          </p>

          <h2 className="text-2xl font-serif font-bold text-white mt-12 mb-6">8. Contact Information</h2>
          <p>
            For any inquiries regarding these Terms and Conditions, please contact our legal department:
          </p>
          <div className="mt-4 p-6 bg-[#050505] rounded-xl border border-[rgba(255,255,255,0.05)]">
            <p className="text-[#C9A227] font-mono uppercase tracking-widest text-[10px] mb-2 font-bold">Apex Luxury Automobiles</p>
            <p className="text-sm text-gray-400 font-light m-0 leading-relaxed">
              Legal Department<br />
              legal@techzoetic.com<br />
              Dubai, United Arab Emirates
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
