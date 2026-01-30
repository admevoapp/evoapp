import React, { useState, useEffect, useRef } from 'react';
import { Banner } from '../types';
import { bannerService } from '../services/bannerService';

const BannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const allBanners = await bannerService.fetchBanners();
        const activeBanners = allBanners.filter(b => b.active);
        setBanners(activeBanners);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };

    fetchBanners();
  }, []);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (banners.length === 0) return;

    resetTimeout();
    timeoutRef.current = setTimeout(
      () =>
        setCurrentIndex((prevIndex) =>
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        ),
      5000 // Change slide every 5 seconds
    );

    return () => {
      resetTimeout();
    };
  }, [currentIndex, banners.length]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  if (banners.length === 0) {
    return null; // Don't render anything if no banners
  }

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-700/50">
      <div
        className="whitespace-nowrap h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(${-currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="inline-block w-full h-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${banner.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-center items-center text-center p-4">
              <h2 className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg">{banner.title}</h2>
              {banner.description && (
                <p className="text-slate-200 mt-2 text-sm md:text-base max-w-lg drop-shadow-md">{banner.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {banners.map((_, slideIndex) => (
            <button
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              aria-label={`Go to slide ${slideIndex + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === slideIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlider;