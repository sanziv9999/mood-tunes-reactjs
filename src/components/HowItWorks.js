import React from 'react';
import { Smile, Music, Play } from 'lucide-react';

function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Subtle Background Wave Effect (Matching Features) */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <svg className="w-full h-full animate-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="0.3"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        {/* Heading Section */}
        <div className="text-center space-y-6 mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Your Mood, Your Music
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your emotions into soundscapes in just three simple steps.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="grid gap-12 md:grid-cols-3 relative z-10">
          {/* Connecting Line with Gradient (Hidden on Mobile) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-purple-600/20 via-indigo-600/40 to-purple-600/20 transform -translate-y-1/2 rounded-full">
            <div className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 animate-line-flow"></div>
          </div>

          {[
            {
              icon: <Smile className="h-12 w-12 text-purple-600" />,
              step: '1. Capture Your Vibe',
              description: 'Snap a selfie or type your mood—our AI instantly gets you.',
              badge: 'Instant',
            },
            {
              icon: <Music className="h-12 w-12 text-purple-600" />,
              step: '2. Craft Your Sound',
              description: 'AI weaves a playlist that flows with your emotional tide.',
              badge: 'Custom',
            },
            {
              icon: <Play className="h-12 w-12 text-purple-600" />,
              step: '3. Play Your Mood',
              description: 'Press play and immerse yourself—save it for later vibes.',
              badge: 'Yours',
            },
          ].map((item, index) => (
            <div
              key={item.step}
              className="group relative flex flex-col items-center text-center p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up border border-purple-100"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Step Number Circle */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                {index + 1}
              </div>
              {/* Icon */}
              <div className="mt-8 mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                {item.icon}
              </div>
              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-800 mb-3 relative">
                {item.step}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transform -translate-x-1/2 transition-all duration-300 group-hover:w-3/4 rounded-full"></span>
              </h3>
              {/* Description */}
              <p className="text-gray-600 text-base leading-relaxed max-w-xs mb-4">
                {item.description}
              </p>
              {/* Badge */}
              <span className="inline-block px-3 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white">
                {item.badge}
              </span>
            </div>
          ))}
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

        @keyframes line-flow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-line-flow {
          animation: line-flow 3s linear infinite;
        }
      `}</style>
    </section>
  );
}

export default HowItWorks;