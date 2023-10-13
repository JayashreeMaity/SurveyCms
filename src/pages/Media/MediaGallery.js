import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Button, Form, Input, Pagination, message, Modal } from 'antd';
import AWS from 'aws-sdk';
import { FormOutlined, DeleteOutlined } from '@ant-design/icons';
import { ModalHeader, ModalBody } from "reactstrap";


function MediaGallery() {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const [images, setImages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imagePath, setImagePath] = useState();
  const [mediaType, setMediaType] = useState();
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editImageId, setEditImageId] = useState(null);
  const [editImageDetails, setEditImageDetails] = useState(null);


  AWS.config.update({
    accessKeyId: process.env.REACT_APP_BUCKET_KEY,
    secretAccessKey: process.env.REACT_APP_BUCKET_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_BUCKET_REGION
  });
  const s3 = new AWS.S3();

  useEffect(() => {
    fetch(`${apiEndpoint}/api/media`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === true) {
          setImages(data.result.data.sort((a, b) => b._id.localeCompare(a._id)));
        } else {
          console.error('API response indicates an error:', data);
        }
      })
      .catch((error) => {
        console.error('Error fetching images:', error);
      });
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
    resetImageStates();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
            setImagePath(data.Location)
            setImages([...images, { media_thumb: data.Location, media_type: fileType }]);
            setSelectedImageFile(file); // Store the selected image file
            setImagePreviewUrl(URL.createObjectURL(file));
            setMediaType(fileType);
          }
        });
        console.log('File uploaded successfully:', file);
      }
    };
    img.src = URL.createObjectURL(file);
  };
  const resetImageStates = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setImagePath(null);
    setMediaType(null);
  };

  const onFinish = async (values) => {
    console.log("value>>", values)
    const media_url = imagePath;
    const media_type = mediaType || 'jpg';

    try {
      // Make a POST request to your API with the generated values
      const response = await fetch(`${apiEndpoint}/api/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_url,
          media_thumb: imagePath,
          media_type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === true) {
          // Update the images state with the new image data
          setImages((prevImages) => [data.result.data, ...prevImages]); // Add new data at the beginning of the array
          setIsModalVisible(false); // Close the modal
          form.resetFields(); // Reset form fields
          resetImageStates();
        } else {
          console.error('API response indicates an error:', data);
        }
      } else {
        console.error('Failed to submit the form.');
      }
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };



  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = images.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
  };

  const openDeleteConfirmationModal = (_id) => {
    setUserToDelete(_id);
    setDeleteConfirmationModal(true);
  };


  const closeDeleteConfirmationModal = () => {
    setUserToDelete(null);
    setDeleteConfirmationModal(false);
  };

  const handleDelete = async (_id) => {
    openDeleteConfirmationModal(_id);
  };

  const handleConfirmDelete = async (_id) => {
    closeDeleteConfirmationModal();
    try {
      const response = await fetch(`${apiEndpoint}/api/media/${_id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Successful deletion
        console.log('Deleted successfully');
        setImages((prevData) => prevData.filter((record) => record._id !== _id));
      } else {
        // Handle non-successful response
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      // Handle error
      console.error('Error:', error);
    }
  };

  const openEditModal = async (_id) => {
    try {
      const response = await fetch(`${apiEndpoint}/api/media/${_id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === true) {
          setEditImageDetails(data.result.data);
          setEditImageId(_id);
          setIsEditModalVisible(true);
          // Set initial values for the edit form here
          form.setFieldsValue({
            media_thumb: null, // Clear the existing file input
          });
          setImagePreviewUrl(data.result.data.media_thumb);
          setMediaType(data.result.data.media_type);
        } else {
          console.error('API response indicates an error:', data);
        }
      } else {
        console.error('Failed to fetch image details for editing.');
      }
    } catch (error) {
      console.error('Error fetching image details:', error);
    }
  };


  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditImageId(null);
    // Reset any form values if needed
    // Example: form.resetFields();
  };

  const onEditFinish = async (values) => {
    const media_url = imagePath;
    const media_type = mediaType || 'jpg';

    try {
      const response = await fetch(`${apiEndpoint}/api/media/${editImageId}`, {
        method: 'PUT', // Use the appropriate HTTP method for updating
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_url,
          media_thumb: imagePath,
          media_type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === true) {
          // Update the images state with the updated image data
          setImages((prevImages) => {
            const updatedImages = prevImages.map((image) => {
              if (image._id === editImageId) {
                return data.result.data;
              }
              return image;
            });
            return updatedImages;
          });

          closeEditModal(); // Close the edit modal
          resetImageStates(); // Reset image-related states
        } else {
          console.error('API response indicates an error:', data);
        }
      } else {
        console.error('Failed to update the image.');
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  return (
    <div className='page-content'>
      <div className="main--content-container">
        <div className="main--content">
          <Button className="hover--white btn--primary" type="primary" onClick={showModal}>Add</Button>
          <Row gutter={16}>
            {currentItems.map((image, index) => (
              <Col span={6} key={index}>
                <Card
                  hoverable
                  style={{ width: 240 }}
                  cover={<img alt={`Image ${index}`} src={image.media_thumb} />}
                  className="custom-card"
                >
                  
                  <div className="edit-card" >
                    <span
                      onClick={() => openEditModal(image._id)}
                    >
                      <FormOutlined />
                    </span>
                    <span
                      onClick={() => handleDelete(image._id)}
                    >
                      <DeleteOutlined />
                    </span>
                  </div>
                  {/* <Card.Meta title={`Image ${index}`} description={`Media Type: ${image.media_type}`} /> */}
                </Card>
              </Col>
            ))}
          </Row>
          <Pagination
            current={currentPage}
            total={images.length}
            pageSize={itemsPerPage}
            onChange={handlePageChange}
          />
        </div>
      </div>
      <Modal
        title="Add Media"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
        >

          <Form.Item
            name="media_thumb"
            label="Media Thumb"
            rules={[
              {
                required: true,
                message: 'Please choose a file for media thumb!',
              },
            ]}
          >
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'media_thumb')} />
            {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: '100px', marginTop: '10px' }} />}

          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Upload
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Confirm Delete"
        visible={deleteConfirmationModal}
        onOk={() => handleConfirmDelete(userToDelete)}
        onCancel={closeDeleteConfirmationModal}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this image?</p>
      </Modal>
      <Modal
        title="Edit Media"
        visible={isEditModalVisible}
        onCancel={closeEditModal}
        footer={null}
      >
        <Form
          form={form}
          onFinish={onEditFinish}
          layout="vertical"
        >
          <Form.Item
            name="media_thumb"
            label="Media Thumb"
            rules={[
              {
                required: editImageDetails === null, // Apply the rule only when editing a new image
                message: 'Please choose a file for media thumb!',
              },
            ]}
          >
            <div>
            {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" style={{ marginBottom: "10px", width: "200px" }}  />}
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'media_thumb')} />
          </Form.Item>
          {/* {editImageDetails && (
            <div>
              <p>Existing Image:</p>
              <img src={editImageDetails.media_thumb} alt="Existing" style={{ maxWidth: '100px' }} />
              <p>Media Type: {editImageDetails.media_type}</p>
            </div>
          )} */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>


    </div>
  );
}

export default MediaGallery;
