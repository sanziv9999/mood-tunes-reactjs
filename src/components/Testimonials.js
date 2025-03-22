import React from 'react';
import { Star, Quote } from 'lucide-react';

function Testimonials() {
  return (
    <section id="testimonials" className="w-full py-12 md:py-24 bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Subtle Background Wave Effect (Matching Features and HowItWorks) */}
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
        {/* Heading Section */}
        <div className="text-center space-y-6 mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Voices of Our Community
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hear how MoodTunes resonates with souls across the globe.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-10 md:grid-cols-3 relative z-10">
          {[
            {
              name: 'Emma S.',
              image: 'https://via.placeholder.com/60',
              rating: 5,
              quote: 'MoodTunes nails it every time—my emotions in perfect harmony!',
              role: 'Music Enthusiast',
            },
            {
              name: 'Liam R.',
              image: 'https://via.placeholder.com/60',
              rating: 5,
              quote: 'It’s like a personal DJ that feels my vibe—pure genius!',
              role: 'Creative Soul',
            },
            {
              name: 'Sophie K.',
              image: 'https://via.placeholder.com/60',
              rating: 4,
              quote: 'Mood detection that’s uncanny, playlists that enchant.',
              role: 'Daily Listener',
            },
          ].map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group relative flex flex-col p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up border border-purple-100"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 h-10 w-10 text-purple-600 opacity-10 group-hover:opacity-30 transition-all duration-300 transform group-hover:rotate-12" />

              {/* User Info */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={`${testimonial.name}'s avatar`}
                  className="w-14 h-14 rounded-full border-2 border-purple-600 transform transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-600 object-cover"
                />
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <div className="flex text-yellow-400 gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 transition-all duration-300 ${
                          i < testimonial.rating
                            ? 'fill-current group-hover:scale-110'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-600 text-base leading-relaxed italic relative px-4 py-2 bg-purple-50/50 rounded-lg">
                "{testimonial.quote}"
                <span className="absolute -bottom-2 left-1/2 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transform -translate-x-1/2 transition-all duration-300 group-hover:w-3/4 rounded-full"></span>
              </p>

              {/* Floating Musical Note (Between Cards, Hidden on Last Card) */}
              {index < 2 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-500 animate-float" style={{ animationDelay: `${index}s` }}>
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
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

export default Testimonials;