import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as faceapi from 'face-api.js';
import SpotifyWebApi from 'spotify-web-api-js';
import { debounce } from 'lodash';

const FacialExpressionDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const sectionRef = useRef(null);
  const capturedCanvasRef = useRef(null);
  const [mood, setMood] = useState('Unknown');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState(null);
  const [expressionScores, setExpressionScores] = useState({});
  const [suggestions, setSuggestions] = useState({ music: [], activity: '', relaxation: '' });
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [token, setToken] = useState('');
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [createdPlaylistId, setCreatedPlaylistId] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [isFetchingTracks, setIsFetchingTracks] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [detectionError, setDetectionError] = useState(null); // New state for detection errors

  const spotifyApi = useMemo(() => new SpotifyWebApi(), []);

  const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
  const RESPONSE_TYPE = 'token';
  const SCOPES = 'user-read-private streaming playlist-modify-public playlist-modify-private';

  const [moodOptions, setMoodOptions] = useState([]);
  const [moodToGenres, setMoodToGenres] = useState({});

  useEffect(() => {
    const fetchMoodsAndGenres = async () => {
      try {
        const moodsResponse = await fetch('http://localhost:8000/api/moods/');
        if (!moodsResponse.ok) throw new Error('Failed to fetch moods');
        const moodsData = await moodsResponse.json();
        const capitalizedMoods = moodsData.map(mood => 
          mood.name.charAt(0).toUpperCase() + mood.name.slice(1)
        );
        setMoodOptions(capitalizedMoods);
        setMood('Unknown'); // Initial mood is 'Unknown'
      } catch (error) {
        console.error('Error fetching moods or genres:', error);
        setMoodOptions([]);
        setMoodToGenres({});
      }
    };

    fetchMoodsAndGenres();
  }, []);

  useEffect(() => {
    if (token) {
      spotifyApi.setAccessToken(token);
    }
  }, [token, spotifyApi]);

  const startVideo = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported in this browser.');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      })
      .catch((err) => {
        setCameraError(`Camera access failed: ${err.message}. Please allow camera permissions or check your device.`);
      });
  }, []);

  const stopVideo = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoElement.srcObject = null;
    }
  }, []);

  useEffect(() => {
    const sectionElement = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionElement) {
      observer.observe(sectionElement);
    }

    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement);
      }
    };
  }, []);

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
      if (storedToken) {
        window.localStorage.setItem('token', storedToken);
      }
    }

    setToken(storedToken || '');
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
          faceapi.nets.ageGenderNet.loadFromUri('/models'),
        ]);
        startVideo();
      } catch (error) {
        console.error('Error loading models:', error);
        setDetectionError('Failed to load face detection models. Please refresh the page.');
      }
    };
    loadModels();

    return () => {
      stopVideo();
    };
  }, [startVideo, stopVideo]);

  const fetchSuggestions = useCallback(
    async (mood, retryCount = 0, genreIndex = 0) => {
      if (!token) {
        console.log('Please log in to Spotify first');
        return;
      }

      setLoading(true);
      let selectedGenre = '';
      const moodLower = mood.toLowerCase();
      const genres = moodToGenres[moodLower] || [];
      let activitySuggestion = 'Explore local culture'; // Default fallback
      let relaxationActivity = 'Take a moment to relax'; // Default fallback

      // Fetch activity and relaxation suggestions
      try {
        const activityResponse = await fetch('http://localhost:8000/api/activity-suggestions/');
        if (!activityResponse.ok) throw new Error('Failed to fetch activity suggestions');
        const activityData = await activityResponse.json();
        const matchingActivities = activityData.filter(item => item.mood.name.toLowerCase() === moodLower);
        
        if (matchingActivities.length > 0) {
          const allSuggestions = matchingActivities.flatMap(item => item.suggestion);
          if (allSuggestions.length > 0) {
            activitySuggestion = allSuggestions[Math.floor(Math.random() * allSuggestions.length)];
          }
        }

        const relaxationResponse = await fetch('http://localhost:8000/api/relaxation-activities/');
        if (!relaxationResponse.ok) throw new Error('Failed to fetch relaxation activities');
        const relaxationData = await relaxationResponse.json();
        const matchingRelaxations = relaxationData.filter(item => item.mood.name.toLowerCase() === moodLower);
        
        if (matchingRelaxations.length > 0) {
          const allActivities = matchingRelaxations.flatMap(item => item.activity);
          if (allActivities.length > 0) {
            relaxationActivity = allActivities[Math.floor(Math.random() * allActivities.length)];
          }
        }
      } catch (error) {
        console.error('Error fetching activity/relaxation suggestions:', error);
      }

      try {
        await spotifyApi.getMe();

        if (genres.length === 0) {
          throw new Error(`No genres defined for mood: ${mood}`);
        }

        selectedGenre = genres[genreIndex % genres.length];

        const recommendations = await spotifyApi.getRecommendations({
          seed_genres: selectedGenre,
          limit: 50,
        });

        const allTracks = recommendations.tracks;
        if (!allTracks || allTracks.length === 0) {
          throw new Error('No tracks returned from Spotify recommendations');
        }

        const tracksWithDetails = await Promise.all(
          allTracks.map(async (track) => {
            try {
              const fullTrack = await spotifyApi.getTrack(track.id);
              return {
                ...track,
                preview_url: fullTrack.preview_url || track.preview_url,
                album: fullTrack.album,
              };
            } catch (error) {
              console.warn(`Could not fetch full track details for ${track.id}:`, error);
              return track;
            }
          })
        );

        const tracksWithPreviews = tracksWithDetails.filter((track) => track.preview_url);
        let musicSuggestions;

        if (tracksWithPreviews.length >= 5) {
          const shuffledTracks = tracksWithPreviews.sort(() => Math.random() - 0.5);
          musicSuggestions = shuffledTracks.slice(0, 5).map((track) => ({
            name: `${track.name} by ${track.artists[0].name}`,
            id: track.id,
            preview_url: track.preview_url,
            external_url: track.external_urls.spotify,
            album: track.album,
          }));
        } else {
          const shuffledTracks = allTracks.sort(() => Math.random() - 0.5);
          musicSuggestions = shuffledTracks.slice(0, 5).map((track) => ({
            name: `${track.name} by ${track.artists[0].name}`,
            id: track.id,
            preview_url: track.preview_url,
            external_url: track.external_urls.spotify,
            album: track.album,
          }));
        }

        setSuggestions({
          music: musicSuggestions,
          activity: activitySuggestion,
          relaxation: relaxationActivity,
        });

        if (!musicSuggestions.some((track) => track.preview_url)) {
          if (retryCount < 2 && genres.length > genreIndex + 1) {
            console.log(
              `No tracks with previews found for ${selectedGenre}. Trying ${genres[(genreIndex + 1) % genres.length]}...`
            );
            fetchSuggestions(mood, retryCount + 1, genreIndex + 1);
            return;
          } else {
            console.log('No previews available for these tracks. Please open them in Spotify to listen or refresh for new suggestions.');
          }
        }
      } catch (error) {
        console.error('Error fetching music suggestions:', error);
        if (error.status === 401) {
          setToken('');
          window.localStorage.removeItem('token');
          console.log('Spotify session expired. Please log in again.');
        } else if (retryCount < 2 && genres.length > genreIndex + 1) {
          console.log(
            `No tracks found for ${selectedGenre}. Trying ${genres[(genreIndex + 1) % genres.length]}...`
          );
          fetchSuggestions(mood, retryCount + 1, genreIndex + 1);
        } else {
          try {
            selectedGenre = genres[Math.floor(Math.random() * genres.length)] || 'pop';
            const searchResponse = await spotifyApi.searchTracks(`genre:${selectedGenre}`, { limit: 50 });

            const allTracks = searchResponse.tracks.items;
            const tracksWithPreviews = allTracks.filter((track) => track.preview_url);
            let musicSuggestions;

            if (tracksWithPreviews.length >= 5) {
              const shuffledTracks = tracksWithPreviews.sort(() => Math.random() - 0.5);
              musicSuggestions = shuffledTracks.slice(0, 5).map((track) => ({
                name: `${track.name} by ${track.artists[0].name}`,
                id: track.id,
                preview_url: track.preview_url,
                external_url: track.external_urls.spotify,
                album: track.album,
              }));
            } else {
              const shuffledTracks = allTracks.sort(() => Math.random() - 0.5);
              musicSuggestions = shuffledTracks.slice(0, 5).map((track) => ({
                name: `${track.name} by ${track.artists[0].name}`,
                id: track.id,
                preview_url: track.preview_url,
                external_url: track.external_urls.spotify,
                album: track.album,
              }));
            }

            setSuggestions({
              music: musicSuggestions,
              activity: activitySuggestion,
              relaxation: relaxationActivity,
            });

            if (!musicSuggestions.some((track) => track.preview_url)) {
              console.log('No previews available for these tracks. Please open them in Spotify to listen or refresh for new suggestions.');
            }
          } catch (searchError) {
            console.error('Fallback search failed:', searchError);
            setSuggestions({
              music: [],
              activity: activitySuggestion,
              relaxation: relaxationActivity,
            });
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [token, setToken, setSuggestions, setLoading, moodToGenres, spotifyApi]
  );

  const detectExpression = useCallback(
    async (imageDataUrl) => {
      try {
        const img = new Image();
        img.src = imageDataUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const originalWidth = img.width;
        const originalHeight = img.height;

        // Adjust TinyFaceDetectorOptions for better detection
        const detections = await faceapi
          .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender();

        if (detections.length === 0) {
          // No face detected
          setDetectionError('No face detected. Please ensure your face is visible and well-lit, then retake the picture.');
          return null;
        }

        const { expressions, gender: detectedGender, age: detectedAge } = detections[0];
        const maxExpression = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );

        // Check if the highest expression score is too low (e.g., below 0.5)
        if (expressions[maxExpression] < 0.5) {
          setDetectionError('Expression detection confidence is too low. Please try a clearer expression or better lighting, then retake the picture.');
          return null;
        }

        const newMood = maxExpression.charAt(0).toUpperCase() + maxExpression.slice(1);
        const newGender = detectedGender;
        const newAge = Math.round(detectedAge);

        const scores = {};
        Object.keys(expressions).forEach((exp) => {
          scores[exp.charAt(0).toUpperCase() + exp.slice(1)] = (expressions[exp] * 100).toFixed(2);
        });
        setExpressionScores(scores);

        const validMood = moodOptions.includes(newMood) ? newMood : null;
        if (!validMood) {
          setDetectionError('Detected mood is not supported. Please try a different expression or retake the picture.');
          return null;
        }

        setMood(validMood);
        setGender(newGender);
        setAge(newAge);
        setDetectionError(null); // Clear any previous detection errors

        const canvas = canvasRef.current;
        canvas.width = originalWidth;
        canvas.height = originalHeight;

        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        const resizedDetections = faceapi.resizeResults(detections, { 
          width: originalWidth, 
          height: originalHeight 
        });

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        resizedDetections.forEach((detection) => {
          const box = detection.detection.box;
          const text = `${detection.gender}, ${Math.round(detection.age)} years`;
          const drawBox = new faceapi.draw.DrawTextField([text], box.topLeft);
          drawBox.draw(canvas);
        });

        fetchSuggestions(validMood.toLowerCase());
        return validMood;
      } catch (error) {
        console.error('Detection error:', error);
        setDetectionError('An error occurred during face detection. Please retake the picture.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchSuggestions, moodOptions]
  );

  const snapPicture = useCallback(async () => {
    if (!token || cameraError) return;

    setLoading(true);
    setDetectionError(null); // Clear previous detection errors
    const video = videoRef.current;
    const canvas = capturedCanvasRef.current;

    if (!video || !canvas) {
      setLoading(false);
      setDetectionError('Camera or canvas not available. Please refresh the page and try again.');
      return;
    }

    const displaySize = {
      width: video.videoWidth || 640,
      height: video.videoHeight || 480,
    };
    
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);

    stopVideo();
    const detectedMood = await detectExpression(imageDataUrl);

    if (!detectedMood) {
      // Detection failed, do not save the image or proceed
      setLoading(false);
      return;
    }

    const formData = new FormData();
    const blob = await fetch(imageDataUrl).then(res => res.blob());
    formData.append('image', blob, `captured_image_${Date.now()}.jpg`);
    formData.append('mood', detectedMood);

    try {
      const response = await fetch('http://localhost:8000/api/captured-images/', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to save image');
      const result = await response.json();
      console.log('Image saved successfully:', result);
    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      setLoading(false);
    }
  }, [token, cameraError, detectExpression, stopVideo]);

  const retakePicture = useCallback(() => {
    stopVideo();
    setCapturedImage(null);
    setMood('Unknown');
    setGender('');
    setAge(null);
    setExpressionScores({});
    setSuggestions({ music: [], activity: '', relaxation: '' });
    setCreatedPlaylistId(null);
    setPlaylistTracks([]);
    setFetchError(null);
    setDetectionError(null); // Clear detection error

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setPlayingTrackId(null);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    setTimeout(() => {
      startVideo();
    }, 100);
  }, [startVideo, stopVideo]);

  const fetchPlaylistTracks = useCallback(async (playlistId) => {
    if (!token || !playlistId) return;

    setIsFetchingTracks(true);
    setFetchError(null);

    try {
      const response = await spotifyApi.getPlaylistTracks(playlistId, {
        fields: 'items(track(id,name,artists(name),preview_url,external_urls(spotify),album(images)))',
        limit: 50
      });

      if (!response.items || response.items.length === 0) {
        throw new Error('No tracks found in the playlist.');
      }

      const tracks = response.items.map(item => ({
        name: `${item.track.name} by ${item.track.artists[0].name}`,
        id: item.track.id,
        preview_url: item.track.preview_url,
        external_url: item.track.external_urls.spotify,
        album: item.track.album
      }));

      if (createdPlaylistId === playlistId) {
        setPlaylistTracks(tracks);
      }
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      setFetchError(
        error.status === 401 ? 'Session expired. Please login again.' :
        error.status === 429 ? 'Too many requests. Please wait.' :
        'Failed to fetch playlist tracks.'
      );
      setPlaylistTracks([]);
    } finally {
      setIsFetchingTracks(false);
    }
  }, [token, createdPlaylistId]);

  const debouncedFetchPlaylistTracks = useMemo(
    () => debounce((playlistId) => {
      if (playlistId) {
        fetchPlaylistTracks(playlistId);
      }
    }, 500),
    [fetchPlaylistTracks]
  );

  useEffect(() => {
    if (createdPlaylistId) {
      fetchPlaylistTracks(createdPlaylistId);
    }
  }, [createdPlaylistId, fetchPlaylistTracks]);

  const savePlaylistToSpotify = useCallback(async () => {
    if (!token || !suggestions.music.length) {
      console.log('No tracks to save or not logged in.');
      return;
    }

    setLoading(true);
    setPlaylistTracks([]);
    setCreatedPlaylistId(null);
    setFetchError(null);

    try {
      const user = await spotifyApi.getMe();
      const userId = user.id;

      const finalPlaylistName = playlistName.trim() || `MoodTunes - ${mood} Playlist (${new Date().toLocaleDateString()})`;

      const playlist = await spotifyApi.createPlaylist(userId, {
        name: finalPlaylistName,
        description: `A playlist created by MoodTunes based on your ${mood} mood.`,
        public: false,
      });

      const playlistId = playlist.id;
      const trackUris = suggestions.music.map((track) => `spotify:track:${track.id}`);
      await spotifyApi.addTracksToPlaylist(playlistId, trackUris);

      setCreatedPlaylistId(playlistId);
      await fetchPlaylistTracks(playlistId);
    } catch (error) {
      console.error('Error saving playlist:', error);
      if (error.status === 401) {
        setToken('');
        window.localStorage.removeItem('token');
        setFetchError('Spotify session expired. Please log in again.');
      } else {
        setFetchError('Failed to save playlist. Please try again.');
      }
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setPlaylistName('');
    }
  }, [token, suggestions.music, mood, playlistName, fetchPlaylistTracks]);

  const handleSavePlaylistClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setPlaylistName('');
  }, []);

  const handleModalSave = useCallback(() => {
    savePlaylistToSpotify();
  }, [savePlaylistToSpotify]);

  const handleManualMood = useCallback(
    (value) => {
      setMood(value);
      fetchSuggestions(value.toLowerCase());
      setIsDropdownOpen(false);
    },
    [fetchSuggestions]
  );

  const logout = useCallback(() => {
    setToken('');
    window.localStorage.removeItem('token');
    setSuggestions({ music: [], activity: '', relaxation: '' });
    setPlayingTrackId(null);
    setCreatedPlaylistId(null);
    setPlaylistTracks([]);
    setFetchError(null);
    setCapturedImage(null);
    setExpressionScores({});
    setDetectionError(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    startVideo();
  }, [startVideo]);

  const togglePlay = useCallback(
    async (track) => {
      if (!track.preview_url) {
        console.log('No preview available for this track.');
        return;
      }

      try {
        if (playingTrackId === track.id) {
          audioRef.current.pause();
          setPlayingTrackId(null);
          return;
        }

        if (playingTrackId) {
          audioRef.current.pause();
        }

        audioRef.current.src = track.preview_url;
        audioRef.current.load();

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise
            .then(() => {
              setPlayingTrackId(track.id);
            })
            .catch(error => {
              console.error('Playback failed:', error);
              alert('Please click the play button again to start playback.');
            });
        }
      } catch (error) {
        console.error('Audio error:', error);
        setPlayingTrackId(null);
      }
    },
    [playingTrackId]
  );

  const openInSpotify = useCallback((url) => {
    if (url) {
      window.open(url, '_blank');
    }
  }, []);

  const moodColor = useMemo(() => {
    const colors = [
      'bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-gray-500', 
      'bg-purple-500', 'bg-orange-500', 'bg-teal-500', 'bg-pink-500'
    ];
    const moodColorMap = {};
    moodOptions.forEach((mood, index) => {
      moodColorMap[mood] = colors[index % colors.length];
    });
    return moodColorMap;
  }, [moodOptions]);

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen py-12 md:py-24 bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center"
    >
      <div className="absolute inset-0 overflow-hidden opacity-10 animate-wave">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="0.3"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-purple-300 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)] ${isVisible ? 'animate-float' : 'opacity-0'}`}
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
        <div className={`text-center space-y-6 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 relative inline-block group">
            Detect Your Mood
            <span className="absolute -bottom-2 left-1/2 w-0 h-1 bg-gradient-to-r from-yellow-300 to-orange-400 transform -translate-x-1/2 transition-all duration-500 group-hover:w-1/2 rounded-full"></span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Snap a picture and let MoodTunes analyze your facial expression to curate a playlist for your mood.
          </p>
        </div>

        {!token ? (
          <div className={`text-center mt-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <a
              href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              Login to Spotify
            </a>
          </div>
        ) : (
          <div className={`text-center mt-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-2 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              Logout
            </button>
          </div>
        )}

        <div className={`mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '400ms' }}>
          <div className="bg-white/80 backdrop-blur-md shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-t-lg -mx-6 -mt-6 mb-4">
              {capturedImage ? 'Captured Image' : 'Camera Feed'}
            </h3>
            <div className="relative">
              {capturedImage ? (
                <>
                  <img src={capturedImage} alt="Captured" className="w-full h-auto rounded-lg" />
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                </>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-auto rounded-lg transform scale-x-[-1]"
                    style={{ display: cameraError ? 'none' : 'block' }}
                  />
                  {cameraError && (
                    <div className="text-center text-red-500 p-4">
                      {cameraError}
                      <br />
                      <button
                        onClick={startVideo}
                        className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      >
                        Retry Camera
                      </button>
                    </div>
                  )}
                  <canvas 
                    ref={canvasRef} 
                    className="absolute top-0 left-0" 
                    style={{ width: '100%', height: 'auto', maxWidth: '100%', objectFit: 'contain' }} 
                  />
                </>
              )}
              {detectionError && capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="text-center text-white p-4">
                    <p className="text-red-400 mb-2">{detectionError}</p>
                    <button
                      onClick={retakePicture}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    >
                      Retake Picture
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-4">
              {capturedImage ? (
                <button
                  onClick={retakePicture}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                >
                  Retake Picture
                </button>
              ) : (
                <button
                  onClick={snapPicture}
                  disabled={loading || !token || cameraError}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Snap Picture'}
                </button>
              )}
              <button
                onClick={() => fetchSuggestions(mood.toLowerCase())}
                disabled={loading || !token || !capturedImage || detectionError || mood === 'Unknown'}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 px-6 py-2 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(251,191,36,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Refresh Suggestions
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-t-lg -mx-6 -mt-6 mb-4">
              <h3 className="text-xl font-semibold text-white">Detection Results</h3>
              <div className="relative w-32">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={!token || cameraError || moodOptions.length === 0}
                  className="w-full flex items-center justify-between bg-white/20 text-white px-4 py-2 rounded-full text-left font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{mood}</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white/90 backdrop-blur-md shadow-lg rounded-lg max-h-60 overflow-auto">
                    {moodOptions.map((moodOption) => (
                      <button
                        key={moodOption}
                        onClick={() => handleManualMood(moodOption)}
                        className="w-full text-left py-2 px-4 hover:bg-purple-500 hover:text-white transition-colors duration-200"
                      >
                        {moodOption}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-gray-700">Mood:</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-white ${moodColor[mood] || 'bg-gray-500'}`}>
                    {mood}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-gray-700">Gender:</span>
                  <span>{gender || 'Not Detected'}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-gray-700">Age:</span>
                  <span>{age ? `${age} years` : 'Not Detected'}</span>
                </div>
              </div>

              {Object.keys(expressionScores).length > 0 && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-gray-800">Expression Confidence Scores</h4>
                  <div className="space-y-2 mt-2">
                    {Object.entries(expressionScores).map(([exp, score]) => (
                      <div key={exp} className="flex items-center space-x-2">
                        <span className="text-gray-600 w-24">{exp}:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-600">{score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {moodToGenres[mood.toLowerCase()] && mood !== 'Unknown' && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-gray-800">Genres for {mood} Mood</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {moodToGenres[mood.toLowerCase()].map((genre, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 bg-gradient-to-r from-purple-200 to-indigo-200 text-gray-800 rounded-full text-sm font-medium transition-all duration-300 hover:from-purple-300 hover:to-indigo-300 hover:shadow-md"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 relative">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
                    <div className="w-8 h-8 border-4 border-t-transparent border-purple-600 rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Loading suggestions...</span>
                  </div>
                )}
                <h4 className="text-lg font-semibold text-gray-800">Suggestions</h4>
                <div className="space-y-4 mt-2">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Music Recommendations:</h5>
                    {suggestions.music.length > 0 ? (
                      <div className="space-y-2">
                        {suggestions.music.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                          >
                            <div className="flex items-center space-x-4 w-full">
                              <span className="text-gray-500 font-medium w-6 flex-shrink-0">{index + 1}.</span>
                              {item.album && item.album.images && item.album.images.length > 0 ? (
                                <img
                                  src={item.album.images[0].url}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-500 rounded-md flex-shrink-0">
                                  No Image
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-800 font-medium truncate">{item.name.split(' by ')[0]}</p>
                                <p className="text-gray-500 text-sm truncate">{item.name.split(' by ')[1]}</p>
                                {!item.preview_url && (
                                  <span className="inline-block mt-1 px-2 py-0.5 text-xs text-orange-600 bg-orange-100 rounded-full">
                                    Preview Unavailable
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
                              <button
                                onClick={() => togglePlay(item)}
                                disabled={!item.preview_url}
                                className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {playingTrackId === item.id ? (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Play</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => openInSpotify(item.external_url)}
                                className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 px-4 py-2 rounded-full font-medium hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span>Spotify</span>
                              </button>
                            </div>
                          </div>
                        ))}
                        {!suggestions.music.some((track) => track.preview_url) && suggestions.music.length > 0 && (
                          <p className="text-center text-orange-500 mt-2 text-sm">
                            No previews available. Refresh or open in Spotify for full tracks.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Snap a picture to get music suggestions.</p>
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">Activity Suggestion:</h5>
                    <p className="text-gray-600 text-sm">{suggestions.activity || 'Not available'}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">Relaxation Tip:</h5>
                    <p className="text-gray-600 text-sm">{suggestions.relaxation || 'Not available'}</p>
                  </div>
                </div>
                {suggestions.music.length > 0 && (
                  <button
                    onClick={handleSavePlaylistClick}
                    disabled={loading || !token}
                    className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Playlist to Spotify
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {token && (suggestions.music.length > 0 || createdPlaylistId) && (
          <div className={`mt-12 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '600ms' }}>
            <div className="bg-white/80 backdrop-blur-md shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-t-lg -mx-6 -mt-6 mb-4">
                Your Mood Playlist
              </h3>
              {createdPlaylistId ? (
                <>
                  <div className="relative mb-4">
                    <iframe
                      title="Spotify Embed: MoodTunes Playlist"
                      src={`https://open.spotify.com/embed/playlist/${createdPlaylistId}?utm_source=generator&theme=0`}
                      width="100%"
                      height="380px"
                      className="min-h-[360px] rounded-lg border-2 border-transparent"
                      style={{ borderImage: 'linear-gradient(to right, #9333ea, #4f46e5) 1' }}
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                  <div className="relative">
                    {isFetchingTracks ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-8 h-8 border-4 border-t-transparent border-purple-600 rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-600">Loading playlist tracks...</span>
                      </div>
                    ) : fetchError ? (
                      <div className="text-center py-4">
                        <p className="text-red-500 text-sm mb-2">{fetchError}</p>
                        <button
                          onClick={() => debouncedFetchPlaylistTracks(createdPlaylistId)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                        >
                          Retry
                        </button>
                      </div>
                    ) : playlistTracks.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Songs in Your Playlist</h4>
                        {playlistTracks.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                          >
                            <div className="flex items-center space-x-4 w-full">
                              <span className="text-gray-500 font-medium w-6 flex-shrink-0">{index + 1}.</span>
                              {item.album && item.album.images && item.album.images.length > 0 ? (
                                <img
                                  src={item.album.images[0].url}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-500 rounded-md flex-shrink-0">
                                  No Image
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-800 font-medium truncate">{item.name.split(' by ')[0]}</p>
                                <p className="text-gray-500 text-sm truncate">{item.name.split(' by ')[1]}</p>
                                {!item.preview_url && (
                                  <span className="inline-block mt-1 px-2 py-0.5 text-xs text-orange-600 bg-orange-100 rounded-full">
                                    Preview Unavailable
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
                              <button
                                onClick={() => togglePlay(item)}
                                disabled={!item.preview_url}
                                className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {playingTrackId === item.id ? (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Play</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => openInSpotify(item.external_url)}
                                className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 px-4 py-2 rounded-full font-medium hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span>Spotify</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm mb-2">
                          No tracks found for this playlist. Try refreshing or saving a new playlist.
                        </p>
                        <button
                          onClick={() => debouncedFetchPlaylistTracks(createdPlaylistId)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">Save a playlist to see it here.</p>
              )}
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Save Your Playlist</h3>
              <p className="text-gray-600 mb-4">Enter a name for your playlist, or leave it blank to use the default name.</p>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder={`MoodTunes - ${mood} Playlist`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSave}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <canvas ref={capturedCanvasRef} className="hidden" />
        <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} />
      </div>

      <style jsx>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }
        .animate-wave {
          animation: wave 20s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.8; }
          100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default FacialExpressionDetection;