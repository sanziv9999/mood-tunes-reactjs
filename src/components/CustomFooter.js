import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Heart } from 'lucide-react';

function CustomFooter() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    // Add your subscription logic here (e.g., API call)
    console.log('Subscribed with email:', e.target.querySelector('input[type="email"]').value);
  };

  return (
    <footer className="w-full py-12 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-700 text-white relative overflow-hidden">
      {/* Background Wave Effect */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <svg className="w-full h-full animate-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="0.3"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Floating Dots */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
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
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-6 animate-fade-in-up">
            <Link to="/" className="flex items-center gap-2 group">
              <svg
                className="h-8 w-8 text-purple-500 transition-all duration-300 group-hover:scale-110"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              <span className="text-2xl font-bold tracking-tight text-white">
                MoodTunes
              </span>
            </Link>
            <p className="text-sm text-gray-300  leading-relaxed max-w-xs">
              Sync your soul with music—AI-crafted playlists for every emotion you feel.
            </p>
            <div className="flex gap-6">
              {[
                { href: 'https://facebook.com/moodtunes', icon: <Facebook className="h-5 w-5" />, label: 'Facebook' },
                { href: 'https://twitter.com/moodtunes', icon: <Twitter className="h-5 w-5" />, label: 'Twitter' },
                { href: 'https://instagram.com/moodtunes', icon: <Instagram className="h-5 w-5" />, label: 'Instagram' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-purple-500 transform transition-all duration-300 hover:scale-110 group relative"
                  aria-label={`Visit MoodTunes on ${social.label}`}
                >
                  {social.icon}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                    {social.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Explore Section */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Explore
            </h3>
            <nav className="grid gap-3">
              {[
                { to: '#features', label: 'Features' },
                { to: '#how-it-works', label: 'How It Works' },
                { to: '#download', label: 'Download' },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm text-gray-300 hover:text-yellow-300 transition-all duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal Section */}
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Legal
            </h3>
            <nav className="grid gap-3">
              {[
                { to: '/privacy-policy', label: 'Privacy Policy' },
                { to: '/terms-of-service', label: 'Terms of Service' },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm text-gray-300 hover:text-yellow-300 transition-all duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter Section */}
          <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Stay Tuned
            </h3>
            <p className="text-sm text-gray-300 mb-4">Subscribe for updates and exclusive playlists.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-full bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="relative bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-2 rounded-full font-semibold transition-all duration-300 hover:from-purple-600 hover:to-indigo-600"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="mt-12 text-center text-sm text-gray-400 animate-fade-in-up border-t border-gray-700/50 pt-6"
          style={{ animationDelay: '800ms' }}
        >
          © {new Date().getFullYear()} MoodTunes. All rights reserved.
          <span className="block mt-2 text-xs opacity-75">
            Crafted with <Heart className="inline h-4 w-4 text-purple-500 animate-pulse" /> by the MoodTunes Team
          </span>
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
            transform: translateY(0);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0);
            opacity: 0.5;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
}

export default CustomFooter;