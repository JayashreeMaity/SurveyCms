import TableContainer from "../../components/Common/TableContainer";
import AWS from 'aws-sdk';

//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardBody, Container, Table, Modal, ModalHeader, ModalBody, Form, Row, Col, Label, Input, Button } from "reactstrap";
import { message, Pagination } from 'antd';
import { FormOutlined, DeleteOutlined, DashboardOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { SketchPicker, HuePicker } from 'react-color';
import { products, } from "../../common/data/ecommerce";
import axios from "axios";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
const ViewCate = () => {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedCategory, setEditedCategory] = useState(null);
    const [formData, setFormData] = useState({});
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isGridView, setIsGridView] = useState(false); // Track the view mode
    const [sortingOrder, setSortingOrder] = useState('asc'); // Initial sorting order
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [subCat, setSubCat] = useState([])
    const [subCatModalOpen, setSubCatModalOpen] = useState(false)
    const [catIndex, setCatIndex] = useState(null);
    const [color, setColor] = useState(formData.category_color);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newPageSize, newPage) => {
        setPageSize(newPageSize);
        setCurrentPage(newPage); // Reset to the first page when changing page size
    };

    // Calculate the range of items to display based on current page and page size
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);
    const { _id } = useParams();
    AWS.config.update({
        accessKeyId: process.env.REACT_APP_BUCKET_KEY,
        secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_BUCKET_REGION
    });
    const s3 = new AWS.S3();
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }
    const openCatModal = (shows) => {
        setSubCat(shows);
        setSubCatModalOpen(true);
    };

    const closeCatModal = () => {
        setCatIndex(null);
        setSubCatModalOpen(false);
    };
    useEffect(() => {
        setLoading(true);
        fetch(`${apiEndpoint}/api/showcategory`)
            .then((response) => response.json())
            .then((response) => {
                if (response.status && response.result && response.result.data) {
                    const sortedData = response.result.data.sort((a, b) => b._id.localeCompare(a._id));
                    setData(sortedData);
                    setLoading(false);
                } else {
                    console.error('Invalid response format:', response);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setLoading(false);
            });
    }, []);
    const openDeleteConfirmationModal = (_id) => {
        setUserToDelete(_id);
        setDeleteConfirmationModal(true);
    };

    // Function to close the delete confirmation modal
    const closeDeleteConfirmationModal = () => {
        setUserToDelete(null);
        setDeleteConfirmationModal(false);
    };
    const handleDelete = async (_id) => {
        // Open the custom delete confirmation modal here
        openDeleteConfirmationModal(_id);
    };

    const handleConfirmDelete = async (_id) => {
        closeDeleteConfirmationModal();
        try {
            const response = await fetch(`${apiEndpoint}/api/showcategory/${_id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Successful deletion
                console.log('Deleted successfully');
                setData((prevData) => prevData.filter((record) => record._id !== _id));
            } else {
                // Handle non-successful response
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            // Handle error
            console.error('Error:', error);
        }
    };

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
    
    const toggleAndEdit = (_id) => {
        toggleModal(); // Close the modal if open
        handleEdit(_id); // Fetch and populate data for editing
    };

    const toggleModal = useCallback(() => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    }, []);

    const breadcrumbItems = [
        { title: "Category", link: "/" },
        { title: "All Category", link: "#" },
    ]
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiEndpoint}/api/showcategory/${formData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Update the data in the state with the edited data
                setData(prevData => prevData.map(item => item._id === formData._id ? formData : item));
                setIsModalOpen(false);
                message.success('Category updated successfully.');
                console.log('Updated Data:', formData);
            } else {
                message.error('Failed to update category.');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('An error occurred while updating the category.');
        }
    };
    const handleEdit = async (_id) => {
        try {
            const response = await fetch(`${apiEndpoint}/api/showcategory/${_id}`);
            if (response.ok) {
                const categoryData = await response.json();
                setFormData(categoryData.result.data);
                setIsModalOpen(true);
            } else {
                message.error('Failed to fetch category data for editing.');
            }
            console.log("setFormData", setFormData)
        } catch (error) {
            console.error('Error:', error);
            message.error('An error occurred while fetching category data for editing.');
        }
    };
    const handleInputChange = (event) => {
        const { id, value } = event.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [id]: value,
        }));
    };
    const handleColorChange = (color) => {
        setColor(color.hex);
        setFormData({ ...formData, category_color: color.hex });
    }
    const handleGridViewClick = () => {
        setIsGridView(true);
    };
    const handleListViewClick = () => {
        setIsGridView(false);
    };
    const toggleSortingOrder = () => {
        if (data.length > 0) {
            const newOrder = sortingOrder === 'asc' ? 'desc' : 'asc';
            setSortingOrder(newOrder);

            // Sort the data based on the selected sorting order
            const sortedData = [...data].sort((a, b) => {
                if (newOrder === 'asc') {
                    return (a.category_image || '').localeCompare(b.category_image || '');
                } else {
                    return (b.category_image || '').localeCompare(a.category_image || '');
                }
            });

            setData(sortedData);
        }
    };
    return (
        <React.Fragment>
            <div className="page-content" >
                <div className="main--content-container">
                    <div className="main--content">
                        <div className="category__layout view__podcast__table ">
                            <div className="category__container ">
                                <h2 className="podcast-title mb-lg-4">Category</h2>
                                <div className="view-header row mb-6 mb-lg-2">
                                    <div className="col-md-6">
                                        <Link to='/add/category'><Button className="hover--white btn--primary">Add Category</Button></Link>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="toggle-view-buttons-b">
                                            <div className="float-end d-none d-lg-block">
                                                <div className="btn-group box__flex">
                                                    <span
                                                        className={`toggle-view-button-b mr-2 ${isGridView ? "" : "active"}`}
                                                        onClick={handleListViewClick}
                                                    >
                                                        <UnorderedListOutlined className="toggle-icon-t" />
                                                    </span>
                                                    <span
                                                        className={`toggle-view-button-b ${!isGridView ? "" : "active"}`}
                                                        onClick={handleGridViewClick}
                                                    >
                                                        <AppstoreOutlined className="toggle-icon-t" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="category__card__area">
                                    {data.sort((a, b) => b._id.localeCompare(a._id)).map((category) => (
                                        <div key={category._id} className="category__card"  >
                                            <img src={category.category_image} alt="category_image" className="category__cardimage" />
                                            <div className="category__card__details">
                                                <div className="contant">
                                                    <h4>{category.category_name}</h4>
                                                    <p>{category.category_description}</p>
                                                </div>
                                            </div>
                                            <div className="category__card__icons">
                                                <span
                                                    className="action__icon"
                                                    onClick={() => toggleAndEdit(category._id)}
                                                >
                                                    <FormOutlined />
                                                </span>
                                                <span
                                                    className="action__icon"
                                                    onClick={() => handleDelete(category._id)}
                                                >
                                                    <DeleteOutlined />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div> */}
                                {isGridView ? (
                                    <div className="category__card__area">
                                        {data.sort((a, b) => b._id.localeCompare(a._id)).map((category) => (
                                            <div key={category._id} className="category__card"  >
                                                <img src={category.category_image} alt="category_image" className="category__cardimage" />
                                                <div className="category__card__details">
                                                    <div className="contant">
                                                        <h4>{category.category_name}</h4>
                                                        <p>{category.category_description}</p>
                                                    </div>
                                                </div>
                                                <div className="category__card__icons">
                                                    <span
                                                        className="action__icon"
                                                        onClick={() => toggleAndEdit(category._id)}
                                                    >
                                                        <FormOutlined />
                                                    </span>
                                                    <span
                                                        className="action__icon"
                                                        onClick={() => handleDelete(category._id)}
                                                    >
                                                        <DeleteOutlined />
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div>
                                        <Table striped responsive>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <span className="img__width">
                                                            Image{" "}
                                                            <span
                                                                className="sorting-icon"
                                                                onClick={toggleSortingOrder}
                                                            >
                                                                {sortingOrder === 'asc' ? (
                                                                    <FontAwesomeIcon icon={faCaretDown} />
                                                                ) : (
                                                                    <FontAwesomeIcon icon={faCaretUp} />
                                                                )}
                                                            </span>
                                                        </span>
                                                    </th>
                                                    <th><span className="name__width">Category Name</span></th>
                                                    <th><span className="lg_description__width">Category Description</span></th>
                                                    <th><span className="lg_description__width">Sub Category</span></th>
                                                    <th><span className="actions__width">Actions</span></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((item) => (
                                                    <tr className="hover__none" key={item._id}>
                                                        <td>
                                                            <span className="img__width">
                                                                <img
                                                                    src={item.category_image || 'N/A'}
                                                                    alt="category_image"
                                                                    width="70"
                                                                    height="auto"
                                                                />
                                                            </span>
                                                        </td>
                                                        <td><span className="name__width">{item.category_name || 'N/A'}</span></td>
                                                        <td><span className="lg_description__width">{item.category_description || 'N/A'}</span></td>
                                                        <td>
                                                            <span className="episodes__width">
                                                                <span className="bg-click-style"
                                                                    style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                    onClick={() => openCatModal(item.sub_category)}
                                                                >
                                                                    {item.sub_category ? item.sub_category.length : 'N/A'}
                                                                </span>
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="actions__width">
                                                                <div className="flex-icon-row">
                                                                    <span className="edit__icon"
                                                                        style={{ cursor: 'pointer', marginRight: '10px' }}
                                                                        onClick={() => toggleAndEdit(item._id)}
                                                                    >
                                                                        <FormOutlined />
                                                                    </span>
                                                                    <span className="delete__icon"
                                                                        style={{ cursor: 'pointer', color: 'red' }}
                                                                        onClick={() => handleDelete(item._id)}
                                                                    >
                                                                        <DeleteOutlined />
                                                                    </span>
                                                                </div>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        <Pagination
                                            current={currentPage}
                                            pageSize={pageSize}
                                            total={totalItems}
                                            onChange={handlePageChange}
                                            onShowSizeChange={handlePageSizeChange}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                size="lg"
                isOpen={isModalOpen}
                centered={true}
                toggle={toggleModal}
            >
                <ModalHeader toggle={toggleModal}>Edit Category</ModalHeader>
                <ModalBody className="input__add__h_35 scroll-y--auto">
                    <Form>
                        <Row  >
                            <div className="mb-1">
                                <Label className="form-label" htmlFor="category_name">Category Name</Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="category_name"
                                    placeholder="Enter Category Name"
                                    value={formData.category_name}
                                    onChange={handleInputChange} // Handle input change
                                />
                            </div>
                            <div className="mb-1">
                                <Label className="form-label" htmlFor="category_slug">Category Slug</Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="category_slug"
                                    placeholder="Enter Category Slug"
                                    value={formData.category_slug}
                                    onChange={handleInputChange} // Handle input change
                                />
                            </div>
                            <div className="mb-1">
                                <Label className="form-label" htmlFor="category_image">Category Image</Label>

                                <div className="img_show_area" style={{ marginBottom: "5px" }}>
                                    {formData?.category_image?.length !== 0 && (
                                        <img
                                            src={formData.category_image} style={{ height: "100px", padding: "5px", marginBottom: "5px" }} />
                                    )}
                                </div>

                                <Input
                                    type="file"
                                    className="form-control"
                                    id="category_image"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "category_image")}
                                />
                            </div>
                            <div className="mb-1">
                                <Label className="form-label" htmlFor="category_icon">Category Icon</Label>

                                <div className="img_show_area" style={{ marginBottom: "5px" }}>
                                    {formData?.category_icon?.length !== 0 && (
                                        <img
                                            src={formData.category_icon} style={{ height: "100px", padding: "5px", marginBottom: "5px" }} />
                                    )}
                                </div>
                                <Input
                                    type="file"
                                    className="form-control"
                                    id="category_icon"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "category_icon")}
                                />
                            </div>
                            <div className="mb-1">
                                <Label className="form-label" htmlFor="category_banner">Category Banner</Label>

                                <div className="img_show_area" style={{ marginBottom: "5px",height: "150px", width: "202px" }}>
                                    {formData?.category_banner?.length !== 0 && (
                                        <img
                                            src={formData.category_banner} style={{ height: "100px", padding: "5px", marginBottom: "5px" }} />
                                    )}
                                </div>

                                <Input
                                    type="file"
                                    className="form-control"
                                    id="category_banner"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "category_banner")}
                                />
                            </div>
                            {/* <div className="mb-1">
                                <Label className="form-label" htmlFor="category_color">Category Color</Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="category_color"
                                    placeholder="Enter Color"
                                    value={formData.category_color}
                                    onChange={handleInputChange} // Handle input change
                                />
                            </div> */}
                            {/* <div className="mb-3">
                                <Label className="form-label" htmlFor="category_color">*Category Color</Label>
                                <SketchPicker
                                    color={formData.category_color}
                                    onChangeComplete={handleColorChange}
                                    value={formData.category_color}

                                />
                            </div> */}
                            <div className="mb-3">
                                <Label className="form-label" htmlFor="category_color">*Category Color</Label>
                                <HuePicker styles={{ width: "1202px", height: "16px" }}
                                    color={formData.category_color}
                                    onChange={handleColorChange}
                                />
                                <input
                                    type="text"
                                    value={formData.category_color}
                                    onChange={(e) => setFormData({ category_color: e.target.value })}
                                    placeholder="Color"
                                    className="form-control"
                                />
                            </div>
                        </Row>
                        <Row>
                            <div className="mb-1">
                                <Label className="form-label" htmlFor="category_description">Category Description</Label>
                                <textarea
                                    className="form-control"
                                    id="category_description"
                                    rows="3"
                                    value={formData.category_description}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                        </Row>
                        <Row>
                            <div className="text-end mt-2">
                                <Button
                                    type="submit"
                                    color="primary"
                                    onClick={handleEditSubmit}
                                >
                                    Update 
                                </Button>
                            </div>

                        </Row>
                    </Form>
                </ModalBody>
            </Modal>
            <Modal
                isOpen={deleteConfirmationModal}
                centered={true}
                toggle={closeDeleteConfirmationModal}
            >
                <ModalHeader toggle={closeDeleteConfirmationModal}>
                    Confirm Delete
                </ModalHeader>
                <ModalBody>
                    Are you sure you want to delete this category?
                </ModalBody>
                <div className="modal-footer">
                    {/* When "Confirm" is clicked, call handleConfirmDelete */}
                    <Button color="primary" onClick={() => handleConfirmDelete(userToDelete)}>
                        Confirm
                    </Button>
                    {/* When "Cancel" is clicked, simply close the modal */}
                    <Button color="secondary" onClick={closeDeleteConfirmationModal}>
                        Cancel
                    </Button>
                </div>
            </Modal>
            <Modal
                size="lg"
                isOpen={subCatModalOpen}
                centered={true}
                toggle={closeCatModal}
            >
                <ModalHeader toggle={closeCatModal}>Sub Category</ModalHeader>
                <ModalBody>
                    <div>
                        {subCat.length === 0 ? (
                            <p>No Sub Category</p>
                        ) : (
                            <table className="table">
                            <thead>
                              <tr>
                                <th>Sub Category Name</th>
                                <th>Sub Category Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subCat.map((cat, index) => (
                                <tr key={index}>
                                  <td>{cat.sub_category_name}</td>
                                  <td>{cat.sub_category_description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={closeCatModal}
                    >
                        Close
                    </button>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
};

export default ViewCate;