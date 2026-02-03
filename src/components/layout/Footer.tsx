'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import Link from 'next/link';

export default function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    company: [
      { label: t('nav_about'), href: '/about' },
      { label: t('nav_contact'), href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' }
    ],
    support: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Size Guide', href: '/size-guide' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="mb-4 text-2xl font-bold">OnsiShop</h3>
            <p className="mb-4 text-gray-400">
              Your destination for premium fashion and lifestyle products.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 transition-colors hover:text-white">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-white">
                <span className="sr-only">Instagram</span>
                📷
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-white">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">{t('footer_company')}</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">{t('footer_support')}</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">{t('footer_newsletter')}</h4>
            <p className="mb-4 text-gray-400">{t('footer_newsletter_subscribe')}</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="focus:border-purple-500 flex-1 rounded-l-md border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
              />
              <button className="bg-purple-600 hover:bg-purple-700 rounded-r-md px-4 py-2 text-white transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between border-t border-gray-800 pt-8 md:flex-row">
          <p className="text-sm text-gray-400">{t('footer_copyright')}</p>

          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-400">
              <strong>{t('footer_disclaimer_title')}:</strong> {t('footer_disclaimer_text')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
