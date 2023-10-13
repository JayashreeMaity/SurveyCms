import TableContainer from "../../components/Common/TableContainer";
import AWS from 'aws-sdk';

//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardBody, Container, Modal, ModalHeader, ModalBody, Form, Row, Col, Label, Input, Button, Table } from "reactstrap";
import { Select, message, Pagination } from 'antd';
import { FormOutlined, DeleteOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { products, } from "../../common/data/ecommerce";
import axios from "axios";
import { useParams, useNavigate, Link, useHistory } from 'react-router-dom';
import { faPlay } from '@fortawesome/free-solid-svg-icons'; // Import the play icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const ViewArtist = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showName, setShowName] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedEpisodes, setEditedEpisodes] = useState([]);
  const [episodeModal, setEpisodeModal] = useState(false);
  const [editedShows, setEditedShows] = useState([]);
  const [formData, setFormData] = useState({});
  const [isGridView, setIsGridView] = useState(false);
  const [selectedShowData, setSelectedShowData] = useState({});
  const [selectedEpisodeData, setSelectedEpisodeData] = useState({});
  const history = useHistory();

  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [editedIndex, setShowEpisodeIndex] = useState(null);
  const [isEpisodesModalOpen, setIsEpisodesModalOpen] = useState(false);
  const [episodeIndex, setEpisodeIndex] = useState(null);
  const [episodesShowData, setEpisodesShowData] = useState([]);

  const [sortData, setSortData] = useState({});
  const [shows, setShows] = useState([]);
  const [episodeOptions, setEpisodeOptions] = useState([]);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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

  const { user_id } = useParams();
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_BUCKET_KEY,
    secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_BUCKET_REGION
  });
  const s3 = new AWS.S3();

  useEffect(() => {
    if (Object.keys(sortData).length !== 0) {
      const details = sortData;
      if (details.show_name) setShowName(details.show_name);
    }
  }, [sortData]);

  const openShowEpisodesModal = async (shows) => {
    setEditedShows(shows);
    setIsShowModalOpen(true);
  };

  const closeShowEpisodesModal = () => {
    setShowEpisodeIndex(null);
    setIsShowModalOpen(false);
  };
  
  const openEpisodesModal = (shows) => {
    setEditedEpisodes(shows);
    setIsEpisodesModalOpen(true);
  };

  const closeEpisodesModal = () => {
    setEpisodeIndex(null);
    setIsEpisodesModalOpen(false);
  };

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/api/shows`);
        const data = await response.json();

        if (response.ok) {
          setEpisodesShowData(data.result.data);
          setLoading(false);
        } else {
          console.error('Error fetching data:', data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchShows();
  }, []);

  const getEpisodeNamesByIds = (episodeIds) => {
    const episodeNames = [];
    for (const show of episodesShowData) {
      for (const episode of show.episodes) {
        if (episodeIds?.includes(episode._id)) {
          episodeNames?.push(episode.episode_name);
        }
      }
    }
    console.log('Episode Names:', episodeNames);
    return episodeNames;
  };

  const getShowNameById = (showId) => {
    const show = episodesShowData.find((show) => show._id === showId);
    return show ? show.show_name : '';
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${apiEndpoint}/api/artists`)
      .then((response) => response.json())
      .then((response) => {
        if (response.status && response.result && response.result.data) {
          const sortedData = response.result.data.sort((a, b) => b._id.localeCompare(a._id));
          console.log('Fetched Data:', sortedData);
          setData(sortedData);
          setTotalItems(sortedData.length);
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
      const response = await fetch(`${apiEndpoint}/api/artists/${_id}`, {
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


  const toggleAndEdit = async (_id, shows) => {
    try {
      console.log("shows", shows)
      toggleModal(); // Close the modal if open
      handleEdit(_id);
      const response = await fetch(`${apiEndpoint}/api/shows/${shows[0].show_id}`);
      console.log("???", response)

      if (response.ok) {
        const showData = await response.json();
        setSortData(showData.result.data)
        // return showData.result.data;
      } else {
        console.error('Failed to fetch show data.');
        return 'No Show Found'; // Return a default value or message when the show is not found
      }
    } catch (error) {
      console.error('Error:', error);
      return 'No Show Found'; // Return a default value or message on error
    }
  };

  const toggleModal = useCallback(() => {
    setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
  }, []);


  const breadcrumbItems = [
    { title: "Artist", link: "/" },
    { title: "All Artist", link: "#" },
  ]
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiEndpoint}/api/artists/${formData._id}`, {
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
        message.success('artist updated successfully.');
        console.log('Updated Data:', formData);
      } else {
        message.error('Failed to update artist.');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while updating the artist.');
    }
  };
  const handleEdit = async (_id) => {
    try {
      const response = await fetch(`${apiEndpoint}/api/artists/${_id}`);
      if (response.ok) {
        const categoryData = await response.json();
        setEditedEpisodes(categoryData.result.data.artist_episodes);
        setEditedShows(categoryData.result.data.artist_shows);
        setFormData(categoryData.result.data);
        setIsModalOpen(true);
      } else {
        message.error('Failed to fetch artist data for editing.');
      }
      console.log("setFormData", setFormData)
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while fetching artist data for editing.');
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
  const addNewEpisode = (showId) => {
    const newEpisode = {
      show_id: showId,
    };
    setEditedShows((prevEpisodes) => [...prevEpisodes, newEpisode]);
  };

  console.log("showData", sortData)
  const toggleSortingOrder = () => {
    if (data.length > 0) {
      const newOrder = sortingOrder === 'asc' ? 'desc' : 'asc';
      setSortingOrder(newOrder);

      // Sort the data based on the selected sorting order
      const sortedData = [...data].sort((a, b) => {
        if (newOrder === 'asc') {
          return (a.artist_name || '').localeCompare(b.artist_name || '');
        } else {
          return (b.artist_name || '').localeCompare(a.artist_name || '');
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
                  <h2 className="podcast-title mb-lg-4">Artist</h2>
                  <div className="view-header row mb-6 mb-lg-2">
                    <div className="col-md-6">
                      <Link to='/add/artist-list'><Button className="hover--white btn--primary">Add Artist</Button></Link>
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
                              <img src={item.artist_image} alt="artist_image" />
                            </div>
                            <div className="card-title"> {item.artist_name} </div>
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
                              <span className="img__width"> Image{" "}
                                <span className="sorting-icon" onClick={toggleSortingOrder}> {sortingOrder === 'asc' ? (
                                  <FontAwesomeIcon icon={faCaretDown} />) : (
                                  <FontAwesomeIcon icon={faCaretUp} />)}
                                </span>
                              </span>
                            </th>
                            <th> <span className="name__width">Artist Name</span> </th>
                            {/* <th> <span className="type__width">Artist Type</span></th> */}
                            <th> <span className="description__width"> Artist Description</span> </th>
                            <th> <span className="shows__width"> Artist Shows </span> </th>
                            <th> <span className="episodes__width"> Artist Episodes </span></th>
                            <th> <span className="actions__width"> Actions </span></th>
                          </tr>
                        </thead>
                        <tbody> {paginatedData.map((item) => (<tr className="hover__none" key={item._id}>
                          <td>
                            <span className="img__width">
                              <img src={item.artist_image || 'N/A'} alt="artist_image" width="70" height="auto" />
                            </span>
                          </td>
                          <td> <span className="name__width"> {item.artist_name || 'N/A'} </span></td>
                          {/* <td> <span className="type__width"> {item.artist_type || 'N/A'} </span></td> */}
                          <td> <span className="lg_description__width"> {item.artist_description || 'N/A'} </span> </td>
                          <td>
                            <span className="shows__width">
                              <span className="bg-click-style" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer',
                              }} onClick={() => openShowEpisodesModal(item.artist_shows)} > {item.artist_shows ? item.artist_shows.length : 'N/A'} </span>
                            </span>
                          </td>
                          <td>
                            <span className="episodes__width">
                              <span className="bg-click-style" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer',
                              }} onClick={() => openEpisodesModal(item.artist_episodes)} > {item.artist_episodes ? item.artist_episodes.length : 'N/A'} </span>
                            </span>
                          </td>
                          <td>
                            <span className="actions__width">
                              <div className="flex-icon-row">
                                <span className="edit__icon" style={{ cursor: 'pointer', marginRight: '10px' }} onClick={() => toggleAndEdit(item._id, item.artist_shows)} >
                                  <FormOutlined />
                                </span>
                                <span className="delete__icon" style={{ cursor: 'pointer', color: 'red' }} onClick={() => handleDelete(item._id)} >
                                  <DeleteOutlined />
                                </span>
                              </div>
                            </span>
                          </td>
                        </tr>))} </tbody>
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
        <ModalHeader toggle={toggleModal}>Edit Artist</ModalHeader>
        <ModalBody className=" scroll-y--auto">
          <Form>
            <Row>
              <div className="mb-1">
                <Label className="form-label" htmlFor="artist_name">Artist Name</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="artist_name"
                  placeholder="Enter Playlist Name"
                  value={formData.artist_name}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="artist_slug">Artist Slug</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="artist_slug"
                  placeholder="Enter Playlist Slug"
                  value={formData.artist_slug}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="artist_image">*Please Upload Artist Image</Label>

                <div className="img_show_area" style={{ marginBottom: "5px" }}>
                  {formData?.artist_image?.length !== undefined &&
                    <img
                      src={formData.artist_image} style={{ height: "100px", padding: "5px", marginBottom: "5px" }} />
                  }
                </div>


                <Input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="artist_image"
                  name="artist_image"
                  onChange={event => handleFileChange(event, "artist_image")}
                />
              </div>
              {/* <div className="mb-1">
                <Label className="form-label" htmlFor="artist_type">Artist Type</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="artist_type"
                  placeholder="Enter Artist Type"
                  value={formData.artist_type}
                  onChange={handleInputChange}
                />
              </div> */}
              <div className="mb-1">
                <Label className="form-label" htmlFor="artist_description">Artist Description</Label>
                <textarea
                  type="text"
                  className="form-control"
                  id="artist_description"
                  placeholder="Enter Description"
                  value={formData.artist_description}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              {/* <div className="mb-1">
                <Label className="form-label">Show Name</Label>
                {editedShows.map((show, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <Select
                      type="text"
                      className="form-control me-2"
                      placeholder="Show Name"
                      value={showName}
                      onChange={(e) => { handleEditShowNameChange(e, index) }}
                    >
                      {shows.map((show) => (
                        <Select.Option key={show._id} value={show._id}>
                          {show.show_name}
                          {console.log("show", show)}

                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                ))}
                <Button color="primary" onClick={addNewEpisode}>
          Add New Shows
        </Button>
              </div>
              <div className="mb-1">
                <Label className="form-label">Edit Episodes</Label>
                {sortData.episodes?.map((episode, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    {console.log("episode", episode)}
                    <Input
                      type="text"
                      className="form-control me-2"
                      placeholder="Episode Name"
                      value={episode.episode_name}
                      onChange={(e) => handleEditEpisodeNameChange(e, index)}
                    />
                  </div>
                ))}
              </div> */}
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
        size="lg"
        isOpen={isShowModalOpen}
        centered={true}
        toggle={closeShowEpisodesModal}
      >
        <ModalHeader toggle={closeShowEpisodesModal}>Artist Shows:</ModalHeader>
        <ModalBody >
        <div className="row">
            {editedShows.length === 0 ? (
              <p>No Shows</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Shows Name</th>
                  </tr>
                </thead>
                <tbody>
                  {editedShows.map((show, index) => (
                    <tr key={index}>
                      <td>{getShowNameById(show.show_id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={closeShowEpisodesModal}
          >
            Close
          </button>
        </ModalBody>
      </Modal>
      <Modal
        size="lg"
        isOpen={isEpisodesModalOpen}
        centered={true}
        toggle={closeEpisodesModal}
      >
        <ModalHeader toggle={closeEpisodesModal}>Artist Episodes:</ModalHeader>
        <ModalBody>
          <div className="row">
            {editedEpisodes.length === 0 ? (
              <p>No Episodes</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Episode Name</th>
                  </tr>
                </thead>
                <tbody>
                  {editedEpisodes.map((episode, index) => (
                    <tr key={index}>
                      <td>{getEpisodeNamesByIds(episode.episode_id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={closeEpisodesModal}
          >
            Close
          </button>
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
          Are you sure you want to delete this artist?
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

export default ViewArtist;
