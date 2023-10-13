import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Input, Container, Modal, ModalHeader, ModalBody } from "reactstrap";
import { Button } from 'antd';
import { message, Select, TimePicker } from 'antd';
import DatePicker from 'react-datepicker';
import { useHistory, useParams, useLocation, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import moment from 'moment';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import AWS from 'aws-sdk';

function EditPod() {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const history = useHistory();
    const location = useLocation();
    let propsData = location.state;
    const [currentStep, setCurrentStep] = useState(1);
    const { showId } = useParams();
    const [formData, setFormData] = useState(propsData !== undefined ? propsData.formData : {});
    const [catSelect, setCatSelect] = useState(propsData !== undefined ? propsData.catSelect : "");
    const [secCatSelect, setSecCatSelect] = useState(propsData !== undefined ? propsData.secCatSelect : "");
    const [firstCatSelect, setFirstCatSelect] = useState(propsData !== undefined ? propsData.firstCatSelect : "");
    const [languages, setLanguages] = useState([]);
    const [artist, setArtist] = useState([]);
    const [category, setCategory] = useState([]);
    const [shows, setShows] = useState([]);
    const [showsName, setShowsName] = useState();
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(formData.show_publish_time || null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showResId, setShowResId] = useState();
    const [showDescQuill, setShowDescQuill] = useState("");
    const [showNameState, setShowNameState] = useState("");
    const [showSlugState, setShowSlugState] = useState("");
    const [showSubtitleState, setSubtitleState] = useState("");
    const [showDescState, setShowDescState] = useState("");
    const [showImgState, setShowImgState] = useState("");
    const [showBannerState, setShowBannerState] = useState("");
    const [showSoonState, setShowSoonState] = useState("");
    const [showTotalDur, setShowTotalDur] = useState("");
    const [showDate, setShowDate] = useState("");
    const [showCredit, setShowCredit] = useState("");
    const [showTag, setShowTag] = useState("");
    const [showRss, setShowRss] = useState("");
    const [showAuthor, setShowAuthor] = useState("");
    const [nextSelect, setNextSelect] = useState({ id: "", isOpen: "" });
    const [thirdCatSelect, setThirdCatSelect] = useState({ isOpen: false, value: "" });
    const [trailerAudioPreview, setTrailerAudioPreview] = useState(null);
    const [showAudioState, setShowAudioState] = useState("");

    useEffect(() => {
        fetch(`${apiEndpoint}/api/shows/${showId}`)
            .then(response => response.json())
            .then(response => {
                if (response.status && response.result && response.result.data) {
                    setFormData(propsData !== undefined ? propsData.formData : (response.result.data));
                    setTrailerAudioPreview(response.result.data.trailer_audio);
                    console.log("O>>>>>>", response.result.data.url)
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
                const response = await fetch(`${apiEndpoint}/api/languages`);
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
                const response = await fetch(`${apiEndpoint}/api/artists`);
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
                const response = await fetch(`${apiEndpoint}/api/showcategory`);
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
                const response = await fetch(`${apiEndpoint}/api/shows`);
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

    useEffect(() => {
        if (propsData !== undefined) {
            setFormData(propsData.formData);
        }
    }, [propsData]);

    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            setFirstCatSelect(formData?.category_id[0]);
        }
    }, [formData]);

    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            setCatSelect(formData?.category_id[1]);
        }
    }, [formData]);

    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            setSecCatSelect(formData?.category_id[2]);
        }
    }, [formData]);

    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            if (firstCatSelect?.length !== 0) {
                formData.category_id[0] = firstCatSelect;
            }
        }
    }, [firstCatSelect]);

    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            if (catSelect?.length !== 0) {
                formData.category_id[1] = catSelect;
            }
        }
    }, [catSelect]);

    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            if (secCatSelect?.length !== 0) {
                formData.category_id[2] = secCatSelect;
            }
        }
    }, [secCatSelect]);

    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            if (formData.show_description?.length !== 0) {
                setShowDescQuill(formData.show_description)
            }
        }
    }, [formData]);

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
                show_description: showDescQuill,
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
        } if (formData.show_description === "") {
            setShowDescState("invalid");
            isValid = false;
        } else {
            setShowDescState("valid");
        } if (formData.show_total_durations === "") {
            setShowTotalDur("invalid");
            isValid = false;
        } else {
            setShowTotalDur("valid");
        } if (formData.show_publish_date === "") {
            setShowDate("invalid");
            isValid = false;
        } else {
            setShowDate("valid");
        } if (formData.show_credits === "") {
            setShowCredit("invalid");
            isValid = false;
        } else {
            setShowCredit("valid");
        } if (formData.show_tags === "") {
            setShowTag("invalid");
            isValid = false;
        } else {
            setShowTag("valid");
        } if (formData.show_rss_slug === "") {
            setShowRss("invalid");
            isValid = false;
        } else {
            setShowRss("valid");
        } if (formData.show_author === "") {
            setShowAuthor("invalid");
            isValid = false;
        } else {
            setShowAuthor("valid");
        }
        return isValid;
    }

    console.log("firstCatSelect", firstCatSelect);

    const handleSubmit = (event) => {
        event.preventDefault();
        const validation = validateCustomStylesForm();
        if (validation) {
            fetch(`${apiEndpoint}/api/shows/${showId}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    setShowSuccessModal(true);
                    setShowResId(data.result.data._id);
                })
                .catch(error => {

                    message.error('An error occurred while submitting.');

                });
        }
    };
    const handleModalCancel = () => {
        // Close the modal and reset form data
        setFormData({
            show_name: " ",
            show_slug: " ",
            show_subtitle: " ",
            show_description: " ",
            show_type: " ",
            update_frequency: " ",
            show_banner: " ",
            total_listens: "0",
            show_total_durations: "00:00:00 Hrs",
            show_language: " ",
            trailer_audio: " ",
            show_image: " ",
            show_author: " ",
            show_writer: " ",
            show_narrator: " ",
            show_podcaster: " ",
            show_artist: " ",
            show_access_type: " Public",
            show_publish_date: " ",
            show_publish_time: " ",
            show_rss_slug: " ",
            show_credits: " ",
            show_tags: " ",
            category_id: [],
            show_comingsoon_image: " ",
            episodes: []
        });
        setShowSuccessModal(false);
    }

    const handleOk = () => {
        history.push(`/my-podcast`);
    }
    const handleEpisodeFileChange = async (event, episodeIndex, fieldName) => {
        const file = event.target.files[0];
        const fileType = file.type.split('/')[1];
        const allowedFileTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/mp4', "audio/mp3"];  // Adjust this array for other audio formats
        const maxSizeKB = 500;

        if (!allowedFileTypes.includes(file.type)) {
            message.error('Error: Unsupported file type.');
            return;
        }

        // if (file.size / 1024 > maxSizeKB) {
        //     message.error('Error: File size should be less than 500 KB.');
        //     return;
        // }

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
        if (!file) {
            console.error('No file selected.');
            return;
        }
        const fileType = file.type.split('/')[1];
        const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp'];

        const maxSizeKB = 500;

        if (!allowedFileTypes.includes(file.type)) {
            message.error('Error: Unsupported file type.');
            return;
        }

        if (file.size / 1024 > maxSizeKB) {
            message.error('Error: File size should be less than 500 KB.');
            return;
        }

        // if (fileType.startsWith('audio/') && file.duration > 600000) {
        //     message.error('Error: Audio duration should be 10 minutes or less.');
        //     return;
        // }

        // const img = new Image();
        // img.src = URL.createObjectURL(file);
        // await img.decode(); // Wait for the image to load

        // if (img.width > 3000 || img.height > 3000) {
        //     message.error('Error: Image dimensions should be 3000x3000 pixels or less.');
        //     return;
        // }
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
            setTrailerAudioPreview(file);
            console.log("KKKKK", URL.createObjectURL(trailerAudioPreview))
            console.log("KKKKK", file)
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };
    const handleAudioFileChange = async (event, fieldName) => {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }
        const fileType = file?.type.split('/')[1];
        const allowedFileTypes = ['audio/mpeg', 'audio/mp4', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3', 'audio/mpg', 'audio/x-mpg', 'audio/mpeg3', 'audio/x-mpeg3'];

        const maxSizeKB = 500;

        if (!allowedFileTypes.includes(file.type)) {
            message.error('Error: Unsupported file type.');
            return;
        }

        const params = {
            Bucket: process.env.REACT_APP_S3_BUCKET,
            Key: `${fieldName}_${Date.now()}.${file?.name}`,
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
            setTrailerAudioPreview(file);
            console.log("KKKKK", URL.createObjectURL(trailerAudioPreview))
            console.log("KKKKK", file)
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };
    const handleDescriptionChange = (value) => {
        // Handle the rich text editor content change
        handleFormChange({ target: { name: 'show_description', value } });

        // Check if the content is empty and set the validation state accordingly
        if (!value.trim()) {
            setShowDescState('invalid');
        } else {
            setShowDescState('valid');
        }
    };

    const finalStepNumber = 5;
    const renderFormOneFields = () => {
        return (
            <div className="col-md-12 col-lg-7">
                <label htmlFor="show_name">Show Name</label>
                <div className="tooltip-text"> Used in podcast players, e.g. Apple Podcasts, Spotify; this title will display in all podcast directories and players. </div>
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
                    }} />
                <label htmlFor="show_slug">Show Slug</label>
                <div className="tooltip-text">Used in some podcast search results. </div>
                <div className="input-group mb-3">
                    <div className="input-group-prepend d-none d-sm-flex">
                        <span className="input-group-text">https://feeds.audiopitara.com</span>
                    </div>
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
                </div>

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
                    }} />
                <label htmlFor="show_description">Show Description</label>
                <div className="show__description__height">
                    <ReactQuill
                        id="show_description"
                        name="show_description"
                        value={showDescQuill}
                        onChange={handleDescriptionChange}
                    />
                </div>
                <label htmlFor="show_language">Show Language</label>
                <div className="antd_select">
                    <Select
                        id="show_language"
                        name="show_language"
                        size="large"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={formData.show_language || ''}
                        onChange={(value) => setFormData({ ...formData, show_language: value })}
                    >
                        {languages.map((language) => (
                            <Select.Option key={language.id} value={language.language_name}>
                                {language.language_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <label htmlFor="show_type">Show Type</label>
                <div className="antd_select">
                    <Select
                        id="show_type"
                        name="show_type"
                        size="large"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={formData.show_type || ''}
                        onChange={(value) => setFormData({ ...formData, show_type: value })}
                    >
                        <Select.Option value="Audio Book">Audio Book</Select.Option>
                        <Select.Option value="Audio Drama">Audio Drama</Select.Option>
                        <Select.Option value="Podcast">Podcast</Select.Option>
                        <Select.Option value="Music/Bhajan">Music/Bhajan</Select.Option>
                        <Select.Option value="Short Stories">Short Stories</Select.Option>
                        <Select.Option value="Audio Nattak">Audio Nattak</Select.Option>
                    </Select>
                </div>
                <label htmlFor="update_frequency">Updated Frequency</label>
                <div className="antd_select">
                    <Select
                        id="update_frequency"
                        name="update_frequency"
                        size="large"
                        style={{ width: "100%", border: "0px", lineheight: "2" }}                            // className="form-control"
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
                </div>
            </div>
        );
    };
    const renderFormSecondFields = () => {

        return (
            <div className="col-md-12 col-lg-7">
                <label htmlFor="trailer_audio">Trailer Audio</label>
                {console.log("formData?.trailer_audio?.length", formData.trailer_audio)}
                {formData.trailer_audio && (
                    <audio
                        key={formData.trailer_audio} // Add a unique key based on the audio URL
                        controls
                        style={{ width: "-webkit-fill-available", marginBottom: "4px" }}
                    >
                        <source src={formData.trailer_audio} />
                        Your browser does not support the audio element.
                    </audio>
                )}
                <p>
                    Current Audio:{" "}
                    {formData.trailer_audio
                        ? decodeURIComponent(formData.trailer_audio.split("/").pop())
                        : "No Audio selected"}
                </p>
                <Input
                    type="file"
                    id="trailer_audio"
                    accept="audio/*"
                    valid={showAudioState === "valid"}
                    invalid={showAudioState === "invalid"}
                    onChange={(e) => {
                        handleAudioFileChange(e, 'trailer_audio');
                        if (e.target.value === "") {
                            setShowAudioState("invalid");
                        } else {
                            setShowAudioState("valid");
                        }
                    }} />

                <label htmlFor="show_image">Show Image</label>
                <div className="tooltip-text"> Used in podcast players, e.g. Apple Podcasts, Spotify; this title will display in all podcast directories and players. </div>
                {formData.show_image &&
                    <div>
                        <img src={formData.show_image} style={{ marginBottom: "10px", width: "200px" }} />
                    </div>}
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
                    }} />
                <p> Current Image: {formData.show_image ? "Image selected" : "No image selected"}</p>
                <label htmlFor="show_banner">Show Banner</label>
                {formData.show_banner &&
                    <div>
                        <img src={formData.show_banner} style={{ marginBottom: "10px", width: "200px" }} />
                    </div>}
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
                    }} />
                {/* <p>Current Image: {formData.show_banner ? formData.show_banner : "No banner selected"}</p> */}
                <p> Current Image: {formData.show_banner ? "Image selected" : "No image selected"}</p>

                <label htmlFor="show_comingsoon_image">Coming soon Image</label>
                {formData.show_comingsoon_image &&
                    <div>
                        <img src={formData.show_comingsoon_image} style={{ marginBottom: "10px", width: "240px", height: "170px" }} />
                    </div>}
                <Input
                    type="file"
                    id="show_comingsoon_image"
                    accept="image/*"
                    valid={showSoonState === "valid"}
                    invalid={showSoonState === "invalid"}
                    onChange={(e) => {
                        handleFileChange(e, 'show_comingsoon_image');
                        if (e.target.value === "") {
                            setShowSoonState("invalid");
                        } else {
                            setShowSoonState("valid");
                        }
                    }} />
                {/* <p>Current Image: {formData.show_comingsoon_image ? formData.show_comingsoon_image : "No image selected"}</p> */}
                <p> Current Image: {formData.show_comingsoon_image ? "Image selected" : "No image selected"}</p>
            </div>
        );
    };
    const renderFormThirdFields = () => {
        return (
            <div className="col-md-12 col-lg-7">
                <label htmlFor="show_author">Author Name</label>
                <div className="tooltip-text">The name of the host or creator brand. Do not spam this with keywords or other peoples’ names, you may get banned from Apple Podcasts etc. </div>
                <Input
                    type="text"
                    id="show_author"
                    value={formData.show_author || ''}
                    valid={showAuthor === "valid"}
                    invalid={showAuthor === "invalid"}
                    onChange={(e) => {
                        setFormData({ ...formData, show_author: e.target.value });
                        if (e.target.value === "") {
                            setShowAuthor("invalid");
                        } else {
                            setShowAuthor("valid");
                        }
                    }} />
                {/* <div className="antd_select">
                    <Select
                        id="show_author"
                        name="show_author"
                        size="large"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={formData.show_author || ''}
                        onChange={(value) => setFormData({ ...formData, show_author: value })}
                    >
                        {artist.map((artist) => (
                            <Select.Option key={artist.id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div> */}
                {(formData.show_type === "Audio Book" || formData.show_type === "Audio Drama" || formData.show_type === "Music/Bhajan" || formData.show_type === "Short Stories" || formData.show_type === "Audio Nattak") &&
                    <>
                        <label htmlFor="show_writer">Show Writer</label>
                        <div className="antd_select">
                            <Select
                                id="show_writer"
                                name="show_writer"
                                size="large"
                                style={{ width: "100%", border: "0px", lineheight: "2" }} value={formData.show_writer || ''}
                                onChange={(value) => setFormData({ ...formData, show_writer: value })}
                            >
                                {artist.map((artist) => (
                                    <Select.Option key={artist.id} value={artist.artist_name}>
                                        {artist.artist_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </>
                }
                {(formData.show_type === "Audio Book" || formData.show_type === "Short Stories" || formData.show_type === "Audio Nattak") &&
                    <>
                        <label htmlFor="show_narrator">Show Narrator</label>
                        <div className="antd_select">
                            <Select
                                id="show_narrator"
                                name="show_narrator"
                                size="large"
                                style={{ width: "100%", border: "0px", lineheight: "2" }} value={formData.show_narrator || ''}
                                onChange={(value) => setFormData({ ...formData, show_narrator: value })}
                            >
                                {artist.map((artist) => (
                                    <Select.Option key={artist.id} value={artist.artist_name}>
                                        {artist.artist_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </>
                }
                {(formData.show_type === "Podcast") &&
                    <>
                        <label htmlFor="show_podcaster">Show Podcaster</label>
                        <div className="antd_select">
                            <Select
                                id="show_podcaster"
                                name="show_podcaster"
                                size="large"
                                style={{ width: "100%", border: "0px", lineheight: "2" }} value={formData.show_podcaster || ''}
                                onChange={(value) => setFormData({ ...formData, show_podcaster: value })}
                            >
                                {artist.map((artist) => (
                                    <Select.Option key={artist.id} value={artist.artist_name}>
                                        {artist.artist_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </>
                }
                {(formData.show_type === "Audio Drama" || formData.show_type === "Music/Bhajan") &&
                    <>
                        <label htmlFor="show_artist">Show Artist</label>
                        <div className="antd_select">
                            <Select
                                id="show_artist"
                                name="show_artist"
                                size="large"
                                style={{ width: "100%", border: "0px", lineheight: "2" }} value={formData.show_artist || ''}
                                onChange={(value) => setFormData({ ...formData, show_artist: value })}
                            >
                                {artist.map((artist) => (
                                    <Select.Option key={artist.id} value={artist.artist_name}>
                                        {artist.artist_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </>
                }

                <label htmlFor="show_access_type">Show Access Type</label>
                <div className="antd_select">
                    <Select
                        id="show_access_type"
                        name="show_access_type"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={formData.show_access_type || ''}
                        onChange={(value) => setFormData({ ...formData, show_access_type: value })}
                    >
                        <Select.Option value="Public">Public</Select.Option>
                        <Select.Option value="Private">Private</Select.Option>
                    </Select>
                </div>
                {/* <label htmlFor="show_total_durations">Total Duration</label>
                <Input
                    type="text"
                    id="show_total_durations"
                    value={formData.show_total_durations || ''}
                    valid={showTotalDur === "valid"}
                    invalid={showTotalDur === "invalid"}
                    onChange={(e) => {
                        setFormData({ ...formData, show_total_durations: e.target.value });
                        if (e.target.value === "") {
                            setShowTotalDur("invalid");
                        } else {
                            setShowTotalDur("valid");
                        }
                    }
                    }
                /> */}
            </div>
        );
    };
    const handleTimeChange = (time, timeString) => {
        console.log("timeString", timeString)
        console.log("time", time)
        setFormData((prevData) => ({
            ...prevData,
            show_publish_time: timeString,
        }));
        setSelectedTime(timeString);
    };
    const options = [];
    for (let i = 10; i < 36; i++) {
        options.push({
            value: i.toString(36) + i,
            label: i.toString(36) + i,
        });
    }
    const renderFormFourthFields = () => {
        return (
            <div className="col-md-12 col-lg-7">
                <label htmlFor="show_credits">Show Credit</label>
                <textarea
                    type="text"
                    id="show_credits"
                    className="form-control"
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
                {/* <Input
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
                    }}
                /> */}
                <div className="antd_select spase_none">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        mode="tags"
                        id="show_tags"
                        placeholder="Show Tags"
                        value={formData.show_tags || ''}
                        name="show_tags"
                        onChange={(value) => handleFormChange({ target: { name: 'show_tags', value } })}
                        options={options}
                        // options={[]}
                    />
                </div>

                <label htmlFor="category_id">Main Category</label>
                <div className="antd_select">
                    <Select
                        id="category_id"
                        name="category_id"
                        value={firstCatSelect}
                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                        onChange={(value) => {
                            // handleFormChange({ target: { name: 'category_id', value } })
                            setNextSelect({ id: 1, isOpen: true, value });
                            setFirstCatSelect(value)
                        }}
                        virtual={false} 
                    >
                        <Select.Option value="">None</Select.Option>
                        {category.map((category) => (
                            <>
                                <Select.Option key={category.id} value={category._id}>
                                    {category.category_name}
                                </Select.Option>
                                {category.sub_category.map((cat) => (
                                    <Select.Option key={cat.id} value={cat._id}>
                                        {category.category_name !== null ? `${category.category_name} > ${cat.sub_category_name}` : cat.sub_category_name}
                                    </Select.Option>))}
                            </>
                        ))}
                    </Select>
                </div>
                <div className="tooltip-text" style={{ marginTop: "10px" }}>
                    The main category that your show will appear in when browsing podcast apps.
                </div>

                <label htmlFor="category_id">Second Category</label>
                <Col>
                    <div className="antd_select">
                        <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                            id="category_id"
                            name="category_id"
                            value={catSelect}
                            onChange={(value) => {
                                setCatSelect(value);
                                // handleFormChange({ target: { name: 'category_id_01', value } })
                                setThirdCatSelect({ isOpen: true, value });
                            }}
                            virtual={false} 
                        >
                            <Select.Option value="">None</Select.Option>
                            {category.map((category) => (
                                <>
                                    <Select.Option key={category.id} value={category._id}>
                                        {category.category_name}
                                    </Select.Option>
                                    {category.sub_category.map((cat) => (
                                        <Select.Option key={cat.id} value={cat._id}>
                                            {category.category_name !== null ? `${category.category_name} > ${cat.sub_category_name}` : cat.sub_category_name}
                                        </Select.Option>))}
                                </>
                            ))}
                        </Select>
                    </div>
                </Col>

                <label htmlFor="category_id">Third Category</label>
                <Col>
                    <div className="antd_select">
                        <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                            id="category_id"
                            name="category_id"
                            value={secCatSelect}
                            onChange={(value) => {
                                setSecCatSelect(value)
                                // handleFormChange({ target: { name: 'category_id_02', value } })
                            }}
                            virtual={false} 
                        >
                            <Select.Option value="">None</Select.Option>
                            {category.map((category) => (
                                <>
                                    <Select.Option key={category.id} value={category._id}>
                                        {category.category_name}
                                    </Select.Option>
                                    {category.sub_category.map((cat) => (
                                        <Select.Option key={cat.id} value={cat._id}>
                                            {category.category_name !== null ? `${category.category_name} > ${cat.sub_category_name}` : cat.sub_category_name}
                                        </Select.Option>))}
                                </>
                            ))}
                        </Select>
                    </div>
                </Col>
                <label htmlFor="show_publish_date">Date</label>
                <DatePicker
                    id="show_publish_date"
                    name="show_publish_date"
                    className="form-control"
                    selected={selectedDate}
                    onChange={(date) => {
                        setSelectedDate(date);
                        setFormData({ ...formData, show_publish_date: date });
                    }}
                    value={moment(formData.show_publish_date).format('DD/MM/YYYY') || ''}
                    dateFormat="dd/MM/yyyy"
                />
                <label htmlFor="show_publish_time">Time</label>

                <TimePicker
                    id="show_publish_time"
                    className="form-control"
                    onChange={handleTimeChange}
                    value={formData.show_publish_time ? moment(formData.show_publish_time, 'h:mm A') : null}
                    format="h:mm A"
                    showSecond={false}
                    use12Hours={true}
                    hideDisabledOptions={true}
                />
                <div className="mb-3">
                    <label htmlFor="subdomain">Feed URL</label>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend d-none d-sm-flex">
                            <span className="input-group-text">https://feeds.audiopitara.com</span>
                        </div>
                        <Input
                            id="show_rss_slug"
                            placeholder="myshow"
                            formcontrolname="subdomain"
                            autoComplete="off"
                            className="form-control"
                            type="text"
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
                            }}
                        />
                    </div>
                </div>
                {/* <label htmlFor="show_rss_slug">Show Rss Slug</label>

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
                    }} /> */}
            </div>
        );
    };
    const renderEpisodeFields = (episode, index) => {
        return (
            <div key={index} className="col-md-12 col-lg-7">
                <label htmlFor={`episode_name_${index}`}>Episode Name</label>
                <div className="tooltip-text"> Used in podcast players, e.g. Apple Podcasts, Spotify; this title will display in all podcast directories and players. </div>
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

                // onChange={(e) => handleEpisodeFileChange(e, index, 'episode_image')}
                />
                <label htmlFor={`episode_audio_${index}`}>Episode Audio</label>
                <Input
                    id={`episode_audio_${index}`}
                    type="file"
                    accept="audio/*"
                    name={`episode_audio_${index}`}
                    className="form-control"
                    onChange={(e) => handleEpisodeFileChange(e, index, 'episode_audio')}

                // onChange={(e) => handleEpisodeFileChange(e, index, 'episode_audio')}
                />
                <label htmlFor={`episode_type_${index}`}>Episode Type</label>
                <div className="antd_select">
                    <Select
                        id={`episode_type_${index}`}
                        name="episode_type"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={episode.episode_type}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_type', value } }, index)}
                    >
                        <Select.Option value="trailer">Trailer</Select.Option>
                        <Select.Option value="bonus">Bonus</Select.Option>
                        <Select.Option value="normal">Normal</Select.Option>

                    </Select>
                </div>
                <label htmlFor={`episode_author_${index}`}>Episode Author</label>
                <div className="antd_select">
                    <Select
                        id={`episode_author_${index}`}
                        name="episode_author"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={episode.episode_author}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_author', value } }, index)}
                    >
                        {artist.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <label htmlFor={`episode_writer_${index}`}>Episode Writer</label>
                <div className="antd_select">
                    <Select
                        id={`episode_writer_${index}`}
                        name="episode_writer"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={episode.episode_writer}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_writer', value } }, index)}
                    >
                        {artist.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <label htmlFor={`episode_narrator_${index}`}>Episode Narrator</label>
                <div className="antd_select">
                    <Select
                        id={`episode_narrator_${index}`}
                        name="episode_narrator"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={episode.episode_narrator}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_narrator', value } }, index)}
                    >
                        {artist.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <label htmlFor={`episode_podcaster_${index}`}>Episode Podcaster</label>
                <div className="antd_select">
                    <Select
                        id={`episode_podcaster_${index}`}
                        name="episode_podcaster"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={episode.episode_podcaster}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_podcaster', value } }, index)}
                    >
                        {artist.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <label htmlFor={`episode_artist_${index}`}>Episode Artist</label>
                <div className="antd_select">
                    <Select
                        id={`episode_artist_${index}`}
                        name="episode_artist"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={episode.episode_artist}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_artist', value } }, index)}
                    >
                        {artist.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <label htmlFor={`_episode_access_type_${index}`}>Episode Access Type</label>
                <div className="antd_select">
                    <Select
                        id={`_episode_access_type_${index}`}
                        name="episode_access_type"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={episode.episode_access_type}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_access_type', value } }, index)}
                    >
                        <Select.Option value="Public">Public</Select.Option>
                        <Select.Option value="Private">Private</Select.Option>
                    </Select>
                </div>

                <label htmlFor={`episode_duration_${index}`}>Episode Duration</label>
                <Input
                    id={`episode_duration_${index}`}
                    placeholder="Episode Description"
                    name="episode_description"
                    className="form-control"
                    value={episode.episode_duration}
                    onChange={(e) => handleFormChange(e, index)}
                />
                {/* <label htmlFor={`left_duration_${index}`}>Left Duration</label>
                <Input
                    id={`left_duration_${index}`}
                    placeholder="Episode Description"
                    name="episode_description"
                    className="form-control"
                    value={episode.left_duration}
                    onChange={(e) => handleFormChange(e, index)}
                /> */}
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
                <label htmlFor={`show_id_${index}`}>Select Show Name</label>
                <div className="antd_select">
                    <Select
                        id={`show_id_${index}`}
                        name="show_id"
                        style={{ width: "100%", border: "0px", lineheight: "2" }} value={shows[0].show_name}
                        onChange={(value) => setShows[0]?.show_name(value)}
                    >
                        {shows.map((show) => (
                            <Select.Option key={show._id} value={show._id}>
                                {show.show_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>
        );
    };

    const addEpisode = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            episodes: [
                ...prevFormData?.episodes,
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

    const editPodCast = {
        formData,
        currentStep,
        firstCatSelect,
        secCatSelect,
        catSelect
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container >
                    {/* <Breadcrumbs title="Shows/Episodes" breadcrumbItems={[]} /> */}
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    <div id="progrss-wizard" className="twitter-bs-wizard">
                                        <form className="mt-4" onSubmit={handleSubmit}>
                                            <section className="tab-stepper-vertical ">

                                                <div className="tab-step  ">

                                                    <div className="tab-step-header tab-focus-indicator tab-vertical-stepper-header "  >
                                                        <div className="tab-ripple tab-step-header-ripple"></div>
                                                        <div className="tab-step-icon tab-step-icon-state-number tab-step-icon-selected">
                                                            <div className="tab-step-icon-content"><span >1</span></div>
                                                        </div>
                                                        <div className="tab-step-label tab-step-label-active tab-step-label-selected">
                                                            <div className="tab-step-text-label "
                                                                onClick={() => setCurrentStep(1)}
                                                            ><span>Podcast name and details</span></div>
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
                                                                            )}

                                                                        </div>
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
                                                            <div className="tab-step-text-label "
                                                                onClick={() => setCurrentStep(2)}
                                                            ><span>Cover Art</span></div>
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
                                                                                    <div className="information-text">Make sure your cover art stands out and is easy to read on small screens as potential listeners will swipe through podcasts quickly. Note: You can skip this step now and add your cover art later. We’ll use a placeholder in the meantime.</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {renderFormSecondFields()}
                                                                        <div className="col-12 mt-4 mb-4">
                                                                            {currentStep > 1 && (
                                                                                <button className="tab-stepper-prev btn btn-primary mr__2  " onClick={handlePreviousStep}>
                                                                                    Previous
                                                                                </button>
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
                                                            <div className="tab-step-text-label "
                                                                onClick={() => setCurrentStep(3)}
                                                            ><span>Podcast author and details</span></div>
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
                                                                                <button className="tab-stepper-prev btn btn-primary mr__2  " onClick={handlePreviousStep}>
                                                                                    Previous
                                                                                </button>
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
                                                            <div className="tab-step-text-label "
                                                                onClick={() => setCurrentStep(4)}
                                                            ><span>Podcast Settings</span></div>
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
                                                                                    <div className="information-text">Speak in your voice, here. Be yourself and tell people what they can expect from your show as new listeners will potentially use this to decide whether to start listening. Also include any segments and how people can connect with you on social media.
                                                                                        Most podcast directories, such as Apple Podcasts, categorize the shows that they display using a pretty standard set of categories. The first category is the "Main" so make sure to choose a category that best fits your show for this main category.</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {renderFormFourthFields()}
                                                                        <div className="col-12 mt-4 mb-4">
                                                                            {currentStep > 3 && (
                                                                                <button className="tab-stepper-prev btn btn-primary mr__2  " onClick={handlePreviousStep}>
                                                                                    Previous
                                                                                </button>
                                                                            )}
                                                                            {/* {currentStep < finalStepNumber && (
                                                                                <Link to={{
                                                                                    pathname: `/edit-episode/${showId}`, state: editPodCast
                                                                                }}>
                                                                                    <button className="tab-stepper-next btn btn-primary" onClick={handleNextStep}>
                                                                                        Next: Podcast episodes
                                                                                    </button>
                                                                                </Link>
                                                                            )} */}
                                                                            <Button type="submit" className="tab-stepper-prev btn btn--primary"
                                                                                onClick={handleSubmit}>
                                                                                Update Show
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                                {/* <div className="tab-step  ">

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
                                                                        <div className="col-md-12">
                                                                            {formData.episodes.map((episode, index) => (
                                                                                <React.Fragment key={index}>
                                                                                    {renderEpisodeFields(episode, index)}
                                                                                </React.Fragment>
                                                                            ))}
                                                                            <div className="col-12 mt-4 mb-4">
                                                                                {currentStep > 4 && (
                                                                                    <button className="tab-stepper-prev btn btn-primary" onClick={handlePreviousStep}>
                                                                                        Previous
                                                                                    </button>
                                                                                )}
                                                                                <Button type="button" onClick={addEpisode}>
                                                                                    Add Episode
                                                                                </Button>
                                                                                {currentStep === finalStepNumber ? (
                                                                                    <button type="submit" onClick={handleSubmit}>
                                                                                        Submit
                                                                                    </button>
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

                                                </div> */}
                                            </section>
                                        </form>
                                        <Modal
                                            isOpen={showSuccessModal}
                                            // toggle={handleModalCancel}
                                            centered={true}
                                        >
                                            <ModalHeader>Success</ModalHeader>
                                            <ModalBody>
                                                Successfully updated Podcast Show
                                            </ModalBody>
                                            <div className="modal-footer">
                                                <Button color="primary" onClick={handleOk}>
                                                    Ok
                                                </Button>
                                                {/* <Button color="secondary" onClick={handleModalCancel}>
                                                    Cancel
                                                </Button> */}
                                            </div>
                                        </Modal>
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

export default EditPod;




// import React, { useState } from 'react';
// import { Label, Input, Button } from 'reactstrap';

// function YourComponent() {
//   const [formData, setFormData] = useState({
//     subdomain: '', // Initialize with your desired default value
//     latestFeed: false, // Initialize with your desired default value
//   });

//   const handleCopyClick = () => {
//     // Implement your copy logic here
//     // You can use a library like clipboard.js for copying text to the clipboard
//   };

//   return (
//     <div>
//       <div className="mb-3">
//         <Label htmlFor="subdomain">Feed URL</Label>
//         <div className="input-group mb-3">
//           <div className="input-group-prepend d-none d-sm-flex">
//             <span className="input-group-text">https://feeds.captivate.fm/</span>
//           </div>
//           <Input
//             id="subdomain"
//             placeholder="myshow"
//             formcontrolname="subdomain"
//             autoComplete="off"
//             className="form-control"
//             type="text"
//             value={formData.subdomain}
//             onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
//           />
//         </div>
//         <small className="breakable text-muted">https://feeds.captivate.fm/just-jagriti/</small>
//         <Button
//           type="button"
//           className="btn btn-outline-primary mt-2 mt-lg-0 float-md-right d-block d-md-inline"
//           onClick={handleCopyClick}
//         >
//           Copy
//         </Button>
//       </div>
//       <div className="custom-control custom-checkbox mt-4">
//         <Input
//           type="checkbox"
//           id="latestFeed"
//           className="custom-control-input"
//           checked={formData.latestFeed}
//           onChange={(e) => setFormData({ ...formData, latestFeed: e.target.checked })}
//         />
//         <Label htmlFor="latestFeed" className="custom-control-label">
//           Want the latest episode only feed?
//         </Label>
//       </div>
//     </div>
//   );
// }

// export default YourComponent;
