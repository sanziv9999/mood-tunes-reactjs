import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function MusicSuggestion() {
  const [token, setToken] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState(null); // Track the currently playing song
  const audioRef = useRef(null); // Reference to the audio element

  // Spotify credentials (should be in .env file in production)
  const CLIENT_ID = "07119f923efd42afa83501788c9b90a1"; // Replace with your Client ID
  const REDIRECT_URI = 'http://127.0.0.1:3000/facial-expression-detection/';
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPES = 'user-read-private';

  // Get token from URL hash after authentication
  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem('token');

    if (!storedToken && hash) {
      storedToken = hash
        .substring(1)
        .split('&')
        .find((elem) => elem.startsWith('access_token'))
        ?.split('=')[1];

      window.location.hash = '';
      window.localStorage.setItem('token', storedToken);
    }

    setToken(storedToken || '');
  }, []);

  // Logout function
  const logout = () => {
    setToken('');
    window.localStorage.removeItem('token');
    setSongs([]);
    setPlayingTrackId(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Search songs function
  const searchSongs = async (e) => {
    e.preventDefault();
    if (!searchKey || !token) {
      alert('Please enter a search term and ensure you are logged in to Spotify.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchKey,
          type: 'track',
          limit: 10,
        },
      });

      setSongs(response.data.tracks.items);
    } catch (error) {
      console.error('Error searching songs:', error);
      if (error.response?.status === 401) {
        logout();
        alert('Spotify session expired. Please log in again.');
      } else {
        alert('Failed to search songs. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle play/pause for a song
  const togglePlay = (song) => {
    if (!song.preview_url) {
      alert('No preview available for this track. Try opening it in Spotify.');
      return;
    }

    if (playingTrackId === song.id) {
      // Pause the current song
      audioRef.current.pause();
      setPlayingTrackId(null);
    } else {
      // Play a new song
      audioRef.current.src = song.preview_url;
      audioRef.current
        .play()
        .then(() => {
          setPlayingTrackId(song.id);
        })
        .catch((err) => {
          console.error('Playback error:', err);
          if (err.name === 'NotAllowedError') {
            alert('Playback was blocked. Please interact with the page (e.g., click) before playing audio.');
          } else {
            alert('Failed to play preview. Try opening in Spotify.');
          }
        });
    }
  };

  // Open song in Spotify
  const openInSpotify = (url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Spotify link not available for this track.');
    }
  };

  // Render song list
  const renderSongs = () => {
    return songs.map((song) => (
      <div
        key={song.id}
        className="flex items-center p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300"
      >
        {song.album.images.length ? (
          <img
            src={song.album.images[0].url}
            alt={song.name}
            className="w-16 h-16 rounded-md object-cover mr-4"
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-gray-200 text-gray-500 rounded-md mr-4">
            No Image
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{song.name}</h3>
          <p className="text-sm text-gray-600">
            {song.artists.map((artist) => artist.name).join(', ')}
          </p>
          {!song.preview_url && (
            <p className="text-xs text-orange-500 mt-1">Preview Unavailable</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => togglePlay(song)}
            disabled={!song.preview_url}
            className={`px-4 py-2 rounded-full text-white font-semibold transition-colors duration-300 ${
              playingTrackId === song.id
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-purple-600 hover:bg-purple-700'
            } ${!song.preview_url && 'opacity-50 cursor-not-allowed'}`}
          >
            {playingTrackId === song.id ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => openInSpotify(song.external_urls.spotify)}
            className="px-4 py-2 bg-yellow-400 text-gray-800 rounded-full font-semibold hover:bg-yellow-500 transition-colors duration-300"
          >
            Open in Spotify
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Spotify Song Search
          </h1>
          <div className="mt-4">
            {!token ? (
              <a
                href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(
                  SCOPES
                )}`}
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Login to Spotify
              </a>
            ) : (
              <button
                onClick={logout}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Logout
              </button>
            )}
          </div>
        </header>

        {token && (
          <form onSubmit={searchSongs} className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="Enter keywords to search songs..."
              className="w-full sm:w-80 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : songs.length > 0 ? (
            renderSongs()
          ) : (
            token && (
              <p className="text-center text-gray-600">
                No songs found. Try searching!
              </p>
            )
          )}
        </div>

        <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} />
      </div>
    </div>
  );
}

export default MusicSuggestion;