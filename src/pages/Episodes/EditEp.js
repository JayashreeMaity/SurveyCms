import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Input, Container, Modal, ModalBody, ModalHeader } from "reactstrap";
import { Button, Image } from 'antd';
import { message, Select, TimePicker, Radio } from 'antd';
import DatePicker from 'react-datepicker';
import { useHistory, useParams, useLocation, Link } from 'react-router-dom';
import { FormOutlined, DeleteOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';

import moment from 'moment';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import AWS from 'aws-sdk';
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
dayjs.extend(customParseFormat);

function EditEp() {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const history = useHistory();
    const location = useLocation();
    const propsData = location.state;
    const [currentStep, setCurrentStep] = useState(1);
    const { showId } = useParams();
    const { index } = useParams();
    const [formData, setFormData] = useState(propsData !== undefined ? propsData.formData : {});
    const [languages, setLanguages] = useState([]);
    const [artist, setArtist] = useState([]);
    const [category, setCategory] = useState([]);
    const [shows, setShows] = useState([]);
    const [showsName, setShowsName] = useState();
    const [loading, setLoading] = useState(true);
    const [episodes, setEpisodes] = useState([]);
    const [episode, setEpisode] = useState({
        episode_name: "",
        episode_slug: "",
        episode_description: "",
        episode_type: "normal",
        episode_image: "",
        episode_audio: "",
        episode_author: "",
        episode_writer: "",
        episode_narrator: "",
        episode_podcaster: "",
        episode_artist: [],
        episode_number: "",
        episode_season: "",
        episode_sorting: "",
        episode_duration: "0",
        left_duration: "00:00:00 Hrs",
        episode_access_type: "",
        episode_publish_date: "",
        episode_publish_time: "",
        is_published: null,
        show_id: " " // Set the show_id here
    });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
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
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [editEpisodeIndex, setEditEpisodeIndex] = useState(parseInt(document.location.pathname.split("/")[4]));
    const [editArr, setEditArr] = useState([]);
    const [trailerEpAudioPreview, setTrailerEpAudioPreview] = useState(null);
    const dateFormatList = 'DD/MM/YYYY';
    const [updatedFormData, setUpdatedFormData] = useState({});
    const [showDescQuill, setShowDescQuill] = useState("");

    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            setEditArr([formData.episodes[editEpisodeIndex]])
        }
    }, [formData])


    useEffect(() => {
        fetch(`${apiEndpoint}/api/shows/${showId}`)
            .then(response => response.json())
            .then(response => {
                if (response.status && response.result && response.result.data) {
                    setFormData(propsData !== undefined ? propsData.formData : response.result.data);
                    setTrailerEpAudioPreview(response.result.data.episodes.episode_audio);

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
    const epIndex = document.location.pathname.split("/")[4];


    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            if (editArr.length !== 0) {
                console.log("Data is inside")
                formData.episodes[editEpisodeIndex] = editArr;
            }
        }
    }, [formData])

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
    const s3 = new AWS.S3();
    const handleNextStep = () => {
        setCurrentStep(currentStep + 1);
    };
    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
    };
    const handleFormChange = (e, index) => {
        const { name, value } = e.target;

        if (index !== undefined) {
            console.log(">>>editArr", editArr)
            const updatedEpisodes = [...editArr];
            const updatedEpisode = { ...updatedEpisodes[index], [name]: value };
            if (name === "episode_name") {
                const episodeSlug = value.toLowerCase().replace(/^\s+/, '').replace(/\s+/g, "-");
                // updatedEpisode.episode_slug = episodeSlug; 
                updatedEpisodes[index] = updatedEpisode;
                setEditArr(updatedEpisodes);
            }
            updatedEpisodes[index] = updatedEpisode;
            setEditArr(updatedEpisodes);
        } else {

            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };


    const validateCustomStylesForm = () => {
        let isValid = true;
        if (formData?.show_name === "") {
            setShowNameState("invalid");
            isValid = false;
        } else {
            setShowNameState("valid");
        } if (formData?.show_slug === "") {
            setShowSlugState("invalid");
            isValid = false;
        } else {
            setShowSlugState("valid");
        } if (formData?.show_subtitle === "") {
            setSubtitleState("invalid");
            isValid = false;
        } else {
            setSubtitleState("valid");
        } if (formData?.show_desc === "") {
            setShowDescState("invalid");
            isValid = false;
        } else {
            setShowDescState("valid");
        } if (formData?.show_image === "") {
            setShowImgState("invalid");
            isValid = false;
        } else {
            setShowImgState("valid");
        } if (formData?.show_banner === "") {
            setShowBannerState("invalid");
            isValid = false;
        } else {
            setShowBannerState("valid");
        } if (formData?.show_comingsoon_image === "") {
            setShowSoonState("invalid");
            isValid = false;
        } else {
            setShowSoonState("valid");
        } if (formData?.trailer_audio === "") {
            setShowAudioState("invalid");
            isValid = false;
        } else {
            setShowAudioState("valid");
        } if (formData?.show_total_durations === "") {
            setShowTotalDur("invalid");
            isValid = false;
        } else {
            setShowTotalDur("valid");
        } if (formData?.show_publish_date === "") {
            setShowDate("invalid");
            isValid = false;
        } else {
            setShowDate("valid");
        } if (formData?.show_credits === "") {
            setShowCredit("invalid");
            isValid = false;
        } else {
            setShowCredit("valid");
        } if (formData?.show_tags === "") {
            setShowTag("invalid");
            isValid = false;
        } else {
            setShowTag("valid");
        } if (formData?.show_rss_slug === "") {
            setShowRss("invalid");
            isValid = false;
        } else {
            setShowRss("valid");
        }
        return isValid;
    }
    useEffect(() => {
        if (Object.keys(formData).length !== 0) {
            const updatedFormData = { ...formData };
            updatedFormData.episodes[editEpisodeIndex] = editArr[0];
            setUpdatedFormData(updatedFormData); // Assuming you have a state variable for updatedFormData
        }
    }, [formData, editEpisodeIndex, editArr]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const validation = validateCustomStylesForm();
        if (validation) {
            console.log("itemToUpdate>>>>", updatedFormData);
            fetch(`${apiEndpoint}/api/shows/${showId}`, {
                method: 'PUT',
                body: JSON.stringify(updatedFormData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    setShowSuccessModal(true);

                })
                .catch(error => {
                    // Handle error
                    message.error('An error occurred while submitting.');

                });
        }
    };
    const handleModalCancel = () => {
       
        setFormData({
            show_name: " ",
            show_slug: " ",
            show_subtitle: " ",
            show_description: " ",
            show_type: " ",
            update_frequency: " ",
            show_banner: " ",
            total_listens: " ",
            show_total_durations: " ",
            show_language: " ",
            trailer_audio: " ",
            show_image: " ",
            show_author: " ",
            show_writer: " ",
            show_narrator: " ",
            show_podcaster: " ",
            show_artist: " ",
            show_access_type: " ",
            show_publish_date: " ",
            show_publish_time: " ",
            show_rss_slug: " ",
            show_credits: " ",
            show_tags: " ",
            category_id: " ",
            show_comingsoon_image: " ",
            episodes: [
                {
                    episode_name: " ",
                    episode_slug: " ",
                    episode_description: " ",
                    episode_type: " ",
                    episode_image: " ",
                    episode_audio: " ",
                    episode_author: " ",
                    episode_writer: " ",
                    episode_narrator: " ",
                    episode_podcaster: " ",
                    episode_artist: " ",
                    episode_duration: " ",
                    left_duration: " ",
                    episode_access_type: " ",
                    episode_publish_date: " ",
                    episode_publish_time: " ",
                    show_id: " ",
                },
            ]
        });
        setShowSuccessModal(false);
    }
    const handleOk = () => {
        setFormData(propsData !== undefined ? propsData.formData : {})
        history.push(`/episodeslist/${showId}`);

    }
    const handleEpisodeFileChange = async (event, episodeIndex, fieldName) => {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }
        const fileType = file.type.split('/')[1];
        const allowedFileTypes = ['image/jpeg', 'image/webp', 'image/png'];  // Adjust this array for other audio formats
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
            setFormData(prevFormData => {
                const updatedEpisodes = [...prevFormData.episodes];
                updatedEpisodes[episodeIndex][fieldName] = data.Location;

                return {
                    ...prevFormData,
                    episodes: updatedEpisodes
                };
            });
            console.log(">>>>", URL.createObjectURL(file));
            setTrailerEpAudioPreview(file);

        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };
    const handleEpisodeAudioFileChange = async (event, episodeIndex, fieldName) => {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }
        const fileType = file.type.split('/')[1];
        const allowedFileTypes = ['audio/mpeg', 'audio/mp4', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3', 'audio/mpg', 'audio/x-mpg', 'audio/mpeg3', 'audio/x-mpeg3'];  // Adjust this array for other audio formats
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
            Key: `${fieldName}_${Date.now()}.${file?.name}`,
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
            console.log(">>>>", URL.createObjectURL(file));
            setTrailerEpAudioPreview(file);

        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };


    const handleTimeChange = (time, timeString) => {
        setFormData({ ...formData, show_publish_time: time, timeString });
    };

    const removeEpisode = (index) => {
        setFormData(prevFormData => {
            const updatedEpisodes = [...prevFormData.episodes];
            updatedEpisodes.splice(index, 1);
            return {
                ...prevFormData,
                episodes: updatedEpisodes,
            };
        });
    }
    const handleQuillChange = (content) => {
        // You can update the episode_description in your state here
        handleFormChange(index, 'episode_description', content);
    };
    const renderEpisodeFields = (episode, index) => {
        const date = moment(episode?.episode_publish_date).format('DD/MM/YYYY');
        return (
            <div key={index} className="col-md-12 col-lg-7">
                <label htmlFor={`episode_name_${index}`}>Episode Name</label>
                <Input
                    type="text"
                    id={`episode_name_${index}`}
                    placeholder="Episode Name"
                    name="episode_name"
                    value={episode?.episode_name}
                    onChange={(e) => handleFormChange(e, index)}
                />
                <label htmlFor={`episode_slug_${index}`}>Episode Slug</label>
                <Input
                    id={`episode_slug_${index}`}
                    placeholder="Episode Slug"
                    name="episode_slug"
                    className="form-control"
                    value={episode?.episode_slug}
                    onChange={(e) => handleFormChange(e, index)}
                />
                <label htmlFor={`episode_description_${index}`}>Episode Description</label>
                <div className="show__description__height">
                    <ReactQuill
                        id="episode_description"
                        name="episode_description"
                        value={episode?.episode_description}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_description', value } }, index)}
                    />
                </div>
                {/* <textarea
                    id={`episode_description_${index}`}
                    placeholder="Episode Description"
                    name="episode_description"
                    className="form-control"
                    value={episode?.episode_description}
                    onChange={(e) => handleFormChange(e, index)}
                /> */}
                {/* {formData.show_writer.length > 1 &&
                    <> */}
                <label htmlFor={`episode_writer_${index}`}>Episode Writer</label><div className="antd_select">
                    <Select
                        id={`episode_writer_${index}`}
                        name="episode_writer"
                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                        value={episode.episode_writer || formData.show_writer}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_writer', value } }, index)}
                    >
                        {artist?.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                {/* </>
                } */}
                {/* {formData.show_narrator.length > 1 &&
                    <> */}
                <label htmlFor={`episode_narrator_${index}`}>Episode Narrator</label><div className="antd_select">
                    <Select
                        id={`episode_narrator_${index}`}
                        name="episode_narrator"
                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                        value={episode.episode_narrator}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_narrator', value } }, index)}
                    >
                        {artist?.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                {/* </>
                } */}
                {/* {formData.show_podcaster.length > 1 &&
                    <> */}
                <label htmlFor={`episode_podcaster_${index}`}>Episode Podcaster</label><div className="antd_select">
                    <Select
                        id={`episode_podcaster_${index}`}
                        name="episode_podcaster"
                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                        value={episode.episode_podcaster}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_podcaster', value } }, index)}
                    >
                        {artist?.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                {/* </>
                    } */}
                {/* {formData.show_artist.length > 1 &&
                    <> */}
                <label htmlFor={`episode_artist_${index}`}>Episode Artist</label><div className="antd_select">
                    <Select
                        id={`episode_artist_${index}`}
                        name="episode_artist"
                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                        value={episode.episode_artist}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_artist', value } }, index)}
                    >
                        {artist?.map((artist) => (
                            <Select.Option key={artist._id} value={artist.artist_name}>
                                {artist.artist_name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                {/* </>
                } */}
                <label htmlFor={`_episode_access_type_${index}`}>Episode Access Type</label><div className="antd_select">
                    <Select
                        id={`_episode_access_type_${index}`}
                        name="episode_access_type"
                        value={episode.episode_access_type}
                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                        onChange={(value) => handleFormChange({ target: { name: 'episode_access_type', value } }, index)}
                    >
                        <Select.Option value="Public">Public</Select.Option>
                        <Select.Option value="Private">Private</Select.Option>
                    </Select>
                </div>

            </div >
        );
    };
    const renderEpisodeOneFields = (episode, index) => {
        return (
            <div key={index}>
                <div key={index}>
                    <label htmlFor={`episode_audio_${index}`}>Episode Audio</label>
                    {episode?.episode_audio && (
                        <audio key={episode.episode_audio} controls style={{ width: "-webkit-fill-available", marginBottom: "4px" }}>
                            <source src={episode?.episode_audio} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    )}
                    <p>
                        Current Audio:{" "}
                        {episode.episode_audio
                            ? decodeURIComponent(episode.episode_audio.split("/").pop())
                            : "No Audio selected"}
                    </p>
                    <Input
                        id={`episode_audio_${index}`}
                        type="file"
                        accept="audio/*"
                        name={`episode_audio_${index}`}
                        className="form-control"
                        onChange={(e) => handleEpisodeAudioFileChange(e, index, 'episode_audio')}
                    />
                </div>
            </div>

        );

    };
    const renderEpisodeTwoFields = (episode, index) => {
        return (
            <div key={index}>
                <label htmlFor={`episode_image_${index}`}>Episode Image</label>
                <div>
                    {episode?.episode_image?.length !== 0 &&
                        <Image src={episode.episode_image} style={{ marginBottom: "10px", width: "200px" }} />}
                </div>
                <Input
                    id={`episode_image_${index}`}
                    type="file"
                    accept="image/*"
                    name={`episode_image_${index}`}
                    className="form-control"
                    onChange={(e) => handleEpisodeFileChange(e, index, 'episode_image')}
                />
                <p> Current Image: {episode.episode_image ? "Image selected" : "No image selected"}</p>
            </div>

        );

    };
    const renderEpisodeThirdFields = (episode, index) => {
        return (
            <div key={index}>
                <label htmlFor={`episode_type_${index}`}>Episode Type</label>
                <div >
                    <Radio.Group
                        id={`episode_type_${index}`}
                        name="episode_type"
                        value={episode.episode_type}
                        defaultValue="normal"
                        onChange={(e) => handleFormChange({ target: { name: 'episode_type', value: e.target.value } }, index)}
                    >
                        <Radio value="normal">Normal</Radio>
                        <Radio value="trailer">Trailer</Radio>
                        <Radio value="bonus">Bonus</Radio>
                    </Radio.Group>
                </div>
            </div>

        );

    };
    const renderEpisodeSixthFields = (episode, index) => {
        return (
            <div key={index}>
                <>
                    <label htmlFor={`episode_publish_date_${index}`}>Episode Publish Date</label>
                    <DatePicker
                        id="episode_publish_date"
                        name="episode_publish_date"
                        className="form-control"
                        selected={selectedDate}
                        onChange={(date) => {
                            setSelectedDate(date);
                            handleFormChange({ target: { name: 'episode_publish_date', value: date } }, index)
                        }}
                        value={moment(episode?.episode_publish_date).format('DD/MM/YYYY') || ''}
                        dateFormat="dd/MM/yyyy"
                    />
                </>
            </div>

        );

    };
    const renderEpisodeSeventhFields = (episode, index) => {
        return (
            <div key={index}>

                <>
                    <label htmlFor={`episode_publish_time_${index}`}>Episode Time</label>
                    <TimePicker
                        id="show_publish_time"
                        placeholder="Select Episode Time"
                        className="form-control size_same_time"
                        name="episode_publish_time"
                        format="h:mm A"
                        showSecond={false}
                        use12Hours={true}
                        style={{ width: "100%" }}
                        value={episode.episode_publish_time ? moment(episode.episode_publish_time, 'h:mm A') : null}
                        onChange={(time, timeString) => {
                            handleFormChange({ target: { name: 'episode_publish_time', value: timeString, time } }, index)
                        }}
                    />
                </>
            </div>

        );

    };
    const renderEpisodeEighthFields = (episode, index) => {
        return (
            <div key={index}>
                <>
                    <label htmlFor={`episode_number_${index}`}>Episode Number</label>
                    <Input
                        type="text"
                        id={`episode_number_${index}`}
                        placeholder="Episode Number"
                        name="episode_number"
                        value={episode.episode_number}
                        onChange={(e) => handleFormChange(e, index)}
                    />
                </>
            </div>

        );

    };
    const renderEpisodeNinethFields = (episode, index) => {
        return (
            <div key={index}>
                <>
                    <label htmlFor={`episode_season_${index}`}>Episode Season</label>
                    <Input
                        type="text"
                        id={`episode_season_${index}`}
                        placeholder="Episode Season"
                        name="episode_season"
                        value={episode.episode_season}
                        onChange={(e) => handleFormChange(e, index)}
                    />
                </>
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
                    episode_type: "normal",
                    episode_image: formData.show_image,
                    episode_audio: "",
                    episode_author: formData.show_author,
                    episode_writer: formData.show_author,
                    episode_narrator: formData.show_narrator,
                    episode_podcaster: formData.show_podcaster,
                    episode_artist: formData.show_podcaster,
                    episode_duration: "0",
                    left_duration: "00:00:00 Hrs",
                    episode_access_type: "Public",
                    episode_publish_date: "",
                    episode_publish_time: "",
                    show_id: showId,
                }
            ]
        }));
    };

    const editPodCast = {
        formData,
        currentStep,
        // firstCatSelect,
        // secCatSelect,
        // catSelect
    };

    console.log("edit >>>>>", editArr);

    console.log("formdata >>>>>", Object.keys(formData)?.length !== 0 && (formData.episodes[editEpisodeIndex]));
    console.log("formData checking", formData)
    return (
        <React.Fragment>
            <div className="page-content">
                <div className="main-container">
                    <div className="main-content-container">
                        <div className="mobile-content-block">
                            <div className="ng--layout">
                                <h2>Edit Episode </h2>
                                <form className="episode-detail" onSubmit={handleSubmit}>
                                    <div role="tablist" className="accordion" aria-multiselectable='true'>
                                        <div className="card">
                                            <div role='tab' className='card-header' id='content-header'>Content and Information</div>
                                            <div role='tabpanel' className="collapse show " id='content' aria-labelledby='content-header'>
                                                <div className='card-body'>
                                                    <div className="row ">
                                                        <div className="col-lg-3 mb-3 mb-lg-0"><strong className="fs__16">Upload Your File</strong></div>
                                                        <div className="col-lg-9">
                                                            <div className="row ">
                                                                <div className="col-12 ">
                                                                    <div className="flex-grow-1 ">
                                                                        {/* <div className="media-upload dropzone"> */}
                                                                            <div className="ngx-file-drop__drop-zone">
                                                                                <div className="ngx-file-drop__content">
                                                                                    <div className="box__input">
                                                                                        <div className="block-col-area">
                                                                                            {Object.keys(formData)?.length !== 0 && editArr?.length > 0 && (
                                                                                                <>
                                                                                                    {editArr.map((episode, index) => (
                                                                                                        <React.Fragment key={index}>
                                                                                                            {renderEpisodeOneFields(episode, index)}
                                                                                                            {editArr.length > 1 && (
                                                                                                                <DeleteOutlined
                                                                                                                    style={{ marginTop: "5px" }}
                                                                                                                    className="removeButton  mb-2"
                                                                                                                    onClick={() => removeEpisode(index)}
                                                                                                                />
                                                                                                            )}
                                                                                                        </React.Fragment>
                                                                                                    ))}
                                                                                                </>
                                                                                            )}
                                                                                        </div>
                                                                                        {/* <div className="small remember-text"> *Remember your mp3 file must use a <a href="#" target="_blank">fixed bitrate</a>! </div> */}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        {/* </div> */}
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <hr className="mt-4 mb-4 " />
                                                    <div className="row ">
                                                        <div className="col-lg-3 mb-3 mb-lg-0"><strong className="fs__16">Episode Details</strong>
                                                            <div className="small mt-2"><span className="text-purple mr-1">*</span>Required </div>
                                                        </div>
                                                        {Object.keys(formData)?.length !== 0 && editArr?.length > 0 && (
                                                            <>
                                                                {editArr.map((episode, index) => (
                                                                    <React.Fragment key={index}>
                                                                        {renderEpisodeFields(episode, index)}
                                                                        {editArr.length > 1 && (
                                                                            <DeleteOutlined
                                                                                style={{ marginTop: "5px" }}
                                                                                className="removeButton  mb-2"
                                                                                onClick={() => removeEpisode(index)}
                                                                            />
                                                                        )}
                                                                    </React.Fragment>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card ">
                                            <div role="tab" className="card-header" id="settings-header">Advanced Options</div>
                                            <div role="tabpanel" className="collapse show " id="settings" aria-labelledby="settings-header">
                                                <div className="card-body">
                                                    <div className="row ">
                                                        <div className="col-lg-3 mb-3 mb-lg-0"><strong>Episode Meta</strong></div>
                                                        <div className="col-lg-9">
                                                            {/* <label>Episode type</label> */}
                                                            {Object.keys(formData)?.length !== 0 && editArr?.length > 0 && (
                                                                <>
                                                                    {editArr.map((episode, index) => (
                                                                        <React.Fragment key={index}>
                                                                            {renderEpisodeThirdFields(episode, index)}
                                                                            {editArr.length > 1 && (
                                                                                <DeleteOutlined
                                                                                    style={{ marginTop: "5px" }}
                                                                                    className="removeButton  mb-2"
                                                                                    onClick={() => removeEpisode(index)}
                                                                                />
                                                                            )}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </>
                                                            )}
                                                            <div className="row ">
                                                                <div className="row mt-4">
                                                                    <div className="col-lg-6">
                                                                        {Object.keys(formData)?.length !== 0 && editArr?.length > 0 && (
                                                                            <>
                                                                                {editArr.map((episode, index) => (
                                                                                    <React.Fragment key={index}>
                                                                                        {renderEpisodeSixthFields(episode, index)}
                                                                                        {editArr.length > 1 && (
                                                                                            <DeleteOutlined
                                                                                                style={{ marginTop: "5px" }}
                                                                                                className="removeButton  mb-2"
                                                                                                onClick={() => removeEpisode(index)}
                                                                                            />
                                                                                        )}
                                                                                    </React.Fragment>
                                                                                ))}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <div className="col-6">
                                                                        {Object.keys(formData)?.length !== 0 && editArr?.length > 0 && (
                                                                            <>
                                                                                {editArr.map((episode, index) => (
                                                                                    <React.Fragment key={index}>
                                                                                        {renderEpisodeSeventhFields(episode, index)}
                                                                                        {editArr.length > 1 && (
                                                                                            <DeleteOutlined
                                                                                                style={{ marginTop: "5px" }}
                                                                                                className="removeButton  mb-2"
                                                                                                onClick={() => removeEpisode(index)}
                                                                                            />
                                                                                        )}
                                                                                    </React.Fragment>
                                                                                ))}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row ">

                                                                <div className="row mt-4">
                                                                    <div className="col-lg-6">
                                                                        {Object.keys(formData)?.length !== 0 && editArr?.length > 0 && (
                                                                            <>
                                                                                {editArr.map((episode, index) => (
                                                                                    <React.Fragment key={index}>
                                                                                        {renderEpisodeEighthFields(episode, index)}
                                                                                        {editArr.length > 1 && (
                                                                                            <DeleteOutlined
                                                                                                style={{ marginTop: "5px" }}
                                                                                                className="removeButton  mb-2"
                                                                                                onClick={() => removeEpisode(index)}
                                                                                            />
                                                                                        )}
                                                                                    </React.Fragment>
                                                                                ))}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <div className="col-6">
                                                                        {Object.keys(formData)?.length !== 0 && editArr?.length > 0 && (
                                                                            <>
                                                                                {editArr.map((episode, index) => (
                                                                                    <React.Fragment key={index}>
                                                                                        {renderEpisodeNinethFields(episode, index)}
                                                                                        {editArr.length > 1 && (
                                                                                            <DeleteOutlined
                                                                                                style={{ marginTop: "5px" }}
                                                                                                className="removeButton  mb-2"
                                                                                                onClick={() => removeEpisode(index)}
                                                                                            />
                                                                                        )}
                                                                                    </React.Fragment>
                                                                                ))}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card ">
                                            <div role="tab" className="card-header" id="marketing-header">Marketing</div>
                                            <div role="tabpanel" className="collapse show " id="marketing" aria-labelledby="marketing-header">
                                                <div className="card-body">
                                                    <div className="row ">
                                                        <div className="col-lg-3 mb-3 mb-lg-0"><strong>Episode Artwork</strong></div>
                                                        <div className="col-lg-9">
                                                            <p className="mb-4"> Upload an episode specific image to replace your podcast’s usual cover art. </p>
                                                            {Object.keys(formData)?.length !== 0 && editArr?.length > 0 && (
                                                                <>
                                                                    {editArr.map((episode, index) => (
                                                                        <React.Fragment key={index}>
                                                                            {renderEpisodeTwoFields(episode, index)}
                                                                            {editArr.length > 1 && (
                                                                                <DeleteOutlined
                                                                                    style={{ marginTop: "5px" }}
                                                                                    className="removeButton  mb-2"
                                                                                    onClick={() => removeEpisode(index)}
                                                                                />
                                                                            )}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </>
                                                            )}
                                                            <div className="mt-2"><small className="text-muted">Use specific artwork to market exclusive content, seasonal episodes or one-off bonus content.</small></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 mt-4 mb-4">

                                            {/* <Link to={{
                                                        pathname: `/podcast-setting/${showId}`,
                                                        state: editPodCast
                                                        }}>
                                                        <Button ctype="button" className="btn--primary mr__2 hight_add_add__Episode" onClick={handlePreviousStep}>
                                                        Previous
                                                       </Button>
                                                        </Link> */}
                                            {/* <Button type="button" className="btn--primary mr__2 hight_add_add__Episode"
                                                         onClick={addEpisode}>
                                                        Add Episode
                                                        </Button> */}
                                            <Button type="submit" className="btn--primary mr__2 hight_add_add__Episode"
                                                onClick={handleSubmit}>
                                                Update Episode
                                            </Button>

                                        </div>
                                    </div>
                                </form>
                                <Modal
                                    isOpen={showSuccessModal}
                                    // toggle={handleModalCancel}
                                    centered={true}
                                >
                                    <ModalHeader>Success</ModalHeader>
                                    <ModalBody>
                                        Successfully updated Episodes
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
                        </div>
                    </div>
                </div>

            </div>
        </React.Fragment>
    );
}

export default EditEp;
