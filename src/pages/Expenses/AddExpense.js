import React, { useState } from "react";
import AWS from 'aws-sdk';
import { message, DatePicker, Form, Input } from 'antd';
import { withRouter } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, Modal, ModalHeader, ModalBody } from "reactstrap";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import noProImage from '../../assets/images/noProfile.jpg'

const { Item } = Form;

function AddExpense(props) {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        amount: "",
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        fetch(`${apiEndpoint}/api/voter/update-price`, {
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


    const handleModalCancel = () => {
        // Close the modal and reset form data
        setFormData({
            amount: "",
        });
        setShowSuccessModal(false);
    }

    const handleOk = () => {
        setFormData({
            amount: "",
        });
        props.history.push("/expense/view-expense");
    }
    return (
        <React.Fragment>
            <div className="page-content" >
                <div className="main--content-container">
                    <div className="main--content">
                        {/* <Breadcrumbs breadcrumbItems={[
                            { title: "Users", link: "/view/users" },
                            { title: "Add Users", link: "#" },
                        ]} /> */}
                        <h2 className="podcast-title mb-lg-4">Add Amount</h2>
                        <Row>
                            <Col xs={12}>
                                <Card>
                                    <CardBody>
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-1">
                                                <Label className="form-label" htmlFor="amount">*amount</Label>
                                                <input
                                                    name="amount"
                                                    placeholder="amount"
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    id="amount"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                />
                                            </div>
                                            <FormGroup >
                                                <div >
                                                    <button type="submit"  style={{ marginTop: "13px", fontSize: "16px", backgroundColor:"rgb(118, 201, 228)" }}>
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

export default withRouter(AddExpense);
