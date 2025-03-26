import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, Menu, X } from 'lucide-react';

function CustomHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const token = window.localStorage.getItem("token");

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Determine if we're on a page where "Log In" and "Sign Up" should be hidden
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg text-white">
      {/* Subtle Background Wave Effect */}
      <div className="absolute inset-0 overflow-hidden opacity-20 animate-wave">
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
            { label: 'Features', href: '/#features', isSection: true },
            { label: 'How It Works', href: '/#how-it-works', isSection: true },
            { label: 'Testimonials', href: '/#testimonials', isSection: true },
            { label: 'Download', href: '/#download', isSection: true },
          ].map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 animate-fade-in-up relative group transform hover:scale-105 ${
                location.hash === item.href.split('#')[1] && location.pathname === '/' ? 'text-yellow-300' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {item.label}
              <span
                className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                  location.hash === item.href.split('#')[1] && location.pathname === '/' ? 'w-full' : ''
                }`}
              ></span>
            </a>
          ))}
          {token && (
            <>
              <Link
                to="/music"
                className={`text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 animate-fade-in-up relative group transform hover:scale-105 ${
                  location.pathname === '/music' ? 'text-yellow-300' : ''
                }`}
                style={{ animationDelay: '400ms' }}
              >
                Music Suggestion
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                    location.pathname === '/music' ? 'w-full' : ''
                  }`}
                ></span>
              </Link>
              <Link
                to="/facial-expression-detection"
                className={`text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 animate-fade-in-up relative group transform hover:scale-105 ${
                  location.pathname === '/facial-expression-detection' ? 'text-yellow-300' : ''
                }`}
                style={{ animationDelay: '500ms' }}
              >
                Detect Mood
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                    location.pathname === '/facial-expression-detection' ? 'w-full' : ''
                  }`}
                ></span>
              </Link>
            </>
          )}
        </nav>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          {!token && !isAuthPage ? (
            <>
              <Link to="/login">
                <button className="text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                  Log In
                </button>
              </Link>
              <Link to="/signup">
                <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(251,191,36,0.5)] hover:scale-105">
                  Sign Up
                </button>
              </Link>
            </>
          ) : token ? (
            <button
              onClick={() => {
                window.localStorage.removeItem("token");
                window.location.href = "/";
              }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold border border-white/20 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] hover:scale-105"
            >
              Logout
            </button>
          ) : null}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white focus:outline-none animate-fade-in-up group"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
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
              { label: 'Features', href: '/#features', isSection: true },
              { label: 'How It Works', href: '/#how-it-works', isSection: true },
              { label: 'Testimonials', href: '/#testimonials', isSection: true },
              { label: 'Download', href: '/#download', isSection: true },
            ].map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 animate-fade-in-up relative group transform hover:scale-105 ${
                  location.hash === item.href.split('#')[1] && location.pathname === '/' ? 'text-yellow-300' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={toggleMenu}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                    location.hash === item.href.split('#')[1] && location.pathname === '/' ? 'w-full' : ''
                  }`}
                ></span>
              </a>
            ))}
            {token && (
              <>
                <Link
                  to="/music"
                  className={`text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 animate-fade-in-up relative group transform hover:scale-105 ${
                    location.pathname === '/music' ? 'text-yellow-300' : ''
                  }`}
                  style={{ animationDelay: '400ms' }}
                  onClick={toggleMenu}
                >
                  Music Suggestion
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                      location.pathname === '/music' ? 'w-full' : ''
                    }`}
                  ></span>
                </Link>
                <Link
                  to="/facial-expression-detection"
                  className={`text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 animate-fade-in-up relative group transform hover:scale-105 ${
                    location.pathname === '/facial-expression-detection' ? 'text-yellow-300' : ''
                  }`}
                  style={{ animationDelay: '500ms' }}
                  onClick={toggleMenu}
                >
                  Detect Mood
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                      location.pathname === '/facial-expression-detection' ? 'w-full' : ''
                    }`}
                  ></span>
                </Link>
              </>
            )}
            {!token && !isAuthPage ? (
              <>
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 animate-fade-in-up transform hover:scale-105"
                  style={{ animationDelay: '600ms' }}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={toggleMenu}
                  className="animate-fade-in-up"
                  style={{ animationDelay: '700ms' }}
                >
                  <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(251,191,36,0.5)] hover:scale-105">
                    Sign Up
                  </button>
                </Link>
              </>
            ) : token ? (
              <button
                onClick={() => {
                  window.localStorage.removeItem("token");
                  window.location.href = "/";
                  toggleMenu();
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold border border-white/20 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: '600ms' }}
              >
                Logout
              </button>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}

export default CustomHeader;