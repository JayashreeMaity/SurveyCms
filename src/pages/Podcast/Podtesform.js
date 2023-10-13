import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Input, Container, Button } from "reactstrap";
// import { Button } from 'antd';
import { message, Modal, Select, TimePicker } from 'antd';
import DatePicker from 'react-datepicker';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import moment from 'moment'; 

import Breadcrumbs from '../../components/Common/Breadcrumb';
import AWS from 'aws-sdk';

function Podtesform() {
    const location = useLocation();
    const history = useHistory();

    const [currentStep, setCurrentStep] = useState(1);
    const { showId } = useParams();
    const [formData, setFormData] = useState(location.state.csvData);
    const [languages, setLanguages] = useState([]);
    const [artist, setArtist] = useState([]);
    const [category, setCategory] = useState([]);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showNameState, setShowNameState] = useState("");
    const [showSlugState, setShowSlugState] = useState("");
    const [showSubtitleState, setSubtitleState] = useState("");
    const [showDescState, setShowDescState] = useState("");
    const [showImgState, setShowImgState] = useState("");
    const [showBannerState, setShowBannerState] = useState("");
    const [showSoonState, setShowSoonState] = useState("");
    const [showAudioState, setShowAudioState] = useState("");
    const [showTotalDur, setShowTotalDur] = useState("");
    const [showDate, setShowDate] = useState("");
    const [showCredit, setShowCredit] = useState("");
    const [showTag, setShowTag] = useState("");
    const [showRss, setShowRss] = useState("");

    useEffect(() => {
        fetch(`http://3.6.200.239:8000/api/shows/${showId}`)
            .then(response => response.json())
            .then(response => {
                if (response.status && response.result && response.result.data) {
                    setFormData(response.result.data);
                } else {
                    console.error('Invalid response format:', response);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, [showId]);
    AWS.config.update({
        accessKeyId: process.env.REACT_APP_BUCKET_KEY,
        secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_BUCKET_REGION
    });
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch('http://3.6.200.239:8000/api/languages');
                const data = await response.json();

                if (response.ok) {
                    const sortedData = data.result.data.sort((a, b) => b._id.localeCompare(a._id));
                    setLanguages(sortedData);
                    setLoading(false);
                } else {
                    console.error('Error fetching data:', data);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };

        fetchLanguages();
    }, []);
    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const response = await fetch('http://3.6.200.239:8000/api/artists');
                const data = await response.json();

                if (response.ok) {
                    const sortedData = data.result.data.sort((a, b) => b._id.localeCompare(a._id));
                    setArtist(sortedData);
                    setLoading(false);
                } else {
                    console.error('Error fetching data:', data);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };

        fetchArtist();
    }, []);
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await fetch('http://3.6.200.239:8000/api/showcategory');
                const data = await response.json();

                if (response.ok) {
                    const sortedData = data.result.data.sort((a, b) => b._id.localeCompare(a._id));
                    setCategory(sortedData);
                    setLoading(false);
                } else {
                    console.error('Error fetching data:', data);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };

        fetchCategory();
    }, []);
    useEffect(() => {
        const fetchShows = async () => {
            try {
                const response = await fetch('http://3.6.200.239:8000/api/shows');
                const data = await response.json();

                if (response.ok) {
                    const sortedData = data.result.data.sort((a, b) => b._id.localeCompare(a._id));
                    setShows(sortedData);
                    setLoading(false);
                } else {
                    console.error('Error fetching data:', data);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };

        fetchShows();
    }, []);
    const s3 = new AWS.S3();
    const handleNextStep = () => {
        setCurrentStep(currentStep + 1);
    };
    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
    };
    const handleFormChange = (event, index) => {
        const { name, value } = event.target;
        if (index !== undefined) {
            const newEpisodes = [...formData.episodes];
            newEpisodes[index] = {
                ...newEpisodes[index], [name]: value,

            };
            setFormData({ ...formData, episodes: newEpisodes });
        } else {
            setFormData({
                ...formData,
                [name]: value,

            });
        }
    };

    const validateCustomStylesForm = () => {
        let isValid = true;
        if (formData.show_name === "") {
            setShowNameState("invalid");
            isValid = false;
        } else {
            setShowNameState("valid");
        } if (formData.show_slug === "") {
            setShowSlugState("invalid");
            isValid = false;
        } else {
            setShowSlugState("valid");
        } if (formData.show_subtitle === "") {
            setSubtitleState("invalid");
            isValid = false;
        } else {
            setSubtitleState("valid");
        } if (formData.show_desc === "") {
            setShowDescState("invalid");
            isValid = false;
        } else {
            setShowDescState("valid");
        } if (formData.show_image === "") {
            setShowImgState("invalid");
            isValid = false;
        } else {
            setShowImgState("valid");
        } if (formData.show_banner === "") {
            setShowBannerState("invalid");
            isValid = false;
        } else {
            setShowBannerState("valid");
        } if (formData.show_comingsoon_image === "") {
            setShowSoonState("invalid");
            isValid = false;
        } else {
            setShowSoonState("valid");
        } if (formData.trailer_audio === "") {
            setShowAudioState("invalid");
            isValid = false;
        } else {
            setShowAudioState("valid");
        }if (formData.show_total_durations === "") {
            setShowTotalDur("invalid");
            isValid = false;
        } else {
            setShowTotalDur("valid");
        }if (formData.show_publish_date === "") {
            setShowDate("invalid");
            isValid = false;
        } else {
            setShowDate("valid");
        }if (formData.show_credits === "") {
            setShowCredit("invalid");
            isValid = false;
        } else {
            setShowCredit("valid");
        }if (formData.show_tags === "") {
            setShowTag("invalid");
            isValid = false;
        } else {
            setShowTag("valid");
        }if (formData.show_rss_slug === "") {
            setShowRss("invalid");
            isValid = false;
        } else {
            setShowRss("valid");
        }
        return isValid;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const validation = validateCustomStylesForm();
        if (validation) {
            fetch('http://3.6.200.239:8000/api/shows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
                .then(response => response.json())
                .then(data => {
                    // Open confirmation modal
                    Modal.confirm({
                        title: 'Submission Successful',
                        onOk: () => {
                            // Reset form fields and navigate to another page
                            setFormData({
                                show_name: "",
                                show_slug: "",
                                show_subtitle: "",
                                show_description: "",
                                show_type: "",
                                update_frequency: "",
                                show_banner: "",
                                total_listens: "",
                                show_total_durations: "",
                                show_language: "",
                                trailer_audio: "",
                                show_image: "",
                                show_author: "",
                                show_writer: "",
                                show_narrator: "",
                                show_podcaster: "",
                                show_artist: "",
                                show_access_type: "",
                                show_publish_date: "",
                                show_publish_time: "",
                                show_rss_slug: "",
                                show_credits: "",
                                show_tags: "",
                                category_id: "",
                                show_comingsoon_image: "",
                                episodes: [
                                    {
                                        episode_name: "",
                                        episode_slug: "",
                                        episode_description: "",
                                        episode_type: "",
                                        episode_image: "",
                                        episode_audio: "",
                                        episode_author: "",
                                        episode_writer: "",
                                        episode_narrator: "",
                                        episode_podcaster: "",
                                        episode_artist: "",
                                        episode_duration: "",
                                        left_duration: "",
                                        episode_access_type: "",
                                        episode_publish_date: "",
                                        episode_publish_time: "",
                                        show_id: "",
                                    },
                                ]
                            });
                            history.push('/my-podcast');
                        },
                    });
                })
                .catch(error => {
                    // Handle error
                    message.error('An error occurred while submitting.');

                });
        }
    };
    const handleEpisodeFileChange = async (event, episodeIndex, fieldName) => {
        const file = event.target.files[0];
        const fileType = file?.type.split('/')[1];
        const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', "audio/mp3"];  // Adjust this array for other audio formats
        const maxSizeKB = 500;

        if (!allowedFileTypes.includes(file?.type)) {
            message.error('Error: Unsupported file type.');
            return;
        }

        if (file.size / 1024 > maxSizeKB) {
            message.error('Error: File size should be less than 500 KB.');
            return;
        }

        const params = {
            Bucket: process.env.REACT_APP_S3_BUCKET,
            Key: `${fieldName}_${Date.now()}.${fileType}`,
            Body: file
        };

        try {
            const data = await s3.upload(params).promise();
            console.log('File uploaded successfully:', data.Location);

            // const fileNameWithoutURL = decodeURIComponent(data.Location.split('/').pop());
            setFormData(prevFormData => {
                const updatedEpisodes = [...prevFormData.episodes];
                updatedEpisodes[episodeIndex][fieldName] = data.Location;

                return {
                    ...prevFormData,
                    episodes: updatedEpisodes
                };
            });
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };
    const handleFileChange = async (event, fieldName) => {
        const file = event.target.files[0];
        const fileType = file?.type.split('/')[1];
        const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', "audio/mp3"];

        const maxSizeKB = 500;

        if (!allowedFileTypes.includes(file?.type)) {
            message.error('Error: Unsupported file type.');
            return;
        }

        if (file.size / 1024 > maxSizeKB) {
            message.error('Error: File size should be less than 500 KB.');
            return;
        }

        if (fileType.startsWith('audio/') && file.duration > 600) {
            message.error('Error: Audio duration should be 10 minutes or less.');
            return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);
        await img.decode(); // Wait for the image to load

        if (img.width > 3000 || img.height > 3000) {
            message.error('Error: Image dimensions should be 3000x3000 pixels or less.');
            return;
        }

        const params = {
            Bucket: process.env.REACT_APP_S3_BUCKET,
            Key: `${fieldName}_${Date.now()}.${fileType}`,
            Body: file
        };

        try {
            const data = await s3.upload(params).promise();
            console.log('File uploaded successfully:', data.Location);

            // const fileNameWithoutURL = decodeURIComponent(data.Location.split('/').pop());
            setFormData(prevFormData => ({
                ...prevFormData,
                [fieldName]: data.Location
            }));
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };
    const handleTimeChange = (time, timeString) => {
        setFormData({ ...formData, show_publish_time: timeString });
    };
    const finalStepNumber = 5;
    const renderFormOneFields = () => {
        return (
            <div className="col-md-12 col-lg-7">
                <div className="tooltip-text"> Used in podcast players, e.g. Apple Podcasts, Spotify; this title will display in all podcast directories and players. </div>
                <label htmlFor="show_name">Show Name</label>
                <Input
                    type="text"
                    id="show_name"
                    value={formData.show_name || ''}
                    valid={showNameState === "valid"}
                    invalid={showNameState === "invalid"}
                    onChange={(e) => {
                        setFormData({ ...formData, show_name: e.target.value });
                        if (e.target.value === "") {
                            setShowNameState("invalid");
                        } else {
                            setShowNameState("valid");
                        }
                    }}
                />
                <div className="tooltip-text"> Used in podcast players, e.g. Apple Podcasts, Spotify; this title will display in all podcast directories and players. </div>
                <label htmlFor="show_slug">Show Slug</label>
                <Input
                    type="text"
                    id="show_slug"
                    value={formData.show_slug || ''}
                    valid={showSlugState === "valid"}
                    invalid={showSlugState === "invalid"}
                    onChange={(e) => {
                        setFormData({ ...formData, show_slug: e.target.value });
                        if (e.target.value === "") {
                            setShowSlugState("invalid");
                        } else {
                            setShowSlugState("valid");
                        }
                    }}
                />
                <label htmlFor="show_subtitle">Show Subtitle</label>
                <Input
                    type="text"
                    id="show_subtitle"
                    value={formData.show_subtitle || ''}
                    valid={showSubtitleState === "valid"}
                    invalid={showSubtitleState === "invalid"}
                    onChange={(e) => {
                        setFormData({ ...formData, show_subtitle: e.target.value });
                        if (e.target.value === "") {
                            setSubtitleState("invalid");
                        } else {
                            setSubtitleState("valid");
                        }
                    }}
                />
                <label htmlFor="show_description">Show Description</label>
                <Input
                    type="text"
                    id="show_description"
                    value={formData.show_description || ''}
                    valid={showDescState === "valid"}
                    invalid={showDescState === "invalid"}
                    onChange={(e) => {
                        setFormData({ ...formData, show_description: e.target.value })
                        if (e.target.value === "") {
                            setShowDescState("invalid");
                        } else {
                            setShowDescState("valid");
                        }
                    }}
                />
                <Row>
                    <label htmlFor="show_language">Show Language</label>
                </Row>
                <Row>
                    <Col span={24}>
                        <Select
                            id="show_language"
                            name="show_language"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={formData.show_language || ''}
                            onChange={(value) => setFormData({ ...formData, show_language: value })}
                        >
                            {languages.map((language) => (
                                <Select.Option key={language.id} value={language.language_name}>
                                    {language.language_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor="show_type">Show Type</label>
                </Row>
                <Row>
                    <Col span={24}>
                        <Select
                            id="show_type"
                            name="show_type"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={formData.show_type || ''}
                            onChange={(value) => setFormData({ ...formData, show_type: value })}
                        >
                            <Select.Option value="Audio Book">Audio Book</Select.Option>
                            <Select.Option value="Audio Drama">Audio Drama</Select.Option>
                            <Select.Option value="Podcast">Podcast</Select.Option>
                            <Select.Option value="Music/Bhajan">Music/Bhajan</Select.Option>
                            <Select.Option value="Short Stories">Short Stories</Select.Option>
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor="update_frequency">Updated Frequency</label>
                </Row>
                <Row>
                    <Col span={24}>
                        <Select
                            id="update_frequency"
                            name="update_frequency"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            // className="form-control"
                            value={formData.update_frequency || ''}
                            onChange={(value) => setFormData({ ...formData, update_frequency: value })}
                        >
                            <Select.Option value="Complete">Complete</Select.Option>
                            <Select.Option value="Daily">Daily</Select.Option>
                            <Select.Option value="Weekly">Weekly</Select.Option>
                            <Select.Option value="Semiweekly">Semiweekly</Select.Option>
                            <Select.Option value="Biweekly">Biweekly</Select.Option>
                            <Select.Option value="Monthly">Monthly</Select.Option>
                            <Select.Option value="Semimonthly">Semimonthly</Select.Option>
                            <Select.Option value="Bimonthly">Bimonthly</Select.Option>
                            <Select.Option value="No Set Schedule">No Set Schedule</Select.Option>
                        </Select>
                    </Col>
                </Row>
            </div>
        );
    };
    const renderFormSecondFields = () => {

        return (
            <div className="col-md-12 col-lg-7">
                <label htmlFor="show_image">Show Image</label>
                <p>Current File: {formData.show_image ? formData.show_image : "No image selected"}</p>
                <Input
                    type="file"
                    id="show_image"
                    accept="image/*"
                    valid={showImgState === "valid"}
                    invalid={showImgState === "invalid"}
                    onChange={(e) => {
                        handleFileChange(e, 'show_image');
                        if (e.target.value === "") {
                            setShowImgState("invalid");
                        } else {
                            setShowImgState("valid");
                        }
                    }}
                />
                <div className="tooltip-text"> Used in podcast players, e.g. Apple Podcasts, Spotify; this title will display in all podcast directories and players. </div>
                <label htmlFor="show_banner">Show Banner</label>
                <p>Current File: {formData.show_banner ? formData.show_banner : "No banner selected"}</p>
                <Input
                    type="file"
                    id="show_banner"
                    accept="image/*"
                    valid={showBannerState === "valid"}
                    invalid={showBannerState === "invalid"}
                    onChange={(e) => {
                        handleFileChange(e, 'show_banner');
                        if (e.target.value === "") {
                            setShowBannerState("invalid");
                        } else {
                            setShowBannerState("valid");
                        }
                    }}
                />
                <label htmlFor="show_comingsoon_image">Coming soon Image</label>
                <p>Current File: {formData.show_comingsoon_image ? formData.show_comingsoon_image : "No image selected"}</p>
                <Input
                    type="file"
                    id="show_banner"
                    accept="image/*"
                    valid={showSoonState === "valid"}
                    invalid={showSoonState === "invalid"}
                    onChange={(e) => {
                        handleFileChange(e, 'show_banner');
                        if (e.target.value === "") {
                            setShowSoonState("invalid");
                        } else {
                            setShowSoonState("valid");
                        }
                    }}
                />
                <label htmlFor="trailer_audio">Trailer Audio</label>
                <p>Current File: {formData.trailer_audio ? formData.trailer_audio : "No file selected"}</p>
                <Input
                    type="file"
                    id="trailer_audio"
                    accept="audio/*"
                    valid={showAudioState === "valid"}
                    invalid={showAudioState === "invalid"}
                    onChange={(e) => {
                        handleFileChange(e, 'trailer_audio');
                        if (e.target.value === "") {
                            setShowAudioState("invalid");
                        } else {
                            setShowAudioState("valid");
                        }
                    }}
                />
            </div>
        );
    };
    const renderFormThirdFields = () => {
        return (
            <div className="col-md-12 col-lg-7">
                <Row>
                    <label htmlFor="show_author">Show Author</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id="show_author"
                            name="show_author"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={formData.show_author || ''}
                            onChange={(value) => setFormData({ ...formData, show_author: value })}
                        >
                            {artist.map((artist) => (
                                <Select.Option key={artist.id} value={artist.artist_name}>
                                    {artist.artist_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor="show_writer">Show Writer</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id="show_writer"
                            name="show_writer"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={formData.show_writer || ''}
                            onChange={(value) => setFormData({ ...formData, show_writer: value })}
                        >
                            {artist.map((artist) => (
                                <Select.Option key={artist.id} value={artist.artist_name}>
                                    {artist.artist_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor="show_narrator">Show Narrator</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id="show_narrator"
                            name="show_narrator"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={formData.show_narrator || ''}
                            onChange={(value) => setFormData({ ...formData, show_narrator: value })}
                        >
                            {artist.map((artist) => (
                                <Select.Option key={artist.id} value={artist.artist_name}>
                                    {artist.artist_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor="show_podcaster">Show Podcaster</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id="show_podcaster"
                            name="show_podcaster"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={formData.show_podcaster || ''}
                            onChange={(value) => setFormData({ ...formData, show_podcaster: value })}
                        >
                            {artist.map((artist) => (
                                <Select.Option key={artist.id} value={artist.artist_name}>
                                    {artist.artist_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor="show_artist">Show Artist</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id="show_artist"
                            name="show_artist"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={formData.show_artist || ''}
                            onChange={(value) => setFormData({ ...formData, show_artist: value })}
                        >
                            {artist.map((artist) => (
                                <Select.Option key={artist.id} value={artist.artist_name}>
                                    {artist.artist_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor="show_access_type">Show Access Type</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id="show_access_type"
                            name="show_access_type"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={formData.show_access_type || ''}
                            onChange={(value) => setFormData({ ...formData, show_access_type: value })}
                        >
                            <Select.Option value="Public">Public</Select.Option>
                            <Select.Option value="Private">Private</Select.Option>
                        </Select>
                    </Col>
                </Row>
            </div>
        );
    };
    const renderFormFourthFields = () => {
        return (
            <div className="col-md-12 col-lg-7">
                <label htmlFor="show_publish_date">Date</label>
                <DatePicker
                    id="show_publish_date"
                    name="show_publish_date"
                    className="form-control"
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    value={formData.show_publish_date || ''}
                    dateFormat="MM/dd/yyyy"
                />
                <div className="tooltip-text"> Used in podcast players, e.g. Apple Podcasts, Spotify; this title will display in all podcast directories and players. </div>
                <label htmlFor="show_publish_time">Time</label>
                <TimePicker
                id="show_publish_time"
                value={formData.show_publish_time ? moment(formData.show_publish_time, 'HH:mm:ss') : null}
                className="form-control"
                onChange={handleTimeChange}
                format="HH:mm:ss"
                showSecond={true} 
                use12Hours={false} 
            />
                <label htmlFor="show_credits">Show Credit</label>
                <Input
                    type="text"
                    id="show_credits"
                    value={formData.show_credits || ''}
                    valid={showCredit === "valid"}
                    invalid={showCredit === "invalid"}
                    onChange={(e) => {
                        setFormData({ ...formData, show_credits: e.target.value });
                        if (e.target.value === "") {
                            setShowCredit("invalid");
                        } else {
                            setShowCredit("valid");
                        }
                    }}
                />
                <label htmlFor="show_tags">Show Tags</label>
                <Input
                    type="text"
                    id="show_tags"
                    value={formData.show_tags || ''}
                    valid={showTag === "valid"}
                    invalid={showTag === "invalid"}
                    onChange={(e) => {
                        setFormData({ ...formData, show_tags: e.target.value });
                        if (e.target.value === "") {
                            setShowTag("invalid");
                        } else {
                            setShowTag("valid");
                        }
                    }}                />
                <label htmlFor="show_rss_slug">Show Tags</label>
                <Input
                    type="text"
                    id="show_rss_slug"
                    value={formData.show_rss_slug || ''}
                    valid={showRss === "valid"}
                    invalid={showRss === "invalid"}
                    onChange={(e) => {
                        setFormData({ ...formData, show_rss_slug: e.target.value });
                        if (e.target.value === "") {
                            setShowRss("invalid");
                        } else {
                            setShowRss("valid");
                        }
                    }}                 />
                <Row>
                    <label htmlFor="category_id">Select Category Name</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id="category_id"
                            name="category_id"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={formData.category_id || ''}
                            onChange={(value) => setFormData({ ...formData, category_id: value })}
                        >
                            {category.map((category) => (
                                <Select.Option key={category.id} value={category._id}>
                                    {category.category_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </div>
        );
    };
    const renderEpisodeFields = (episode, index) => {
        return (
            <div key={index} className="col-md-12 col-lg-7">
                <div className="tooltip-text"> Used in podcast players, e.g. Apple Podcasts, Spotify; this title will display in all podcast directories and players. </div>
                <label htmlFor={`episode_name_${index}`}>Episode Name</label>
                <Input
                    type="text"
                    id={`episode_name_${index}`}
                    name="episode_name"
                    value={episode.episode_name}
                    onChange={(e) => handleFormChange(e, index)}
                />
                <label htmlFor={`episode_slug_${index}`}>Episode Slug</label>
                <Input
                    id={`episode_slug_${index}`}
                    placeholder="Episode Slug"
                    name="episode_slug"
                    className="form-control"
                    value={episode.episode_slug}
                    onChange={(e) => handleFormChange(e, index)}
                />
                <label htmlFor={`episode_description_${index}`}>Episode Description</label>
                <Input
                    id={`episode_description_${index}`}
                    placeholder="Episode Description"
                    name="episode_description"
                    className="form-control"
                    value={episode.episode_description}
                    onChange={(e) => handleFormChange(e, index)}
                />
                <label htmlFor={`episode_image_${index}`}>Episode Image</label>
                <Input
                    id={`episode_image_${index}`}
                    type="file"
                    accept="image/*"
                    name={`episode_image_${index}`}
                    className="form-control"
                    onChange={(e) => handleEpisodeFileChange(e, index, 'episode_image')}
                />
                <label htmlFor={`episode_audio_${index}`}>Episode Audio</label>
                <Input
                    id={`episode_audio_${index}`}
                    type="file"
                    accept="audio/*"
                    name={`episode_audio_${index}`}
                    className="form-control"
                    onChange={(e) => handleEpisodeFileChange(e, index, 'episode_audio')}
                />
                <Row>
                    <label htmlFor={`episode_type_${index}`}>Episode Type</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id={`episode_type_${index}`}
                            name="episode_type"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={episode.episode_type}
                            onChange={(value) => handleFormChange({ target: { name: 'episode_type', value } }, index)}
                        >
                            <Select.Option value="trailer">Trailer</Select.Option>
                            <Select.Option value="bonus">Bonus</Select.Option>
                            <Select.Option value="normal">Normal</Select.Option>

                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor={`episode_author_${index}`}>Episode Author</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id={`episode_author_${index}`}
                            name="episode_author"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={episode.episode_author}
                            onChange={(value) => handleFormChange({ target: { name: 'episode_author', value } }, index)}
                        >
                            {artist.map((artist) => (
                                <Select.Option key={artist._id} value={artist.artist_name}>
                                    {artist.artist_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor={`episode_writer_${index}`}>Episode Writer</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id={`episode_writer_${index}`}
                            name="episode_writer"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={episode.episode_writer}
                            onChange={(value) => handleFormChange({ target: { name: 'episode_writer', value } }, index)}
                        >
                            {artist.map((artist) => (
                                <Select.Option key={artist._id} value={artist.artist_name}>
                                    {artist.artist_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor={`episode_narrator_${index}`}>Episode Narrator</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id={`episode_narrator_${index}`}
                            name="episode_narrator"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={episode.episode_narrator}
                            onChange={(value) => handleFormChange({ target: { name: 'episode_narrator', value } }, index)}
                        >
                            {artist.map((artist) => (
                                <Select.Option key={artist._id} value={artist.artist_name}>
                                    {artist.artist_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor={`episode_podcaster_${index}`}>Episode Podcaster</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id={`episode_podcaster_${index}`}
                            name="episode_podcaster"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={episode.episode_podcaster}
                            onChange={(value) => handleFormChange({ target: { name: 'episode_podcaster', value } }, index)}
                        >
                            {artist.map((artist) => (
                                <Select.Option key={artist._id} value={artist.artist_name}>
                                    {artist.artist_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor={`episode_artist_${index}`}>Episode Artist</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id={`episode_artist_${index}`}
                            name="episode_artist"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={episode.episode_artist}
                            onChange={(value) => handleFormChange({ target: { name: 'episode_artist', value } }, index)}
                        >
                            {artist.map((artist) => (
                                <Select.Option key={artist._id} value={artist.artist_name}>
                                    {artist.artist_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <label htmlFor={`_episode_access_type_${index}`}>Episode Access Type</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id={`_episode_access_type_${index}`}
                            name="episode_access_type"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={episode.episode_access_type}
                            onChange={(value) => handleFormChange({ target: { name: 'episode_access_type', value } }, index)}
                        >
                            <Select.Option value="Public">Public</Select.Option>
                            <Select.Option value="Private">Private</Select.Option>
                        </Select>
                    </Col>
                </Row>
                <label htmlFor={`episode_duration_${index}`}>Episode Duration</label>
                <Input
                    id={`episode_duration_${index}`}
                    placeholder="Episode Description"
                    name="episode_description"
                    className="form-control"
                    value={episode.episode_duration}
                    onChange={(e) => handleFormChange(e, index)}
                />
                <label htmlFor={`left_duration_${index}`}>Left Duration</label>
                <Input
                    id={`left_duration_${index}`}
                    placeholder="Episode Description"
                    name="episode_description"
                    className="form-control"
                    value={episode.left_duration}
                    onChange={(e) => handleFormChange(e, index)}
                />
                <label htmlFor={`episode_publish_date_${index}`}>Episode Publish Date</label>
                <Input
                    id={`episode_publish_date_${index}`}
                    placeholder="Episode Description"
                    name="episode_description"
                    className="form-control"
                    value={episode.episode_publish_date}
                    onChange={(e) => handleFormChange(e, index)}
                />
                <label htmlFor={`episode_publish_time_${index}`}>Episode Time</label>
                <Input
                    id={`episode_publish_time_${index}`}
                    placeholder="Episode Description"
                    name="episode_description"
                    className="form-control"
                    value={episode.episode_publish_time}
                    onChange={(e) => handleFormChange(e, index)}
                />
                <Row>
                    <label htmlFor={`show_id_${index}`}>Select Show Name</label>
                </Row>
                <Row>
                    <Col>
                        <Select
                            id={`show_id_${index}`}
                            name="show_id"
                            size="large"
                            style={{ width: 660, border: "1px solid", borderRadius: "8px", borderColor: "black" }}
                            value={episode.show_id}
                            onChange={(value) => handleFormChange({ target: { name: 'show_id', value } }, index)}
                        >
                            {shows.map((show) => (
                                <Select.Option key={show._id} value={show._id}>
                                    {show.show_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </div >
        );
    };

    const addEpisode = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            episodes: [
                ...prevFormData.episodes,
                {
                    episode_name: "",
                    episode_slug: "",
                    episode_description: "",
                    episode_type: "",
                    episode_image: "",
                    episode_audio: "",
                    episode_author: "",
                    episode_writer: "",
                    episode_narrator: "",
                    episode_podcaster: "",
                    episode_artist: "",
                    episode_duration: "",
                    left_duration: "",
                    episode_access_type: "",
                    episode_publish_date: "",
                    episode_publish_time: "",
                    show_id: "",
                }
            ]
        }));
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container >
                    <Breadcrumbs title="Shows/Episodes" breadcrumbItems={[]} />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    <div id="progrss-wizard" className="twitter-bs-wizard">
                                        <form className="mt-4" onSubmit={handleSubmit}>
                                            <section className="tab-stepper-vertical ">

                                                <div className="tab-step  ">

                                                    <div className="tab-step-header tab-focus-indicator tab-vertical-stepper-header " >
                                                        <div className="tab-ripple tab-step-header-ripple"></div>
                                                        <div className="tab-step-icon tab-step-icon-state-number tab-step-icon-selected">
                                                            <div className="tab-step-icon-content"><span >1</span></div>
                                                        </div>
                                                        <div className="tab-step-label tab-step-label-active tab-step-label-selected">
                                                            <div className="tab-step-text-label "><span>Podcast name and details</span></div>
                                                        </div>
                                                    </div>
                                                    {currentStep === 1 && (
                                                        <div className="tab-vertical-content-container ">
                                                            <div className="tab-vertical-stepper-content " >
                                                                <div className="tab-vertical-content ">
                                                                    <div className="row">

                                                                        <div className="col-12">
                                                                            <div className="mb-3" >
                                                                                <div className="bg-lightest-blue rounded-sm information-block mb-3 ">
                                                                                    <div className="duo-tone-icon">
                                                                                        <div className="duo-tone-block"><i className="fas fa-glasses"></i></div>
                                                                                    </div>
                                                                                    <h4 >Information</h4>
                                                                                    <div className="information-text">As a general rule of thumb, don’t make people think - you’re going to be in podcast directories like Apple Podcasts and Spotify and people browse quickly, so make sure your show is named in a nice, obvious way. The author is the person or company who owns the podcast. Most often, that's you!</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {renderFormOneFields()}
                                                                        <div className="col-12 mt-4 mb-4">
                                                                            {currentStep < finalStepNumber && (
                                                                                <button className="tab-stepper-next btn btn-primary" onClick={handleNextStep}>
                                                                                    Next: Podcast cover art
                                                                                </button>
                                                                            )}                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                                <div className="tab-step  ">

                                                    <div className="tab-step-header tab-focus-indicator tab-vertical-stepper-header " >
                                                        <div className="tab-ripple tab-step-header-ripple"></div>
                                                        <div className="tab-step-icon tab-step-icon-state-number tab-step-icon-selected">
                                                            <div className="tab-step-icon-content"><span >2</span></div>
                                                        </div>
                                                        <div className="tab-step-label tab-step-label-active tab-step-label-selected">
                                                            <div className="tab-step-text-label "><span>Cover Art</span></div>
                                                        </div>
                                                    </div>
                                                    {currentStep === 2 && (

                                                        <div className="tab-vertical-content-container ">
                                                            <div className="tab-vertical-stepper-content " >
                                                                <div className="tab-vertical-content ">
                                                                    <div className="row">

                                                                        <div className="col-12">
                                                                            <div className="mb-3" >
                                                                                <div className="bg-lightest-blue rounded-sm information-block mb-3 ">
                                                                                    <div className="duo-tone-icon">
                                                                                        <div className="duo-tone-block"><i className="fas fa-glasses"></i></div>
                                                                                    </div>
                                                                                    <h4 >Information</h4>
                                                                                    <div className="information-text">As a general rule of thumb, don’t make people think - you’re going to be in podcast directories like Apple Podcasts and Spotify and people browse quickly, so make sure your show is named in a nice, obvious way. The author is the person or company who owns the podcast. Most often, that's you!</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {renderFormSecondFields()}
                                                                        <div className="col-12 mt-4 mb-4">
                                                                            {currentStep > 1 && (
                                                                                <Button className="waves-effect waves-light" style={{ marginRight: "7px" }} onClick={handlePreviousStep}>
                                                                                    Previous
                                                                                </Button>
                                                                            )}
                                                                            {currentStep < finalStepNumber && (
                                                                                <button className="tab-stepper-next btn btn-primary" onClick={handleNextStep}>
                                                                                    Next: Podcast author
                                                                                </button>
                                                                            )}                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>

                                                <div className="tab-step  ">

                                                    <div className="tab-step-header tab-focus-indicator tab-vertical-stepper-header " >
                                                        <div className="tab-ripple tab-step-header-ripple"></div>
                                                        <div className="tab-step-icon tab-step-icon-state-number tab-step-icon-selected">
                                                            <div className="tab-step-icon-content"><span >3</span></div>
                                                        </div>
                                                        <div className="tab-step-label tab-step-label-active tab-step-label-selected">
                                                            <div className="tab-step-text-label "><span>Podcast author and details</span></div>
                                                        </div>
                                                    </div>
                                                    {currentStep === 3 && (
                                                        <div className="tab-vertical-content-container ">
                                                            <div className="tab-vertical-stepper-content " >
                                                                <div className="tab-vertical-content ">
                                                                    <div className="row">

                                                                        <div className="col-12">
                                                                            <div className="mb-3" >
                                                                                <div className="bg-lightest-blue rounded-sm information-block mb-3 ">
                                                                                    <div className="duo-tone-icon">
                                                                                        <div className="duo-tone-block"><i className="fas fa-glasses"></i></div>
                                                                                    </div>
                                                                                    <h4 >Information</h4>
                                                                                    <div className="information-text">As a general rule of thumb, don’t make people think - you’re going to be in podcast directories like Apple Podcasts and Spotify and people browse quickly, so make sure your show is named in a nice, obvious way. The author is the person or company who owns the podcast. Most often, that's you!</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {renderFormThirdFields()}
                                                                        <div className="col-12 mt-4 mb-4">
                                                                            {currentStep > 2 && (
                                                                                <Button className="waves-effect waves-light" style={{ marginRight: "7px" }} onClick={handlePreviousStep}>
                                                                                    Previous
                                                                                </Button>
                                                                            )}
                                                                            {currentStep < finalStepNumber && (
                                                                                <button className="tab-stepper-next btn btn-primary" onClick={handleNextStep}>
                                                                                    Next: Podcast others
                                                                                </button>
                                                                            )}                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                                <div className="tab-step  ">

                                                    <div className="tab-step-header tab-focus-indicator tab-vertical-stepper-header " >
                                                        <div className="tab-ripple tab-step-header-ripple"></div>
                                                        <div className="tab-step-icon tab-step-icon-state-number tab-step-icon-selected">
                                                            <div className="tab-step-icon-content"><span >4</span></div>
                                                        </div>
                                                        <div className="tab-step-label tab-step-label-active tab-step-label-selected">
                                                            <div className="tab-step-text-label "><span>Podcast others</span></div>
                                                        </div>
                                                    </div>
                                                    {currentStep === 4 && (

                                                        <div className="tab-vertical-content-container ">
                                                            <div className="tab-vertical-stepper-content " >
                                                                <div className="tab-vertical-content ">
                                                                    <div className="row">

                                                                        <div className="col-12">
                                                                            <div className="mb-3" >
                                                                                <div className="bg-lightest-blue rounded-sm information-block mb-3 ">
                                                                                    <div className="duo-tone-icon">
                                                                                        <div className="duo-tone-block"><i className="fas fa-glasses"></i></div>
                                                                                    </div>
                                                                                    <h4 >Information</h4>
                                                                                    <div className="information-text">As a general rule of thumb, don’t make people think - you’re going to be in podcast directories like Apple Podcasts and Spotify and people browse quickly, so make sure your show is named in a nice, obvious way. The author is the person or company who owns the podcast. Most often, that's you!</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {renderFormFourthFields()}
                                                                        <div className="col-12 mt-4 mb-4">
                                                                            {currentStep > 3 && (
                                                                                <Button className="waves-effect waves-light" style={{ marginRight: "7px" }} onClick={handlePreviousStep}>
                                                                                    Previous
                                                                                </Button>
                                                                            )}
                                                                            {currentStep < finalStepNumber && (
                                                                                <button className="tab-stepper-next btn btn-primary" onClick={handleNextStep}>
                                                                                    Next: Podcast episodes
                                                                                </button>
                                                                            )}                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                                <div className="tab-step  ">

                                                    <div className="tab-step-header tab-focus-indicator tab-vertical-stepper-header " >
                                                        <div className="tab-ripple tab-step-header-ripple"></div>
                                                        <div className="tab-step-icon tab-step-icon-state-number tab-step-icon-selected">
                                                            <div className="tab-step-icon-content"><span >5</span></div>
                                                        </div>
                                                        <div className="tab-step-label tab-step-label-active tab-step-label-selected">
                                                            <div className="tab-step-text-label "><span>Podcast Episodes</span></div>
                                                        </div>
                                                    </div>
                                                    {currentStep === 5 && (

                                                        <div className="tab-vertical-content-container ">
                                                            <div className="tab-vertical-stepper-content " >
                                                                <div className="tab-vertical-content ">
                                                                    <div className="row">

                                                                        <div className="col-12">
                                                                            <div className="mb-3" >
                                                                                <div className="bg-lightest-blue rounded-sm information-block mb-3 ">
                                                                                    <div className="duo-tone-icon">
                                                                                        <div className="duo-tone-block"><i className="fas fa-glasses"></i></div>
                                                                                    </div>
                                                                                    <h4 >Information</h4>
                                                                                    <div className="information-text">As a general rule of thumb, don’t make people think - you’re going to be in podcast directories like Apple Podcasts and Spotify and people browse quickly, so make sure your show is named in a nice, obvious way. The author is the person or company who owns the podcast. Most often, that's you!</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-12 col-lg-7 ">
                                                                            {formData.episodes.map((episode, index) => (
                                                                                <React.Fragment key={index}>
                                                                                    {renderEpisodeFields(episode, index)}
                                                                                </React.Fragment>
                                                                            ))}
                                                                            <div className="col-12 mt-4 mb-4">
                                                                                {currentStep > 4 && (
                                                                                    <Button className="waves-effect waves-light" style={{ marginRight: "7px" }} onClick={handlePreviousStep}>
                                                                                        Previous
                                                                                    </Button>
                                                                                )}
                                                                                {/* <Button type="button" onClick={addEpisode}>
                                                                                    Add Episode
                                                                                </Button> */}
                                                                                {currentStep === finalStepNumber ? (
                                                                                    <Button type="submit" color="success" onClick={handleSubmit}>
                                                                                        Submit
                                                                                    </Button>
                                                                                ) : (
                                                                                    <button onClick={handleNextStep}>
                                                                                        Next: Podcast cover art
                                                                                    </button>
                                                                                )}
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                            </section>
                                        </form>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

export default Podtesform;
