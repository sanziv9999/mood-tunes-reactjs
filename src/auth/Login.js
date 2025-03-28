import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import api from '../api';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    setErrors({});
    try {
      const response = await api.post('/login/', formData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
  
      console.log('Login successful:', response.data);
      navigate('/facial-expression-detection');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.non_field_errors) {
        errorMessage = error.non_field_errors.join(' ');
      }
      setErrors({ api: errorMessage });
    }
  };



  // Check if user is already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If already logged in, redirect to facial expression detection page
      navigate('/facial-expression-detection');
    }
  }, [navigate]);

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-gray-100 via-indigo-50 to-purple-50 flex items-center justify-center py-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="0.5"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 animate-fade-in-up border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Welcome Back to MoodTunes
            </h2>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Dive into your personalized music journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-300" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-800`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.email}</p>}
            </div>

            <div className="relative group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-300" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-800`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.password}</p>}
            </div>

            {errors.api && <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.api}</p>}

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-purple-600 hover:text-purple-700 hover:underline transition-all duration-300"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group"
            >
              <span className="relative z-10">Log In</span>
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-purple-600 hover:text-purple-700 hover:underline transition-all duration-300 font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;