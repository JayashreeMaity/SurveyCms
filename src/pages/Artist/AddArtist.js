import React, { useState, useEffect } from "react";
import AWS from 'aws-sdk';
import { message, Select } from 'antd';
import { Row, Col, Card, CardBody, FormGroup, Button, Label, Container, Modal, ModalHeader, ModalBody } from "reactstrap";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { useHistory, useParams } from 'react-router-dom';
import deFaultimg from "../../assets/images/default_img.jpeg"


const { Option } = Select;

const AddArtist = () => {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const history = useHistory();
    const { showId } = useParams();
    const defaultImageURL = deFaultimg;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        artist_name: "",
        artist_slug: "",
        artist_image: defaultImageURL,
        artist_type: null,
        artist_description: "",
        user_id: null,
        artist_shows: [],
        artist_show_count: "",
        artist_episode_count: "",
        artist_episodes: [],
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showOptions, setShowOptions] = useState([]);
    const [episodeOptions, setEpisodeOptions] = useState([]);
    const [selectedShowId, setSelectedShowId] = useState("");

    const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_BUCKET_KEY,
        secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_BUCKET_REGION
    });
    useEffect(() => {
        const showSlug = formData.artist_name.toLowerCase().replace(/^\s+/, '').replace(/ /g, "-");
        // const showCount = formData.artist_shows.length
        // const episodeCount = formData.artist_episodes.length
        setFormData((prevFormData) => ({
            ...prevFormData,
            artist_slug: showSlug,
            // artist_shows: showCount,
            // artist_episodes: episodeCount,
        }));
    }, [formData.artist_name]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${apiEndpoint}/api/users/user-list`);
                const data = await response.json();

                if (response.ok) {
                    setUsers(data.result.data);
                    setLoading(false);
                } else {
                    console.error('Error fetching data:', data);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchUser();
    }, []);
    useEffect(() => {
        const fetchShows = async () => {
            try {
                const response = await fetch(`${apiEndpoint}/api/shows`); // Replace with your API URL
                const data = await response.json();
                if (response.ok) {
                    setShowOptions(data.result.data.map((show) => ({ label: show.show_name, value: show._id })));
                } else {
                    console.error('Error fetching shows:', data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchShows();
    }, []);

    useEffect(() => {
        const fetchEpisodesByShowId = async (showId) => {
            try {
                const response = await fetch(`${apiEndpoint}/api/shows/${showId}`);
                const data = await response.json();

                if (response.ok) {
                    setEpisodeOptions(data.result.data.episodes.map((episode) => ({ label: episode.episode_name, value: episode._id })));
                } else {
                    console.error('Error fetching episodes:', data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        if (selectedShowId) {
            fetchEpisodesByShowId(selectedShowId);
        } else {
            setEpisodeOptions([]);
        }
    }, [selectedShowId]);

    const handleSubmit = (event) => {
        event.preventDefault();
        // Your form submission logic here...
        // if (formData.artist_name && formData.artist_image && formData.user_id) {
        fetch(`${apiEndpoint}/api/artists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then(data => {
                if (data.status === false && data.statusCode === 500) {

                    setError(data.message);
                } else {
                    console.log(data);
                    setShowSuccessModal(true);
                }
            })
            .catch(error => {
                console.error(error);
                setError('Artist you are tyring to add is already registered .');
            });
        // }
    }


    const handleFileChange = (event, fieldName) => {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }
        const fileType = file.type.split('/')[1];
        const maxSizeKB = 500;

        if (file.size / 1024 > maxSizeKB) {
            message.error('Error: File size should be less than 500 KB.');
            // const newInput = document.createElement('input');
            // newInput.type = 'file';
            // newInput.accept = 'image/*';

            // event.target.parentNode.replaceChild(newInput, event.target);
            // console.log('Error: File size should be less than 500 KB.');

            return;
        }

        const img = new Image();
        // img.src = URL.createObjectURL(file);
        img.onload = async () => {
            if (img.width > 3000 || img.height > 3000) {
                message.error('Error: Image dimensions should be 3000x3000 pixels or less.');
                return;
            } else {

                const params = {
                    Bucket: process.env.REACT_APP_S3_BUCKET,
                    Key: `${fieldName}_${Date.now()}.${fileType}`,
                    Body: file
                };

                s3.upload(params, (err, data) => {
                    if (err) {
                        console.error('Error uploading file:', err);
                    } else {
                        console.log('File uploaded successfully:', data.Location);
                        setFormData(prevFormData => ({
                            ...prevFormData,
                            [fieldName]: data.Location
                        }));
                    }
                });
            }
        };
        img.src = URL.createObjectURL(file);

    }
    const handleOk = () => {
        history.push("/view/artist-list");

    }
    const handleModalCancel = () => {
        setFormData({
            artist_name: "",
            artist_slug: "",
            artist_image: defaultImageURL,
            artist_type: null,
            artist_description: "",
            user_id: null,
            artist_shows: [],
            artist_show_count: "",
            artist_episode_count: "",
            artist_episodes: [],
        });
        setShowSuccessModal(false);
    }

    const handleShowChange = (value, index, field) => {
        setFormData((prevFormData) => {
            const updatedShows = [...prevFormData.artist_shows];
            updatedShows[index][field] = value;
            const showCount = formData.artist_shows.length
            return {
                ...prevFormData,
                artist_shows: updatedShows,
                artist_show_count: showCount
            };
        });
    };

    const handleEpisodeChange = (value, index, field) => {
        setFormData((prevFormData) => {
            const updatedEpisodes = [...prevFormData.artist_episodes];
            const episodeCount = formData.artist_episodes.length
            updatedEpisodes[index][field] = value;
            return {
                ...prevFormData,
                artist_episodes: updatedEpisodes,
                artist_episode_count: episodeCount
            };
        });
    };

    const addEpisode = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            artist_episodes: [...prevFormData.artist_episodes, { episode_id: "" }],
        }));
    }

    const removeEpisode = (index) => {
        setFormData(prevFormData => {
            const updatedEpisodes = [...prevFormData.artist_episodes];
            updatedEpisodes.splice(index, 1);
            return {
                ...prevFormData,
                artist_episodes: updatedEpisodes,
            };
        });
    }


    const addShow = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            artist_shows: [...prevFormData.artist_shows, { show_id: "" }],
        }));
    }

    const removeShow = (index) => {
        setFormData(prevFormData => {
            const updatedEpisodes = [...prevFormData.artist_shows];
            updatedEpisodes.splice(index, 1);
            return {
                ...prevFormData,
                artist_shows: updatedEpisodes,
            };
        });
    }

    return (
        <React.Fragment>
            <div className="page-content" >
                <div className="main--content-container">
                    <div className="main--content">
                        <Breadcrumbs breadcrumbItems={[
                            { title: "Artist", link: "/view/artist-list" },
                            { title: "Add Artist", link: "#" },
                        ]} />
                        <h2 className="podcast-title mb-lg-4">Add Artist</h2>
                        <Row>
                            <Col xs={12}>
                                <Card>
                                    <CardBody>
                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        )}
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="artist_name">*Artist Name</Label>
                                                <input
                                                    name="artist_name"
                                                    placeholder="Name"
                                                    type="text"
                                                    className="form-control"
                                                    id="artist_name"
                                                    value={formData.artist_name}
                                                    onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="artist_image">*Artist Image</Label>
                                                <div>
                                                    {formData?.artist_image?.length !== 0 ? (
                                                        <img
                                                            src={formData.artist_image}
                                                            style={{ height: "100px", width: "100px", padding: "10px" }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={defaultImageURL}
                                                            style={{ height: "100px", width: "100px", padding: "10px" }}
                                                        />
                                                    )}
                                                </div>
                                                <input
                                                    name="artist_image"
                                                    type="file"
                                                    className="form-control"
                                                    id="artist_image"
                                                    onChange={(event) => handleFileChange(event, 'artist_image')}

                                                />
                                            </div>
                                            {/* <div className="mb-1">
                                                <Label className="form-label" htmlFor="artist_type">*Artist Type</Label>
                                                <div className="antd_select">

                                                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                        name="artist_type"
                                                        placeholder="Select Artist Type"

                                                        value={formData.artist_type}
                                                        onChange={(value) => setFormData({ ...formData, artist_type: value })}
                                                        required
                                                    >
                                                        <Select.Option value="" disabled>Select</Select.Option>
                                                        <Select.Option value="Artist">Artist</Select.Option>
                                                        <Select.Option value="Podcaster">Podcaster</Select.Option>
                                                        <Select.Option value="Narrator">Narrator</Select.Option>
                                                        <Select.Option value="Writer">Writer</Select.Option>
                                                    </Select>
                                                </div>
                                            </div> */}
                                            {/* <div className="mb-3">
                                            <Label className="form-label" htmlFor="artist_show_count">*Artist Count</Label>
                                            <input
                                                name="artist_show_count"
                                                placeholder="Type"
                                                type="text"
                                                className="form-control"
                                                id="artist_show_count"
                                                value={formData.artist_show_count}
                                                onChange={(e) => setFormData({ ...formData, artist_show_count: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <Label className="form-label" htmlFor="artist_episode_count">*Artist Episode Count</Label>
                                            <input
                                                name="artist_episode_count"
                                                placeholder="Type"
                                                type="text"
                                                className="form-control"
                                                id="artist_episode_count"
                                                value={formData.artist_episode_count}
                                                onChange={(e) => setFormData({ ...formData, artist_episode_count: e.target.value })}
                                                required
                                            />
                                        </div> */}
                                            {/* <div className="mb-1">
                                                <Label className="form-label" htmlFor="user_id">*User</Label>
                                                <div className="antd_select">

                                                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                        name="user_id"
                                                        placeholder="Select User"

                                                        value={formData.user_id}
                                                        onChange={(value) => {
                                                            setFormData({ ...formData, user_id: value });
                                                        }}
                                                        required
                                                    >
                                                        <Select.Option value="" disabled>Select</Select.Option>
                                                        {users.map((user) => (
                                                            <Select.Option key={user.user_id} value={user.user_id}>
                                                                {user.firstName}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </div>
                                            </div> */}
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="artist_description">*Artist Description</Label>
                                                <textarea
                                                    name="artist_description"
                                                    placeholder="Description"
                                                    type="text"
                                                    className="form-control"
                                                    id="artist_description"
                                                    value={formData.artist_description}
                                                    onChange={(e) => setFormData({ ...formData, artist_description: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            {/* <div className="mb-1">
                                                <Label className="form-label" htmlFor="validationCustom01">*Shows</Label>
                                                {formData.artist_shows.map((show, index) => (
                                                    <div key={index} className="mb-1">

                                                        <div className="antd_select mb-2">

                                                            <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                                name="show_id"
                                                                placeholder="Select Show"

                                                                value={selectedShowId}
                                                                onChange={(value) => {
                                                                    console.log('Selected Show ID:', value);
                                                                    setSelectedShowId(value);
                                                                    handleShowChange(value, index, "show_id")
                                                                }}
                                                                options={showOptions}
                                                            />
                                                        </div>


                                                        <Button type="button" className="removeButton  mb-2" onClick={() => removeShow(index)}>Remove</Button>

                                                    </div>
                                                ))}

                                            </div>
                                            <Button type="button" color="primary" className=" btn--primar mb-2 " onClick={addShow}>Add Show</Button>
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="validationCustom01">*Episodes</Label>
                                                {formData.artist_episodes.map((episode, index) => (
                                                    <div key={index}>
                                                        <div className="antd_select mb-2">
                                                            <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                                name={`episode_id_${index}`}
                                                                placeholder="Select Episode"

                                                                value={episode.episode_id}
                                                                onChange={(value) => handleEpisodeChange(value, index, "episode_id")}
                                                                options={episodeOptions}
                                                            />
                                                        </div>
                                                        <Button type="button" className="removeButton  mb-2" onClick={() => removeEpisode(index)}>Remove</Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button type="button" color="primary" className="btn--primar mt-2" onClick={addEpisode}>Add Episode</Button> */}
                                            <FormGroup className="mb-0">
                                                <div>
                                                    <Button type="submit" color="primary" className="btn--primar me-1" style={{ marginTop: "13px", fontSize: "16px" }}>
                                                        Add Artist
                                                    </Button>
                                                    <Button onClick={handleModalCancel} className="btn--primary " style={{ marginTop: "13px", fontSize: "16px" }}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </FormGroup>
                                        </form>
                                        <Modal
                                            isOpen={showSuccessModal}
                                            toggle={handleModalCancel}
                                            centered={true}
                                        >
                                            <ModalHeader toggle={handleModalCancel}>Success</ModalHeader>
                                            <ModalBody>
                                                Artist added successfully.
                                            </ModalBody>
                                            <div className="modal-footer">
                                                <Button color="primary" onClick={handleOk}>
                                                    OK
                                                </Button>
                                                <Button color="secondary" onClick={handleModalCancel}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </Modal>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>


                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default AddArtist;


