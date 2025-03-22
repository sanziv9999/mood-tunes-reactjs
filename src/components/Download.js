import React from 'react';
import { Smartphone, Apple } from 'lucide-react';

function Download() {
  return (
    <section
      id="download"
      className="w-full py-12 md:py-24 bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 relative overflow-hidden"
    >
      {/* Subtle Background Wave Effect (Matching Features, HowItWorks, Testimonials) */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <svg className="w-full h-full animate-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="0.3"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* Subtle Particle Animation in Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-300 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          {/* Text Content */}
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Get MoodTunes Today
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-md leading-relaxed">
              Available for iOS and Android—immerse yourself in mood-driven music now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#app-store"
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 relative overflow-hidden"
              >
                <Apple className="h-5 w-5 transform transition-transform duration-300 group-hover:scale-110" />
                <span className="relative z-10">App Store</span>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </a>
              <a
                href="#google-play"
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 relative overflow-hidden"
              >
                <Smartphone className="h-5 w-5 transform transition-transform duration-300 group-hover:scale-110" />
                <span className="relative z-10">Google Play</span>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </a>
            </div>
          </div>

          {/* Image Section */}
          <div
            className="flex justify-center animate-fade-in-right perspective-1000 relative"
            style={{ animationDelay: '200ms' }}
          >
            <div className="group relative transform transition-all duration-500 hover:rotate-3 hover:scale-105">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md"></div>
              <img
                src="https://via.placeholder.com/300x500"
                alt="MoodTunes App"
                className="rounded-xl shadow-2xl max-w-full h-auto object-cover border border-purple-100 relative z-10"
              />
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <span className="text-sm font-medium">Free Download</span>
              </div>
              {/* Floating Musical Notes */}
              <div className="absolute -top-8 -left-8 w-6 h-6 text-purple-600 animate-float" style={{ animationDelay: '0s' }}>
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <div className="absolute -bottom-8 -right-8 w-5 h-5 text-indigo-600 animate-float" style={{ animationDelay: '1s' }}>
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <div className="absolute top-4 left-16 w-4 h-4 text-purple-500 animate-float" style={{ animationDelay: '2s' }}>
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes wave {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-25%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-wave {
          animation: wave 15s ease-in-out infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.5;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default Download;