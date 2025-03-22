import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function MuiscSuggestion() {

    const [token, setToken] = useState('');
    const [searchKey, setSearchKey] = useState('');
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Spotify credentials (should be in .env file in production)
    const CLIENT_ID = "07119f923efd42afa83501788c9b90a1"; // Replace with your Client ID
    const REDIRECT_URI = 'http://127.0.0.1:3000/music/';
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const RESPONSE_TYPE = "token";

    // Get token from URL hash after authentication
    useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("token");

    if (!storedToken && hash) {
        storedToken = hash
        .substring(1)
        .split("&")
        .find(elem => elem.startsWith("access_token"))
        .split("=")[1];

        window.location.hash = "";
        window.localStorage.setItem("token", storedToken);
    }

    setToken(storedToken);
    }, []);

    // Logout function
    const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    setSongs([]);
    };

    // Search songs function
    const searchSongs = async (e) => {
    e.preventDefault();
    if (!searchKey || !token) return;

    setIsLoading(true);
    try {
        const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            q: searchKey,
            type: "track",
            limit: 10,
        },
        });

        setSongs(response.data.tracks.items);
    } catch (error) {
        console.error("Error searching songs:", error);
        if (error.response?.status === 401) {
        logout(); // Token might have expired
        }
    } finally {
        setIsLoading(false);
    }
    };

    // Render song list
    const renderSongs = () => {
    return songs.map(song => (
        <div key={song.id} className="song-item">
        {song.album.images.length ? (
            <img src={song.album.images[0].url} alt={song.name} />
        ) : (
            <div>No Image</div>
        )}
        <div className="song-details">
            <h3>{song.name}</h3>
            <p>{song.artists.map(artist => artist.name).join(", ")}</p>
        </div>
        </div>
    ));
    };
  return (
    <div className="App">
    <header>
      <h1>Spotify Song Search</h1>
      {!token ? (
        <a
          href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-read-private`}
        >
          Login to Spotify
        </a>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </header>

    {token && (
      <form onSubmit={searchSongs}>
        <input
          type="text"
          value={searchKey}
          onChange={e => setSearchKey(e.target.value)}
          placeholder="Enter keywords to search songs..."
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>
    )}

    <div className="songs-container">
      {isLoading ? (
        <p>Loading...</p>
      ) : songs.length > 0 ? (
        renderSongs()
      ) : (
        token && <p>No songs found. Try searching!</p>
      )}
    </div>
  </div>
);
  
}

export default MuiscSuggestion
