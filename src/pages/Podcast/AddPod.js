import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Input, Container, ModalHeader, ModalBody, Modal } from "reactstrap";
import { Button, Image } from 'antd';
import { message, Select, TimePicker, Tag } from 'antd';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useHistory, useLocation, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import moment from 'moment';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AWS from 'aws-sdk';
import AudioPlayer from 'react-audio-player';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import deFaultimg from "../../assets/images/default_img.jpeg"

function AddPod(props) {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const history = useHistory();
    const defaultImageURL = deFaultimg;
    const location = useLocation();
    const propsData = location.state;
    const [currentStep, setCurrentStep] = useState(1);
    const [catSelect, setCatSelect] = useState(propsData !== undefined ? propsData.catSelect : "");
    const [secCatSelect, setSecCatSelect] = useState(propsData !== undefined ? propsData.secCatSelect : "");
    const [firstCatSelect, setFirstCatSelect] = useState(propsData !== undefined ? propsData.firstCatSelect : "");
    const [selectedDate, setSelectedDate] = useState(new Date()); // State to store the selected date
    const [selectedTime, setSelectedTime] = useState(''); // State to store the selected time
    const [languages, setLanguages] = useState([]);
    const [artist, setArtist] = useState([]);
    const [category, setCategory] = useState([]);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextSelect, setNextSelect] = useState({ id: "", isOpen: "" });
    const [secSelect, setSecSelect] = useState({ isOpen: false, value: "" });
    const [thirdCatSelect, setThirdCatSelect] = useState({ isOpen: false, value: "" });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showNameState, setShowNameState] = useState("");
    const [episodeAuthor, setEpisodeAuthor] = useState("");
    const [showSubtitleState, setSubtitleState] = useState("");
    const [showDescState, setShowDescState] = useState("");
    const [showImgState, setShowImgState] = useState("");
    const [showBannerState, setShowBannerState] = useState("");
    const [showSoonState, setShowSoonState] = useState("");
    const [showAudioState, setShowAudioState] = useState("");
    const [showTotalDur, setShowTotalDur] = useState("");
    const [showDate, setShowDate] = useState("");
    const [showAuthor, setShowAuthor] = useState("");
    const [showCredit, setShowCredit] = useState("");
    const [showTag, setShowTag] = useState("");
    const [showRss, setShowRss] = useState("");
    const [trailerAudioPreview, setTrailerAudioPreview] = useState(null);
    const [showId, setShowId] = useState("");
    const [trailerEpAudioPreview, setTrailerEpAudioPreview] = useState(null);
    const [formData, setFormData] = useState(propsData !== undefined ? propsData?.formData : {
        show_name: " ",
        show_slug: "",
        show_subtitle: " ",
        show_description: " ",
        show_type: " ",
        update_frequency: " ",
        show_banner: defaultImageURL,
        total_listens: "0",
        show_total_durations: "00:00:00 Hrs",
        show_language: " ",
        trailer_audio: null,
        show_image: defaultImageURL,
        show_author: " ",
        show_writer: " ",
        show_narrator: " ",
        show_podcaster: " ",
        show_artist: [],
        show_access_type: "Public ",
        show_publish_date: new Date(),
        show_publish_time: " ",
        show_rss_slug: " ",
        show_credits: " ",
        show_tags: " ",
        category_id: [],
        show_comingsoon_image: defaultImageURL,
        is_favourite: false,
        // episodes: [
        //     {
        //         episode_name: " ",
        //         episode_slug: " ",
        //         episode_description: " ",
        //         episode_type: "Normal",
        //         episode_image: " ",
        //         episode_audio: " ",
        //         episode_author: episodeAuthor,
        //         episode_writer: " ",
        //         episode_narrator: " ",
        //         episode_podcaster: " ",
        //         episode_artist: " ",
        //         episode_duration: "0",
        //         left_duration: "00:00:00 Hrs",
        //         episode_access_type: "Public",
        //         episode_publish_date: " ",
        //         episode_publish_time: " ",
        //         show_id: " ",
        //     },
        // ]
        episodes: [],
    });
    const [imageFile, setImageFile] = useState(null);
    const [audioPreviewLoading, setAudioPreviewLoading] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: null, height: null });
    const [selectedValues, setSelectedValues] = useState([]);


    const options = [
        {
            value: 'Amit Deondi',
        },
        {
            value: 'Horror Nights',
        },
        {
            value: 'Kasim Ansari',
        },
    ];
    // for (let i = 10; i < 36; i++) {
    //     options.push({
    //         value: i.toString(36) + i,
    //         label: i.toString(36) + i,
    //     });
    // }
    const tagRender = (props) => {
        const { label, closable, onClose } = props;
        const onPreventMouseDown = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };
        return (
            <Tag
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{
                    marginRight: 3,
                }}
            >
                {label}
            </Tag>
        );
    };
    const handleTagChange = (selectedValue) => {
        setSelectedValues(selectedValue);
    };
    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    AWS.config.update({
        accessKeyId: process.env.REACT_APP_BUCKET_KEY,
        secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_BUCKET_REGION
    });

    const s3 = new AWS.S3();

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
        if (Object.keys(formData).length !== 0) {
            setEpisodeAuthor(formData.show_author);
        }
    }, [formData]);

    useEffect(() => {
        if (firstCatSelect.length !== 0) {
            formData.category_id[0] = firstCatSelect;
        }
    }, [firstCatSelect]);

    useEffect(() => {
        if (catSelect.length !== 0) {
            formData.category_id[1] = catSelect;
        }
    }, [catSelect]);

    useEffect(() => {
        if (secCatSelect.length !== 0) {
            formData.category_id[2] = secCatSelect;
        }
    }, [secCatSelect]);

    // useEffect(() => {
    //     if (formData?.show_name?.length !== 0) {
    //         formData.show_slug = formData.show_name.toLowerCase().replace(/ /g, "-");
    //     }
    // }, []);

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
        const fileType = file.type.split('/')[1];
        const allowedFileTypes = ['audio/mpeg', 'audio/mp4', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3', 'audio/mpg', 'audio/x-mpg', 'audio/mpeg3', 'audio/x-mpeg3'];

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
            setAudioPreviewLoading(false);

            console.log("KKKKK", URL.createObjectURL(trailerAudioPreview))
            console.log("KKKKK", file)
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };

    const handleEpisodeFileChange = async (event, episodeIndex, fieldName) => {
        const file = event.target.files[0];
        const fileType = file.type.split('/')[1];
        const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', "audio/mp3"];  // Adjust this array for other audio formats
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
            setTrailerEpAudioPreview(URL.createObjectURL(file));
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };
    const handleNextStep = () => {
        setCurrentStep(currentStep + 1);
    };
    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleFormChange = (event, index) => {
        const { name, value } = event.target;
        console.log("name >>>", name, "value >>>>", value);
        if (name === "show_author") {
            formData.episodes.map((episode, index) => {
                const newEpisodes = [...formData.episodes];
                newEpisodes[index] = {
                    ...newEpisodes[index], [name]: value,
                    episode_author: value
                };
                setFormData({ ...formData, episodes: newEpisodes });
            })
            console.log("authorcfgfgvhvfghv ghcgfhcfghfc", formData);
        }
        if (index !== undefined) {
            {
                formData.episodes.map((episode, index) => {
                    const episodeSlug = episode.episode_name.toLowerCase().replace(/\s+/g, '-');
                    const newEpisodes = [...formData.episodes];
                    newEpisodes[index] = {
                        ...newEpisodes[index], [name]: value,
                        // episode_publish_date: generateCurrentDate(), // Generate current date
                        // episode_publish_time: generateCurrentTime(),
                        episode_slug: episodeSlug,
                        episode_author: episodeAuthor
                    };
                    setFormData({ ...formData, episodes: newEpisodes });
                })
            }
        } else {
            console.log("formData.show??????", formData.show_name.toLowerCase().replace(/^\s+/, '').replace(/\s+/g, '-'))
            setFormData({
                ...formData,
                [name]: value,
                show_rss_slug: `feeds/${formData.show_name.toLowerCase().replace(/^\s+/, '').replace(/\s+/g, '-')}`,
                show_slug: formData.show_name.toLowerCase().replace(/^\s+/, '').replace(/\s+/g, '-'),
                // show_publish_date: generateCurrentDate(),
                // show_publish_time: generateCurrentTime(),
            });
        }
    };

    const generateCurrentDate = () => {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        return formattedDate;
    };

    const generateCurrentTime = () => {
        const currentDate = new Date();
        const formattedTime = currentDate.toTimeString().split(' ')[0];
        return formattedTime;
    };
    const validateCustomStylesForm = () => {
        let isValid = true;
        if (formData.show_name === "") {
            setShowNameState("invalid");
            isValid = false;
        } else {
            setShowNameState("valid");
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
        } if (formData.show_author === "") {
            setShowAuthor("invalid");
            isValid = false;
        } else {
            setShowAuthor("valid");
        }
        return isValid;
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        const validation = validateCustomStylesForm();

        if (validation) {
            fetch(`${apiEndpoint}/api/shows`, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        // Success response, open the success modal
                        return response.json();
                    } else {
                        // Error response, reject the promise with an error message
                        throw new Error('Please fill all fields.');
                    }
                })
                .then(data => {
                    // This block will only be executed for successful responses
                    setShowSuccessModal(true);
                    setShowId(data.result.data._id);
                })
                .catch(error => {
                    // Handle error and display the error message
                    message.error(error.message);
                });
        }
    };

    const handleModalCancel = () => {
        // Close the modal and reset form data
        history.push('/my-podcast')
    }

    const handleOk = () => {
        history.push(`/create/add-episode/${showId}`);
    }

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
                    id="show_name"
                    placeholder="Show Name"
                    name="show_name"
                    className="form-control"
                    value={formData.show_name}
                    valid={showNameState === "valid"}
                    invalid={showNameState === "invalid"}
                    onChange={(e) => {
                        handleFormChange(e)
                        if (e.target.value === "") {
                            setShowNameState("invalid");
                        } else {
                            setShowNameState("valid");
                        }
                    }}
                //  onChange={(e) => {
                //     setFormData({ ...formData, show_name: e.target.value });
                //     if (e.target.value === "") {
                //         setShowNameState("invalid");
                //     } else {
                //         setShowNameState("valid");
                //     }
                // }} 
                />
                <label htmlFor="show_subtitle">Show Subtitle</label>
                <div className="tooltip-text"> Used in some podcast search results. </div>
                {console.log("formData.show_subtitle", formData.show_subtitle)}
                <Input
                    id="show_subtitle"
                    // placeholder={formData.show_subtitle == "" ? "Show Subtitle": ""}
                    placeholder="Name"
                    name="show_subtitle"
                    className="form-control"
                    value={formData.show_subtitle}
                    valid={showSubtitleState === "valid"}
                    invalid={showSubtitleState === "invalid"}
                    onChange={(e) => {
                        handleFormChange(e)
                        if (e.target.value === "") {
                            setSubtitleState("invalid");
                        } else {
                            setSubtitleState("valid");
                        }
                    }} />
                {/* <label htmlFor="show_subtitle">Show Slug</label>
                <Input
                    id="show_slug"
                    placeholder="Show Subtitle"
                    name="show_slug"
                    className="form-control"
                    value={formData.show_slug}
                    // valid={showSubtitleState === "valid"}
                    // invalid={showSubtitleState === "invalid"}
                    onChange={(e) => {
                        setFormData({ ...formData, show_slug: e.target.value })
                        // if (e.target.value === "") {
                        //     setSubtitleState("invalid");
                        // } else {
                        //     setSubtitleState("valid");
                        // }
                    }} /> */}
                <label htmlFor="show_description">Show Description</label>
                <div className="show__description__height">
                    <ReactQuill
                        id="show_description"
                        name="show_description"
                        value={formData.show_description}
                        onChange={handleDescriptionChange}
                    />
                </div>
                {/* NEW-Select Box */}
                <label htmlFor="show_language">Show Language</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id="show_language"
                        name="show_language"
                        value={formData.show_language}
                        type="select"
                        // placeholder="Select Language"
                        onChange={(value) => handleFormChange({ target: { name: 'show_language', value } })}
                    >
                        <Select.Option value=" " disabled>Select Language</Select.Option>
                        {languages.map((language, index) => (
                            <Select.Option style={{ border: "0px", height: "35px" }}
                                key={index} value={language.language_name}>
                                {language.language_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                {/* NEW-Select Box */}
                <label htmlFor="show_type">Show Type</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id="show_type"
                        name="show_type"

                        value={formData.show_type}
                        onChange={(value) => handleFormChange({ target: { name: 'show_type', value } })}
                    >
                        <Select.Option value=" " disabled>Select Type</Select.Option>
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
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id="update_frequency"
                        name="update_frequency"

                        value={formData.update_frequency}
                        onChange={(value) => handleFormChange({ target: { name: 'update_frequency', value } })}
                    >
                        <Select.Option value=" " disabled>Select Frequency</Select.Option>

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
                {console.log("formData?.trailer_audio?.length", formData?.trailer_audio?.length)}

                {audioPreviewLoading ? (
                    <p>Loading audio preview...</p>
                ) : (
                    <>
                        {formData?.trailer_audio?.length > 1 && (
                            <>
                                {trailerAudioPreview && (
                                    <audio
                                        key={formData.trailer_audio}
                                        controls
                                        style={{ width: "-webkit-fill-available", marginBottom: "4px" }}
                                    >
                                        <source
                                            src={URL.createObjectURL(trailerAudioPreview)}
                                            type={trailerAudioPreview.type}
                                        />
                                        Your browser does not support the audio element.
                                    </audio>
                                )}
                            </>

                        )}
                        <p>
                            Current Audio:{" "}
                            {formData.trailer_audio
                                ? decodeURIComponent(formData.trailer_audio.split("/").pop())
                                : "No Audio selected"}
                        </p>

                        {/* <p>
                            Current Audio:{" "}
                            {formData.trailer_audio
                                ? formData.trailer_audio
                                    .split("/")
                                    .pop() // Extract the filename from the URL
                                    .replace(/^.*?([^/]+)$/, "$1") // Remove any prefix from the filename
                                : "No Audio selected"}
                        </p> */}

                    </>
                )}
                <Input
                    id="trailer_audio"
                    type="file"
                    accept="audio/*"  // Specify that only audio files are allowed
                    name="trailer_audio"
                    className="form-control"
                    valid={showAudioState === "valid"}
                    invalid={showAudioState === "invalid"}
                    onChange={(e) => {
                        handleAudioFileChange(e, "trailer_audio");
                        // if (e.target.value === "") {
                        //     setShowAudioState("invalid");
                        // } else {
                        //     setShowAudioState("valid");
                        // }
                        handleFormChange(e);
                    }} />

                <label htmlFor="show_image">Show Image</label>
                <div className="tooltip-text">Used in podcast players, e.g. Apple Podcast,
                    Spotify; this image will display in all podcast directories and players. Ensure the image uploaded
                    is 3000x3000 in dimension and size is below 500kb.</div>
                <div className="img_show_area" style={{ marginBottom: "5px" }}>
                    {(
                        <>
                            {console.log("formData.show_image>>", formData.show_image.length)}
                            {console.log("formData.show_ima", defaultImageURL)}
                            <Image
                                src={formData?.show_image?.length > 1 ? formData.show_image : defaultImageURL}
                                style={{ height: "100px", width: "100px", padding: "10px" }}
                            />
                        </>
                    )}
                </div>
                <Input
                    id="show_image"
                    type="file"
                    accept="image/*"
                    name="show_image"
                    className="form-control"
                    valid={showImgState === "valid"}
                    invalid={showImgState === "invalid"}
                    onChange={(e) => {
                        handleFileChange(e, "show_image");
                        handleFormChange(e)
                        if (e.target.value === "") {
                            setShowImgState("invalid");
                        } else {
                            setShowImgState("valid");
                        }
                    }} />

                <label htmlFor="show_banner">Show Banner</label>
                <div className="tooltip-text">Used in Audiopitara website pages as feature
                    image. Ensure the image uploaded is 1920x1080 in dimension and size is below 500kb.</div>
                <div className="img_show_area" style={{ marginBottom: "5px" }}>
                    {(
                        <>
                            <Image
                                src={formData?.show_banner?.length > 1 ? formData.show_banner : defaultImageURL}
                                style={{ height: "200px", padding: "5px", marginBottom: "5px", width: "250px" }}
                            />
                        </>
                    )}
                </div>
                <Input
                    id="show_banner"
                    type="file"
                    accept="image/*"
                    name="show_banner"
                    className="form-control"
                    valid={showBannerState === "valid"}
                    invalid={showBannerState === "invalid"}
                    onChange={(e) => {
                        handleFileChange(e, "show_banner");
                        handleFormChange(e)
                        if (e.target.value === "") {
                            setShowBannerState("invalid");
                        } else {
                            setShowBannerState("valid");
                        }
                    }} />
                <label htmlFor="show_comingsoon_image">Coming Soon Image</label>
                <div className="tooltip-text">Used in Audiopitara website pages as
                    feature image when show is scheduled and will be replaced with Show Banner once show is
                    published. Ensure the image uploaded is 1920x1080 in dimension and size is below 500kb.</div>

                <div className="img_show_area" style={{ marginBottom: "5px" }}>
                    {(
                        <>
                            <Image
                                src={formData?.show_comingsoon_image?.length > 1 ? formData.show_comingsoon_image : defaultImageURL}
                                style={{ height: "200px", padding: "0px", marginBottom: "5px", width: "280px" }}
                            />
                        </>
                    )}
                </div>
                <Input
                    id="show_comingsoon_image"
                    type="file"
                    accept="image/*"
                    name="show_comingsoon_image"
                    className="form-control"
                    valid={showSoonState === "valid"}
                    invalid={showSoonState === "invalid"}
                    onChange={(e) => {
                        handleFileChange(e, "show_comingsoon_image");
                        handleFormChange(e)
                        if (e.target.value === "") {
                            setShowSoonState("invalid");
                        } else {
                            setShowSoonState("valid");
                        }
                    }} />
            </div>
        );
    };

    const renderFormThirdFields = () => {
        return (
            <div className="col-md-12 col-lg-7">
                <label htmlFor="show_author">Author Name</label>
                <div className="tooltip-text">The name of the host or creator brand. Do not spam this with keywords or other peoples’ names, you may get banned from Apple Podcasts etc. </div>

                <Input
                    placeholder="Author Name"
                    id="show_author"
                    name="show_author"
                    className="form-control"
                    valid={showAuthor === "valid"}
                    invalid={showAuthor === "invalid"}
                    value={formData.show_author}
                    onChange={(e) => {
                        handleFormChange(e)
                        if (e.target.value === "") {
                            setShowAuthor("invalid");
                        } else {
                            setShowAuthor("valid");
                        }
                    }} />
                {/* <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id="show_author"
                        name="show_author"

                        value={formData.show_author}
                        onChange={(value) => handleFormChange({ target: { name: 'show_author', value } })}
                    >
                        <Select.Option value="" disabled>Select Author</Select.Option>

                        {artist.map((artist, index) => (
                            <Select.Option key={index} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div> */}
                {
                    <>
                        <label htmlFor="show_writer">Show Writer</label>
                        <div className={(formData.show_type === "Audio Book" || formData.show_type === "Audio Drama" || formData.show_type === "Music/Bhajan" || formData.show_type === "Short Stories" || formData.show_type === "Audio Nattak") ? "antd_select" : "antd_select ant-select-disabled"}>
                            <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                                id="show_writer"
                                name="show_writer"
                                placeholder="Select Writer"
                                disabled={(formData.show_type === "Audio Book" || formData.show_type === "Audio Drama" || formData.show_type === "Music/Bhajan" || formData.show_type === "Short Stories" || formData.show_type === "Audio Nattak") ? false : true}
                                value={formData.show_writer}
                                onChange={(value) => handleFormChange({ target: { name: 'show_writer', value } })}
                            >
                                <Select.Option value="" disabled>Select Writer</Select.Option>

                                {artist.map((artist, index) => (
                                    <Select.Option key={index} value={artist.artist_name}>
                                        {artist.artist_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </>
                }
                {
                    <>
                        <label htmlFor="show_narrator">Show Narrator</label>
                        <div className={(formData.show_type === "Audio Book" || formData.show_type === "Short Stories" || formData.show_type === "Audio Nattak") ? "antd_select" : "antd_select ant-select-disabled"}>
                            <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                                id="show_narrator"
                                name="show_narrator"
                                placeholder="Select Narrator"
                                disabled={(formData.show_type === "Audio Book" || formData.show_type === "Short Stories" || formData.show_type === "Audio Nattak") ? false : true}
                                value={formData.show_narrator}
                                onChange={(value) => handleFormChange({ target: { name: 'show_narrator', value } })}
                            >
                                <Select.Option value="" disabled>Select Narrator</Select.Option>

                                {artist.map((artist, index) => (
                                    <Select.Option key={index} value={artist.artist_name}>
                                        {artist.artist_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </>
                }
                {
                    <>
                        <label htmlFor="show_podcaster">Show Podcaster</label>

                        <div className={(formData.show_type === "Podcast") ? "antd_select" : "antd_select ant-select-disabled"}>
                            <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                                id="show_podcaster"
                                name="show_podcaster"
                                placeholder="Select Podcaster"
                                disabled={(formData.show_type === "Podcast") ? false : true}
                                value={formData.show_podcaster}
                                onChange={(value) => handleFormChange({ target: { name: 'show_podcaster', value } })}
                            >
                                <Select.Option value="" disabled>Select Podcaster</Select.Option>

                                {artist.map((artist, index) => (
                                    <Select.Option key={index} value={artist.artist_name}>
                                        {artist.artist_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </>
                }

                {
                    <>
                        <label htmlFor="show_artist">Show Artist</label>
                        <div className={(formData.show_type === "Audio Drama" || formData.show_type === "Music/Bhajan") ? "antd_select" : "antd_select ant-select-disabled"}>
                            <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                                id="show_artist"
                                name="show_artist"
                                placeholder="Select Artist"
                                value={formData.show_artist}
                                disabled={(formData.show_type === "Audio Drama" || formData.show_type === "Music/Bhajan") ? false : true}
                                onChange={(value) => handleFormChange({ target: { name: 'show_artist', value } })}
                            >
                                <Select.Option value="" disabled>Select Artist</Select.Option>

                                {artist.map((artist, index) => (
                                    <Select.Option key={index} value={artist.artist_name}>
                                        {artist.artist_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </>
                }
                <label htmlFor="show_access_type">Show Access Type</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id="show_access_type"
                        name="show_access_type"

                        value={formData.show_access_type}
                        onChange={(value) => handleFormChange({ target: { name: 'show_access_type', value } })}
                    >
                        <Select.Option value="" disabled>Select Access Type</Select.Option>
                        <Select.Option value="Public">Public</Select.Option>
                        <Select.Option value="Private">Private</Select.Option>
                    </Select>
                </div>
            </div>
        );
    };

    const renderFormFourthFields = () => {
        return (
            <div className="col-md-12 col-lg-7">
                <label htmlFor="show_credits">Show Credit</label>
                <textarea
                    id="show_credits"
                    placeholder="Show Credit"
                    name="show_credits"
                    className="form-control"
                    value={formData.show_credits}
                    valid={showCredit === "valid"}
                    invalid={showCredit === "invalid"}
                    onChange={(e) => {
                        handleFormChange(e)
                        if (e.target.value === "") {
                            setShowCredit("invalid");
                        } else {
                            setShowCredit("valid");
                        }
                    }} />
                <label htmlFor="show_tags">Show Tags</label>
                <div className="antd_select spase_none">
                    {/* <Select
                         style={{ width: "100%", border: "0px", lineHeight: "2" }}
                        mode="tags"
                        id="show_tags"
                        placeholder="Show Tags"
                        name="show_tags"
                        size="default"
                        onChange={(value) => handleFormChange({ target: { name: 'show_tags', value } })}
                        options={options}
                        tagRender={tagRender}
                    /> */}
                     <Select
                        style={{ width: "100%", border: "0px", lineHeight: "2" }}
                        mode="tags"
                        id="show_tags"
                        placeholder="Show Tags"
                        name="show_tags"
                        size="default"
                        onChange={(value) => handleFormChange({ target: { name: 'show_tags', value } })}
                        // options={[]}
                    options={options}
                    />

                </div>
                <label htmlFor="category_id">Main Category</label>
                <div className="tooltip-text">
                    The main category that your show will appear in when browsing podcast apps.
                </div>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id="category_id"
                        name="category_id"
                        value={firstCatSelect}
                        onChange={(value) => {
                            // handleFormChange({ target: { name: 'category_id', value } })
                            setNextSelect({ _id: 1, isOpen: true, value });
                            setFirstCatSelect(value)
                        }}
                        virtual={false}
                    >
                        <Select.Option value="" disabled>-Select-</Select.Option>
                        {category.map((category) => (
                            <>
                                <Select.Option key={category._id} value={category._id}>
                                    {category.category_name}
                                </Select.Option>
                                {category.sub_category.map((cat) => (
                                    <Select.Option key={cat._id} value={cat._id}>
                                        {category.category_name !== null ? `${category.category_name} > ${cat.sub_category_name}` : cat.sub_category_name}
                                    </Select.Option>))}
                            </>
                        ))}
                    </Select>
                </div>
                <label htmlFor="category_id">Second Category</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id="category_id"
                        name="category_id"
                        value={catSelect}
                        onChange={(value) => {
                            setCatSelect(value);
                            setThirdCatSelect({ isOpen: true, value });
                        }}
                        virtual={false}
                    >
                        <Select.Option value="" disabled>-Select-</Select.Option>
                        {category.map((category) => (
                            <>
                                <Select.Option key={category._id} value={category._id}>
                                    {category.category_name}
                                </Select.Option>
                                {category.sub_category.map((cat) => (
                                    <Select.Option key={cat._id} value={cat._id}>
                                        {category.category_name !== null ? `${category.category_name} > ${cat.sub_category_name}` : cat.sub_category_name}
                                    </Select.Option>))}
                            </>
                        ))}
                    </Select>
                </div>

                <label htmlFor="category_id">Third Category</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id="category_id"
                        name="category_id"
                        value={secCatSelect}
                        onChange={(value) => {
                            setSecCatSelect(value)
                        }}
                        virtual={false}
                    >
                        <Select.Option value="" disabled>-Select-</Select.Option>
                        {category.map((category) => (
                            <>
                                <Select.Option key={category._id} value={category._id}>
                                    {category.category_name}
                                </Select.Option>
                                {category.sub_category.map((cat) => (
                                    <Select.Option key={cat._id} value={cat._id}>
                                        {category.category_name !== null ? `${category.category_name} > ${cat.sub_category_name}` : cat.sub_category_name}
                                    </Select.Option>))}
                            </>
                        ))}
                    </Select>
                </div>
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
                    dateFormat="dd/MM/yyyy"
                />
                <label htmlFor="show_publish_time">Time</label>
                <TimePicker
                    id="show_publish_time"
                    className="form-control"
                    onChange={handleTimeChange}
                    // value={moment(selectedTime || formData.show_publish_time, 'h:mm A')}
                    defaultValue={moment(selectedTime || formData.show_publish_time, 'h:mm A')}
                    format="h:mm A"
                    showSecond={false}
                    use12Hours={true}
                    hideDisabledOptions={true}
                />
            </div >
        );
    };

    useEffect(() => {
        // Set the default time in formData when the component is mounted
        const currentTime = moment();
        const formattedCurrentTime = currentTime.format('h:mm A');
        setFormData((prevData) => ({
            ...prevData,
            show_publish_time: formattedCurrentTime,
        }));
    }, []);

    const handleTimeChange = (time, timeString) => {
        setFormData((prevData) => ({
            ...prevData,
            show_publish_time: timeString,
        }));
        setSelectedTime(timeString);
    };

    const currentTime = moment();
    const formattedCurrentTime = currentTime.format('h:mm A');

    const renderEpisodeFields = (episode, index) => {
        return (
            <div key={index} className="col-md-12 col-lg-7">
                <label htmlFor={`episode_name_${index}`}>Episode Name</label>
                <div className="tooltip-text"> Used in podcast players, e.g. Apple Podcasts, Spotify; this title will display in all podcast directories and players. </div>
                <Input
                    id={`episode_name_${index}`}
                    placeholder="Episode Name"
                    name="episode_name"
                    className="form-control"
                    value={episode.episode_name}
                    onChange={(e) => handleFormChange(e, index)}
                />
                <label htmlFor={`episode_description_${index}`}>Episode Description</label>
                <textarea
                    id={`episode_description_${index}`}
                    placeholder="Episode Description"
                    name="episode_description"
                    className="form-control"
                    value={episode.episode_description}
                    onChange={(e) => handleFormChange(e, index)}
                />

                <label htmlFor={`episode_image_${index}`}>Episode Image</label>
                <div className="img_show_area" style={{ marginBottom: "5px" }}>
                    {episode?.episode_image?.length !== 0 &&
                        <Image src={episode.episode_image} style={{ height: "200px", padding: "5px", marginBottom: "5px" }} />}
                </div>

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
                <label htmlFor={`episode_type_${index}`}>Episode Type</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id={`episode_type_${index}`}
                        name="episode_type"

                        value={episode.episode_type}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_type', value } }, index)}
                    >
                        <Select.Option value="" disabled>Select</Select.Option>

                        <Select.Option value="trailer">Trailer</Select.Option>
                        <Select.Option value="bonus">Bonus</Select.Option>
                        <Select.Option value="normal">Normal</Select.Option>

                    </Select>
                </div>
                <label htmlFor={`episode_author_${index}`}>Episode Author</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id={`episode_author_${index}`}
                        name="episode_author"

                        value={episode.episode_author}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_author', value } }, index)}
                    >
                        <Select.Option value="" disabled>Select</Select.Option>

                        {artist.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <label htmlFor={`episode_writer_${index}`}>Episode Writer</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id={`episode_writer_${index}`}
                        name="episode_writer"

                        value={episode.episode_writer}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_writer', value } }, index)}
                    >
                        <Select.Option value="" disabled>Select</Select.Option>

                        {artist.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <label htmlFor={`episode_narrator_${index}`}>Episode Narrator</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id={`episode_narrator_${index}`}
                        name="episode_narrator"

                        value={episode.episode_narrator}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_narrator', value } }, index)}
                    >
                        <Select.Option value="" disabled>Select</Select.Option>

                        {artist.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <label htmlFor={`episode_podcaster_${index}`}>Episode Podcaster</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id={`episode_podcaster_${index}`}
                        name="episode_podcaster"

                        value={episode.episode_podcaster}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_podcaster', value } }, index)}
                    >
                        <Select.Option value="" disabled>Select</Select.Option>

                        {artist.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <label htmlFor={`episode_artist_${index}`}>Episode Artist</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id={`episode_artist_${index}`}
                        name="episode_artist"

                        value={episode.episode_artist}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_artist', value } }, index)}
                    >
                        <Select.Option value="" disabled>Select</Select.Option>

                        {artist.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <label htmlFor={`_episode_access_type_${index}`}>Episode Access Type</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id={`_episode_access_type_${index}`}
                        name="episode_access_type"

                        value={episode.episode_access_type}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_access_type', value } }, index)}
                    >
                        <Select.Option value="" disabled>Select</Select.Option>
                        <Select.Option value="Public">Public</Select.Option>
                        <Select.Option value="Private">Private</Select.Option>
                    </Select>
                </div>
                <label htmlFor={`show_id_${index}`}>Show Name</label>
                <div className="antd_select">
                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                        id={`show_id_${index}`}
                        name="show_id"

                        value={episode.show_id}
                        onChange={(value) => handleFormChange({ target: { name: 'show_id', value } }, index)}
                    >
                        <Select.Option value="" disabled>Select</Select.Option>

                        {shows.map((show) => (
                            <Select.Option key={show._id} value={show._id}>
                                {show.show_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
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

    const addPodCastData = {
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

                                                    <div className="tab-step-header tab-focus-indicator tab-vertical-stepper-header " >
                                                        <div className="tab-ripple tab-step-header-ripple"></div>
                                                        <div className="tab-step-icon tab-step-icon-state-number tab-step-icon-selected">
                                                            <div className="tab-step-icon-content"><span >1</span></div>
                                                        </div>
                                                        <div className="tab-step-label tab-step-label-active tab-step-label-selected">
                                                            <div className="tab-step-text-label"
                                                                onClick={() => setCurrentStep(1)}>
                                                                <span>Podcast name and details</span>
                                                            </div>
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
                                                            <div className="tab-step-text-label"
                                                                onClick={() => setCurrentStep(2)}>
                                                                <span>Cover Art</span>
                                                            </div>
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
                                                                        {/* Button-add */}
                                                                        <div className="col-md-12 col-lg-7 mt-4 mb-4">
                                                                            <div className="flex--button">
                                                                                {currentStep > 1 && (
                                                                                    <button className="tab-stepper-prev btn btn-primary mr__2  " onClick={handlePreviousStep}>
                                                                                        Previous
                                                                                    </button>
                                                                                )}
                                                                                {currentStep < finalStepNumber && (
                                                                                    <button className="tab-stepper-next btn btn-primary" onClick={handleNextStep}>
                                                                                        Next: Podcast author
                                                                                    </button>
                                                                                )}
                                                                            </div >
                                                                        </div >
                                                                    </div >
                                                                    {/* Button add */}
                                                                </div >
                                                            </div >
                                                        </div >
                                                    )}
                                                </div >

                                                <div className="tab-step  ">

                                                    <div className="tab-step-header tab-focus-indicator tab-vertical-stepper-header " >
                                                        <div className="tab-ripple tab-step-header-ripple"></div>
                                                        <div className="tab-step-icon tab-step-icon-state-number tab-step-icon-selected">
                                                            <div className="tab-step-icon-content"><span >3</span></div>
                                                        </div>
                                                        <div className="tab-step-label tab-step-label-active tab-step-label-selected">
                                                            <div className="tab-step-text-label "
                                                                onClick={() => setCurrentStep(3)}>
                                                                <span>Podcast author and details</span>
                                                            </div>
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
                                                                        <div className="col-md-12 col-lg-7 mt-4 mb-4">
                                                                            <div className="flex--button">
                                                                                {currentStep > 2 && (
                                                                                    <button className="tab-stepper-prev btn btn-primary mr__2" onClick={handlePreviousStep}>
                                                                                        Previous
                                                                                    </button>
                                                                                )}
                                                                                {currentStep < finalStepNumber && (
                                                                                    <button className="tab-stepper-next btn btn-primary" onClick={handleNextStep}>
                                                                                        Next: Podcast Settings
                                                                                    </button>
                                                                                )}
                                                                            </div>                                                                      </div>
                                                                    </div >
                                                                </div >
                                                            </div >
                                                        </div >
                                                    )
                                                    }

                                                </div >
                                                <div className="tab-step  ">

                                                    <div className="tab-step-header tab-focus-indicator tab-vertical-stepper-header " >
                                                        <div className="tab-ripple tab-step-header-ripple"></div>
                                                        <div className="tab-step-icon tab-step-icon-state-number tab-step-icon-selected">
                                                            <div className="tab-step-icon-content"><span >4</span></div>
                                                        </div>
                                                        <div className="tab-step-label tab-step-label-active tab-step-label-selected">
                                                            <div className="tab-step-text-label"
                                                                onClick={() => setCurrentStep(4)}>
                                                                <span>Podcast Settings</span>
                                                            </div>
                                                        </div >
                                                    </div >
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
                                                                        <div className="col-md-12 col-lg-7  mt-4 mb-4">
                                                                            <div className="flex--button">
                                                                                {
                                                                                    currentStep > 3 && (
                                                                                        <button className="tab-stepper-prev btn btn-primary mr__2" onClick={handlePreviousStep}>
                                                                                            Previous
                                                                                        </button>
                                                                                    )
                                                                                }
                                                                                {/* {
                                                                                    currentStep < finalStepNumber && (
                                                                                        <Link to={{
                                                                                            pathname: "/create/add-episode", state: addPodCastData
                                                                                        }}>
                                                                                            <button className="tab-stepper-next btn btn-primary" onClick={handleNextStep}>
                                                                                                Next: Podcast episodes
                                                                                            </button>
                                                                                        </Link>
                                                                                    )
                                                                                } */}
                                                                                <button type="submit" className="tab-stepper-prev btn btn--primary " onClick={handleSubmit}>
                                                                                    Create Show
                                                                                </button>
                                                                            </div >
                                                                        </div >
                                                                    </div >
                                                                </div >
                                                            </div >
                                                        </div >
                                                    )
                                                    }
                                                </div >
                                            </section >
                                        </form >
                                        <Modal
                                            isOpen={showSuccessModal}
                                            toggle={handleModalCancel}
                                            centered={true}
                                        >
                                            <ModalHeader toggle={handleModalCancel}>Success</ModalHeader>
                                            <ModalBody>
                                                Show is Published
                                            </ModalBody>
                                            <div className="modal-footer">
                                                <Button color="primary" onClick={handleOk}>
                                                    Add New Episodes
                                                </Button>
                                                <Button color="secondary" onClick={handleModalCancel}>
                                                    Back to Show
                                                </Button>
                                            </div>
                                        </Modal>
                                    </div >

                                </CardBody >
                            </Card >
                        </Col >
                    </Row >
                </Container >
            </div >
        </React.Fragment >
    );
}

export default AddPod;
