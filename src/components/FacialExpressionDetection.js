import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, Select, Typography, Spin, message, Row, Col, Tag, Descriptions, List, Button } from 'antd';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import '../assets/css/FacialExpressionDetection.css';

const { Title } = Typography;
const { Option } = Select;

const FacialExpressionDetection = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const [mood, setMood] = useState('Neutral');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState(null);
    const [suggestions, setSuggestions] = useState({ music: [], activity: '', relaxation: '' });
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [token, setToken] = useState('');
    const [playingTrackId, setPlayingTrackId] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const intervalRef = useRef(null);
    const moodHistoryRef = useRef([]);

    const CLIENT_ID = '07119f923efd42afa83501788c9b90a1';
    const REDIRECT_URI = 'http://127.0.0.1:3000/facial-expression-detection/';
    const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
    const RESPONSE_TYPE = 'token';
    const SCOPES = 'user-read-private streaming';

    // Spotify authentication
    useEffect(() => {
        const hash = window.location.hash;
        let storedToken = window.localStorage.getItem('token');

        if (!storedToken && hash) {
            storedToken = hash
                .substring(1)
                .split('&')
                .find(elem => elem.startsWith('access_token'))
                .split('=')[1];

            window.location.hash = '';
            window.localStorage.setItem('token', storedToken);
        }

        setToken(storedToken);

        if (!storedToken) {
            const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;
            window.location.href = authUrl;
        }
    }, []);

    // Load face-api.js models
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
                console.log('Models loaded successfully');
                startVideo();
            } catch (error) {
                console.error('Error loading models:', error);
                message.error('Failed to load face detection models. Check the /models folder and network.');
            }
        };
        loadModels();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            stopVideo();
        };
    }, []);

    const startVideo = () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraError('Camera access is not supported in this browser.');
            message.error('Camera access is not supported. Use a modern browser like Chrome or Firefox.');
            return;
        }

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'user' } })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        console.log('Webcam started and playing');
                    };
                }
            })
            .catch((err) => {
                console.error('Webcam error:', err);
                setCameraError(`Camera access failed: ${err.message}. Please allow camera permissions or check your device.`);
                message.error(`Camera access failed: ${err.message}. Check permissions or device.`);
            });
    };

    const stopVideo = () => {
        const videoElement = videoRef.current;
        if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoElement.srcObject = null;
        }
    };

    const scanFace = useCallback(() => {
        if (isScanning || !token || cameraError) return;
        setIsScanning(true);
        setLoading(true);
        moodHistoryRef.current = [];

        const canvas = canvasRef.current;
        const displaySize = {
            width: videoRef.current?.videoWidth || 640,
            height: videoRef.current?.videoHeight || 480,
        };

        faceapi.matchDimensions(canvas, displaySize);

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(async () => {
            if (videoRef.current && canvas && !cameraError) {
                try {
                    const detections = await faceapi
                        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceExpressions()
                        .withAgeAndGender();

                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    const context = canvas.getContext('2d');
                    context.clearRect(0, 0, canvas.width, canvas.height);

                    faceapi.draw.drawDetections(canvas, resizedDetections);
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

                    if (detections.length > 0) {
                        const { expressions, gender: detectedGender, age: detectedAge } = detections[0];
                        const maxExpression = Object.keys(expressions).reduce((a, b) =>
                            expressions[a] > expressions[b] ? a : b
                        );
                        const newMood = maxExpression.charAt(0).toUpperCase() + maxExpression.slice(1);
                        const newGender = detectedGender;
                        const newAge = Math.round(detectedAge);

                        setMood(newMood);
                        setGender(newGender);
                        setAge(newAge);

                        moodHistoryRef.current.push(maxExpression);

                        resizedDetections.forEach(detection => {
                            const box = detection.detection.box;
                            const text = `${detection.gender}, ${Math.round(detection.age)} years`;
                            const drawBox = new faceapi.draw.DrawTextField([text], box.topLeft);
                            drawBox.draw(canvas);
                        });
                    } else {
                        setGender('');
                        setAge(null);
                    }
                } catch (error) {
                    console.error('Detection error:', error);
                    message.error('Face detection failed. Ensure models are loaded and camera is working.');
                }
            }
        }, 1000);

        setTimeout(() => {
            clearInterval(intervalRef.current);
            setIsScanning(false);
            setLoading(false);

            const moodHistory = moodHistoryRef.current;
            if (moodHistory.length > 0) {
                const averageMood = calculateAverageMood(moodHistory);
                setMood(averageMood.charAt(0).toUpperCase() + averageMood.slice(1));
                fetchSuggestions(averageMood);
            } else {
                message.warning('No faces detected during scan.');
            }
        }, 10000);
    }, [isScanning, token, cameraError]);

    const calculateAverageMood = (moodArray) => {
        if (!moodArray.length) return 'neutral';
        const moodCount = {};
        moodArray.forEach(m => {
            moodCount[m] = (moodCount[m] || 0) + 1;
        });
        return Object.keys(moodCount).reduce((a, b) => 
            moodCount[a] > moodCount[b] ? a : b
        );
    };

    const fetchSuggestions = async (mood) => {
        if (!token) {
            message.error('Please log in to Spotify first');
            return;
        }

        setLoading(true);
        try {
            const backendResponse = await axios.get(`http://localhost:8000/api/suggestions/${mood}/`);
            const { music: musicType, activity, relaxation } = backendResponse.data;

            // Dynamic mood-based audio features
            const moodAttributes = {
                happy: { energy: 0.8, valence: 0.9, danceability: 0.7 },
                sad: { energy: 0.3, valence: 0.2, danceability: 0.4 },
                angry: { energy: 0.9, valence: 0.4, danceability: 0.6 },
                neutral: { energy: 0.5, valence: 0.5, danceability: 0.5 },
                fearful: { energy: 0.4, valence: 0.3, danceability: 0.3 },
                surprised: { energy: 0.7, valence: 0.6, danceability: 0.6 }
            };

            const moodLower = mood.toLowerCase();
            const moodParams = moodAttributes[moodLower] || moodAttributes.neutral;

            // Step 1: Search for Nepali seed tracks
            const seedSearch = await axios.get('https://api.spotify.com/v1/search', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    q: `${musicType} nepali ${moodLower}`,
                    type: 'track',
                    limit: 3,
                    market: 'NP',
                },
            });

            const seedTracks = seedSearch.data.tracks.items.map(track => track.id).join(',');

            // Step 2: Get dynamic recommendations
            const recoResponse = await axios.get('https://api.spotify.com/v1/recommendations', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    seed_tracks: seedTracks,
                    target_energy: moodParams.energy,
                    target_valence: moodParams.valence,
                    target_danceability: moodParams.danceability,
                    limit: 5,
                    market: 'NP',
                    min_popularity: Math.floor(Math.random() * 30) + 20, // 20-50
                    max_popularity: Math.floor(Math.random() * 40) + 60, // 60-100
                },
            });

            const musicSuggestions = recoResponse.data.tracks.map(track => ({
                name: `${track.name} by ${track.artists[0].name}`,
                id: track.id,
                preview_url: track.preview_url,
                external_url: track.external_urls.spotify,
            }));

            console.log('Dynamic Music Suggestions:', musicSuggestions);

            if (!musicSuggestions.some(track => track.preview_url)) {
                message.warning('Limited previews available. Refresh or open in Spotify.');
            }

            setSuggestions({
                music: musicSuggestions,
                activity: activity,
                relaxation: relaxation,
            });
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            if (error.response?.status === 401) {
                setToken('');
                window.localStorage.removeItem('token');
                message.error('Spotify session expired. Please log in again.');
            } else {
                const fallbackTrack = {
                    name: `Nepali ${mood} Song - Various Artists`,
                    id: `fallback-${Date.now()}`,
                    preview_url: null,
                    external_url: `https://open.spotify.com/search/nepali%20${mood.toLowerCase()}`
                };
                setSuggestions({
                    music: Array(3).fill().map((_, i) => ({
                        ...fallbackTrack,
                        name: `${fallbackTrack.name} ${i + 1}`,
                        id: `${fallbackTrack.id}-${i}`
                    })),
                    activity: 'Explore local music',
                    relaxation: 'Take a moment to breathe',
                });
                message.error('Failed to fetch recommendations. Showing fallback options.');
            }
        }
        setLoading(false);
    };

    const handleManualMood = (value) => {
        fetchSuggestions(value.toLowerCase());
    };

    const logout = () => {
        setToken('');
        window.localStorage.removeItem('token');
        setSuggestions({ music: [], activity: '', relaxation: '' });
        setPlayingTrackId(null);
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const togglePlay = (track) => {
        if (!track.preview_url) {
            message.warning('No preview available for this track. Try opening it in Spotify.');
            return;
        }

        if (playingTrackId === track.id) {
            audioRef.current.pause();
            setPlayingTrackId(null);
        } else {
            audioRef.current.src = track.preview_url;
            audioRef.current.play().catch(err => {
                console.error('Playback error:', err);
                message.error('Failed to play preview. Try opening in Spotify.');
            });
            setPlayingTrackId(track.id);
        }
    };

    const openInSpotify = (url) => {
        if (url) {
            window.open(url, '_blank');
        } else {
            message.error('Spotify link not available for this track.');
        }
    };

    const moodColor = {
        Happy: 'green',
        Sad: 'blue',
        Angry: 'red',
        Neutral: 'gray',
        Fearful: 'purple',
        Surprised: 'orange',
    };

    return (
        <div className="app-container">
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                Mood Detector
            </Title>

            {!token ? (
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <a
                        href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`}
                    >
                        Login to Spotify
                    </a>
                </div>
            ) : (
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Button onClick={logout}>Logout</Button>
                </div>
            )}

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Video Feed" style={{ height: '100%' }}>
                        <div style={{ position: 'relative' }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                className="video"
                                style={{ width: '100%', height: 'auto', display: cameraError ? 'none' : 'block' }}
                            />
                            {cameraError && (
                                <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
                                    {cameraError}
                                    <br />
                                    <Button
                                        type="primary"
                                        onClick={startVideo}
                                        style={{ marginTop: 10 }}
                                    >
                                        Retry Camera
                                    </Button>
                                </div>
                            )}
                            <canvas
                                ref={canvasRef}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: cameraError ? 'none' : 'block',
                                }}
                            />
                        </div>
                        <Button
                            type="primary"
                            onClick={scanFace}
                            disabled={isScanning || !token || cameraError}
                            style={{ marginTop: 16, marginRight: 8 }}
                        >
                            {isScanning ? 'Scanning...' : 'Scan Mood'}
                        </Button>
                        <Button
                            onClick={() => fetchSuggestions(mood.toLowerCase())}
                            disabled={loading || !token}
                            style={{ marginTop: 16 }}
                        >
                            Refresh Suggestions
                        </Button>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card
                        title="Detection Results"
                        extra={
                            <Select
                                defaultValue="Neutral"
                                style={{ width: 120 }}
                                onChange={handleManualMood}
                                disabled={!token || cameraError}
                            >
                                <Option value="Happy">Happy</Option>
                                <Option value="Sad">Sad</Option>
                                <Option value="Angry">Angry</Option>
                                <Option value="Neutral">Neutral</Option>
                                <Option value="Fearful">Fearful</Option>
                                <Option value="Surprised">Surprised</Option>
                            </Select>
                        }
                    >
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Mood">
                                <Tag color={moodColor[mood]}>{mood}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Gender">
                                {gender || 'Detecting...'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Age">
                                {age ? `${age} years` : 'Detecting...'}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 16 }}>
                            <Spin spinning={loading} tip="Loading suggestions...">
                                <Descriptions title="Suggestions" column={1} bordered>
                                    <Descriptions.Item label="Music">
                                        <List
                                            dataSource={suggestions.music}
                                            renderItem={(item) => (
                                                <List.Item
                                                    key={item.id}
                                                    actions={[
                                                        <Button
                                                            type="primary"
                                                            size="small"
                                                            onClick={() => togglePlay(item)}
                                                            disabled={!item.preview_url}
                                                        >
                                                            {playingTrackId === item.id ? 'Pause' : 'Play'}
                                                        </Button>,
                                                        <Button
                                                            type="default"
                                                            size="small"
                                                            onClick={() => openInSpotify(item.external_url)}
                                                            style={{ marginLeft: 8 }}
                                                        >
                                                            Open in Spotify
                                                        </Button>,
                                                    ]}
                                                >
                                                    {item.name}
                                                    {!item.preview_url && (
                                                        <Tag color="orange" style={{ marginLeft: 8 }}>
                                                            Preview Unavailable
                                                        </Tag>
                                                    )}
                                                </List.Item>
                                            )}
                                        />
                                        {!suggestions.music.some(track => track.preview_url) && (
                                            <p style={{ color: 'orange', textAlign: 'center' }}>
                                                No previews available. Refresh or open in Spotify for full tracks.
                                            </p>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Activity">
                                        {suggestions.activity}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Relaxation">
                                        {suggestions.relaxation}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Spin>
                        </div>
                    </Card>
                </Col>
            </Row>

            <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} />
        </div>
    );
};

export default FacialExpressionDetection;