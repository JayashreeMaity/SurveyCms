import TableContainer from "../../components/Common/TableContainer";
import AWS from 'aws-sdk';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
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
import noProfile from '../../assets/images/noProfile.jpg'


const Viewtable = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { user_id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedCategory, setEditedCategory] = useState(null);
  const [formData, setFormData] = useState({});
  const [isGridView, setIsGridView] = useState(false); // Track the view mode
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sortingOrder, setSortingOrder] = useState('asc'); // Initial sorting order
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchInput, setSearchInput] = useState('');



  const filteredData = useMemo(() => {
    // Step 2: Filter data based on the search input
    return data.filter(item => (
      item.username.toLowerCase().includes(searchInput.toLowerCase()) ||
      item.mobile_number.toLowerCase().includes(searchInput.toLowerCase())
    ));
  }, [data, searchInput]);
  
  const handleSearchInputChange = (e) => {
    // Step 4: Handle search input change
    setSearchInput(e.target.value);
  };
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    // setPageSize(pageSize);
  };

  const handlePageSizeChange = (newPageSize, newPage) => {
    // setPageSize(newPageSize);
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const totalItems = filteredData.length;

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_BUCKET_KEY,
    secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_BUCKET_REGION
  });
  const s3 = new AWS.S3();

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData(prevFormData => ({
      ...prevFormData,
      dateOfBirth: date ? date.toISOString().split('T')[0] : '',
    }));
  };

  const handleFileChange = (event, fieldName) => {
    const file = event.target.files[0];

    // Check if a file was selected
    if (!file) {
      console.error('No file selected.');
      return;
    }

    const fileType = file.type.split('/')[1];
    const maxSizeKB = 500;

    if (file.size / 1024 > maxSizeKB) {
      // Show error message for file size greater than 500 KB
      message.error('Error: File size should be less than 500 KB.');
      return;
    }

    // Create an image element to check dimensions
    const img = new Image();
    img.onload = async () => {
      if (img.width > 3000 || img.height > 3000) {
        console.error('Error: Image dimensions should be 3000x3000 pixels or less.');
      } else {
        // If the file size and dimensions are valid, proceed with uploading
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
            // Update the state with the uploaded file URL
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

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/api/voter/getAllUsers`);
        if (response.ok) {
          const responseData = await response.json();
          if (Array.isArray(responseData) && responseData.length > 0) {
            // Sort the data in descending order based on the 'created_at' field
            const sortedData = responseData.sort((a, b) => {
              const dateA = new Date(a.user_id);
              const dateB = new Date(b.user_id);
              return dateB - dateA;
            });
            console.log("<<<MMMMMMM", sortedData);
            setData(sortedData);
          } else {
            console.error('Invalid response format:', responseData);
          }
        } else {
          console.error('Failed to fetch data:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [apiEndpoint]);


  const openDeleteConfirmationModal = (user_id) => {
    setUserToDelete(user_id);
    setDeleteConfirmationModal(true);
  };

  const closeDeleteConfirmationModal = () => {
    setUserToDelete(null);
    setDeleteConfirmationModal(false);
  };

  const handleDelete = async (user_id) => {
    // Open the custom delete confirmation modal here
    openDeleteConfirmationModal(user_id);
  };

  const handleConfirmDelete = async (user_id) => {
    closeDeleteConfirmationModal(); // Close the modal

    try {
      const response = await fetch(`${apiEndpoint}/api/users/delete/${user_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Successful deletion
        console.log('Deleted successfully');
        setData((prevData) => prevData.filter((record) => record.user_id !== user_id));
      } else {
        // Handle non-successful response
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      // Handle error
      console.error('Error:', error);
    }
  };

  const toggleAndEdit = (user_id) => {
    toggleModal(); // Close the modal if open
    handleEdit(user_id); // Fetch and populate data for editing
  };

  const toggleModal = useCallback(() => {
    setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
  }, []);

  const handleGridViewClick = () => {
    setIsGridView(true);
  };

  const handleListViewClick = () => {
    setIsGridView(false);
  };

  const breadcrumbItems = [
    { title: "Users", link: "/" },
    { title: "All Users", link: "#" },
  ]
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiEndpoint}/api/users/update/${formData.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Update the data in the state with the edited data
        setData(prevData => prevData.map(item => item.user_id === formData.user_id ? formData : item));
        setIsModalOpen(false); // Close the modal
        message.success('Users updated successfully.');
        console.log('Updated Data:', formData);
      } else {
        message.error('Failed to update category.');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while updating the Users.');
    }
  };

  const handleEdit = async (user_id) => {
    try {
      const response = await fetch(`${apiEndpoint}/api/users/user-list/${user_id}`);
      if (response.ok) {
        const categoryData = await response.json();
        setFormData(data);
        setIsModalOpen(true);
      } else {
        message.error('Failed to fetch Users data for editing.');
      }
      console.log("setFormData", setFormData)
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while fetching Users data for editing.');
    }
  };

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const toggleSortingOrder = () => {
    if (data.length > 0) {
      const newOrder = sortingOrder === 'asc' ? 'desc' : 'asc';
      setSortingOrder(newOrder);

      // Sort the data based on the selected sorting order
      const sortedData = [...data].sort((a, b) => {
        if (newOrder === 'asc') {
          return (a.user_image || '').localeCompare(b.user_image || '');
        } else {
          return (b.user_image || '').localeCompare(a.user_image || '');
        }
      });

      setData(sortedData);
    }
  };
  console.log(">><<<<<<<<", data)
  return (
    <React.Fragment>
      <div className="page-content" >
        <div className="main--content-container">
          <div className="main--content">
            <div className="view__podcast__table">
              <div className="card--container">
                <CardBody className="card-1">
                  <h2 className="podcast-title mb-lg-4">All Users</h2>
                  <div className="view-header row mb-6 mb-lg-2">
                    <div className="col-md-6">
                      <Link to='/add-users'><Button className=" hover--white btn--primary">Add Users</Button></Link>
                    </div>
                    <div className="col-md-6">
                      {/* Step 3: Add the search input field */}
                      <div className="search-input">
                        <input
                          type="text"
                          placeholder="Search by Username and Mobile Number"
                          value={searchInput}
                          onChange={handleSearchInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <Table striped responsive>
                    <thead>
                      <tr>
                        <th><span >User Id</span></th>
                        <th><span >Username</span></th>
                        <th><span className="last--name">Password</span></th>
                        <th><span >Mobile Number</span></th>
                        <th><span >Parent Id</span></th>
                        <th><span >Created At</span></th>
                        <th><span >Categories</span></th>
                        <th><span >AC No</span></th>
                        {/* <th><span className="actions__width">Actions</span></th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((item) => (
                        <tr className="hover__none" key={item.user_id}>
                          <td><span >{item.user_id || "N/A"}</span></td>
                          <td><span >{item.username || "N/A"}</span></td>
                          <td><span className="last--name">{item.password || "N/A"}</span></td>
                          <td><span >{item.mobile_number || "N/A"}</span></td>
                          <td><span >{item.parent_id || "N/A"}</span></td>
                          <td><span >{moment(item.created_at).format('DD MMM YYYY') || "N/A"}</span></td>
                          <td><span >{item.categories || "N/A"}</span></td>
                          <td><span >{item.ac_no || "N/A"}</span></td>
                        </tr>
                      ))}
                    </tbody>

                  </Table>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalItems}
                    onChange={setCurrentPage}
                  // onShowSizeChange={handlePageChange}
                  />
                </CardBody>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={deleteConfirmationModal}
        centered={true}
        toggle={closeDeleteConfirmationModal}
      >
        <ModalHeader toggle={closeDeleteConfirmationModal}>
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete this user?
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
        isOpen={isModalOpen}
        centered={true}
        toggle={toggleModal}
      >
        <ModalHeader toggle={toggleModal}>Edit Users</ModalHeader>
        <ModalBody className=" scroll-y--auto">
          <Form>
            <Row>
              <div className="mb-1">
                <Label className="form-label" htmlFor="firstName">First Name</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="firstName"
                  placeholder="Enter First Name"
                  value={formData.firstName}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="lastName">Last Name</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="lastName"
                  placeholder="Enter Category Slug"
                  value={formData.lastName}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="email">Email</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="email"
                  placeholder="Enter Color"
                  value={formData.email}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="user_image">Image</Label>
                <div className="img_show_area" style={{ marginBottom: "5px" }}>
                  {formData?.user_image?.length !== 0 && (
                    <img
                      src={formData.user_image} style={{ height: "100px", padding: "5px", marginBottom: "5px" }}
                    />
                  )}
                </div>
                <Input
                  type="file"
                  className="form-control"
                  id="user_image"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "user_image")}
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="country">Country</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="country"
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="phoneNumber"
                  placeholder="Enter Color"
                  value={formData.phoneNumber}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="dateOfBirth">Date Of Birth</Label>
                <DatePicker
                  selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                  onChange={date => handleDateChange(date)}
                  dateFormat="MM-dd-yyyy"
                  className="form-control"
                  id="dateOfBirth"
                  placeholderText="Select Date of Birth"
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="gender">Gender</Label>
                <div className="antd_select">
                  <select style={{ width: "100%", border: "0px", lineheight: "2" }}
                    name="gender"
                    required
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">FeMale</option>
                    <option value="Other">Other</option>
                  </select>

                </div>
                {/* <Input
                  type="text"
                  className="form-control"
                  id="gender"
                  placeholder="Enter Color"
                  value={formData.gender}
                  onChange={handleInputChange} // Handle input change
                /> */}
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
    </React.Fragment>
  );
};

export default Viewtable;
