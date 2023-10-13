import React, { useState, useEffect } from "react";
import AWS from 'aws-sdk';
import { message } from 'antd';
import { withRouter } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, Modal, ModalHeader, ModalBody } from "reactstrap";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import deFaultimg from "../../assets/images/default_img.jpeg"

function AddLan(props) {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const defaultImageURL = deFaultimg;
    const [formData, setFormData] = useState({
        language_name: "",
        language_slug: "",
        language_image: defaultImageURL,
        language_banner: defaultImageURL,
        language_description: "",
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState(null);

    AWS.config.update({
        accessKeyId: process.env.REACT_APP_BUCKET_KEY,
        secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_BUCKET_REGION
    });
    const s3 = new AWS.S3();

    useEffect(() => {
        const showSlug = formData.language_name?.toLowerCase().replace(/^\s+/, '').replace(/ /g, "-");
        setFormData((prevFormData) => ({
            ...prevFormData,
            language_slug: showSlug,
        }));
    }, [formData.language_name]);

    const handleSubmit = (event) => {
        event.preventDefault();
        // Call your API endpoint here using the 'formData' object

        fetch(`${apiEndpoint}/api/languages`, {
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
                console.error(error);
                setError('Playlist you are tyring to add is already registered .');

            });
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
            language_name: "",
            language_slug: "",
            language_image: defaultImageURL,
            language_banner: defaultImageURL,
            language_description: "",
        });
        props.history.push("/view/language");
    }
    const handleModalCancel = () => {
        // Close the modal and reset form data
        setFormData({
            language_name: "",
            language_slug: "",
            language_image: defaultImageURL,
            language_banner: defaultImageURL,
            language_description: "",
        });
        setShowSuccessModal(false);
    }


    return (
        <React.Fragment>

            <div className="page-content" >
                <div className="main--content-container">
                    <div className="main--content">
                        <Breadcrumbs breadcrumbItems={[
                            { title: "Language", link: "/view/language" },
                            { title: "Add Language", link: "#" },
                        ]} />
                        <h2 className="podcast-title mb-lg-4">Add Language</h2>
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
                                                <Label className="form-label" htmlFor="language_name">*Language Name</Label>
                                                <input
                                                    name="language_name"
                                                    placeholder="language name"
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    id="language_name"
                                                    value={formData.language_name}
                                                    onChange={(e) => setFormData({ ...formData, language_name: e.target.value })}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="language_image">*Image</Label>
                                                <div>
                                                    {formData?.language_image?.length !== 0 ? (
                                                        <img
                                                            src={formData.language_image}
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
                                                    name="language image"
                                                    placeholder="Image"
                                                    type="file"
                                                    className="form-control"

                                                    id="language_image"
                                                    onChange={(event) => handleFileChange(event, 'language_image')}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="language_banner">*Banner</Label>
                                                <div>
                                                    {formData?.language_banner?.length !== 0 ? (
                                                        <img
                                                            src={formData.language_banner}
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
                                                    name="language banner"
                                                    placeholder="Image"
                                                    type="file"
                                                    className="form-control"

                                                    id="language_banner"
                                                    onChange={(event) => handleFileChange(event, 'language_banner')}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="language_description">*Language Description</Label>
                                                <textarea
                                                    name="language description"
                                                    placeholder="Description"
                                                    className="form-control"
                                                    required
                                                    id="language_description"
                                                    value={formData.language_description}
                                                    onChange={(e) => setFormData({ ...formData, language_description: e.target.value })}
                                                />
                                            </div>

                                            <FormGroup className="mb-0">
                                                <div>
                                                    <Button type="submit" color="primary" className="me-1">
                                                        Add Language
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
                                                Language added successfully.
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

export default withRouter(AddLan);




