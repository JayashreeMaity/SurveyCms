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

function AddEpisode() {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const { showId } = useParams();
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
        episode_access_type: "Public ",
        episode_publish_date: new Date(),
        episode_publish_time: "",
        is_published: null,
        show_id: " " // Set the show_id here
    });
    const location = useLocation();
    const history = useHistory();
    const propsData = location.state;
    const [episodes, setEpisodes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState(propsData !== undefined ? propsData.formData : {});
    const [trailerEpAudioPreview, setTrailerEpAudioPreview] = useState(null);
    const [languages, setLanguages] = useState([]);
    const [artist, setArtist] = useState([]);
    const [category, setCategory] = useState([]);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formErrors, setFormErrors] = useState({});
    const [epNameState, setEpNameState] = useState("");
    const [epDescState, setEpDescState] = useState("");
    const [currentEpisodeTime, setCurrentEpisodeTime] = useState(
        moment().format('h:mm A')
    );

    AWS.config.update({
        accessKeyId: process.env.REACT_APP_BUCKET_KEY,
        secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_BUCKET_REGION
    });
    const s3 = new AWS.S3();

    useEffect(() => {
        const currentTime = moment();
        const formattedCurrentTime = currentTime.format('h:mm A');
        setEpisode((prevData) => ({
            ...prevData,
            episode_publish_time: formattedCurrentTime,
        }));
    }, []);
    const handleEpTimeChange = (time, timeString) => {
        setEpisode((prevData) => ({
            ...prevData,
            episode_publish_time: timeString,
        }));
        setCurrentEpisodeTime(timeString);
    };

    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            console.log("formData.show_image>>>>>>>>", formData.show_image)
            episode.episode_image = formData.show_image;
        }
    }, [formData]);
    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {

            episode.episode_writer = formData.show_writer;
        }
    }, [formData]);
    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            // Check if formData has a show_writer and set it in the episode state

            episode.episode_artist = formData.show_artist;
        }
    }, [formData]);

    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {
            console.log("formData.show_podcaster>>>>>>>>", formData.show_podcaster)
            // if (formData.show_podcaster) {
            // setEpisode({
            //     ...episode,
            //     episode_podcaster: formData.show_podcaster
            // });
            // }
            episode.episode_podcaster = formData.show_podcaster;
        }
    }, [formData]);

    useEffect(() => {
        if (Object.keys(formData)?.length !== 0) {

            episode.episode_narrator = formData.show_narrator;
        }
    }, [formData]);


    useEffect(() => {
        fetch(`${apiEndpoint}/api/shows/${showId}`)
            .then(response => response.json())
            .then(response => {
                if (response.status && response.result && response.result.data) {
                    setFormData(propsData !== undefined ? propsData.formData : response.result.data);
                } else {
                    console.error('Invalid response format:', response);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, [showId]);
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


    const validateForm = () => {
        let isValid = true;
        if (episode.episode_name === "") {
            setEpNameState("invalid");
            isValid = false;
        } else {
            setEpNameState("valid");
        } if (episode.episode_description === "") {
            setEpDescState("invalid");
            isValid = false;
        } else {
            setEpDescState("valid");
        }
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Implement your validation logic here (if needed)
        const updatedFormData = { ...formData };
        updatedFormData.episodes = updatedFormData.episodes || [];
        updatedFormData.episodes.push(episode);
        console.log("episodes: allEpisodes ", updatedFormData)
        const validation = validateForm();
        if (validation) {
            try {
                const response = await fetch(`${apiEndpoint}/api/shows/${showId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedFormData),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Request was successful
                    const data = await response.json();
                    setShowSuccessModal(true);
                } else {
                    // Request failed
                    message.error('An error occurred while submitting.');
                }
            } catch (error) {
                // Handle any network or fetch error
                message.error('An error occurred while adding the episode.');
                console.error('Error:', error);
            }
        }

    };
    const handleEpisodeFileChange = async (event, fieldName) => {
        const file = event.target?.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }

        const fileType = file?.type?.split('/')[1]?.toLowerCase(); // Convert to lowercase
        const allowedFileTypes = ['image/jpeg', 'image/webp', 'image/png'];
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
            Body: file,
        };

        try {
            const data = await s3.upload(params).promise();
            console.log('File uploaded successfully:', data.Location);

            if (fieldName === 'episode_image') {
                setEpisode({
                    ...episode,
                    episode_image: data.Location,
                });
            } else if (fieldName === 'episode_audio') {
                setEpisode({
                    ...episode,
                    episode_audio: data.Location,
                });
                // You can also set the audio file preview here if needed
                setTrailerEpAudioPreview(file);
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            message.error('Error uploading file. Please try again.');
        }
    };
    const handleEpisodeAudioFileChange = async (event, fieldName) => {
        const file = event.target?.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }

        const fileType = file?.type?.split('/')[1]?.toLowerCase(); // Convert to lowercase
        const allowedFileTypes = ['audio/mpeg', 'audio/mp4', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3', 'audio/mpg', 'audio/x-mpg', 'audio/mpeg3', 'audio/x-mpeg3'];


        if (!allowedFileTypes.includes(file?.type)) {
            message.error('Error: Unsupported file type.');
            return;
        }

        const params = {
            Bucket: process.env.REACT_APP_S3_BUCKET,
            Key: `${fieldName}_${Date.now()}.${file?.name}`,
            Body: file,
        };

        try {
            const data = await s3.upload(params).promise();
            console.log('File uploaded successfully:', data.Location);

            if (fieldName === 'episode_image') {
                setEpisode({
                    ...episode,
                    episode_image: data.Location,
                });
            } else if (fieldName === 'episode_audio') {
                setEpisode({
                    ...episode,
                    episode_audio: data.Location,
                });
                // You can also set the audio file preview here if needed
                setTrailerEpAudioPreview(file);
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            message.error('Error uploading file. Please try again.');
        }
    };

    const handleModalCancel = () => {
        // Close the modal and reset form data
        setEpisode({
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
            episode_access_type: "Public ",
            episode_publish_date: new Date(),
            episode_publish_time: "",
            is_published: null,
            show_id: " " // Set the show_id here
        });
        setShowSuccessModal(false);
    }
    const handleOk = () => {
        history.push(`/episodeslist/${showId}`);

    }


    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setEpisode({
            ...episode,
            [name]: value
        });
        if (name === "episode_name") {
            const episodeSlug = value.toLowerCase().replace(/^\s+/, '').replace(/\s+/g, "-");
            setEpisode((prevEpisode) => ({
                ...prevEpisode,
                episode_slug: episodeSlug,
            }));
        }

    };

    const handleDescriptionChange = (value) => {
        handleFormChange({ target: { name: 'episode_description', value } });
        if (!value.trim()) {
            setEpDescState('invalid');
        } else {
            setEpDescState('valid');
        }
    };
    console.log("{{{{", episode.episode_podcaster)
    return (
        <React.Fragment>
            <div className="page-content">
                <div className="main-container">
                    <div className="main-content-container">
                        <div className="mobile-content-block">
                            <div className="ng--layout">
                                <h3>Add Episode </h3>
                                <div id="progrss-wizard" className="twitter-bs-wizard">
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
                                                                                                <label htmlFor={`episode_audio`}>Episode Audio</label>
                                                                                                {episode?.episode_audio?.length > 1 && (
                                                                                                    <>
                                                                                                        {trailerEpAudioPreview && (
                                                                                                            <audio key={episode.episode_audio} controls style={{ width: "-webkit-fill-available", marginBottom: "4px" }}>
                                                                                                                <source src={URL.createObjectURL(trailerEpAudioPreview)} type={trailerEpAudioPreview.type} />
                                                                                                                Your browser does not support the audio element.
                                                                                                            </audio>
                                                                                                        )}
                                                                                                        <p>
                                                                                                            Current Audio:{" "}
                                                                                                            {episode.episode_audio
                                                                                                                ? decodeURIComponent(episode.episode_audio.split("/").pop())
                                                                                                                : "No Audio selected"}
                                                                                                        </p>
                                                                                                    </>

                                                                                                )}
                                                                                                <Input
                                                                                                    id={`episode_audio`}
                                                                                                    type="file"
                                                                                                    accept="audio/*"
                                                                                                    name={`episode_audio`}
                                                                                                    className="form-control"
                                                                                                    onChange={(e) => handleEpisodeAudioFileChange(e, 'episode_audio')}
                                                                                                />
                                                                                            </div>
                                                                                            {/* <div className="small remember-text"> *Remember your mp3 file must use a <a href="#" target="_blank">fixed bitrate</a>!
                                                                                             </div> */}
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
                                                            <div className="col-md-12 col-lg-7">
                                                                <label htmlFor={`episode_name`}>Episode Name</label>
                                                                <Input
                                                                    type="text"
                                                                    id={`episode_name`}
                                                                    placeholder="Episode Name"
                                                                    name="episode_name"
                                                                    valid={epNameState === "valid"}
                                                                    invalid={epNameState === "invalid"}
                                                                    onChange={(e) => {
                                                                        handleFormChange(e)
                                                                        if (e.target.value === "") {
                                                                            setEpNameState("invalid");
                                                                        } else {
                                                                            setEpNameState("valid");
                                                                        }
                                                                    }}
                                                                />
                                                                {/* <label htmlFor={`episode_slug`}>Episode Slug</label>
                                                                <Input
                                                                    id={`episode_slug`}
                                                                    placeholder="Episode Slug"
                                                                    name="episode_slug"
                                                                    className="form-control"

                                                                    onChange={(e) => handleFormChange({ target: { name: 'episode_slug', value: e.target.value } })}
                                                                /> */}
                                                                <label htmlFor={`episode_description`}>Episode Description</label>
                                                                <div className="show__description__height">
                                                                    <ReactQuill
                                                                        id="episode_description"
                                                                        name="episode_description"
                                                                        value={episode.episode_description}
                                                                        onChange={handleDescriptionChange}
                                                                    />
                                                                </div>
                                                                {/* <textarea
                                                                    id={`episode_description`}
                                                                    placeholder="Episode Description"
                                                                    name="episode_description"
                                                                    className="form-control"

                                                                    onChange={(e) => {
                                                                        handleFormChange(e)
                                                                        if (e.target.value === "") {
                                                                            setEpDescState("invalid");
                                                                        } else {
                                                                            setEpDescState("valid");
                                                                        }
                                                                    }}
                                                                /> */}
                                                                {/* {formData.show_writer.length > 1 &&
                    <> */}
                                                                <label htmlFor={`episode_writer`}>Episode Writer</label><div className="antd_select">
                                                                    <Select
                                                                        id={`episode_writer`}
                                                                        name="episode_writer"
                                                                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                                        placeholder="Select Writer"
                                                                        value={episode.episode_writer}
                                                                        onChange={(value) => handleFormChange({ target: { name: 'episode_writer', value } })}
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
                                                                <label htmlFor={`episode_narrator`}>Episode Narrator</label><div className="antd_select">
                                                                    <Select
                                                                        id={`episode_narrator`}
                                                                        name="episode_narrator"
                                                                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                                        placeholder="Select Narrator"
                                                                        value={episode.episode_narrator}
                                                                        onChange={(value) => handleFormChange({ target: { name: 'episode_narrator', value } })}
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
                                                                <label htmlFor={`episode_podcaster`}>Episode Podcaster</label><div className="antd_select">
                                                                    {console.log("><><><", episode.episode_podcaster)}
                                                                    <Select
                                                                        id={`episode_podcaster`}
                                                                        name="episode_podcaster"
                                                                        value={episode.episode_podcaster}
                                                                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                                        placeholder="Select Podcaster"
                                                                        onChange={(value) => {
                                                                            setEpisode((prevEpisode) => ({
                                                                                ...prevEpisode,
                                                                                episode_podcaster: value,
                                                                            }));
                                                                            handleFormChange({ target: { name: "episode_podcaster", value } });
                                                                        }}                                                                    >
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
                                                                <label htmlFor={`episode_artist`}>Episode Artist</label><div className="antd_select">
                                                                    <Select
                                                                        id={`episode_artist`}
                                                                        name="episode_artist"
                                                                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                                        placeholder="Select Artist"
                                                                        value={episode.episode_artist}
                                                                        onChange={(value) => handleFormChange({ target: { name: 'episode_artist', value } })}
                                                                    >
                                                                        <Select.Option value="" disabled>Select Artist</Select.Option>
                                                                        {artist?.map((artist) => (
                                                                            <Select.Option key={artist._id} value={artist.artist_name}>
                                                                                {artist.artist_name}
                                                                            </Select.Option>
                                                                        ))}
                                                                    </Select>
                                                                </div>
                                                                {/* </>
                } */}
                                                                <label htmlFor={`episode_access_type`}>Episode Access Type</label>
                                                                <div className="antd_select">
                                                                    <Select
                                                                        id={`episode_access_type`}
                                                                        name="episode_access_type"
                                                                        // placeholder="Select Access Type"
                                                                        value={episode.episode_access_type}
                                                                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                                        onChange={(value) => handleFormChange({ target: { name: 'episode_access_type', value } })}
                                                                    >
                                                                        <Select.Option value="" disabled>Select Access Type</Select.Option>
                                                                        <Select.Option value="Public">Public</Select.Option>
                                                                        <Select.Option value="Private">Private</Select.Option>
                                                                    </Select>
                                                                </div>
                                                            </div>
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
                                                                <label htmlFor={`episode_type`}>Episode Type</label>
                                                                <div >
                                                                    <Radio.Group
                                                                        id={`episode_type`}
                                                                        name="episode_type"
                                                                        value={episode.episode_type}
                                                                        defaultValue="normal"
                                                                        onChange={(e) => handleFormChange({ target: { name: 'episode_type', value: e.target.value } })}
                                                                    >
                                                                        <Radio value="normal">Normal</Radio>
                                                                        <Radio value="trailer">Trailer</Radio>
                                                                        <Radio value="bonus">Bonus</Radio>
                                                                    </Radio.Group>
                                                                </div>
                                                                <div className="row ">
                                                                    <div className="row mt-4">
                                                                        <div className="col-lg-6">
                                                                            <label htmlFor={`episode_publish_date`}>Episode Publish Date</label>
                                                                            <DatePicker
                                                                                id="episode_publish_date"
                                                                                name="episode_publish_date"
                                                                                className="form-control"
                                                                                selected={selectedDate}
                                                                                onChange={(date) => {
                                                                                    setSelectedDate(date);
                                                                                    handleFormChange({ target: { name: 'episode_publish_date', value: date } })
                                                                                }}
                                                                                value={moment(episode?.episode_publish_date).format('DD/MM/YYYY') || ''}
                                                                                dateFormat="dd/MM/yyyy"

                                                                            />
                                                                        </div>
                                                                        <div className="col-6">
                                                                            <label htmlFor={`episode_publish_time`}>Episode Time</label>
                                                                            <TimePicker
                                                                                defaultValue={moment(currentEpisodeTime, 'h:mm A')}
                                                                                id="show_publish_time"
                                                                                placeholder="Select Episode Time"
                                                                                className="form-control size_same_time"
                                                                                name="episode_publish_time"
                                                                                format="h:mm A"
                                                                                showSecond={false}
                                                                                use12Hours={true}
                                                                                style={{ width: "100%" }}
                                                                                // defaultValue={currentEpisodeTime}
                                                                                // value={episode.episode_publish_time ? moment(episode.episode_publish_time, 'h:mm A') : null}
                                                                                onChange={handleEpTimeChange}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="row ">
                                                                    <div className="row mt-4">
                                                                        <div className="col-lg-6">
                                                                            <label htmlFor={`episode_number`}>Episode Number</label>
                                                                            <Input
                                                                                type="text"
                                                                                id={`episode_number`}
                                                                                placeholder="Episode Number"
                                                                                name="episode_number"
                                                                                value={episode.episode_number}
                                                                                onChange={(e) => handleFormChange(e)}
                                                                            />

                                                                        </div>
                                                                        <div className="col-6">
                                                                            <label htmlFor={`episode_season`}>Episode Season</label>
                                                                            <Input
                                                                                type="text"
                                                                                id={`episode_season`}
                                                                                placeholder="Episode Season"
                                                                                name="episode_season"
                                                                                value={episode.episode_season}
                                                                                onChange={(e) => handleFormChange(e)}
                                                                            />

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
                                                                <label htmlFor={`episode_image`}>Episode Image</label>
                                                                <div>
                                                                    {episode?.episode_image?.length !== 0 &&
                                                                        <Image src={episode.episode_image} style={{ marginBottom: "10px", width: "200px" }} />}
                                                                </div>
                                                                <Input
                                                                    id={`episode_image`}
                                                                    type="file"
                                                                    accept="image/*"
                                                                    name={`episode_image`}
                                                                    className="form-control"
                                                                    // value={episode.episode_image}

                                                                    onChange={(e) => handleEpisodeFileChange(e, 'episode_image')}
                                                                />
                                                                <div className="mt-2"><small className="text-muted">Use specific artwork to market exclusive content, seasonal episodes or one-off bonus content.</small></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-12 mt-4 mb-4">
                                                <Button type="submit" className="btn--primary" onClick={handleSubmit}>
                                                    Add Episode
                                                </Button>


                                            </div>
                                        </div>
                                    </form>
                                    <Modal
                                        isOpen={showSuccessModal}
                                        toggle={handleModalCancel}
                                        centered={true}
                                    >
                                        <ModalHeader toggle={handleModalCancel}>Success</ModalHeader>
                                        <ModalBody>
                                            Successfully Added Episodes
                                        </ModalBody>
                                        <div className="modal-footer">
                                            <Button color="primary" onClick={handleOk}>
                                                Ok
                                            </Button>
                                            <Button color="secondary" onClick={handleModalCancel}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </Modal>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default AddEpisode;
