import React from 'react';
import { Sparkles, Headphones, Heart } from 'lucide-react';

function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Subtle Background Wave Effect (Matching CustomHeader and Hero) */}
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
        {/* Heading Section */}
        <div className="text-center space-y-6 mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Why Choose MoodTunes?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience music that flows with your emotions, powered by innovative AI technology designed to elevate every moment.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              icon: <Sparkles className="h-12 w-12 text-purple-600" />,
              title: 'Mood Detection',
              description: 'Advanced AI analyzes your selfies or text inputs to perfectly match your current vibe.',
              badge: 'Real-Time',
            },
            {
              icon: <Headphones className="h-12 w-12 text-purple-600" />,
              title: 'Dynamic Playlists',
              description: 'Curated tracks that evolve with your emotions, keeping the rhythm alive.',
              badge: 'Adaptive',
            },
            {
              icon: <Heart className="h-12 w-12 text-purple-600" />,
              title: 'Mood Memory',
              description: 'Save and revisit your favorite emotional soundscapes anytime you want.',
              badge: 'Personal',
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="group flex flex-col items-center text-center p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up border border-purple-100"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 relative">
                {feature.title}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transform -translate-x-1/2 transition-all duration-300 group-hover:w-3/4 rounded-full"></span>
              </h3>
              <p className="text-gray-600 text-base leading-relaxed max-w-xs mb-4">
                {feature.description}
              </p>
              <span className="inline-block px-3 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white">
                {feature.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;