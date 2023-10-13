import React, { useState, useEffect } from "react";
import AWS from 'aws-sdk';
import { message } from 'antd';
import { withRouter } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, Modal, ModalHeader, ModalBody } from "reactstrap";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { HuePicker } from 'react-color';
import deFaultimg from "../../assets/images/default_img.jpeg"

function AddCate(props) {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const defaultImageURL = deFaultimg;
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        category_name: "",
        category_slug: "",
        category_color: "",
        category_image: defaultImageURL,
        category_icon: defaultImageURL,
        category_banner: defaultImageURL,
        category_description: "",
        sub_category: []
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [color, setColor] = useState(formData.category_color);
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);


    AWS.config.update({
        accessKeyId: process.env.REACT_APP_BUCKET_KEY,
        secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_BUCKET_REGION
    });
    const s3 = new AWS.S3();


    useEffect(() => {
        fetch(`${apiEndpoint}/api/showcategory`)
            .then(response => response.json())
            .then(data => {
                console.log("data>>>>>>", data.result.data)
                setOptions(data.result.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, [apiEndpoint]);

    const handleDropdownChange = (selectedValue) => {
        setSelectedOption(selectedValue);

        if (selectedValue) {
            // When a category is selected, send the full object
            const selectedCategory = options.find(category => category.category_name === selectedValue);
            setFormData(prevFormData => ({
                ...prevFormData,
                sub_category: [
                    ...prevFormData.sub_category,
                    {
                        sub_category_name: formData.category_name,
                        sub_category_slug: formData.category_slug,
                        sub_category_color: formData.category_color,
                        sub_category_image: formData.category_image,
                        sub_category_icon: formData.category_icon,
                        sub_category_banner: formData.category_banner,
                        sub_category_description: formData.category_description
                    }
                ],
            }));
        } else {
            // When "None" is selected, send an empty array
            setFormData(prevFormData => ({
                ...prevFormData,
                sub_category: []
            }));
        }
    };



    useEffect(() => {
        const showSlug = formData.category_name?.toLowerCase().replace(/^\s+/, '').replace(/ /g, "-");
        setFormData((prevFormData) => ({
            ...prevFormData,
            category_slug: showSlug,
        }));
    }, [formData.category_name]);

    const handleSubmit = (event) => {
        event.preventDefault();
        fetch(`${apiEndpoint}/api/showcategory`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
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
    const handleFileChange = (event, fieldName) => {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected.');

            return;
        }
        const fileType = file?.type.split('/')[1];
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

    const handleModalCancel = () => {
        // Close the modal and reset form data
        setFormData({
            category_name: "",
            category_slug: "",
            category_color: "",
            category_image: defaultImageURL,
            category_icon: defaultImageURL,
            category_banner: defaultImageURL,
            category_description: "",
            sub_category: []
        });
        setShowSuccessModal(false);
    }
    const handleOk = () => {
        setFormData({
            category_name: "",
            category_slug: "",
            category_color: "",
            category_image: defaultImageURL,
            category_icon: defaultImageURL,
            category_banner: defaultImageURL,
            category_description: "",
            sub_category: []
        });
        props.history.push("/view/category");

    }
    const handleColorChange = (color) => {
        setColor(color.hex);
        setFormData({ ...formData, category_color: color.hex });
    }

    const handleInputChange = (e) => {
        const newColor = e.target.value;
        setColor(newColor);
        handleColorChange(newColor);
    };
    const handleEpisodeChange = (event, index, field) => {
        const { value } = event.target;
        setFormData(prevFormData => {
            const updatedEpisodes = [...prevFormData.sub_category];
            updatedEpisodes[index][field] = value;
            return {
                ...prevFormData,
                sub_category: updatedEpisodes,
            };
        });
    }
    const addEpisode = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            sub_category: [...prevFormData.sub_category, { sub_category_name: "", sub_category_description: "" }],
        }));
    }

    const removeEpisode = (index) => {
        setFormData(prevFormData => {
            const updatedEpisodes = [...prevFormData.sub_category];
            updatedEpisodes.splice(index, 1);
            return {
                ...prevFormData,
                sub_category: updatedEpisodes,
            };
        });
    }
    return (
        <React.Fragment>
            <div className="page-content" >
                <div className="main--content-container">
                    <div className="main--content">
                        <Breadcrumbs breadcrumbItems={[
                            { title: "Category", link: "/view/category" },
                            { title: "Add Category", link: "#" },
                        ]} />
                        <h2 className="podcast-title mb-lg-4">Add Category</h2>
                        <Row>
                            <Col xs={12}>
                                <Card>
                                    <CardBody>
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="category_name">*Category Name</Label>
                                                <input
                                                    name="category_name"
                                                    placeholder="Name"
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    id="category_name"
                                                    value={formData.category_name}
                                                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="category_color">*Category Color</Label>
                                                <HuePicker
                                                    styles={{ width: "1202px", height: "16px" }}
                                                    color={formData.category_color}
                                                    onChange={handleColorChange}
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.category_color}
                                                    onChange={(e) => setFormData({ ...formData, category_color: e.target.value })}
                                                    placeholder="Color"
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="category_image">*Image</Label>
                                                <div>
                                                    {formData?.category_image?.length !== 0 ? (
                                                        <img
                                                            src={formData.category_image}
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
                                                    name="category_image"
                                                    placeholder="Image"
                                                    type="file"
                                                    className="form-control"

                                                    id="category_image"
                                                    onChange={(event) => handleFileChange(event, 'category_image')}
                                                />

                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="category_icon">*Icon</Label>
                                                <div>
                                                    {formData?.category_icon?.length !== 0 ? (
                                                        <img
                                                            src={formData.category_icon}
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
                                                    name="category_icon"
                                                    placeholder="Image"
                                                    type="file"
                                                    className="form-control"

                                                    id="category_icon"
                                                    onChange={(event) => handleFileChange(event, 'category_icon')}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="category_banner">*Banner</Label>
                                                <div className="tooltip-text">Used in Audiopitara website pages as
                                                    category’s feature image. Ensure the image uploaded is 1920x1080 in dimension and size is below
                                                    500kb.</div>
                                                <div>
                                                    {formData?.category_banner?.length !== 0 ? (
                                                        <img
                                                            src={formData.category_banner}
                                                            style={{ height: "auto", width: "250px", padding: "10px", height: "200px" }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={defaultImageURL}
                                                            style={{ height: "auto", width: "250px", padding: "10px" }}
                                                        />
                                                    )}
                                                </div>
                                                <input
                                                    name="category_banner"
                                                    placeholder="Image"
                                                    type="file"
                                                    className="form-control"

                                                    id="category_banner"
                                                    onChange={(event) => handleFileChange(event, 'category_banner')}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="category_description">*Category Description</Label>
                                                <textarea
                                                    name="category_description"
                                                    placeholder="Description"
                                                    className="form-control"
                                                    required
                                                    id="category_description"
                                                    value={formData.category_description}
                                                    onChange={(e) => setFormData({ ...formData, category_description: e.target.value })}
                                                />
                                            </div>


                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="sub_category">Parent Category</Label>
                                                <div className="antd_select">
                                                <select style={{ width: "100%", border: "0px", lineheight: "2", marginTop: "-9px" }}
                                                    id="sub_category"
                                                    className="antd_select"
                                                    value={selectedOption}
                                                    onChange={(e) => handleDropdownChange(e.target.value)}
                                                >
                                                    <option value="">None</option>
                                                    {Array.isArray(options) && options.map((option) => (
                                                        <option key={option.category_name} value={option.category_name}>
                                                            {option.category_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                </div>
                                            </div>





                                            {/* <div className="mb-1">
                                                <Label className="form-label" htmlFor="validationCustom01">*Sub Category</Label>

                                                {formData.sub_category?.map((category, index) => (
                                                    <div key={index}>
                                                        <input
                                                            name={`sub_category_name_${index}`}
                                                            placeholder="Name"
                                                            type="text"
                                                            className="form-control mb-2"
                                                            id={`sub_category_name_${index}`}
                                                            value={category.sub_category_name}
                                                            onChange={e => handleEpisodeChange(e, index, "sub_category_name")}
                                                        />
                                                        <input
                                                            name={`sub_category_description_${index}`}
                                                            placeholder="Description"
                                                            type="text"
                                                            className="form-control mb-2"
                                                            id={`sub_category_description_${index}`}
                                                            value={category.sub_category_description}
                                                            onChange={e => handleEpisodeChange(e, index, "sub_category_description")}
                                                        />
                                                        <Button type="button" className="removeButton  mb-2" onClick={() => removeEpisode(index)}>Remove</Button>
                                                    </div>
                                                ))}
                                            </div> */}
                                            {/* <div style={{ marginBottom: "20px" }}>
                                                <Button type="button" color="primary" className="btn--primar mt-2" onClick={addEpisode}>Add Sub Category</Button>
                                            </div> */}

                                            <FormGroup className="mb-0">
                                                <div>
                                                    <Button type="submit" color="primary" className="me-1" >
                                                        Add Category
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
                                                Form submitted successfully.
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
export default withRouter(AddCate);


