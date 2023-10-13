import React, { useState, useEffect } from "react";
import AWS from 'aws-sdk';
import { message, Select } from 'antd';
import { Row, Col, Card, CardBody, FormGroup, Button, Label, Container, Modal, ModalHeader, ModalBody } from "reactstrap";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { useHistory } from 'react-router-dom';
import deFaultimg from "../../assets/images/default_img.jpeg"

const { Option } = Select;

const AddPlaylist = () => {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const defaultImageURL = deFaultimg;
    const history = useHistory();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        playlist_name: "",
        playlist_slug: "",
        playlist_image: defaultImageURL,
        playlist_username: "",
        user_id: "",
        artist_name: " ",
        artist_type: " ",
        show_id: null,
        is_favourite: false,
        playlist_episodes: [],
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_BUCKET_KEY,
        secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_BUCKET_REGION
    });
    useEffect(() => {
        const showSlug = formData.playlist_name?.toLowerCase().replace(/^\s+/, '').replace(/ /g, "-");
        const playlistUser = formData.user_id.toLowerCase();
        setFormData((prevFormData) => ({
            ...prevFormData,
            playlist_slug: showSlug,
            playlist_username: playlistUser,
        }));
    }, [formData.playlist_name, formData.user_id]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${apiEndpoint}/api/users/user-list`);
                const data = await response.json();
                console.log("sortedData", data.result.data)

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
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("formData", formData);
        // Your form submission logic here...
        if (formData.playlist_name && formData.playlist_image && formData.user_id) {
            fetch(`${apiEndpoint}/api/playlists`, {
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
                    setError('Playlist you are tyring to add is already registered .');
                });
        }
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
        setFormData({
            playlist_name: "",
            playlist_slug: "",
            playlist_image: defaultImageURL,
            playlist_username: "",
            user_id: "",
            playlist_episodes: [],
        });
        history.push("/view/playlist-list");

    }
    const handleModalCancel = () => {
        setFormData({
            playlist_name: "",
            playlist_slug: "",
            playlist_image: defaultImageURL,
            playlist_username: "",
            user_id: "",
            playlist_episodes: [],
        });
        setShowSuccessModal(false);
        // history.push("/view/playlist-list");
    }

    const handleEpisodeChange = (event, index, field) => {
        const { value } = event.target;
        setFormData(prevFormData => {
            const updatedEpisodes = [...prevFormData.playlist_episodes];
            updatedEpisodes[index][field] = value;
            return {
                ...prevFormData,
                playlist_episodes: updatedEpisodes,
            };
        });
    }

    const addEpisode = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            playlist_episodes: [...prevFormData.playlist_episodes, { episode_name: "", episode_duration: "" }],
        }));
    }

    const removeEpisode = (index) => {
        setFormData(prevFormData => {
            const updatedEpisodes = [...prevFormData.playlist_episodes];
            updatedEpisodes.splice(index, 1);
            return {
                ...prevFormData,
                playlist_episodes: updatedEpisodes,
            };
        });
    }

    return (
        <React.Fragment>

            <div className="page-content" >
                <div className="main--content-container">
                    <div className="main--content">
                        <Breadcrumbs breadcrumbItems={[
                            { title: "Playlist", link: "/view/playlist-list" },
                            { title: "Add Playlist", link: "#" },
                        ]} />
                        <h2 className="podcast-title mb-lg-4">Add Playlist</h2>
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
                                                <Label className="form-label" htmlFor="playlist_name">*Playlist Name</Label>
                                                <input
                                                    name="playlist_name"
                                                    placeholder="Name"
                                                    type="text"
                                                    className="form-control"
                                                    id="playlist_name"
                                                    value={formData.playlist_name}
                                                    onChange={(e) => setFormData({ ...formData, playlist_name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="playlist_image">*Playlist Image</Label>
                                                <div>
                                                    {formData?.playlist_image?.length !== 0 ? (
                                                        <img
                                                            src={formData.playlist_image}
                                                            style={{ height: "auto", width: "100px", padding: "10px" }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={defaultImageURL}
                                                            style={{ height: "auto", width: "100px", padding: "10px" }}
                                                        />
                                                    )}
                                                </div>
                                                <input
                                                    name="playlist_image"
                                                    type="file"
                                                    className="form-control"
                                                    id="playlist_image"
                                                    onChange={(event) => handleFileChange(event, 'playlist_image')}

                                                />
                                            </div>
                                            {/* <div className="mb-3">
                                            <Label className="form-label" htmlFor="playlist_username">*Playlist UserName</Label>
                                            <input
                                                name="playlist_username"
                                                placeholder="UserName"
                                                type="text"
                                                className="form-control"
                                                id="playlist_username"
                                                value={formData.playlist_username}
                                                onChange={(e) => setFormData({ ...formData, playlist_username: e.target.value })}
                                                required
                                            />
                                        </div> */}
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="user_id">*User</Label>
                                                <div className="antd_select">
                                                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                        name="user_id"
                                                        placeholder="Select User"

                                                        value={formData.user_id}
                                                        onChange={(value) => {
                                                            console.log('Selected User First Name:', value);
                                                            setFormData({ ...formData, user_id: value });
                                                        }}
                                                        required
                                                    >
                                                        <Select.Option value="" disabled>Select</Select.Option>
                                                        {users.map((user) => (
                                                            <Select.Option style={{ border: "0px", height: "35px" }}

                                                                key={user.user_id} value={user.user_id}>
                                                                {user.firstName}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </div>
                                            </div>
                                            {/* <div className="mb-1">
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
                                            {/* <div className="mb-1">
                                                <Label className="form-label" htmlFor="validationCustom01">*Episodes</Label>

                                                {formData.playlist_episodes.map((episode, index) => (
                                                    <div key={index}>
                                                        <input
                                                            name={`episode_name_${index}`}
                                                            placeholder="Episode Name"
                                                            type="text"
                                                            className="form-control mb-2"
                                                            id={`episode_name_${index}`}
                                                            value={episode.episode_name}
                                                            onChange={e => handleEpisodeChange(e, index, "episode_name")}
                                                        />
                                                        <input
                                                            name={`episode_duration_${index}`}
                                                            placeholder="Episode Duration"
                                                            type="text"
                                                            className="form-control mb-2"
                                                            id={`episode_duration_${index}`}
                                                            value={episode.episode_duration}
                                                            onChange={e => handleEpisodeChange(e, index, "episode_duration")}
                                                        />


                                                        <Button type="button" className="removeButton  mb-2" onClick={() => removeEpisode(index)}>Remove</Button>



                                                    </div>

                                                ))}


                                            </div> */}

                                            {/* <Button type="button" color="primary" className="btn--primar mt-2" onClick={addEpisode}>Add Episode</Button> */}
                                            <FormGroup className="mb-0">
                                                <div>
                                                    <Button type="submit" color="primary" className="me-1" style={{ marginTop: "13px", fontSize: "14px" }}>
                                                        Create Playlist
                                                    </Button>{" "}
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
                                                Playlist added successfully.
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

export default AddPlaylist;


