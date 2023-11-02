import React, { useState, useEffect } from "react";
import AWS from 'aws-sdk';
import { message, DatePicker, Form, Input, Select } from 'antd';
import { withRouter } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, ModalHeader, ModalBody, Modal } from "reactstrap";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import noProImage from '../../assets/images/noProfile.jpg'
import { setCanvasCreator } from "echarts";

const { Item } = Form;

function Assembly(props) {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const defaultImage = noProImage;
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ac, setAC] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        constituency: '',
    });
    const [users, setUsers] = useState([]);
    const [updatedAc, setUpdatedAc] = useState([]);
    const [booths, setBooths] = useState([]);

    const uniqueConstituencies = Array.from(new Set(booths.map(booth => booth?.constituency_name + `(${booth?.constituency})`)));

    const filterUser = users.length !== 0 && users.filter((data) => data.user_id == formData.user_id);

    const acFilter = filterUser[0]?.ac_no !== null && filterUser[0]?.ac_no?.split(",")?.map((data) => {
        const update = booths.find((d) => d.constituency == data)
        return update;
    });

    const updatedDetails = updatedAc !== false ? updatedAc?.map((data) => {
        const filterData = booths?.filter((d) => d?.constituency_name == data?.replace(/\(\d+\)/g, '')).map((d) => d.constituency)?.toString();
        const values = filterData.split(',');
        const updatedArr = [...new Set(values)];
        return updatedArr.join(',');
    }) : [];


    const constituencyName = updatedDetails?.map((data) => {
        const names = booths?.filter((d) => d?.constituency == data).map((d) => d.constituency_name)?.toString();
        const values = names.split(',');
        const updatedArr = [...new Set(values)];
        return updatedArr.join(',').toString();
    })


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${apiEndpoint}/api/voter/getAllUsers`);
                const data = await response.json();

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
        fetch(`${apiEndpoint}/api/voter/Allocate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: formData.user_id,
                constituency: updatedDetails?.toString(),
                name: constituencyName?.toString()
            }),
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
            });
    }

    useEffect(() => {
        if (ac) {
            setUpdatedAc(acFilter !== false && acFilter?.length !== 0 && acFilter?.map((d) => d?.constituency_name + `(${d?.constituency})`));
            setAC(false);
        }
    }, [ac])


    const handleUpdateChange = () => {
        setAC(true);
        setUpdatedAc(acFilter !== false && acFilter?.length !== 0 && acFilter?.map((d) => d?.constituency_name));
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
        // setFormData({
        //     user_id: '',
        //     constituency: '',
        // });
        // setShowSuccessModal(false);
        props.history.push("/survey/view-survey");
    }
    console.log("updatedAc>>", updatedAc)
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
                                                <Label htmlFor="user_id">User Id</Label>
                                                <div style={{ border: "solid 1px" }}>
                                                    <Select style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                        name="user_id"
                                                        placeholder="Select User"
                                                        value={formData.user_id}
                                                        onChange={(value) => {
                                                            setFormData({ ...formData, user_id: value });
                                                            handleUpdateChange()
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
                                            </div>
                                            <div className="mb-1" >
                                                <Label htmlFor="constituency">Constituency</Label>
                                                <div style={{ border: "solid 1px" }}>
                                                    <Select
                                                        style={{ width: "100%", border: "5px", lineheight: "2" }}
                                                        name="constituency"
                                                        placeholder="Select Constituency"
                                                        // value={updatedAc?.toString()?.replace(/\(\d+\)/g, '').includes(undefined) ? [] : updatedAc}
                                                        value={updatedAc ? updatedAc : []}
                                                        onChange={(value) => {
                                                            setFormData({ ...formData, constituency: value });
                                                            setUpdatedAc(value)
                                                        }}
                                                        mode="tags"
                                                        required
                                                    >
                                                        {
                                                            uniqueConstituencies.map((uniqueConstituency) => (
                                                                <Select.Option style={{ border: "0px", height: "35px" }}
                                                                    key={uniqueConstituency} value={uniqueConstituency}>
                                                                    {uniqueConstituency}
                                                                </Select.Option>
                                                            ))}
                                                    </Select>
                                                </div>
                                            </div>
                                            <FormGroup >
                                                <div >
                                                    <button type="submit" style={{ marginTop: "13px", fontSize: "14px",backgroundColor:"rgb(118, 201, 228)" }}>
                                                        Submit
                                                    </button>
                                                </div>
                                            </FormGroup>
                                        </form>
                                        <Modal
                                            isOpen={showSuccessModal}
                                            // toggle={handleModalCancel}
                                            centered={true}
                                        >
                                            <ModalHeader toggle={handleModalCancel}>Success</ModalHeader>
                                            <ModalBody>
                                                Added successfully.
                                            </ModalBody>
                                            <div className="modal-footer">
                                                <Button color="primary" onClick={handleOk}>
                                                    OK
                                                </Button>
                                                {/* <Button color="secondary" onClick={handleModalCancel}>
                                                    Cancel
                                                </Button> */}
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

export default withRouter(Assembly);
