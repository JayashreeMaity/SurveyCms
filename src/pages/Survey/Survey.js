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
  Button,
} from "reactstrap";
import { message, Pagination, Tag, Space, Table } from "antd";
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

const Survey = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { user_id } = useParams();
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterData, setFilterData] = useState(data);

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
        item.user_id.includes(input) ||
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

  useEffect(() => {
    if (loading) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            "http://localhost:7500/api/voter/all-surveydata"
          );
          if (response.ok) {
            const responseData = await response.json();
            if (Array.isArray(responseData) && responseData.length > 0) {
              setData(responseData);
              setAllData(responseData);
              console.log(responseData);
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
      const apiUrl = `http://localhost:7500/api/voter/getDatewiseSurvey/${moment(
        startDate
      ).format("YYYY-MM-DD")}/${moment(endDate).format("YYYY-MM-DD")}`;

      const response = await fetch(apiUrl);

      if (response.ok) {
        const responseData = await response.json();
        if (Array.isArray(responseData) && responseData.length > 0) {
          setData(responseData);
          setIndexData(responseData);
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
                      <DatePicker
                        selected={startDate}
                        onChange={handleStartDateChange}
                        placeholderText="Start Date"
                      />
                      <DatePicker
                        selected={endDate}
                        onChange={handleEndDateChange}
                        placeholderText="End Date"
                      />
                      <Button onClick={handleFilterButtonClick}>Filter</Button>
                    </div>
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
                  >
                    Export CSV
                  </CSVLink>
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
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Survey;
