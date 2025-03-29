import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const moodColors = {
    happy: 'bg-gradient-to-r from-yellow-400 to-orange-400',
    sad: 'bg-gradient-to-r from-blue-400 to-indigo-500',
    angry: 'bg-gradient-to-r from-red-500 to-pink-600',
    fearful: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    disgusted: 'bg-gradient-to-r from-green-500 to-teal-500',
    surprised: 'bg-gradient-to-r from-pink-500 to-purple-500',
    neutral: 'bg-gradient-to-r from-gray-400 to-gray-500',
  };
const CapturedExpression = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCapturedImages = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || !user) {
          navigate('/login');
          return;
        }

        const response = await api.get('/captured-images/');
        // Sort images by date (newest first)
        const sortedImages = response.data.sort((a, b) => 
          new Date(b.captured_at) - new Date(a.captured_at)
        );
        setImages(sortedImages);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load images: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCapturedImages();
  }, [navigate]);

  const handleDeleteClick = (imageId) => {
    setImageToDelete(imageId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/captured-images/${imageToDelete}/`);
      setImages(images.filter(image => image.id !== imageToDelete));
      setShowDeleteModal(false);
      toast.success('Image deleted successfully');
      
      // Adjust current index if we deleted the current image
      if (currentIndex >= images.length - 1) {
        setCurrentIndex(Math.max(0, images.length - 2));
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to delete image: ' + err.message);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setImageToDelete(null);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No captured expressions found</h2>
          <p className="text-gray-600">Your facial expressions will appear here after detection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Wave Effect (Matching Hero) */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="0.3"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Header Section with Hero-like styling */}
      <div className="max-w-6xl mx-auto mb-8 relative z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                MoodSync
              </span>
            </h1>
            <h2 className="text-xl font-semibold text-gray-600 mt-1">Captured Expressions</h2>
          </div>
          
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative z-10">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No captured expressions yet</h3>
            <p className="text-gray-500">Your mood analyses will appear here after detection</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center animate-fade-in">
              Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Mood Journey</span>
            </h2>
            
            {/* Enhanced Carousel with Hero-like styling */}
            <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-purple-100 animate-fade-in-up">
              {/* Navigation Arrows with Hero-like styling */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-purple-600 rounded-full p-3 shadow-lg focus:outline-none transition-all duration-200 hover:scale-110 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                    aria-label="Previous image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-purple-600 rounded-full p-3 shadow-lg focus:outline-none transition-all duration-200 hover:scale-110 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                    aria-label="Next image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Image Display with Hero-like styling */}
              <div className="relative h-96 w-full bg-gradient-to-br from-gray-900 to-purple-900">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                    <img 
                      src={image.image} 
                      alt={`Captured expression - ${image.mood}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
              
              {/* Mood Info Section with Hero-like styling */}
              <div className="p-6 bg-gradient-to-t from-gray-900/90 to-transparent absolute bottom-0 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${moodColors[images[currentIndex]?.mood.toLowerCase()] || 'bg-gradient-to-r from-purple-600 to-indigo-600'} text-white mb-2 shadow-md`}>
                      {images[currentIndex]?.mood}
                    </span>
                    <div className="text-white font-medium text-lg">
                      {new Date(images[currentIndex]?.captured_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(images[currentIndex]?.id)}
                    className="text-white hover:text-red-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                    aria-label="Delete image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Dots Indicator with Hero-like styling */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white w-6 shadow-[0_0_5px_rgba(168,85,247,0.8)]' : 'bg-white/50'}`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Image Counter with Hero-like styling */}
            <div className="text-center mt-4 text-gray-600 font-medium animate-fade-in">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 font-bold">
                {currentIndex + 1}
              </span> / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal with Hero-like styling */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                Delete this expression?
              </span>
            </h3>
            <p className="text-gray-600 mb-6">This will permanently remove the captured expression from your history.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-5 py-2 border-2 border-purple-600 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-600 hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg shadow-sm text-sm font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapturedExpression;