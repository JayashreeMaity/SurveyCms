import React, { useState, useEffect } from "react";
import AWS from 'aws-sdk';
import { message, DatePicker, Form, Input, Select } from 'antd';
import { withRouter } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, ModalHeader, ModalBody, Modal } from "reactstrap";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import noProImage from '../../assets/images/noProfile.jpg';
import { setCanvasCreator } from "echarts";

const { Item } = Form;

function AssemblyAllocation(props) {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const defaultImage = noProImage;
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ac, setAC] = useState(false);
    const [formData, setFormData] = useState({
        constituency: [], // Initialize as an empty array
    });
    const [constituency, setConstituency] = useState([]);

    useEffect(() => {
        const fetchConstituency = async () => {
            try {
                const response = await fetch(`http://3.6.200.239:8500/get_all_constituency`);
                const data = await response.json();
                console.log("data>>>>>>>>>>>", data);
                if (response.ok) {
                    setConstituency(data);
                    setLoading(false);
                } else {
                    console.error('Error fetching data:', data);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchConstituency();
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const selectedConstituencies = formData.constituency.join(',');

        // Construct the URL with query parameters
        const url = `http://3.6.200.239:8500/update/?constituency=${selectedConstituencies}`;

        // Make a GET request
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Add the appropriate body data if needed
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === false && data.statusCode === 500) {
                    setError(data.message);
                } else {
                    console.log(data);
                    setShowSuccessModal(true);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const handleModalCancel = () => {
       
        setFormData({
            constituency: [], // Reset as an empty array
        });
        setShowSuccessModal(false);
    }

    const handleOk = () => {
        props.history.push("/call-center/data");
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="main--content-container">
                    <div className="main--content">
                        <h2 className="podcast-title mb-lg-4">Call Center Assembly Allocate</h2>
                        <Row>
                            <Col xs={12}>
                                <Card>
                                    <CardBody>
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-1">
                                                <Label htmlFor="constituency">Constituency</Label>
                                                <div style={{ border: "solid 1px" }}>
                                                    <Select
                                                        style={{ width: "100%", border: "0px", lineheight: "2" }}
                                                        name="constituency"
                                                        placeholder="Select"
                                                        value={formData.constituency}
                                                        onChange={(values) => {
                                                            setFormData({ ...formData, constituency: values });
                                                        }}
                                                        mode="multiple"
                                                        required
                                                    >
                                                        <Select.Option value="" disabled>Select</Select.Option>
                                                        {constituency.map((cons) => (
                                                            <Select.Option
                                                                style={{ border: "0px", height: "35px" }}
                                                                key={cons.value}
                                                                value={cons.value}
                                                            >
                                                                {cons.name}({cons.value})

                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </div>
                                            </div>

                                            <FormGroup>
                                                <div>
                                                    <Button
                                                        type="submit"
                                                        color="primary"
                                                        className="btn--primar me-1"
                                                        style={{ marginTop: "13px", fontSize: "14px" }}
                                                    >
                                                        Submit
                                                    </Button>
                                                </div>
                                            </FormGroup>
                                        </form>
                                        <Modal
                                            isOpen={showSuccessModal}
                                            centered={true}
                                        >
                                            <ModalHeader toggle={handleModalCancel}>Success</ModalHeader>
                                            <ModalBody>Added successfully.</ModalBody>
                                            <div className="modal-footer">
                                                <Button color="primary" onClick={handleOk}>
                                                    OK
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

export default withRouter(AssemblyAllocation);
