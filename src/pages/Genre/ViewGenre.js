import TableContainer from "../../components/Common/TableContainer";
import AWS from 'aws-sdk';

//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardBody, Container, Modal, ModalHeader, ModalBody, Form, Row, Col, Label, Input, Button, Table } from "reactstrap";
import { message, Pagination } from 'antd';
import { FormOutlined, DeleteOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { SketchPicker, HuePicker } from 'react-color';
import { products, } from "../../common/data/ecommerce";
import axios from "axios";
import { useParams, useNavigate, Link } from 'react-router-dom';

const ViewGenre = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedCategory, setEditedCategory] = useState(null);
  const [formData, setFormData] = useState({});
  const [isGridView, setIsGridView] = useState(false); // Track the view mode
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sortingOrder, setSortingOrder] = useState('asc'); // Initial sorting order
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [color, setColor] = useState(formData.genre_color);
  const { user_id } = useParams();


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

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_BUCKET_KEY,
    secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_BUCKET_REGION
  });
  const s3 = new AWS.S3();


  useEffect(() => {
    setLoading(true);
    fetch(`${apiEndpoint}/api/genres`)
      .then((response) => response.json())
      .then((response) => {
        if (response.status && response.result && response.result.data) {
          const sortedData = response.result.data.sort((a, b) => b._id.localeCompare(a._id));
          console.log('Fetched Data:', sortedData); // Log fetched data
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
    closeDeleteConfirmationModal(); // Close the modal

    try {
      const response = await fetch(`${apiEndpoint}/api/genres/${_id}`, {
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

  const toggleAndEdit = (_id) => {
    toggleModal(); // Close the modal if open
    handleEdit(_id); // Fetch and populate data for editing
  };

  const toggleModal = useCallback(() => {
    setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "Genre Image",
        accessor: "genre_image",
        disableFilters: true,
        filterable: false,
        Cell: ({ value }) => (
          <div className="image-cell" style={{ backgroundImage: `url(${value})` }} />
        ),
      },
      {
        Header: "Genre Name",
        accessor: "genre_name",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Genre Description",
        accessor: "genre_description",
        disableFilters: true,
        filterable: false,
      },

      {
        Header: "Actions",
        accessor: "_id", // Assuming you have an 'id' field in your data
        disableFilters: true,
        filterable: false,
        Cell: ({ value }) => (
          <div>
            <span
              style={{ cursor: "pointer", marginRight: "10px" }}
              onClick={() => toggleAndEdit(value)}
            >
              <FormOutlined />
            </span>
            <span
              style={{ cursor: "pointer", color: "red" }}
              onClick={() => handleDelete(value)}
            >
              <DeleteOutlined />
            </span>
          </div>
        ),
      },
    ],
    []
  );

  const breadcrumbItems = [
    { title: "Genre", link: "/" },
    { title: "All Genre", link: "#" },
  ]
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiEndpoint}/api/genres/${formData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Update the data in the state with the edited data
        setData(prevData => prevData.map(item => item._id === formData._id ? formData : item));
        setIsModalOpen(false); // Close the modal
        message.success('Genre updated successfully.');
        console.log('Updated Data:', formData);
      } else {
        message.error('Failed to update Genre.');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while updating the Genre.');
    }
  };
  const handleEdit = async (_id) => {
    try {
      const response = await fetch(`${apiEndpoint}/api/genres/${_id}`);
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
          return (a.genre_name || '').localeCompare(b.genre_name || '');
        } else {
          return (b.genre_name || '').localeCompare(a.genre_name || '');
        }
      });

      setData(sortedData);
    }
  };
  const handleColorChange = (color) => {
    setColor(color.hex);
    setFormData({ ...formData, genre_color: color.hex });
  }

  return (
    <React.Fragment>
      <div className="page-content" >
        <div className="main--content-container">
          <div className="main--content">
            <div className="view__podcast__table">
              <div className="card--container">
                <CardBody className="card-1">
                  <h2 className="podcast-title mb-lg-4">Genre</h2>
                  <div className="view-header row mb-6 mb-lg-2">
                    <div className="col-md-6">
                      <Link to='/add/genre-list'><Button className="hover--white btn--primary">Add Genre</Button></Link>
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
                  {isGridView ? (
                    <div className="view__podcast__card">
                      {data.sort((a, b) => b._id.localeCompare(a._id)).map((item) => (
                        <div className="card h-100 " key={item._id}>
                          <div className="card-body">
                            <div className="show-artwork round__cover">
                              <img src={item.genre_image} alt="genre_image" />
                            </div>
                            <div className="card-title">{item.genre_name}</div>
                            <p className="card__description">{item.genre_description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    // <div className="view__podcast__card">
                    //   {data.sort((a, b) => b._id.localeCompare(a._id)).map((item) => (
                    //      <div key={item._id} className="category__card"  >
                    //      <img src={item.genre_image} alt="genre_image" className="category__cardimage" />
                    //      <div className="category__card__details">
                    //          <div className="contant">
                    //              <h4>{item.genre_name}</h4>
                    //              <p>{item.genre_description}</p>
                    //          </div>
                    //      </div>
                    //      {/* <div className="category__card__icons">
                    //          <span
                    //              className="action__icon"
                    //              onClick={() => toggleAndEdit(item._id)}
                    //          >
                    //              <FormOutlined />
                    //          </span>
                    //          <span
                    //              className="action__icon"
                    //              onClick={() => handleDelete(item._id)}
                    //          >
                    //              <DeleteOutlined />
                    //          </span>
                    //      </div> */}
                    //  </div>
                    //   ))}
                    // </div>
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
                            <th><span className="name__width">Genre Name</span></th>
                            <th> <span className="lg_description__width">Genre Description</span></th>
                            <th><span className="actions__width">Actions</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((item) => (
                            <tr className="hover__none" key={item._id}>
                              <td>
                                <span className="img__width">
                                  <img
                                    src={item.genre_image || 'N/A'}
                                    alt="genre_image"
                                    width="70"
                                    height="auto"
                                  />
                                </span>
                              </td>
                              <td><span className="name__width">{item.genre_name || 'N/A'}</span></td>
                              <td><span className="lg_description__width">{item.genre_description || 'N/A'}</span></td>

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
                </CardBody>
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
        <ModalHeader toggle={toggleModal}>Edit Genre</ModalHeader>
        <ModalBody className=" scroll-y--auto">
          <Form>
            <Row>

              <div className="mb-1">
                <Label className="form-label" htmlFor="genre_name">Genre Name</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="genre_name"
                  placeholder="Enter Genre Name"
                  value={formData.genre_name}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="genre_slug">Genre Slug</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="genre_slug"
                  placeholder="Enter Genre Slug"
                  value={formData.genre_slug}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <Label className="form-label" htmlFor="genre_color">Color</Label>
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
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="genre_image">Image</Label>

                <div className="img_show_area" style={{ marginBottom: "5px" }}>
                  {formData?.genre_image?.length !== 0 && (
                    <img
                      src={formData.genre_image} style={{ height: "100px", padding: "5px", marginBottom: "5px" }}
                    />
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="genre_image"
                  name="genre_image"
                  onChange={event => handleFileChange(event, "genre_image")}
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="genre_icon">Icon</Label>

                <div className="img_show_area" style={{ marginBottom: "5px" }}>
                  {formData?.genre_icon?.length !== 0 && (
                    <img
                      src={formData.genre_icon} style={{ height: "100px", padding: "5px", marginBottom: "5px" }} />
                  )}
                </div>
                <Input
                  type="file"
                  className="form-control"
                  id="genre_icon"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "genre_icon")}
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="genre_banner">Banner</Label>

                <div className="img_show_area" style={{ marginBottom: "5px", height: "150px", width: "202px" }}>
                  {formData?.genre_banner?.length !== 0 && (
                    <img
                      src={formData.genre_banner} style={{ height: "100px", padding: "5px", marginBottom: "5px" }} />
                  )}
                </div>

                <Input
                  type="file"
                  className="form-control"
                  id="genre_banner"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "genre_banner")}
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="genre_description">Genre Description</Label>
                <textarea
                  type="text"
                  className="form-control"
                  id="genre_description"
                  placeholder="Enter Genre Description"
                  value={formData.genre_description}
                  onChange={handleInputChange}
                />
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
          Are you sure you want to delete this genre?
        </ModalBody>
        <div className="modal-footer">
          <Button color="primary" onClick={() => handleConfirmDelete(userToDelete)}>
            Confirm
          </Button>
          <Button color="secondary" onClick={closeDeleteConfirmationModal}>
            Cancel
          </Button>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default ViewGenre;
