'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { useEffect, useState } from 'react';

interface AboutPageContent {
  title: string;
  description: string;
  mission?: string;
  vision?: string;
  values?: string;
  backgroundImage?: string;
}

export default function AboutUsPage() {
  const { t } = useTranslation();
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        const result = await response.json();

        if (result.success) {
          const data = result.data;
          setContent({
            title: data['about.title'] || 'About Our Fashion Store',
            description: data['about.description'] || 'We are passionate about bringing you the finest clothing at affordable prices.',
            mission: data['about.mission'] || 'To provide high-quality, stylish clothing that makes everyone feel confident and beautiful.',
            vision: data['about.vision'] || 'To become the leading fashion destination that combines style, comfort, and affordability.',
            values: data['about.values'] || 'Quality, Style, Sustainability, and Customer Satisfaction are at the heart of everything we do.',
            backgroundImage: data['about.backgroundImage']
          });
        } else {
          // Fallback to default content
          setContent({
            title: 'About Our Fashion Store',
            description: 'We are passionate about bringing you the finest clothing at affordable prices.',
            mission: 'To provide high-quality, stylish clothing that makes everyone feel confident and beautiful.',
            vision: 'To become the leading fashion destination that combines style, comfort, and affordability.',
            values: 'Quality, Style, Sustainability, and Customer Satisfaction are at the heart of everything we do.'
          });
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
        // Fallback to default content
        setContent({
          title: 'About Our Fashion Store',
          description: 'We are passionate about bringing you the finest clothing at affordable prices.',
          mission: 'To provide high-quality, stylish clothing that makes everyone feel confident and beautiful.',
          vision: 'To become the leading fashion destination that combines style, comfort, and affordability.',
          values: 'Quality, Style, Sustainability, and Customer Satisfaction are at the heart of everything we do.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mb-8 mx-auto"></div>
            <div className="space-y-8">
              <div className="h-64 bg-gray-300 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="h-32 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const heroStyle = content?.backgroundImage ? {
    backgroundImage: `url(${content.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="relative bg-gray-50 border-b"
        style={heroStyle}
      >
        {content?.backgroundImage && (
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${content?.backgroundImage ? 'text-white' : 'text-gray-900'}`}>
              {content?.title}
            </h1>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${content?.backgroundImage ? 'text-gray-100' : 'text-gray-600'}`}>
              {content?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Mission */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              {content?.mission}
            </p>
          </div>

          {/* Vision */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              {content?.vision}
            </p>
          </div>

          {/* Values */}
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 leading-relaxed">
              {content?.values}
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Founded with a passion for fashion and a commitment to quality, ONSI Store has grown from a small boutique 
              to a trusted destination for style-conscious individuals. We believe that great fashion should be accessible 
              to everyone, which is why we carefully curate our collections to offer the best value without compromising on style.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Every piece in our collection is selected with care, ensuring that our customers receive not just clothing, 
              but confidence, comfort, and style that lasts. We're more than just a fashion store – we're your partners 
              in expressing your unique personality through what you wear.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Ready to Explore Our Collection?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Discover your next favorite outfit and express your unique style with our carefully curated fashion collection.
          </p>
          <div className="space-x-4">
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Shop Now
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}