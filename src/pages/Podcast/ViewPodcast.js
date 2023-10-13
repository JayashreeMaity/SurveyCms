import React, { useMemo, useState, useEffect, useCallback } from "react";
import TableContainer from "../../components/Common/TableContainer";
import { UnorderedListOutlined, AppstoreOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useHistory } from 'react-router-dom';

//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { CardBody, ModalHeader, ModalBody, Form, Row, Col, Label, Input, Modal, CardImg, Button, Alert, UncontrolledAlert, Table } from "reactstrap";
import { message, Pagination } from 'antd';
import AWS from 'aws-sdk';
import EpisodesList from '../Episodes/EpisodesList'; // Adjust the import path
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { faPodcast } from '@fortawesome/free-solid-svg-icons'; // Make sure you have the correct import path
import { faGear, faRss, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

const ViewPodcast = () => {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const [data, setData] = useState([]);
    const [alert, setAlert] = useState(false);
    const [loading, setLoading] = useState(false);
    const [episodeData, setEpisodeData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGridView, setIsGridView] = useState(false); // Track the view mode
    const [formData, setFormData] = useState({});
    const history = useHistory();
    const showId = localStorage.getItem("show_id");
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    AWS.config.update({
        accessKeyId: process.env.REACT_APP_BUCKET_KEY,
        secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_BUCKET_REGION
    });
    const s3 = new AWS.S3();

    // Add these state variables at the beginning of your component
    const [selectedShowData, setSelectedShowData] = useState({});
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [showSelected, setShowSelected] = useState(false);

    const storedSelectedShowData = localStorage.getItem('selectedShowData');
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


    useEffect(() => {
        if (storedSelectedShowData && Object.keys(JSON.parse(storedSelectedShowData)).length) {
            setSelectedShowData(JSON.parse(storedSelectedShowData))
        }
    }, [storedSelectedShowData])

    useEffect(() => {
        if (episodeData && Object.keys(episodeData).length !== 0) {
            const rssURL = `app.audiopitara.com/feeds/${episodeData?.show_slug}`;
            if (window.isSecureContext && navigator.clipboard) {
                navigator.clipboard.writeText(rssURL);
            } else {
                unsecuredCopyToClipboard(rssURL);
            }
        }
    }, [episodeData])

    useEffect(() => {
        if (alert) {
            setTimeout(() => {
                setAlert(false);
            }, 3000);
        }
    }, [alert])

    useEffect(() => {
        setLoading(true);

        fetch(`${apiEndpoint}/api/shows/`)
            .then((response) => response.json())
            .then((response) => {
                if (response.status && response.result && response.result.data) {
                    const sortedData = response.result.data.sort((a, b) => b._id.localeCompare(a._id));
                    setData(sortedData);
                    setLoading(false);
                    if (storedSelectedShowData) {
                        const details = storedSelectedShowData
                        setSelectedShowData(JSON.parse(details));
                        localStorage.setItem('selectedShowData', JSON.stringify(JSON.parse(details)));
                    } else if (sortedData.length > 0) {
                        setSelectedShowData(sortedData[sortedData.length - 1]);
                    //   const defaultSelectedShow = sortedData[0];
                    // setSelectedShowData(defaultSelectedShow); 
                    // localStorage.setItem('selectedShowData', JSON.stringify(defaultSelectedShow));
                    }

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
/////// setSelectedShowData(sortedData[sortedData.length - 1]);
    const handleSelectShow = (showId) => {
        // Fetch the show data based on the showId
        fetch(`${apiEndpoint}/api/shows/${showId}`)
            .then(response => response.json())
            .then(response => {
                if (response.status && response.result && response.result.data) {
                    setSelectedShowData(response.result.data);
                    setIsButtonDisabled(false); // Enable the button after show is selected
                    setShowSelected(true);

                    // Store the selected show data in local storage
                    localStorage.setItem('selectedShowData', JSON.stringify(response.result.data));
                    localStorage.setItem('show_id', showId);
                    history.push(`/episodeslist/${showId}`);
                } else {
                    console.error('Invalid response format:', response);
                    setIsButtonDisabled(false); // Enable the button even if the response is invalid

                }
            })
            .catch(error => {
                console.error('Error:', error);
                setIsButtonDisabled(false); // Enable the button even if the response is invalid

            });
    };
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

    function unsecuredCopyToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Unable to copy to clipboard', err);
        }
        document.body.removeChild(textArea);
    }

    const handleConfirmDelete = async (_id) => {
        closeDeleteConfirmationModal(); // Close the modal

        try {
            const response = await fetch(`${apiEndpoint}/api/shows/${_id}`, {
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
        handleEditGetId(_id); // Fetch and populate data for editing
    };
    const toggleModal = useCallback(() => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    }, []);

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    const handleFileChange = (event, fieldName) => {
        const file = event.target.files[0];
        const fileType = file.type.split('/')[1];
        const maxSizeKB = 500;

        if (file.size / 1024 > maxSizeKB) {
            // Show error message for file size greater than 500 KB
            message.error('Error: File size should be less than 500 KB.');
            return;
        }

        // Create an image element to check dimensions
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            if (img.width > 3000 || img.height > 3000) {
                // Show error message for image dimensions larger than 3000x3000 pixels
                message.error('Error: Image dimensions should be 3000x3000 pixels or less.');
                return;
            }

            const fileName = `${fieldName}_${Date.now()}.${fileType}`;
            const params = {
                Bucket: process.env.REACT_APP_S3_BUCKET,
                Key: fileName,
                Body: file,
                ACL: 'public-read',
            };

            s3.upload(params, (err, data) => {
                if (err) {
                    console.error('Error uploading file:', err);
                    message.error('An error occurred while uploading the file.');
                } else {
                    console.log('File uploaded successfully:', data.Location);
                    const fileNameWithoutURL = data.Location.split('/').pop();
                    console.log(">>>", fileNameWithoutURL)

                    setFormData(prevFormData => ({
                        ...prevFormData,
                        [fieldName]: fileNameWithoutURL,
                    }));
                    message.success('File uploaded successfully.');
                }
            });
        };
    };

    const breadcrumbItems = [
        { title: "Podcast", link: "/" },
        { title: "All Podcast", link: "#" },
    ]
    const handleListViewClick = () => {
        setIsGridView(false);
    };

    const handleGridViewClick = () => {
        setIsGridView(true);
    };
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiEndpoint}/api/shows/${formData._id}`, {
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
    const handleEditGetId = async (_id) => {
        try {
            const response = await fetch(`${apiEndpoint}/api/shows/${_id}`);
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
    const handleRss = () => {
        fetch(`${apiEndpoint}/api/shows/${showId}`)
            .then((response) => response.json())
            .then((data) => {
                setEpisodeData(data.result.data);
            })
            .catch((error) => {
                console.error('Error fetching episode data:', error);
            });
        setAlert(true);
        // history.push(`/feeds/${showId}`);
    }
    const selectedShowName = selectedShowData ? selectedShowData.show_name : (data[0]?.show_name || "");
    const toggleSortingOrder = () => {
        if (data.length > 0) {
            const newOrder = sortingOrder === 'asc' ? 'desc' : 'asc';
            setSortingOrder(newOrder);

            // Sort the data based on the selected sorting order
            const sortedData = [...data].sort((a, b) => {
                if (newOrder === 'asc') {
                    return (a.show_name || '').localeCompare(b.show_name || '');
                } else {
                    return (b.show_name || '').localeCompare(a.show_name || '');
                }
            });

            setData(sortedData);
        }
    };
    return (
        <React.Fragment>
            <div className="page-content">
                <div className="main--content-container">
                    <div className="main--content">
                        {alert &&
                            <UncontrolledAlert color="success">
                                Your Podcast <Link to={`/feeds/${episodeData?.show_slug}`}>RSS Feed</Link> URL has been copied to your clipboard.
                            </UncontrolledAlert>
                        }
                        {JSON.parse(storedSelectedShowData)?._id?.length !== undefined &&
                            <div className="context-banner show-header d-print-none show-in-network">
                                <FontAwesomeIcon icon={faNetworkWired} className="corner-icon cursor-pointer" />
                                <img className="context-banner-artwork mr-3 mr-lg-4 is-default" src={selectedShowData.show_image} alt={selectedShowData.show_name} width="100" height="100" />
                                <div className="context-banner-content">
                                    <div className="context-banner-title overflow-ellipsis"> {selectedShowData.show_name} </div>
                                    <div className="context-banner-sub-actions hide-tablet flex-grow-1">
                                        <Link to={`/podcast-setting/${selectedShowData._id}`}>
                                            <button type="button" className="btn btn-tertiary mr-4 pl-0 pr-0">
                                                {/* <i className="fal fa-cog mr-2"></i> */}
                                                <FontAwesomeIcon icon={faGear} className="mr-2" />
                                                Podcast Settings
                                            </button>
                                        </Link>
                                        <button onClick={handleRss} type="button" className="btn btn-tertiary mr-4 pl-0 pr-0">
                                            <FontAwesomeIcon icon={faRss} className="mr-2" />
                                            Copy RSS Feed </button>
                                    </div>

                                </div>
                                <Link to={`/create/add-episode/${showId}`}>
                                    <button type="button" className=" btn--primary ml-auto context-banner-main-action-btn">
                                        <span>Publish New Episode</span>
                                        <FontAwesomeIcon icon={faPodcast} className="ml-lg-2" />
                                    </button>
                                </Link>
                            </div>}

                        {<div className="view__podcast__table">
                            <div className="card--container">
                                <CardBody className="card-1">
                                    <h2 className="podcast-title mb-lg-4">All Shows</h2>
                                    <div className="view-header row mb-6 mb-lg-2">
                                        <div className="col-md-6">
                                            <Link to='/new/podcast'><Button className="hover--white btn--primary">Add New Show</Button></Link>
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
                                                 <Link to={`/episodes/${showId}`}>
                                                <div className="card h-100 " key={item._id}>
                                                    <div className="card-body">
                                                        <div className="show-artwork">
                                                            <img src={item.show_image} alt="show_image" />
                                                        </div>
                                                        <div className="card-title"> {item.show_name} </div>
                                                    </div>

                                                    <div className="card-footer">
                                                        <div className="show-date"> Created On: {formatDate(item.show_publish_date)}</div>
                                                    </div>

                                                </div>
                                                </Link>
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
                                                        <th><span className="name__width">Podcast Name</span></th>
                                                        <th> <span className="button__width"></span></th>
                                                        <th> <span className="actions__width"> Actions </span></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedData.map((item) => (
                                                        <tr className="hover__none" key={item._id}>
                                                            <td>
                                                                <span className="img__width">
                                                                    <img
                                                                        src={item.show_image || 'N/A'}
                                                                        alt="show_image"
                                                                        width="70"
                                                                        height="auto"
                                                                    />
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="lg_name__width">
                                                                    <h4>{item.show_name}</h4>
                                                                </span>
                                                                <p className="date-d1">Created On: {formatDate(item.show_publish_date)}</p>
                                                            </td>
                                                            <td>
                                                                <span className="button__width">
                                                                    <Button
                                                                        className={`btn-1 ${showSelected ? 'hidden' : ''}`} // Add 'hidden' class when showSelected is true
                                                                        color="primary"
                                                                        onClick={() => {
                                                                            handleSelectShow(item._id);
                                                                            history.push(`/episodes/${item._id}`);
                                                                        }}
                                                                        disabled={JSON.parse(storedSelectedShowData)?._id === item._id}
                                                                    >
                                                                        {JSON.parse(storedSelectedShowData)?._id === item._id ? "Selected" : "Select Show"}
                                                                    </Button>
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="actions__width">
                                                                    <div className="flex-icon-row">
                                                                        {/* <span className="edit__icon"
                                                                            style={{ cursor: 'pointer', marginRight: '10px' }}
                                                                            onClick={() => toggleAndEdit(item._id)}
                                                                        >
                                                                            <FormOutlined />
                                                                        </span> */}
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
                                        //     className="episode-table1"
                                        //     columns={columns || []}
                                        //     data={data || []}
                                        //     isPagination={false}
                                        //     iscustomPageSize={false}
                                        //     isBordered={false}
                                        //     customPageSize={10}
                                        //     loading={loading}
                                        // />
                                    )}
                                </CardBody>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
            <Modal
                size="xl"
                isOpen={isModalOpen}
                centered={true}
                toggle={toggleModal}
            >
                <ModalHeader toggle={toggleModal}>Edit Podcast</ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleEditSubmit}>
                        <Row>
                            <div>
                                <Label for="show_name">Show Name</Label>
                                <Input
                                    type="text"
                                    id="show_name"
                                    value={formData.show_name || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label for="show_name">Show Language</Label>
                                <Input
                                    type="text"
                                    id="show_language"
                                    value={formData.show_language || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label className="form-label" htmlFor="show_image">Show Image</Label>
                                <Input
                                    type="file"
                                    className="form-control"
                                    id="show_image"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "show_image")}

                                />
                            </div>
                            <div>
                                <Label className="form-label" htmlFor="show_credits">Show Credit</Label>
                                <Input
                                    type="text"
                                    id="show_credits"
                                    value={formData.show_credits}
                                    onChange={handleFileChange}

                                />
                            </div>
                        </Row>
                        <Row>
                            <div className="text-end">
                                <Button color="primary" type="submit">
                                    Save Changes
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
                    Are you sure you want to delete this show?
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

export default ViewPodcast;
