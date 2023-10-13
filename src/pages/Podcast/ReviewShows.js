import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Card, CardImg, CardBody } from 'reactstrap';

const ReviewShows = () => {
    const location = useLocation();
    const showData = location.state ? location.state.show : null;

    const [isPlaying, setIsPlaying] = useState(false);
    const audioElement = useRef(null);

    if (!showData) {
        return <div>No data to display.</div>;
    }

    const handlePlayPause = () => {
        if (audioElement.current) {
            if (isPlaying) {
                audioElement.current.pause();
            } else {
                audioElement.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    return (
        <div className="page-content1 center-content">

            <Container fluid>
                <div className="feed-container1">
                    <p>This is the RSS feed for {showData.show.show_name} New Episodes, a podcast hosted on Audiopitara.fm. Paste this RSS feed's URL from your
                        address bar in to your podcast app or search for the podcast in Apple Podcasts, Spotify, Google Podcasts or the podcast app that you prefer.</p>
                    <h1 className="feed-title">{showData.show.show_name}</h1>
                    <img className="episode-image" src={showData.show.show_image} alt={showData.show.show_image} />
                    <p className="feed-description">{showData.show.show_description}</p>
                    <div className="episode-list">
                        {showData.show.episodes.map((episode, index) => (
                            <div key={index} className="episode-item">
                                <h2 className="episode-name">{episode.episode_name}</h2>
                                <p className="episode-description">{episode.episode_description}</p>
                                <div className="episode-audio-container">
                                    {episode.episode_audio ? (
                                        <audio
                                            className="episode-audio"
                                            ref={audioElement}
                                            src={episode.episode_audio}
                                        />
                                    ) : (
                                        <div className="no-audio-message">No audio available</div>
                                    )}
                                    {episode.episode_audio && (
                                        <div className="progress-bar-container">
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: isPlaying ? `${(audioElement.current.currentTime / audioElement.current.duration) * 100}%` : '0',
                                                }}
                                            />
                                        </div>
                                    )}
                                    {episode.episode_audio && (
                                        <div className="audio-controls">
                                            <button className="audio-play-pause" onClick={handlePlayPause}>
                                                {isPlaying ? 'Pause' : 'Play'}
                                            </button>
                                            <span className="audio-time">
                                                {isPlaying ? `${formatTime(audioElement.current.currentTime)} / ${formatTime(audioElement.current.duration)}` : '0:00 / 0:00'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default ReviewShows;
