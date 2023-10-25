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


const CallData = () => {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const { Id } = useParams();
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



    // const filteredData = data.filter(item => (
    //    item.username.toLowerCase().includes(searchInput.toLowerCase()) || item.constituency_type.toLowerCase().includes(searchInput.toLowerCase())
    // ));
    
    
    const filteredData = useMemo(() => {
        // Step 2: Filter data based on the search input
        return data.filter(item => (
          item.Mobile_Number?.toLowerCase().includes(searchInput?.toLowerCase()) 
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
console.log("paginatedData>>>",paginatedData)
console.log("paginatedData>>>",totalItems)

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
                const response = await fetch(`http://3.6.200.239:8500/SurveyData`);
                if (response.ok) {
                    const responseData = await response.json();
                    if (Array.isArray(responseData) && responseData.length > 0) {
                        const sortedData = responseData.sort((a, b) => {
                            const dateA = new Date(a.Id);
                            const dateB = new Date(b.Id);
                            return dateB - dateA;
                          });
                        setData(responseData);
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


    const openDeleteConfirmationModal = (Id) => {
        setUserToDelete(Id);
        setDeleteConfirmationModal(true);
    };

    const closeDeleteConfirmationModal = () => {
        setUserToDelete(null);
        setDeleteConfirmationModal(false);
    };

    const handleDelete = async (Id) => {
        // Open the custom delete confirmation modal here
        openDeleteConfirmationModal(Id);
    };

    const handleConfirmDelete = async (Id) => {
        closeDeleteConfirmationModal(); // Close the modal

        try {
            const response = await fetch(`${apiEndpoint}/api/users/delete/${Id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Successful deletion
                console.log('Deleted successfully');
                setData((prevData) => prevData.filter((record) => record.Id !== Id));
            } else {
                // Handle non-successful response
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            // Handle error
            console.error('Error:', error);
        }
    };

    const toggleAndEdit = (Id) => {
        toggleModal(); // Close the modal if open
        handleEdit(Id); // Fetch and populate data for editing
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
            const response = await fetch(`${apiEndpoint}/api/users/update/${formData.Id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Update the data in the state with the edited data
                setData(prevData => prevData.map(item => item.Id === formData.Id ? formData : item));
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

    const handleEdit = async (Id) => {
        try {
            const response = await fetch(`${apiEndpoint}/api/users/user-list/${Id}`);
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
                                    <h2 className="podcast-title mb-lg-4">Call Center Data</h2>
                                   
                                        <div className="col-md-6">
                                            
                                            <div className="search-input">
                                                <input
                                                    type="text"
                                                    placeholder="Search by Mobile Number"
                                                    value={searchInput}
                                                    onChange={handleSearchInputChange}
                                                />
                                            </div>
                                        </div>
                                  
                                    <Table striped responsive>
                                        <thead>
                                            <tr>
                                                <th><span >Id</span></th>
                                                <th><span >Timestamp</span></th>
                                                <th><span >Constituency</span></th>
                                                <th><span >Mobile Number</span></th>
                                               
                                                <th><span >Gender</span></th>
                                                <th><span >Urban_or_Rural</span></th>
                                                <th><span >Upcoming_Election_Party</span></th>
                                                <th><span >Party_2018</span></th>
                                                <th><span >Satisfaction_with_CM</span></th>
                                                <th><span >Satisfaction_with_MLA</span></th>
                                                <th><span >Occupation</span></th>
                                                <th><span >Caste</span></th>
                                                <th><span >Agent_ID</span></th>
                                                <th><span >Remarks_if_any</span></th>
                                              
                                            </tr>

                                        </thead>
                                        <tbody>
                                            {paginatedData.map((item) => (
                                                <tr className="hover__none" key={item.Id}>
                                                    <td><span >{item.Id || "N/A"}</span></td>
                                                    <td><span >{item.Timestamp || "N/A"}</span></td>
                                                    <td><span className="last--name">{item.Constituency || "N/A"}</span></td>

                                                    <td><span >{item.Mobile_Number || "N/A"}</span></td>
                                                    <td><span >{item.Gender || "N/A"}</span></td>
                                                    <td><span >{item.Urban_or_Rural || "N/A"}</span></td>
                                                    <td><span >{item.Upcoming_Election_Party || "N/A"}</span></td>
                                                    <td><span >{item.Party_2018 || "N/A"}</span></td>
                                                    <td><span >{item.Satisfaction_with_CM || "N/A"}</span></td>
                                                    <td><span >{item.Satisfaction_with_MLA || "N/A"}</span></td>
                                                    <td><span >{item.Occupation || "N/A"}</span></td>
                                                    <td><span >{item.Caste || "N/A"}</span></td>
                                                    <td><span >{item.Agent_ID || "N/A"}</span></td>
                                                    <td><span >{item.Remarks_if_any || "N/A"}</span></td>
                                                 
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
        </React.Fragment>
    );
};

export default CallData;
