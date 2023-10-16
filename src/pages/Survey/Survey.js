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


const Survey = () => {
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



    // const filteredData = data.filter(item => (
    //    item.username.toLowerCase().includes(searchInput.toLowerCase()) || item.constituency_type.toLowerCase().includes(searchInput.toLowerCase())
    // ));
    
    
    const filteredData = useMemo(() => {
        // Step 2: Filter data based on the search input
        return data.filter(item => (
          item.user_name.toLowerCase().includes(searchInput.toLowerCase()) 
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
                const response = await fetch(`${apiEndpoint}/api/voter/all-surveydata`);
                if (response.ok) {
                    const responseData = await response.json();
                    if (Array.isArray(responseData) && responseData.length > 0) {
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
                                    <h2 className="podcast-title mb-lg-4">Survey</h2>
                                   
                                        <div className="col-md-6">
                                            
                                            <div className="search-input">
                                                <input
                                                    type="text"
                                                    placeholder="Search by person name"
                                                    value={searchInput}
                                                    onChange={handleSearchInputChange}
                                                />
                                            </div>
                                        </div>
                                  
                                    <Table striped responsive>
                                        <thead>
                                            <tr>
                                                <th><span >User Id</span></th>
                                                <th><span >Agent Name</span></th>
                                                <th><span >Ac no</span></th>
                                                <th><span >Parent Id</span></th>
                                                <th><span >Constituency Type</span></th>
                                                <th><span >Constituency</span></th>
                                                <th><span >Polling Booth</span></th>
                                                <th><span >Person name</span></th>
                                                <th><span >Mobile Number</span></th>
                                                <th><span >Relation name</span></th>
                                                <th><span >Age</span></th>
                                                <th><span >Gender</span></th>
                                                <th><span >Caste</span></th>
                                                <th><span >Occupation</span></th>
                                                <th><span >Education</span></th>
                                                <th><span >Religion</span></th>
                                                <th><span >Income Category</span></th>
                                                <th><span >House No</span></th>
                                                <th><span >Address</span></th>
                                                <th><span >Answer1</span></th>
                                                <th><span >Answer2</span></th>
                                                <th><span >Answer3</span></th>
                                                <th><span >Answer4</span></th>
                                                <th><span >Answer5</span></th>
                                                <th><span >Audio</span></th>
                                                <th><span >Image</span></th>
                                                {/* <th><span className="actions__width">Actions</span></th> */}
                                            </tr>

                                        </thead>
                                        <tbody>
                                            {paginatedData.map((item) => (
                                                <tr className="hover__none" key={item.user_id}>
                                                    <td><span >{item.user_id || "N/A"}</span></td>
                                                    <td><span >{item.username || "N/A"}</span></td>
                                                    <td><span className="last--name">{item.ac_no || "N/A"}</span></td>

                                                    <td><span >{item.parent_id || "N/A"}</span></td>
                                                    <td><span >{item.constituency_type || "N/A"}</span></td>
                                                    <td><span >{item.constituency || "N/A"}</span></td>
                                                    <td><span >{item.polling_booth || "N/A"}</span></td>
                                                    <td><span >{item.user_name || "N/A"}</span></td>
                                                    <td><span >{item.mobile_no || "N/A"}</span></td>
                                                    <td><span >{item.relation_name || "N/A"}</span></td>
                                                    <td><span >{item.age || "N/A"}</span></td>
                                                    <td><span >{item.gender || "N/A"}</span></td>
                                                    <td><span >{item.caste || "N/A"}</span></td>
                                                    <td><span >{item.occupation || "N/A"}</span></td>
                                                    <td><span >{item.education || "N/A"}</span></td>
                                                    <td><span >{item.religion || "N/A"}</span></td>
                                                    <td><span >{item.income_category || "N/A"}</span></td>
                                                    <td><span >{item.house_no || "N/A"}</span></td>
                                                    <td><span >{item.address || "N/A"}</span></td>

                                                    <td><span >{item.answer_1 || "N/A"}</span></td>
                                                    <td><span >{item.answer_2 || "N/A"}</span></td>
                                                    <td><span >{item.answer_3 || "N/A"}</span></td>
                                                    <td><span >{item.answer_4 || "N/A"}</span></td>
                                                    <td><span >{item.answer_5 || "N/A"}</span></td>
                                                    <td>
                                                        {item.audio_url ? (
                                                            <audio controls>
                                                                <source src={item.audio_url} type="audio/3gp" />
                                                                <source src={item.audio_url} type="audio/mpeg" />
                                                                <source src={item.audio_url} type="audio/mp3" />
                                                                Your browser does not support the audio element.
                                                            </audio>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span className="img__width">
                                                            <img
                                                                src={item.image_url || 'N/A'}
                                                                alt="image_url"
                                                                width="70"
                                                                height="auto"
                                                            />
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

export default Survey;
