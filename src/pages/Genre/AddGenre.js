import React, { useState, useEffect } from "react";
import AWS from 'aws-sdk';
import { message, } from 'antd';
import { withRouter } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, Modal, ModalHeader, ModalBody } from "reactstrap";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import deFaultimg from "../../assets/images/default_img.jpeg"
import { HuePicker } from 'react-color';

function AddGenre(props) {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const defaultImageURL = deFaultimg;
    const [formData, setFormData] = useState({
        genre_name: "",
        genre_slug: "",
        genre_color: "",
        genre_image: defaultImageURL,
        genre_icon: defaultImageURL,
        genre_banner: defaultImageURL,
        genre_description: "",
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState(null);
    const [color, setColor] = useState(formData.genre_color);

    AWS.config.update({
        accessKeyId: process.env.REACT_APP_BUCKET_KEY,
        secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_BUCKET_REGION
    });
    const s3 = new AWS.S3();

    useEffect(() => {
        const showSlug = formData.genre_name?.toLowerCase().replace(/^\s+/, '').replace(/ /g, "-");
        setFormData((prevFormData) => ({
            ...prevFormData,
            genre_slug: showSlug,
        }));
    }, [formData.genre_name]);
    
    const handleSubmit = (event) => {
        event.preventDefault();
        // Call your API endpoint here using the 'formData' object

        fetch(`${apiEndpoint}/api/genres`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData), // Use the form data here
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === false && data.statusCode === 500) {

                    setError(data.message);
                } else {
                    console.log(data);
                    setShowSuccessModal(true);
                }
            })

            .catch(error => {
                console.error(error); // Handle error
                setError('Playlist you are tyring to add is already registered .');

            });
    }
    const handleModalCancel = () => {
        // Close the modal and reset form data
        setFormData({
            genre_name: "",
            genre_slug: "",
            genre_color: "",
            genre_image: defaultImageURL,
            genre_icon: defaultImageURL,
            genre_banner: defaultImageURL,
            genre_description: "",
        });
        setShowSuccessModal(false);
    }

    const handleOk = () => {
        setFormData({
            genre_name: "",
            genre_slug: "",
            genre_color: "",
            genre_image: defaultImageURL,
            genre_icon: defaultImageURL,
            genre_banner: defaultImageURL,
            genre_description: "",
        });
        props.history.push("/view/genre-list");
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
    const handleColorChange = (color) => {
        setColor(color.hex);
        setFormData({ ...formData, genre_color: color.hex });
    }

    return (
        <React.Fragment>
            <div className="page-content" >
                <div className="main--content-container">
                    <div className="main--content">
                        <Breadcrumbs breadcrumbItems={[
                            { title: "Genre", link: "/view/genre-list" },
                            { title: "Add Genre", link: "#" },
                        ]} />
                        <h2 className="podcast-title mb-lg-4">Add Genre</h2>
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
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="genre_name">*Genre Name</Label>
                                                <input
                                                    name="genre_name"
                                                    placeholder="genre name"
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    id="genre_name"
                                                    value={formData.genre_name}
                                                    onChange={(e) => setFormData({ ...formData, genre_name: e.target.value })}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="genre_color">*Color</Label>
                                                <HuePicker styles={{ width: "1202px", height: "16px" }}
                                                    color={formData.genre_color}
                                                    onChange={handleColorChange}
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.genre_color}
                                                    onChange={(e) => setFormData({ genre_color: e.target.value })}
                                                    placeholder="Color"
                                                    className="form-control"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="genre_image">*Image</Label>
                                                <div>
                                                    {formData?.genre_image?.length !== 0 ? (
                                                        <img
                                                            src={formData.genre_image}
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
                                                    name="genre_image"
                                                    placeholder="Image"
                                                    type="file"
                                                    className="form-control"

                                                    id="genre_image"
                                                    onChange={(event) => handleFileChange(event, 'genre_image')}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="genre_icon">*Icon</Label>
                                                <div>
                                                    {formData?.genre_icon?.length !== 0 ? (
                                                        <img
                                                            src={formData.genre_icon}
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
                                                    name="genre_icon"
                                                    placeholder="Image"
                                                    type="file"
                                                    className="form-control"

                                                    id="genre_icon"
                                                    onChange={(event) => handleFileChange(event, 'category_icon')}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="genre_banner">*Banner</Label>
                                                <div>
                                                    {formData?.genre_banner?.length !== 0 ? (
                                                        <img
                                                            src={formData.genre_banner}
                                                            style={{ height: "auto", width: "250px", padding: "10px" }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={defaultImageURL}
                                                            style={{ height: "auto", width: "250px", padding: "10px" }}
                                                        />
                                                    )}
                                                </div>
                                                <input
                                                    name="genre_banner"
                                                    placeholder="Image"
                                                    type="file"
                                                    className="form-control"

                                                    id="genre_banner"
                                                    onChange={(event) => handleFileChange(event, 'genre_banner')}
                                                />
                                            </div>
                                            {/* <div className="mb-3">
                                            <Label className="form-label" htmlFor="language_image">*Image</Label>
                                            <input
                                                name="language image"
                                                placeholder="Image"
                                                type="file"
                                                className="form-control"
                                                required
                                                id="language_image"
                                                onChange={(event) => handleFileChange(event, 'language_image')}
                                            />
                                        </div> */}
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="genre_description">*Genre Description</Label>
                                                <textarea
                                                    name="genre_description"
                                                    placeholder="Description"
                                                    className="form-control"
                                                    required
                                                    id="genre_description"
                                                    value={formData.genre_description}
                                                    onChange={(e) => setFormData({ ...formData, genre_description: e.target.value })}
                                                />
                                            </div>

                                            <FormGroup className="mb-0">
                                                <div>
                                                    <Button type="submit" color="primary" className="btn--primar me-1">
                                                        Create Genre
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
                                                Genre added successfully.
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

export default withRouter(AddGenre);




