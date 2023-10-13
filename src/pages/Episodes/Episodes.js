import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { Container, Card, CardImg, CardBody } from 'reactstrap';
import { SettingOutlined, CopyOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { faPodcast } from '@fortawesome/free-solid-svg-icons'; // Make sure you have the correct import path
import { faGear, faRss } from '@fortawesome/free-solid-svg-icons';
import { message } from 'antd';
const Episodes = () => {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const { showId } = useParams(); // Get the showId from the URL parameter
    const history = useHistory();
    const [alert, setAlert] = useState(false);

    const [episodeData, setEpisodeData] = useState(null);
    useEffect(() => {
        if (alert) {
            setTimeout(() => {
                setAlert(false);
            }, 3000);
        }
    }, [alert])
    useEffect(() => {
        // Fetch episode data based on the showId and set it in episodeData state
        // Example fetch code:
        fetch(`${apiEndpoint}/api/shows/${showId}`)
            .then((response) => response.json())
            .then((episodeData) => {
                setEpisodeData(episodeData.result.data);
            })
            .catch((error) => {
                console.error('Error fetching episode data:', error);
            });
    }, [showId]);

    if (!episodeData) {
        return <div>Loading...</div>;
    }

    
    const handleCopyRSS = () => {
        fetch(`${apiEndpoint}/api/shows/${showId}`)
            .then((response) => response.json())
            .then((data) => {
                setEpisodeData(data.result.data);
            })
            .catch((error) => {
                console.error('Error fetching episode data:', error);
            });
        setAlert(true);
        // history.push(`/feeds/${showId}`);
    }

    const handlePodset = () => {
        history.push(`/podcast-setting/${showId}`);
    }

    function unsecuredCopyToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Unable to copy to clipboard', err);
        }
        document.body.removeChild(textArea);
    }

    // Render episode details
    return (
        <React.Fragment>


            <div className="page-content">
                <div className="main--content-container">
                    <div className="main--content">


                        <div className="context-banner show-header d-print-none show-in-network">
                            <FontAwesomeIcon icon={faNetworkWired} className="corner-icon cursor-pointer" />
                            <img className="context-banner-artwork mr-3 mr-lg-4 is-default" src={episodeData.show_image} alt={episodeData.show_name} width="100" height="100" />
                            <div className="context-banner-content">
                                <div className="context-banner-title overflow-ellipsis"> {episodeData.show_name}</div>
                                <div className="context-banner-sub-actions hide-tablet flex-grow-1">
                                    <button type="button" className="btn btn-tertiary mr-4 pl-0 pr-0" onClick={handlePodset}>

                                        <FontAwesomeIcon icon={faGear} className="mr-2" />
                                        Podcast Settings
                                    </button>
                                    <button onClick={handleCopyRSS} type="button" className="btn btn-tertiary mr-4 pl-0 pr-0">
                                        <FontAwesomeIcon icon={faRss} className="mr-2" />
                                        Copy RSS Feed </button>
                                </div>
                            </div>
                            <Link to={{ pathname: `/create/add-episode/${showId}` }}>
                                <button type="button" className=" btn--primary ml-auto context-banner-main-action-btn">
                                    <span> Publish New Episode</span>
                                    <FontAwesomeIcon icon={faPodcast} className="ml-lg-2" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Episodes;
