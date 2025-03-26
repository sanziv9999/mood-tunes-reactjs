import React from 'react';

function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 overflow-hidden relative">
      {/* Subtle Background Wave Effect (Matching CustomHeader) */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="0.3"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 tracking-tight leading-tight">
              Discover Music That{' '}
              <span className="relative inline-block group">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                  Vibes
                </span>
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span>{' '}
              With Your Soul
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-md leading-relaxed">
              Experience AI-crafted playlists that resonate with your emotions, adapting to your mood in real-time—from euphoric highs to tranquil lows.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 relative overflow-hidden group">
                <span className="relative z-10">Begin Your Sound Journey</span>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </button>
              <button className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                Discover Features
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div className="flex justify-center animate-fade-in-right" style={{ animationDelay: '200ms' }}>
            <div className="relative flex items-center justify-center group perspective-1000">
              <div className="relative transform transition-all duration-500 group-hover:rotate-3 group-hover:scale-105">
                <img
                  src=""
                  alt="MoodTunes Preview"
                  className="rounded-xl max-w-full h-auto shadow-2xl object-cover border border-purple-100"
                />
                {/* Floating Badge */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                  <span className="text-sm font-medium whitespace-nowrap">MoodTunes Live</span>
                </div>
                {/* Subtle Decorative Elements (Non-Glowing) */}
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full animate-pulse"></div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;