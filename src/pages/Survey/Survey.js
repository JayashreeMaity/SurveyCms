import TableContainer from "../../components/Common/TableContainer";
import AWS from "aws-sdk";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Row,
  Col,
  Label,
  Input,
} from "reactstrap";
import {
  message,
  Pagination,
  Tag,
  Space,
  Table,
  Button,
  Select,
  Typography,
} from "antd";
import {
  FormOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { products } from "../../common/data/ecommerce";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import noProfile from "../../assets/images/noProfile.jpg";

import { CSVLink } from "react-csv";
// import { parse } from 'json2csv';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';




const { Text } = Typography;

const Survey = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { user_id } = useParams();
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [uniqueArr, setUniqueArr] = useState([]);
  const [dataLength, setDataLength] = useState("");
  const [amount, setAmount] = useState("");
  const [indexData, setIndexData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedCategory, setEditedCategory] = useState(null);
  const [formData, setFormData] = useState({});
  const [isGridView, setIsGridView] = useState(false); // Track the view mode
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sortingOrder, setSortingOrder] = useState("asc"); // Initial sorting order
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterData, setFilterData] = useState(data);
  const [locationInfo, setLocationInfo] = useState(null);

  const handleLocationClick = (latitude, longitude) => {
    setLocationInfo({ latitude, longitude });
  };

  const handleCloseLocationViewer = () => {
    setLocationInfo(null);
  };

  useEffect(() => {
    if (locationInfo) {
      const map = L.map('map-view').setView([locationInfo.latitude, locationInfo.longitude], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.marker([locationInfo.latitude, locationInfo.longitude]).addTo(map);
    }
  }, [locationInfo]);

  const columns = [
    {
      title: "User Id",
      dataIndex: "user_id",
      key: "user_id",
    },
    {
      title: "Agent Name",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Ac no",
      dataIndex: "ac_no",
      key: "ac_no",
    },
    {
      title: "Parent Id",
      dataIndex: "parent_id",
      key: "parent_id",
    },
    {
      title: "Constituency Type",
      dataIndex: "constituency_type",
      key: "constituency_type",
    },
    {
      title: "Constituency",
      dataIndex: "constituency",
      key: "constituency",
    },
    {
      title: "Polling Booth",
      dataIndex: "polling_booth",
      key: "polling_booth",
    },
    {
      title: "Person name",
      dataIndex: "user_name",
      key: "user_name",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobile_number",
      key: "mobile_number",
    },
    {
      title: "Relation name",
      dataIndex: "relation_name",
      key: "relation_name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Caste",
      dataIndex: "caste",
      key: "caste",
    },
    {
      title: "Occupation",
      dataIndex: "occupation",
      key: "occupation",
    },
    {
      title: "Education",
      dataIndex: "education",
      key: "education",
    },
    {
      title: "Religion",
      dataIndex: "religion",
      key: "religion",
    },
    {
      title: "Income Category",
      dataIndex: "income_category",
      key: "income_category",
    },
    {
      title: "House No",
      dataIndex: "house_no",
      key: "house_no",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    // {
    //   title: "Location",
    //   dataIndex: "location",
    //   key: "location",
    //   render: (text, record) => `${record.latitude}, ${record.longitude}`,
    // },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (text, record) => (
        <div>
          {`${record.latitude}, ${record.longitude}`}
          <button onClick={() => handleLocationClick(record.latitude, record.longitude)}>
            View Location
          </button>
        </div>
      ),
    },
    {
      title: "Answer1",
      dataIndex: "answer_1",
      key: "answer_1",
    },
    {
      title: "Answer2",
      dataIndex: "answer_2",
      key: "answer_2",
    },
    {
      title: "Answer3",
      dataIndex: "answer_3",
      key: "answer_3",
    },
    {
      title: "Answer4",
      dataIndex: "answer_4",
      key: "answer_4",
    },
    {
      title: "Answer5",
      dataIndex: "answer_5",
      key: "answer_5",
    },
    {
      title: "Audio",
      dataIndex: "audio_url",
      key: "audio_url",
      render: (text) =>
        text ? (
          <audio controls>
            <source src={text} type="audio/3gp" />
            <source src={text} type="audio/mpeg" />
            <source src={text} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image_url",
      render: (text) => (
        <img src={text || "N/A"} alt="image_url" width="70" height="auto" />
      ),
    },
  ];


  const handleSearchInputChange = (e) => {
    const input = e.target.value;
    const filtered = data.filter(
      (item) =>
        item.username.toLowerCase().includes(input.toLowerCase()) ||
        item.user_id.toString().includes(input) ||
        item.mobile_number.includes(input)
    );
    setData(filtered);
    setSearchInput(input);
  };

  useEffect(() => {
    if (searchInput?.length <= 0) {
      setData(allData);
    }
  }, [searchInput, allData]);

  // useEffect(() => {
  //   if (data.length <= 0) {
  //     setDataLength(data.length);
  //   }
  // }, [data, dataLength]);

  useEffect(() => {
    if (loading) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${apiEndpoint}/api/voter/all-surveydata`
          );
          if (response.ok) {
            const responseData = await response.json();
            if (Array.isArray(responseData) && responseData.length > 0) {
              setData(responseData);
              setAllData(responseData);
              setDataLength(responseData.length);
              const updatedData = Array.from(new Set(responseData.map((item) => item.user_id))).map(
                (id) => {
                  return responseData.find((item) => item.user_id === id);
                }
              )
              setUniqueArr(updatedData)
            } else {
              console.error("Invalid response format:", responseData);
            }
          } else {
            console.error("Failed to fetch data:", response.statusText);
          }
        } catch (error) {
          console.error("Error:", error);
        }
        setLoading(false);
      };
      fetchData();
    }
    setLoading(false);
  }, [loading, data]);

  useEffect(() => {
    const fetchAmountData = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/api/voter/amount`);
        if (response.ok) {
          const responseData = await response.json();
          if (Array.isArray(responseData) && responseData.length > 0) {
            setAmount(responseData[0].amount);
          } else {
            console.error("Invalid response format:", responseData);
          }
        } else {
          console.error("Failed to fetch data:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    };
    fetchAmountData();
    // }
    // setLoading(false);
  }, [amount]);

  const toggleSortingOrder = () => {
    if (data.length > 0) {
      const newOrder = sortingOrder === "asc" ? "desc" : "asc";
      setSortingOrder(newOrder);

      // Sort the data based on the selected sorting order
      const sortedData = [...data].sort((a, b) => {
        if (newOrder === "asc") {
          return (a.user_image || "").localeCompare(b.user_image || "");
        } else {
          return (b.user_image || "").localeCompare(a.user_image || "");
        }
      });
      setData(sortedData);
    }
  };

  const fetchDateData = async () => {
    try {
      // Construct the API URL with start_date and end_date as route parameters
      const apiUrl = `${apiEndpoint}/api/voter/getDatewiseSurvey/${moment(
        startDate
      ).format("YYYY-MM-DD")}/${moment(endDate).format(
        "YYYY-MM-DD"
      )}/${userId}`;

      const response = await fetch(apiUrl);

      if (response.ok) {
        const responseData = await response.json();
        if (Array.isArray(responseData) && responseData.length > 0) {
          const updatedData = responseData.map((item) => {
            const userId = item?.user_id[0];
            return {
              ...item,
              user_id: userId,
            };
          });
          setData(updatedData);
          setIndexData(updatedData);
          setDataLength(updatedData.length);
        } else {
          console.error("Invalid response format:", responseData);
        }
      } else {
        console.error("Failed to fetch data:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFilterButtonClick = () => {
    fetchDateData();
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="main--content-container">
          <div className="main--content">
            <div className="view__podcast__table">
              <div className="card--container">
                <CardBody className="card-1">
                  <h2 className="podcast-title mb-lg-4">Survey</h2>
                  <div className="col-md-6">
                    <div className="date-filter">
                      <div style={{ marginBottom: "8px" }}>
                        <Text strong>Select start date: </Text>
                        <DatePicker
                          selected={startDate}
                          onChange={handleStartDateChange}
                          placeholderText="Start Date"
                        />
                      </div>
                      <div style={{ marginBottom: "8px" }}>
                        <Text strong> Select end date: </Text>
                        <DatePicker
                          selected={endDate}
                          onChange={handleEndDateChange}
                          placeholderText="End Date"
                        />
                      </div>
                      <Text strong>Select user id: </Text>
                      <Select
                        style={{
                          width: "100px",
                          border: "0px",
                          lineheight: "2",
                          marginLeft: "5px",
                        }}
                        placeholder="Select user id"
                        // value={userId}
                        onChange={(value) => setUserId(value)}
                      >
                        {uniqueArr.map((data) => (
                          <Select.Option
                            style={{ border: "0px", height: "35px" }}
                            key={data.user_id}
                            value={data.user_id}
                          >
                            {data.username}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                    <Button
                      type="primary"
                      className="btn btn-primary"
                      disabled={userId ? false : true}
                      onClick={handleFilterButtonClick}
                      style={{ marginTop: "10px", marginBottom: "10px" }}
                    >
                      Filter
                    </Button>
                  </div>
                  <div className="col-md-6">
                    <div className="search-input">
                      <input
                        type="text"
                        placeholder="Search by person name,id,Mobile no"
                        value={searchInput}
                        onChange={handleSearchInputChange}
                      />
                    </div>
                  </div>

                  <CSVLink
                    data={data}
                    filename={"survey_data.csv"}
                    className="btn btn-primary"
                    style={{ marginTop: "10px", marginBottom: "10px" }}
                  >
                    Export CSV
                  </CSVLink>
                  {dataLength && (
                    <>
                      <Text
                        strong
                        style={{
                          // paddingRight: "50px",
                          paddingLeft: "80px",
                          color: "blue",
                        }}
                      >{`Total survey count : ${dataLength}`}</Text>
                      {/* <Text
                        strong
                        style={{ color: "green" }}
                      >{`Total amount : ${dataLength * amount}/-`}</Text> */}
                    </>
                  )}
                  <Table
                    columns={columns}
                    dataSource={data}
                    scroll={{
                      x: 1500,
                    }}
                  />
                </CardBody>
              </div>
            </div>
            {locationInfo && (
        <div className="location-viewer">
          <div id="map-view" style={{ height: '300px' }}></div>
          <button onClick={handleCloseLocationViewer}>Close</button>
        </div>
      )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Survey;
