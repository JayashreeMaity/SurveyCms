import TableContainer from "../../components/Common/TableContainer";
import AWS from 'aws-sdk';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardBody, Container, Modal, ModalHeader, ModalBody, Form, Row, Col, Label, Input, Button, } from "reactstrap";
import { message, Pagination, Table, Typography } from 'antd';
import { FormOutlined, DeleteOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { products, } from "../../common/data/ecommerce";
import axios from "axios";
import { useParams, useNavigate, Link } from 'react-router-dom';
import noProfile from '../../assets/images/noProfile.jpg'
import { CSVLink } from "react-csv";
import moment from 'moment'




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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [exportData, setExportData] = useState([]);

  const { Text } = Typography;


  const handleFilter = () => {
    if (startDate && endDate) {
      const filter = data.filter((item) => {
        const createdAt = new Date(item.created_at);
        return createdAt >= startDate && createdAt <= endDate;
      });
      console.log('filter:', filter);
      setData(filter);
      setCurrentPage(1);
    }
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setData(paginatedData);
    setCurrentPage(1);
  };

  // console.log('Filtered Data:', filterData);

  // const filteredData = useMemo(() => {
  //   // Step 2: Filter data based on the search input
  //   return data.filter(item => (
  //     item.username.toLowerCase().includes(searchInput.toLowerCase()) ||
  //     item.mobile_number.toLowerCase().includes(searchInput.toLowerCase())
  //   ));
  // }, [data, searchInput]);

  const handleSearchInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchInput(inputValue);
  
    // Filter the entire data array based on the search input
    const filteredData = data.filter((item) => (
      item.username.toLowerCase().includes(inputValue.toLowerCase()) ||
      item.mobile_number.toLowerCase().includes(inputValue.toLowerCase())
    ));
    setFilteredData(filteredData);
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

  useEffect(() => {
    filterData();
  }, [data, startDate, endDate, searchInput]);

  const filterData = () => {
    let filtered = data;

    // Step 1: Filter data based on the date range
    if (startDate && endDate) {
      filtered = filtered.filter((item) => {
        console.log("item.created_at <<<><<><<><<><><><><><<><><><><><><><><>", item.created_at);
        const createdAt = new Date(item.created_at);
        return createdAt >= startDate && createdAt <= endDate;
      });
    }

    // Step 2: Filter data based on the search input
    if (searchInput) {
      filtered = filtered.filter((item) => {
        return (
          item.username.toLowerCase().includes(searchInput.toLowerCase()) ||
          item.mobile_number.toLowerCase().includes(searchInput.toLowerCase())
        );
      });
    }

    setFilteredData(filtered);
    setExportData(filtered);
  };

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
                      <Link to='/expense/add-expense'><button style={{ backgroundColor:"rgb(118, 201, 228)"}}>Add Amount</button></Link>
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="date-filter row" style={{ display: "-webkit-box" }}>
                      <div className="col-md-3" style={{ marginBottom: "8px" }}>
                        <Text strong>Select start date:</Text>
                        <div style={{ width: "216px" }}>
                          <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            placeholderText="Start Date"
                            dateFormat="dd-MM-yy"
                          />
                        </div>
                      </div>
                      <div className="col-md-3" style={{ marginBottom: "8px", marginRight: "-56px" }}>
                        <Text strong>Select end date:</Text>
                        <div style={{ width: "216px" }}>
                          <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            placeholderText="End Date"
                            dateFormat="dd-MM-yy"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="search-input">
                          <input style={{ width: "318px", marginTop: "22px" }}

                            type="text"
                            placeholder="Search by Username and Mobile Number"
                            value={searchInput}
                            onChange={handleSearchInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-3" >
                        <button 
                          style={{ backgroundColor: "#82c3a8", marginTop:"22px",marginLeft:"10vh" }}>
                          <CSVLink
                            data={exportData}
                            filename={"expense_data.csv"}


                          >
                            Export CSV
                          </CSVLink>
                        </button>
                      </div>


                    </div>
                  </div>
                 




                  <Table className="expense_table"
                    dataSource={paginatedData}
                    loading={loading}
                    rowKey="user_id"
                    pagination={false}
                    bordered
                    scroll={{ x: "max-content" }}
                  >
                    <Table.Column title="User Id" dataIndex="user_id" key="user_id" />
                    <Table.Column title="Username" dataIndex="username" key="username" />
                    <Table.Column title="Mobile Number" dataIndex="mobile_number" key="mobile_number" />
                    <Table.Column title="Constituency Name" dataIndex="constituency_name" key="constituency_name" />
                    <Table.Column title="Survey Count" dataIndex="SurveyCount" key="SurveyCount" />
                    <Table.Column title="Total Expense" dataIndex="TotalExpense" key="TotalExpense" />
                    <Table.Column title="Created At" dataIndex="created_at" key="created_at" render={(text)=> text ? moment(text).format('DD MMM YYYY') : "N/A"} />
                  </Table>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredData.length}
                    onChange={(page) => setCurrentPage(page)}
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
