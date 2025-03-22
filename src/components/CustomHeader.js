import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Menu, X } from 'lucide-react';

function CustomHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg text-white">
      {/* Subtle Background Wave Effect */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="0.3"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 py-4 flex items-center justify-between relative z-10">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group animate-fade-in-up">
          <Music className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <span className="text-2xl font-extrabold text-white tracking-tight transition-colors duration-300 group-hover:text-yellow-300">
            MoodTunes
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-10">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Testimonials', href: '#testimonials' },
            { label: 'Download', href: '#download' },
          ].map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 animate-fade-in-up relative group transform hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <Link to="/login">
            <button className="text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              Log In
            </button>
          </Link>
          <Link to="/signup">
            <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:scale-105">
              Sign Up
            </button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white focus:outline-none animate-fade-in-up group"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
          ) : (
            <Menu className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
          )}
        </button>
      </div>

      {/* Mobile Navigation (Dropdown) */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-purple-600 to-indigo-600 shadow-lg animate-slide-down">
          <nav className="flex flex-col items-center gap-4 py-4">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Testimonials', href: '#testimonials' },
              { label: 'Download', href: '#download' },
            ].map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 animate-fade-in-up relative group transform hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={toggleMenu}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            <Link
              to="/login"
              onClick={toggleMenu}
              className="animate-fade-in-up"
              style={{ animationDelay: '400ms' }}
            >
              <button className="text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                Log In
              </button>
            </Link>
            <Link
              to="/signup"
              onClick={toggleMenu}
              className="animate-fade-in-up"
              style={{ animationDelay: '500ms' }}
            >
              <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:scale-105">
                Sign Up
              </button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default CustomHeader;