import TableContainer from "../../components/Common/TableContainer";
import AWS from 'aws-sdk';

//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardBody, Container, Modal, ModalHeader, ModalBody, Form, Row, Col, Label, Input, Button } from "reactstrap";
import { message } from 'antd';
import { FormOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';

import { products, } from "../../common/data/ecommerce";
import axios from "axios";
import { useParams, useNavigate, Link } from 'react-router-dom';

const ViewAudio = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedCategory, setEditedCategory] = useState(null);
  const [formData, setFormData] = useState({
    // Initialize the file state properties
    path: null, // For storing the uploaded file
  });
  const { _id } = useParams();
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_BUCKET_KEY,
    secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_BUCKET_REGION
  });
  const s3 = new AWS.S3();


  useEffect(() => {
    setLoading(true);
    fetch('http://3.6.200.239:8000/api/music')
      .then((response) => response.json())
      .then((response) => {
        if (response.status && response.result && response.result.data) {
          const sortedData = response.result.data.sort((a, b) => b._id.localeCompare(a._id));
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

  const handleDelete = async (_id) => {

    const confirmed = window.confirm("Are you sure you want to delete?");

    if (confirmed) {
      try {
        const response = await fetch(`http://3.6.200.239:8000/api/music/${_id}`, {
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
    }
  };

  const handleFileChange = (event, fieldName) => {
    const file = event.target.files[0];

    const fileType = file.type.split('/')[1];
    const allowedFileTypes = ['pdf', 'mp3']; // Allowed file types

    if (!allowedFileTypes.includes(fileType)) {
      // Show error message for unsupported file types
      message.error('Error: Unsupported file type. Allowed types: PDF and MP3.');
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

        setFormData((prevFormData) => ({
          ...prevFormData,
          [fieldName]: fileNameWithoutURL,
        }));
        message.success('File uploaded successfully.');
      }
    });
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
        Header: "Title",
        accessor: "title",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Artist",
        accessor: "artist",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Path",
        accessor: "path",
        disableFilters: true,
        filterable: false,
         Cell: ({ value }) => (
                <a href={value} target="_blank" rel="noopener noreferrer">
                    <PlayCircleOutlined style={{ fontSize: '24px', color: 'blue' }} />
                </a>
            ),
      },
      {
        Header: "Description",
        accessor: "description",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Genre",
        accessor: "genre",
        disableFilters: true,
        filterable: false,
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
    { title: "Audio", link: "/" },
    { title: "All Audio", link: "#" },
  ]
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://3.6.200.239:8000/api/music/${formData._id}`, {
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
        message.success('Audio updated successfully.');
        console.log('Updated Data:', formData);
      } else {
        message.error('Failed to update Audio.');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while updating the Audio.');
    }
  };
  const handleEdit = async (_id) => {
    try {
      const response = await fetch(`http://3.6.200.239:8000/api/music/${_id}`);
      if (response.ok) {
        const categoryData = await response.json();
        setFormData(categoryData.result.data);
        setIsModalOpen(true);
      } else {
        message.error('Failed to fetch Audio data for editing.');
      }
      console.log("setFormData", setFormData)
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while fetching Audio data for editing.');
    }
  };
  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [id]: value,
    }));
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="All Audio"
            breadcrumbItems={breadcrumbItems}
          />
          <Card>
            <CardBody>
              <TableContainer
                columns={columns || []}
                data={data || []} // Use fetched data instead of products
                isPagination={false}
                // isGlobalFilter={false}
                iscustomPageSize={false}
                isBordered={false}
                customPageSize={10}
                loading={loading} // Pass loading state to TableContainer
              />
            </CardBody>
          </Card>
        </Container>
      </div>
      <Modal
        size="xl"
        isOpen={isModalOpen}
        centered={true}
        toggle={toggleModal}
      >
        <ModalHeader toggle={toggleModal}>Edit Audio</ModalHeader>
        <ModalBody>
          <Form>
            <Row>

              <div className="mb-3">
                <Label className="form-label" htmlFor="title">Title</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="title"
                  placeholder="Enter title Name"
                  value={formData.title}
                  onChange={handleInputChange} // Handle input change


                />
              </div>
              <div className="mb-3">
                <Label className="form-label" htmlFor="artist">Artist</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="artist"
                  placeholder="Enter Artist Slug"
                  value={formData.artist}
                  onChange={handleInputChange} // Handle input change


                />
              </div>
              <div className="mb-3">
                <Label className="form-label" htmlFor="path">Path</Label>
                <Input
                  type="file"
                  className="form-control"
                  id="path"
                  accept=".pdf,.mp3" // Accept only PDF and MP3 files
                  onChange={(e) => handleFileChange(e, "path")} // Update the field name
                />
              </div>
              <div className="mb-3">
                <Label className="form-label" htmlFor="description">Description</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="description"
                  placeholder="Enter Color"
                  value={formData.description}
                  onChange={handleInputChange} // Handle input change


                />
              </div>
              <div className="mb-3">
                <Label className="form-label" htmlFor="genre">Genre</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="genre"
                  placeholder="Enter Color"
                  value={formData.genre}
                  onChange={handleInputChange} // Handle input change
                />
              </div>
            </Row>
            <Row>

              <div className="text-end">
                <Button
                  type="submit"
                  color="primary"
                  onClick={handleEditSubmit}
                >
                  Submit
                </Button>
              </div>

            </Row>
          </Form>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default ViewAudio;
