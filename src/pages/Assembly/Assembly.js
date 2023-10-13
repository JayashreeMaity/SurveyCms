import React, { useState, useEffect } from "react";
import AWS from 'aws-sdk';
import { message, DatePicker, Form, Input, Select } from 'antd';
import { withRouter } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, Modal, ModalHeader, ModalBody } from "reactstrap";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import noProImage from '../../assets/images/noProfile.jpg'

const { Item } = Form;

function Assembly(props) {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const defaultImage = noProImage;
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        user_id: '',
        constituency: '',
    });
    const [users, setUsers] = useState([]);
    const [booths, setBooths] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${apiEndpoint}/api/voter/getAllUsers`);
                const data = await response.json();
                console.log("sortedData", data)

                if (response.ok) {
                    setUsers(data);
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
        const fetchBooth = async () => {
            try {
                const response = await fetch(`${apiEndpoint}/api/voter/getBooth`);
                const data = await response.json();
                console.log("sortedData", data)

                if (response.ok) {
                    setBooths(data);
                    setLoading(false);
                } else {
                    console.error('Error fetching data:', data);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchBooth();
    }, []);
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

        fetch(`${apiEndpoint}/api/voter/Allocater`, {
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
            user_id: '',
            constituency: '',
        });
        setShowSuccessModal(false);
    }

    const handleOk = () => {
        setFormData({
            user_id: '',
            constituency: '',
        });
        // props.history.push("/view/users");
    }
    const uniqueConstituencies = Array.from(new Set(booths.map(booth => booth.constituency)));

    return (
        <React.Fragment>
            <div className="page-content" >
                <div className="main--content-container">
                    <div className="main--content">
                        {/* <Breadcrumbs breadcrumbItems={[
                            { title: "Users", link: "/view/users" },
                            { title: "Add Users", link: "#" },
                        ]} /> */}
                        <h2 className="podcast-title mb-lg-4">Assembly Allocate</h2>
                        <Row>
                            <Col xs={12}>
                                <Card>
                                    <CardBody>
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="user_id">User Id</Label>
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
                                                        <Select.Option style={{ border: "0px", height: "35px" }}

                                                            key={user.user_id} value={user.user_id}>
                                                            {user.user_id}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </div>
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="constituency">*constituency</Label>
                                                <Select
                                                    style={{ width: "100%", border: "5px", lineheight: "2" }}
                                                    name="constituency"
                                                    placeholder="Select Constituency"
                                                    // value={formData.constituency}
                                                    onChange={(value) => {
                                                        setFormData({ ...formData, constituency: value });
                                                    }}
                                                    mode="multiple"
                                                    required
                                                >
                                                    {/* <Select.Option value="" disabled>Select</Select.Option> */}
                                                    {uniqueConstituencies.map((uniqueConstituency) => (
                                                        <Select.Option style={{ border: "0px", height: "35px" }}
                                                            key={uniqueConstituency} value={uniqueConstituency}>
                                                            {uniqueConstituency}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </div>


                                            <FormGroup >
                                                <div >
                                                    <Button type="submit" color="primary" className="btn--primar me-1" style={{ marginTop: "13px", fontSize: "16px" }}>
                                                        Submit
                                                    </Button>
                                                </div>
                                            </FormGroup>
                                        </form>
                    
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

export default withRouter(Assembly);
