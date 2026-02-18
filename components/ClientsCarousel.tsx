import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Brand {
  name: string;
  category: string;
  icon: string;
}

const ClientsCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const brands: Brand[] = [
    { name: 'Safaricom', category: 'Telecom', icon: '📱' },
    { name: 'Equity Bank', category: 'Finance', icon: '🏦' },
    { name: 'KCB Group', category: 'Banking', icon: '💳' },
    { name: 'Co-operative Bank', category: 'Banking', icon: '🏛️' },
    { name: 'Britam', category: 'Insurance', icon: '🛡️' },
    { name: 'Kenya Airways', category: 'Aviation', icon: '✈️' },
    { name: 'Nairobi Law Firm', category: 'Legal', icon: '⚖️' },
    { name: 'Strathmore Law', category: 'Legal', icon: '📋' },
    { name: 'CMC Law', category: 'Legal', icon: '⚔️' },
    { name: 'Coulson Harney', category: 'Legal', icon: '🏆' },
    { name: 'Kaplan & Stratey', category: 'Legal', icon: '📜' },
    { name: 'Anjarwalla & Khanna', category: 'Legal', icon: '🎖️' },
    { name: 'Scangroup', category: 'Marketing', icon: '📊' },
    { name: 'Net Media', category: 'Marketing', icon: '📡' },
    { name: 'Wavegroup Media', category: 'Digital', icon: '🌐' },
    { name: 'Nairobi Startup Hub', category: 'Tech', icon: '🚀' },
    { name: 'Standard Chartered', category: 'Finance', icon: '💰' },
    { name: 'Nation Media', category: 'Media', icon: '📰' },
  ];

  // Show 3-6 brands per slide depending on screen size
  const brandsPerSlide = 4;
  const totalSlides = Math.ceil(brands.length / brandsPerSlide);

  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlay, totalSlides]);

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const startIdx = currentSlide * brandsPerSlide;
  const visibleBrands = brands.slice(startIdx, startIdx + brandsPerSlide);

  return (
    <div className="mt-16 pt-12 border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">
            Trusted by Leading Organizations
          </p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            3,000+ Agencies & 500+ Brands Use WebProMetrics
          </h3>
          <p className="text-gray-600">
            From Kenya's top banks, law firms, and marketing leaders
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Main Carousel */}
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              {visibleBrands.map((brand, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-brand-200 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                  onMouseEnter={() => setIsAutoPlay(false)}
                  onMouseLeave={() => setIsAutoPlay(true)}
                >
                  {/* Icon */}
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                    {brand.icon}
                  </div>

                  {/* Brand Name */}
                  <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-brand-600 transition-colors">
                    {brand.name}
                  </h4>

                  {/* Category */}
                  <p className="text-xs text-gray-500 font-medium">
                    {brand.category}
                  </p>

                  {/* Hover Badge */}
                  <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ✓ Using
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 bg-brand-600 hover:bg-brand-700 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 bg-brand-600 hover:bg-brand-700 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentSlide
                  ? 'bg-brand-600 w-3 h-3'
                  : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-6 text-sm text-gray-500 font-medium">
          Slide {currentSlide + 1} of {totalSlides}
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-600">3,000+</div>
            <p className="text-xs text-gray-600 mt-1">Agencies</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-600">500+</div>
            <p className="text-xs text-gray-600 mt-1">Brands</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-600">50+</div>
            <p className="text-xs text-gray-600 mt-1">Integrations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsCarousel;
