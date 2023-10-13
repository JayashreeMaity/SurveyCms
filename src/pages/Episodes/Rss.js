import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PlayCircleFilled, PauseCircleFilled, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import moment from 'moment';
import parse from 'html-react-parser';

const Rss = () => {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const { showSlug } = useParams();
    const [episodeData, setEpisodeData] = useState(null);
    // const [isPlaying, setIsPlaying] = useState(false);
    const audioElements = useRef([]);
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(Array(episodeData?.episodes.length).fill(false)); // Initialize playing state array

    useEffect(() => {
        fetch(`${apiEndpoint}/api/shows/slug/${showSlug}`)
            .then((response) => response.json())
            .then((data) => {
                setEpisodeData(data.result.data);
            })
            .catch((error) => {
                console.error('Error fetching episode data:', error);
            });
    }, [showSlug]);

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handlePlayPause = (index) => {
        const newIsPlaying = [...isPlaying]; // Create a copy of the playing state array
        if (newIsPlaying[index]) {
            audioElements.current[index].pause();
        } else {
            audioElements.current[index].play();
        }
        newIsPlaying[index] = !newIsPlaying[index]; // Toggle the playing state for the clicked episode
        setIsPlaying(newIsPlaying); // Update the playing state array
        setCurrentEpisodeIndex(index); // Set the current episode index
    };

    if (!episodeData) {
        return <div>Loading...</div>;
    }
    function removeHtmlTags(input) {
        console.log(">>>input", input.replace(/<[^>]+>/g, ''))
        return input.replace(/<[^>]+>/g, '');
    }
    console.log("parse(episodeData.show_description)>>", parse(episodeData.show_description))
    return (
        <div className='page-content'>
            <div className="feed-container1">
                <p className='rss-des'>This is the RSS feed for {episodeData.show_name} New Episodes, a podcast hosted on Audiopitara.com. Paste this RSS feed's URL from your address bar into your podcast app or search for the podcast in Apple Podcasts, Spotify, Google Podcasts, or the podcast app of your choice.</p>
                <div className='col-nid'>
                    <img className="episode-image" src={episodeData.show_image} alt={episodeData.show_name} style={{ width: "170px" }} />
                    <div>
                        <h1 className="feed-title">{episodeData.show_name}</h1>
                        <p className="feed-description">
                            {`${removeHtmlTags(episodeData.show_description)} ${episodeData.show_tags ? `#${episodeData.show_tags}` : ''}`}
                        </p>
                    </div>
                </div>

                <div className="episode-list">
                    {episodeData.episodes.map((episode, index) => (
                        <div key={index} className="episode-item">
                            <h2 className="episode-name">{episode.episode_name}</h2>
                            <p className="episode-description">{moment(episode.episode_publish_date).format('ddd, DD MMM YYYY HH:mm:ss ZZ')}</p>
                            <p className="episode-description">{`${removeHtmlTags(episode.episode_description)}`}</p>
                            <div className="episode-audio-container">
                                {episode.episode_audio ? (
                                    <audio
                                        className="episode-audio"
                                        style={{width: "-webkit-fill-available"}}
                                        ref={(el) => (audioElements.current[index] = el)}
                                        src={episode.episode_audio}
                                        controls
                                    />
                                ) : (
                                    <div className="no-audio-message">No audio available</div>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Rss;
