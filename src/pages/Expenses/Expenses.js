import TableContainer from "../../components/Common/TableContainer";
import AWS from 'aws-sdk';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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


const Expenses = () => {
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
  // const [totalItems, setTotalItems] = useState(0);
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



  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData(prevFormData => ({
      ...prevFormData,
      dateOfBirth: date ? date.toISOString().split('T')[0] : '',
    }));
  };



  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/api/voter/expense`);
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
                  <h2 className="podcast-title mb-lg-4">Expenses</h2>
                  <div className="view-header row mb-6 mb-lg-2">
                    <div className="col-md-6">
                      <Link to='/expense/add-expense'><Button className="hover--white btn--primary">Add Amount</Button></Link>
                    </div>
                  </div>
                  <div className="search-input">
                    <input style={{ width: "318px" }}
                    
                      type="text"
                      placeholder="Search by Username and Mobile Number"
                      value={searchInput}
                      onChange={handleSearchInputChange}
                    />
                  </div>
                  <Table striped responsive>
                    <thead>

                      <tr>
                        <th><span >User Id</span></th>
                        <th><span >Username</span></th>
                        <th><span >Mobile Number</span></th>
                        <th><span className="last--name">Constituency Name</span></th>
                        <th><span >Survey Count</span></th>

                        <th><span >Total Expense</span></th>

                        {/* <th><span className="actions__width">Actions</span></th> */}
                      </tr>

                    </thead>
                    <tbody>
                      {paginatedData.map((item) => (
                        <tr className="hover__none" key={item.user_id}>

                          <td><span >{item.user_id || "N/A"}</span></td>
                          <td><span >{item.username || "N/A"}</span></td>
                          <td><span >{item.mobile_number || "N/A"}</span></td>
                          <td><span className="last--name">{item.constituency_name || "N/A"}</span></td>
                          <td><span >{item.SurveyCount || "N/A"}</span></td>

                          <td><span >{item.TotalExpense || "N/A"}</span></td>

                        </tr>
                      ))}
                    </tbody>

                  </Table>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={data.length}
                    onChange={handlePageChange}
                  // onShowSizeChange={handlePageChange}
                  />
                </CardBody>
              </div>
            </div>
          </div>
        </div>
      </div>


    </React.Fragment>
  );
};

export default Expenses;
