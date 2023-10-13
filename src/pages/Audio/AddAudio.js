import React, { Component } from "react";
import AWS from 'aws-sdk';
import { message, Modal } from 'antd';

import { Row, Col, Card, CardBody, FormGroup, Button, Label, Input, Container, InputGroup, Form } from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";

//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';

class AddAudio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            breadcrumbItems: [
                { title: "Audio", link: "#" },
                { title: "Add Audio", link: "#" },
            ],
            fnm: false,
            lnm: false,
            unm: false,
            city: false,
            stateV: false,
            formData: { // Create a state object to hold form data
                title: "",
                artist: "",
                path: "",
                description: "",
                genre: "",
            }
        };
        AWS.config.update({
            accessKeyId: process.env.REACT_APP_BUCKET_KEY,
            secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
            region: process.env.REACT_APP_BUCKET_REGION
        });

        this.s3 = new AWS.S3();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.changeHandeler.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);


    }



    handleSubmit(event, errors, values) {
        if (errors.length === 0) {
            // Call your API endpoint here using the 'values' object

            fetch('http://3.6.200.239:8000/api/music', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values), // Use the form data here
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data); // Handle API response
                    Modal.confirm({
                        title: 'Success',
                        content: 'Form submitted successfully.',
                        okText: 'OK',
                        cancelText: 'Cancel',
                        onOk: () => {
                            // Clear form fields
                            this.setState({
                                formData: {
                                    title: "",
                                    artist: "",
                                    path: "",
                                    description: "",
                                    genre: "",
                                }
                            });
                        },
                        onCancel: () => {

                            // Handle cancel action if needed
                        },
                    });
                })
                .catch(error => {
                    console.error(error); // Handle error
                });
        }
    }

    handleFileChange(event, fieldName) {
        const file = event.target.files[0];
    
        const fileType = file.type.split('/')[1];
        const allowedFileTypes = ['audio/mp3']; // Only allow MP3 files
    
        if (!allowedFileTypes.includes(fileType)) {
            // Show error message for unsupported file types
            message.error('Error: Unsupported file type. Allowed type: MP3.');
            return;
        }
    
        const fileName = `${fieldName}_${Date.now()}.${fileType}`;
        const params = {
            Bucket: process.env.REACT_APP_S3_BUCKET,
            Key: fileName,
            Body: file,
            ACL: 'public-read',
        };
    
        this.s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading file:', err);
                message.error('An error occurred while uploading the file.');
            } else {
                console.log('File uploaded successfully:', data.Location);
                const fileNameWithoutURL = data.Location.split('/').pop();
    
                // Update the state with the uploaded file information
                this.setState((prevState) => ({
                    formData: {
                        ...prevState.formData,
                        [fieldName]: fileNameWithoutURL,
                    },
                }));
    
                message.success('File uploaded successfully.');
            }
        });
    }
    
    handleModalCancel = () => {
        this.setState({
            formData: {
                title: "",
                artist: "",
                path: "",
                description: "",
                genre: "",
            },
        });
    };
    
    //for change tooltip display propery
    changeHandeler(event, eleId) {
        if (event.target.value !== "")
            document.getElementById(eleId).style.display = "none";
        else
            document.getElementById(eleId).style.display = "block";
    }

    render() {
        return (
            <React.Fragment>
            {/* //     <div className="page-content">
            //         <Container fluid={true}>
            //             <Breadcrumbs title="Add Audio" breadcrumbItems={this.state.breadcrumbItems} /> */}
                       
            <div className="page-content" >
   

            <div className="main--content-container">

                <div className="main--content">

                <Row>
                            <Col xs={12}>
                                <Card>
                                    <CardBody>
                                        <AvForm onSubmit={this.handleSubmit}>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="validationCustom01">*Please Add Title</Label>
                                                <AvField ddf
                                                    name="title"
                                                    placeholder="title"
                                                    type="text"
                                                    errorMessage="Enter title"
                                                    className="form-control"
                                                    validate={{ required: { value: true } }}
                                                    id="validationCustom01"
                                                    value={this.state.formData.title || ''} // Specify the initial value
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="validationCustom01">*Please Add Artist</Label>
                                                <AvField
                                                    name="artist"
                                                    placeholder="artist"
                                                    type="text"
                                                    errorMessage="Enter Artist"
                                                    className="form-control"
                                                    validate={{ required: { value: true } }}
                                                    id="validationCustom01"
                                                    value={this.state.formData.artist || ''} // Specify the initial value
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="validationCustom01">*Path</Label>
                                                <AvField
                                                    name="path"
                                                    placeholder="path"
                                                    type="file"
                                                    errorMessage="Pick the Image"
                                                    className="form-control"
                                                    // validate={{ required: { value: true } }}
                                                    id="validationCustom01"
                                                    onChange={(event) => this.handleFileChange(event, 'path')}// Specify the initial value
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="validationCustom01">*Please Add Description</Label>
                                                <AvField
                                                    name="description"
                                                    placeholder="Description"
                                                    type="textarea"
                                                    errorMessage="Enter Description"
                                                    className="form-control"
                                                    validate={{ required: { value: true } }}
                                                    id="validationCustom01"
                                                    value={this.state.formData.description || ''} // Specify the initial value
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="validationCustom01">*Please Add Genre</Label>
                                                <AvField
                                                    name="genre"
                                                    placeholder="genre"
                                                    type="textarea"
                                                    errorMessage="Enter genre"
                                                    className="form-control"
                                                    validate={{ required: { value: true } }}
                                                    id="validationCustom01"
                                                    value={this.state.formData.genre || ''} // Specify the initial value
                                                />
                                            </div>
                                            <FormGroup className="mb-0">
                                                <div>
                                                    <Button type="submit" color="primary" className="me-1">
                                                        Submit
                                                    </Button>{" "}
                                                    {/* <Button type="reset" color="secondary">
                                                        Cancel
                                                    </Button> */}
                                                </div>
                                            </FormGroup>
                                        </AvForm>
                                        <Modal
                                            visible={this.state.showSuccessModal}
                                            onOk={this.handleModalOk}
                                            onCancel={this.handleModalCancel}
                                            okText="OK"
                                            cancelText="Cancel"
                                        >
                                            <p>Form submitted successfully.</p>
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
}

export default AddAudio;
