import { DEFAULT_CONTENT_VALUES, getContentValue } from '@/lib/content';
import Link from 'next/link';

const HeroSection = async () => {
  // Use default content values for now to avoid API calls during SSR
  // TODO: Implement proper content management with static generation
  const content = {};
  
  const title = getContentValue(content, 'hero.title', DEFAULT_CONTENT_VALUES['hero.title']);
  const subtitle = getContentValue(content, 'hero.subtitle', DEFAULT_CONTENT_VALUES['hero.subtitle']);
  const description = getContentValue(content, 'hero.description', DEFAULT_CONTENT_VALUES['hero.description']);
  const buttonText = getContentValue(content, 'hero.buttonText', DEFAULT_CONTENT_VALUES['hero.buttonText']);

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
          {title}
        </h1>
        
        <h2 className="text-xl md:text-2xl font-medium mb-6 text-purple-100">
          {subtitle}
        </h2>
        
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-white/90">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/search" 
            className="bg-white text-purple-900 px-8 py-3 rounded-full font-semibold text-lg hover:bg-purple-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {buttonText}
          </Link>
          
          <Link 
            href="/about-us" 
            className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-900 transition-colors duration-300"
          >
            Learn More
          </Link>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full animate-pulse" />
      <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-white/20 rounded-full animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-20 w-12 h-12 border-2 border-white/20 rounded-full animate-pulse delay-500" />
    </section>
  );
};

export default HeroSection;
