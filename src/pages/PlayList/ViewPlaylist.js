import TableContainer from "../../components/Common/TableContainer";
import AWS from 'aws-sdk';

//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardBody, Container, Modal, ModalHeader, ModalBody, Form, Row, Col, Label, Input, Button, Table } from "reactstrap";
import { message, Pagination } from 'antd';
import { FormOutlined, DeleteOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { faPlay } from '@fortawesome/free-solid-svg-icons'; // Import the play icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { products, } from "../../common/data/ecommerce";
import axios from "axios";
import { useParams, useNavigate, Link, useHistory } from 'react-router-dom';

const ViewPlaylist = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedEpisodes, setEditedEpisodes] = useState([]);
  const [formData, setFormData] = useState({});
  const [isGridView, setIsGridView] = useState(false); // Track the view mode
  const history = useHistory();
  const [selectedEpData, setSelectedEpData] = useState({});
  const [isEpisodesModalOpen, setIsEpisodesModalOpen] = useState(false);
  const [episodeIndex, setEpisodeIndex] = useState(null);
  const { user_id } = useParams();
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sortingOrder, setSortingOrder] = useState('asc'); // Initial sorting order
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [users, setUsers] = useState([]);
  const [episodesShowData, setEpisodesShowData] = useState([]);
  const [showsData, setShowsData] = useState([]);


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
  const openEpisodesModal = (shows) => {
    setEditedEpisodes(shows);
    setIsEpisodesModalOpen(true);
  };

  const closeEpisodesModal = () => {
    setEpisodeIndex(null);
    setIsEpisodesModalOpen(false);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${apiEndpoint}/api/playlists`)
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


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/api/users/user-list`);
        const data = await response.json();
        console.log("sortedData", data.result.data)

        if (response.ok) {
          setUsers(data.result.data);
          setLoading(false);
        } else {
          console.error('Error fetching data:', data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUser();
  }, []);
  
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
      const response = await fetch(`${apiEndpoint}/api/playlists/${_id}`, {
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
  const handleSelectEp = (showId) => {
    // Fetch the show data based on the showId
    fetch(`${apiEndpoint}/api/playlists/${showId}`)
      .then(response => response.json())
      .then(response => {
        if (response.status && response.result && response.result.data) {
          setSelectedEpData(response.result.data);
          history.push(`/playlist-episodes/${showId}`);
        } else {
          console.error('Invalid response format:', response);

        }
      })
      .catch(error => {
        console.error('Error:', error);

      });
  };
  const columns = useMemo(
    () => [
      {
        Header: "Playlist Image",
        accessor: "playlist_image",
        disableFilters: true,
        filterable: false,
        Cell: ({ value }) => (
          <div className="image-cell" style={{ backgroundImage: `url(${value})` }} />
        ),
      },
      {
        Header: "Playlist Name",
        accessor: "playlist_name",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Playlist Episodes",
        accessor: "playlist_episodes",
        disableFilters: true,
        filterable: false,
        Cell: ({ row }) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ cursor: 'pointer' }}
              onClick={() => openEpisodesModal(row.original.playlist_episodes)}>{row.original.playlist_episodes.length}
            </span>
          </div>
        ),
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
    { title: "PlayList", link: "/" },
    { title: "All PlayList", link: "#" },
  ]
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiEndpoint}/api/playlists/${formData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          playlist_episodes: editedEpisodes, // Include the edited episodes data
        }),
      });

      if (response.ok) {
        // Update the data in the state with the edited data
        setData(prevData => prevData.map(item => item._id === formData._id ? formData : item));
        setIsModalOpen(false); // Close the modal
        message.success('Playlist updated successfully.');
        console.log('Updated Data:', formData);
      } else {
        message.error('Failed to update Playlist.');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while updating the Playlist.');
    }
  };
  const handleEdit = async (_id) => {
    try {
      const response = await fetch(`${apiEndpoint}/api/playlists/${_id}`);
      if (response.ok) {
        const categoryData = await response.json();
        setFormData(categoryData.result.data);
        setEditedEpisodes(categoryData.result.data.playlist_episodes); // Set the edited episodes
        setIsModalOpen(true);
      } else {
        message.error('Failed to fetch Playlist data for editing.');
      }
      console.log("setFormData", setFormData)
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while fetching Playlist data for editing.');
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

  const handleEditEpisodeNameChange = (event, index) => {
    const { value } = event.target;
    setEditedEpisodes((prevEpisodes) => {
      const updatedEpisodes = [...prevEpisodes];
      updatedEpisodes[index].episode_id = value;
      return updatedEpisodes;
    });
  };

  const handleEditEpisodeDurationChange = (event, index) => {
    const { value } = event.target;
    setEditedEpisodes((prevEpisodes) => {
      const updatedEpisodes = [...prevEpisodes];
      updatedEpisodes[index].episode_duration = value;
      return updatedEpisodes;
    });
  };

  const addNewEpisode = () => {
    // Create a new episode object with empty values
    const newEpisode = {
      episode_id: "",
      episode_duration: "",
    };

    // Add the new episode object to the editedEpisodes array
    setEditedEpisodes((prevEpisodes) => [...prevEpisodes, newEpisode]);
  };

  const toggleSortingOrder = () => {
    if (data.length > 0) {
      const newOrder = sortingOrder === 'asc' ? 'desc' : 'asc';
      setSortingOrder(newOrder);

      // Sort the data based on the selected sorting order
      const sortedData = [...data].sort((a, b) => {
        if (newOrder === 'asc') {
          return (a.playlist_name || '').localeCompare(b.playlist_name || '');
        } else {
          return (b.playlist_name || '').localeCompare(a.playlist_name || '');
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
                  <h2 className="podcast-title mb-lg-4">Playlist</h2>
                  <div className="view-header row mb-6 mb-lg-2">
                    <div className="col-md-6">
                      <Link to='/add/playlist-list'><Button className="hover--white btn--primary">Add Playlist</Button></Link>
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
                            <div className="show-artwork">
                              <img src={item.playlist_image} alt="playlist_image" />
                            </div>
                            <div className="card-title"> {item.playlist_name} </div>
                          </div>
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
                            <th><span className="name__width">PlayList Name</span></th>
                            {/* <th><span className="name__width">PlayList UserName</span></th> */}
                            <th> <span className="episodes__width">PlayList Episodes</span></th>
                            <th> <span className="actions__width"> Actions </span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((item) => (
                            <tr className="hover__none" key={item._id}>
                              <td>
                                <span className="img__width">
                                  <img
                                    src={item.playlist_image || 'N/A'}
                                    alt="playlist_image"
                                    width="70"
                                    height="auto"
                                  />
                                </span>
                              </td>
                              <td><span className="name__width">{item.playlist_name || 'N/A'}</span></td>
                              {/* <td><span className="username__width">{item.playlist_username || 'N/A'}</span></td> */}
                              <td>
                                <span className="episodes__width">
                                  <span className="bg-click-style"
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => openEpisodesModal(item.playlist_episodes)}
                                  >
                                    {item.playlist_episodes ? item.playlist_episodes.length : 'N/A'}
                                  </span>
                                </span>
                              </td>
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
        <ModalHeader toggle={toggleModal}>Edit PlayList</ModalHeader>
        <ModalBody className=" scroll-y--auto">
          <Form>
            <Row>
              <div className="mb-1">
                <Label className="form-label" htmlFor="playlist_name">Playlist Name</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="playlist_name"
                  placeholder="Enter Playlist Name"
                  value={formData.playlist_name}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="playlist_slug">Playlist Slug</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="playlist_slug"
                  placeholder="Enter Playlist Slug"
                  value={formData.playlist_slug}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" htmlFor="playlist_image">*Please Upload Playlist Image</Label>


                <div className="img_show_area" style={{ marginBottom: "5px" }}>
                  {formData?.playlist_image?.length !== 0 && (
                    <img
                      src={formData.playlist_image} style={{ height: "100px", padding: "5px", marginBottom: "5px" }}
                    />
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="playlist_image"
                  name="playlist_image"
                  onChange={event => handleFileChange(event, "playlist_image")}
                />
              </div>
              {/* <div className="mb-1">
                <Label className="form-label" htmlFor="artist_name">Artist Name</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="artist_name"
                  placeholder="Enter Playlist Name"
                  value={formData.artist_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-1">
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
              {/* <div className="mb-1">
                <Label className="form-label">Edit Episodes</Label>
                {editedEpisodes.map((episode, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <Input
                      type="text"
                      className="form-control me-2"
                      placeholder="Episode Name"
                      value={episode.episode_id}
                      onChange={(e) => handleEditEpisodeNameChange(e, index)}
                    />
                    <Input
                      type="text"
                      className="form-control"
                      placeholder="Episode Duration"
                      value={episode.episode_duration}
                      onChange={(e) => handleEditEpisodeDurationChange(e, index)}
                    />
                  </div>
                ))}
                <div className="mb-1">
                  <Button color="primary " className=" btn--primary" onClick={addNewEpisode}>
                    Add New Episode
                  </Button>
                </div>
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
        isOpen={isEpisodesModalOpen}
        centered={true}
        toggle={closeEpisodesModal}
      >
        <ModalHeader toggle={closeEpisodesModal}>Playlist Episodes:</ModalHeader>
        <ModalBody>
          {editedEpisodes.length === 0 ? (
            <p>No Episodes</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Episode Name</th>
                  <th>Episode Duration</th>
                </tr>
              </thead>
              <tbody>
                {editedEpisodes.map((episode, index) => (
                  <tr key={index}>
                    <td>{getEpisodeNamesByIds(episode.episode_id)}</td>
                    <td>{episode.episode_duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button className="btn btn-primary" onClick={closeEpisodesModal}>
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
          Are you sure you want to delete this playlist?
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

export default ViewPlaylist;
