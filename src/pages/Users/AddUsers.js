import React, { useState } from "react";
import AWS from 'aws-sdk';
import { message, DatePicker, Form, Input } from 'antd';
import { withRouter } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, Modal, ModalHeader, ModalBody } from "reactstrap";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import noProImage from '../../assets/images/noProfile.jpg'

const { Item } = Form;

function AddUsers(props) {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const defaultImage = noProImage;
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        mobile_number: "",
        parent_id: "",
        categories: null,
    });
    const handleDateChange = (date) => {
        setFormData({ ...formData, dateOfBirth: date });
    };
    AWS.config.update({
        accessKeyId: process.env.REACT_APP_BUCKET_KEY,
        secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_BUCKET_REGION
    });
    const s3 = new AWS.S3();

    const handleSubmit = (event) => {
        event.preventDefault();
        // Call your API endpoint here using the 'formData' object

        fetch(`${apiEndpoint}/api/voter/add-user`, {
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
            return;
        }
        const img = new Image();
        img.onload = async () => {
            if (img.width > 3000 || img.height > 3000) {

                message.error('Image dimensions should be 3000x3000 pixels or less.');
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
    };


    const handleModalCancel = () => {
        // Close the modal and reset form data
        setFormData({
            username: "",
            password: "",
            mobile_number: "",
            parent_id: "",
            categories: null,
        });
        setShowSuccessModal(false);
    }

    const handleOk = () => {
        setFormData({
            username: "",
            password: "",
            mobile_number: "",
            parent_id: "",
            categories: null,
        });
        props.history.push("/view/users");
    }
    return (
        <React.Fragment>
            <div className="page-content" >
                <div className="main--content-container">
                    <div className="main--content">
                        <Breadcrumbs breadcrumbItems={[
                            { title: "Users", link: "/view/users" },
                            { title: "Add Users", link: "#" },
                        ]} />
                        <h2 className="podcast-title mb-lg-4">Add Users</h2>
                        <Row>
                            <Col xs={12}>
                                <Card>
                                    <CardBody>
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="username">*Username</Label>
                                                <input
                                                    name="username"
                                                    placeholder="username"
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    id="username"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                />
                                            </div>
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="password">*Password</Label>
                                                <input
                                                    name="password"
                                                    placeholder="Password"
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    id="password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="mobile_number">*Phone Number</Label>
                                                <input
                                                    name="mobile_number"
                                                    placeholder="Phone Number"
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    id="mobile_number"
                                                    value={formData.mobile_number}
                                                    onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                                                />
                                            </div>
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="parent_id">*Parent Id</Label>
                                                <input
                                                    name="parent_id"
                                                    placeholder="Last Name"
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    id="parent_id"
                                                    value={formData.parent_id}
                                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                                />
                                            </div>
                                            {/* <div className="mb-1">
                                                <Label className="form-label" htmlFor="categories">*Categories</Label>
                                                <input
                                                    name="categories"
                                                    placeholder="categories"
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    id="categories"
                                                    value={formData.categories}
                                                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                                                />
                                            </div> */}
                                           
                                           
                                           
                                           
                                            <FormGroup >
                                                <div >
                                                    <button type="submit" style={{ marginTop: "13px", fontSize: "16px",backgroundColor:"#82c3a8" }}>
                                                        Submit
                                                    </button>
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
                                                User added successfully.
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

export default withRouter(AddUsers);
