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
    const [totalItems, setTotalItems] = useState(0);
    const [selectedDate, setSelectedDate] = useState(null);
    const [searchInput, setSearchInput] = useState(""); 
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
    const paginatedData = data.slice(startIndex, endIndex);

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

    const filteredData = useMemo(() => {
        return data.filter((item) =>
          item.user_name.toLowerCase().includes(searchInput.toLowerCase()) ||
          item.mobile_no.toLowerCase().includes(searchInput.toLowerCase()) ||
          item.ac_no.toLowerCase().includes(searchInput.toLowerCase()) ||
          item.constituency_type.toLowerCase().includes(searchInput.toLowerCase()) ||
          item.constituency.toLowerCase().includes(searchInput.toLowerCase()) ||
          item.constituency.toLowerCase().includes(searchInput.toLowerCase()) 
        );
      }, [data, searchInput]);
    
      // ... Rest of your component ...
    
      // Add a search input field
      const handleSearchInputChange = (event) => {
        setSearchInput(event.target.value);
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
                                    <h2 className="podcast-title mb-lg-4">All Survey Data</h2>
                                    <div className="view-header row mb-6 mb-lg-2">
                                    <input
                                                type="text"
                                                placeholder="Filter by User Name or Mobile Number"
                                                value={searchInput}
                                                onChange={handleSearchInputChange}
                                            />

                                    </div>

                                  

                                    <Table striped responsive>
                                        <thead>

                                            <tr>

                                                <th><span >User Id</span></th>
                                                <th><span >Agent Name</span></th>
                                                <th><span className="last--name">Ac no</span></th>

                                                <th><span >Parent Id</span></th>
                                                <th><span >constituency_type</span></th>
                                                <th><span >constituency</span></th>
                                                <th><span >polling_booth</span></th>
                                                <th><span >Person name</span></th>
                                                <th><span >Mobile Number</span></th>
                                                <th><span >Relation name</span></th>
                                                <th><span >age</span></th>
                                                <th><span >gender</span></th>
                                                <th><span >caste</span></th>
                                                <th><span >occupation</span></th>
                                                <th><span >education</span></th>
                                                <th><span >religion</span></th>
                                                <th><span >income_category</span></th>
                                                <th><span >house_no</span></th>
                                                <th><span >address</span></th>
                                                <th><span >answer_1</span></th>
                                                <th><span >answer_2</span></th>
                                                <th><span >answer_3</span></th>
                                                <th><span >answer_4</span></th>
                                                <th><span >answer_5</span></th>
                                                <th><span >audio_url</span></th>
                                                <th><span >image_url</span></th>
                                                {/* <th><span className="actions__width">Actions</span></th> */}
                                            </tr>

                                        </thead>
                                        <tbody>
                                            {filteredData.map((item) => (
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
                                        total={data.length}
                                        onChange={handlePageChange}
                                        showSizeChanger={false}
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
