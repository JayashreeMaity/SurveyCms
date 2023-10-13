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
import { products, } from "../../common/data/ecommerce";
import axios from "axios";
import { useParams, useNavigate, Link } from 'react-router-dom';

const ViewLan = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedCategory, setEditedCategory] = useState(null);
  const [formData, setFormData] = useState({});
  const [isGridView, setIsGridView] = useState(false); // Track the view mode
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { user_id } = useParams();
  const [sortingOrder, setSortingOrder] = useState('asc'); // Initial sorting order
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

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
    fetch(`${apiEndpoint}/api/languages`)
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
      const response = await fetch(`${apiEndpoint}/api/languages/${_id}`, {
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
        Header: "Language Image",
        accessor: "language_image",
        disableFilters: true,
        filterable: false,
        Cell: ({ value }) => (
          <div className="image-cell" style={{ backgroundImage: `url(${value})` }} />
        ),
      },
      {
        Header: "Language Name",
        accessor: "language_name",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Language Description",
        accessor: "language_description",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Actions",
        accessor: "_id",
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


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiEndpoint}/api/languages/${formData._id}`, {
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
        message.success('language updated successfully.');
        console.log('Updated Data:', formData);
      } else {
        message.error('Failed to update language.');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while updating the language.');
    }
  };
  const handleEdit = async (_id) => {
    try {
      const response = await fetch(`${apiEndpoint}/api/languages/${_id}`);
      if (response.ok) {
        const categoryData = await response.json();
        setFormData(categoryData.result.data);
        setIsModalOpen(true);
      } else {
        message.error('Failed to fetch language data for editing.');
      }
      console.log("setFormData", setFormData)
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while fetching language data for editing.');
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
  const breadcrumbItems = [
    { title: "Language", link: "/" },
    { title: "All Language", link: "#" },
  ]
  const toggleSortingOrder = () => {
    if (data.length > 0) {
      const newOrder = sortingOrder === 'asc' ? 'desc' : 'asc';
      setSortingOrder(newOrder);

      // Sort the data based on the selected sorting order
      const sortedData = [...data].sort((a, b) => {
        if (newOrder === 'asc') {
          return (a.language_name || '').localeCompare(b.language_name || '');
        } else {
          return (b.language_name || '').localeCompare(a.language_name || '');
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
            <div className="view__podcast__table">
              <div className="card--container">
                <CardBody className="card-1">
                  <h2 className="podcast-title mb-lg-4">Language</h2>
                  <div className="view-header row mb-6 mb-lg-2">
                    <div className="col-md-6">
                      <Link to='/add/language-list'><Button className="hover--white btn--primary">Add Language</Button></Link>
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
                              <img src={item.language_image} alt="artist_image" />
                            </div>
                            <div className="card-title">{item.language_name}</div>
                            <p className="card__description">{item.language_description}</p>
                          </div>
                          {/* <div className="card-footer">
                    <div className="show-date">{item.email}</div>
                  </div> */}
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
                            <th><span className="name__width">Language Name</span></th>
                            <th><span className="lg_description__width">Language Description</span></th>
                            <th><span className="actions__width">Actions</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((item) => (
                            <tr className="hover__none" key={item._id}>
                              <td>
                                <span className="img__width">
                                  <img
                                    src={item.language_image || 'N/A'}
                                    alt="language_image"
                                    width="70"
                                    height="auto"
                                  />
                                </span>
                              </td>
                              <td><span className="name__width">{item.language_name || 'N/A'}</span></td>
                              <td><span className="lg_description__width">{item.language_description || 'N/A'}</span></td>
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
                    // <TableContainer
                    //   className="episode-table"
                    //   columns={columns || []}
                    //   data={data || []}
                    //   isPagination={false}
                    //   iscustomPageSize={false}
                    //   isBordered={false}
                    //   customPageSize={10}
                    //   loading={loading}
                    // />
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
        <ModalHeader toggle={toggleModal}>Edit Language</ModalHeader>
        <ModalBody className=" scroll-y--auto">
          <Form>
            <Row>

              <div className="mb-1">
                <Label className="form-label" htmlFor="language_name">Language Name</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="language_name"
                  required
                  placeholder="Enter First Name"
                  value={formData.language_name}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="language_slug">Language Slug</Label>
                <Input
                  type="text"
                  className="form-control"
                  required
                  id="language_slug"
                  placeholder="Enter Category Slug"
                  value={formData.language_slug}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="language_image">*Please Upload Language Image</Label>
           

                <div className="img_show_area" style={{ marginBottom:"5px"}}>
                {formData?.language_image?.length !== 0 && (
                  <img
                    src={formData.language_image} style={{ height: "100px", padding: "5px" ,marginBottom:"5px"  }}   
                />
                )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="language_image"
                  name="language_image"
                  onChange={event => handleFileChange(event, "language_image")}
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="language_banner">*Please Upload Language Banner</Label>
      
                <div className="img_show_area" style={{ marginBottom:"5px"}}>
                {formData?.language_banner?.length !== 0 && (
                <img
                src={formData.language_banner} style={{  height: "auto", width: "250px", padding: "10px" ,marginBottom:"5px"  }}   
                />
                )}
                </div>   
                <Input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="language_banner"
                  name="language_banner"
                  onChange={event => handleFileChange(event, "language_banner")}
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="language_description">
                  Language Description
                </Label>
                <textarea
                  type="text"
                  className="form-control"
                  id="language_description"
                  placeholder="Enter language description"
                  value={formData.language_description}
                  onChange={handleInputChange} // Handle input change
                  rows={4} // Adjust the number of rows as needed
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
          Are you sure you want to delete this language?
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
    </React.Fragment>
  );
};

export default ViewLan;
