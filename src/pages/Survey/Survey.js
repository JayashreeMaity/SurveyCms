import TableContainer from "../../components/Common/TableContainer";
import AWS from "aws-sdk";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { Modal } from "antd";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardBody,
  Container,

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
import { DownCircleTwoTone, UpCircleTwoTone } from '@ant-design/icons';
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

import { GoogleApiWrapper, Map, Marker } from "google-maps-react";


const { Text } = Typography;


const Survey = (props) => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { user_id } = useParams();
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [uniqueArr, setUniqueArr] = useState([]);
  const [dataLength, setDataLength] = useState("");
  const [amount, setAmount] = useState("");
  const [indexData, setIndexData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setfilterLoading] = useState(true);
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
  const [userId, setUserId] = useState({ user_id: "" });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterData, setFilterData] = useState(data);
  const [locationInfo, setLocationInfo] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const paginationRef = useRef(null);

  const scrollToBottom = () => {
    if (paginationRef.current) {
      paginationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  const scrollToTop = () => {
    if (paginationRef.current) {
      paginationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };



  const handleLocationClick = (latitude, longitude) => {
    setLocationInfo({ latitude, longitude });
    setMarkers([{ lat: latitude, lng: longitude }]);
    setIsMapModalOpen(true);
    if (mapRef.current) {
      // Clear existing markers, if any
      mapRef.current.map && mapRef.current.map.clearMarkers();

      // Add a new marker
      mapRef.current.map &&
        mapRef.current.map.markerRefs[0].createMarker({
          position: {
            lat: latitude,
            lng: longitude,
          },
        });
    }
  };

  const handleCloseLocationViewer = () => {
    setLocationInfo(null);
    setIsMapModalOpen(false);
  };

  useEffect(() => {
    if (locationInfo && isMapModalOpen) {
      const mapContainer = document.getElementById("map-view");

      // Check if a map is already initialized in the container
      if (mapContainer && !mapContainer._leaflet_id) {
        const map = L.map("map-view").setView(
          [locationInfo.latitude, locationInfo.longitude],
          15
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
          map
        );
        L.marker([locationInfo.latitude, locationInfo.longitude]).addTo(map);
      }
    }
  }, [locationInfo, isMapModalOpen]);

  const copyToClipboard = (text) => {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    message.success("Audio link copied to clipboard");
  };

  const copyToLocationClipboard = (text) => {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    message.success("copied");
  };

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
      title: "Agent Mobile Number",
      dataIndex: "mobile_number",
      key: "mobile_number",
    },
    {
      title: "User Mobile Number",
      dataIndex: "mobile_no",
      key: "mobile_no",
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
          {/* <button onClick={() => handleLocationClick(record.latitude, record.longitude)}>
            View Location
          </button> */}
          <br />
          <button>
            <a
              href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Location
            </a></button>
          <br />
          <Button type="link" onClick={() => copyToLocationClipboard(`${record.latitude}, ${record.longitude}`)}>
            Copy Coordinates
          </Button>
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
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Audio",
      dataIndex: "audio_url",
      key: "audio_url",
      render: (text) => (
        <div>
          {text ? (
            <div>
              <audio controls>
                <source src={text} type="audio/3gp" />
                <source src={text} type="audio/mpeg" />
                <source src={text} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
              <br />
              <Button
                type="link"
                onClick={() => copyToClipboard(text)}
              >
                Copy Audio Link
              </Button>
            </div>
          ) : (
            "N/A"
          )}
        </div>
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
        item.mobile_no.includes(input) ||
        item.constituency.includes(input)
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
    const fetchData = async () => {
      if (loading) {
        try {
          const response = await fetch(
            `${apiEndpoint}/api/voter/all-surveydata`
          );
          if (response.ok) {
            const responseData = await response.json();
            console.log("response data >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", responseData);
            if (Array.isArray(responseData) && responseData.length > 0) {
              setfilterLoading(false)
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
      }
      setLoading(false);
    }
    fetchData();
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

  console.log("filterLoading>>>>", filterLoading);

  const fetchDateData = async () => {
    try {
     
        // If user_id is selected, fetch data filtered by user_id
        const apiUrl = `${apiEndpoint}/api/voter/getDatewiseSurvey/${moment(startDate).format("YYYY-MM-DD")}/${moment(endDate).format("YYYY-MM-DD")}`;

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userId),
        };
        const response = await fetch(apiUrl, requestOptions);
        console.log("response", response);
        if (response.ok) {
          const responseData = await response.json();
          if (Array.isArray(responseData) && responseData.length > 0) {
            setfilterLoading(false)
            const updatedData = responseData.map((item) => {
              const userId = item?.user_id[0];
              return {
                ...item,
                user_id: userId,
              };
            });
            setData(updatedData);
            console.log("updatedData", updatedData);
            console.log("user_id>>>>>>", userId);
            setIndexData(updatedData);

            setDataLength(updatedData.length);
          } else {
            console.error("Invalid response format:", responseData);
            message.error("No Data")
          }
        } else {
          console.error("Failed to fetch data:", response.statusText);
        }
      
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // useEffect(() => {
  //   if (startDate && endDate && data.length > 0) {
  //     console.log("filtered________________________________________________DATA>>>>", data);
  //     const dateArr = [new Date(startDate), new Date(endDate)]
  //     console.log("statrtrrttrtrtrtrtrtrtrtDate>>>>", startDate, "endDate >>>>", endDate);
  //     // const filter = data.filter((item) => {
  //     //   const createdAtStart = new Date(item.created_at[0]);
  //     //   const createdAtEnd = new Date(item.created_at[1]);
  //     //   const createArr = [createdAtStart, createdAtEnd];
  //     //   console.log("statrtrrttrtrtrtrtrtrtrtDate>>>>*&*^&^^&*(*()*)())&(*&(&(&(&(*()((&)()*)*)()_(_(_(_(**)&(&(&", item.created_at);
  //     //   console.log("createdATTTTTT", createdAtStart);
  //     //   return createArr.toString() === dateArr.toString();
  //     // });
  //     const start = new Date(startDate);
  //     const end = new Date(endDate);
  //     //  if(data.length > 0){
  //     const filteredArr = data
  //       ?.map((item) => ({
  //         ...item,
  //         created_at: item.created_at?.map((dateString) => new Date(dateString)),
  //       }))
  //       .filter((item) => {
  //         console.log("item >>>>>", item);
  //         const createdAtDates = item.created_at;
  //         return createdAtDates?.some((createdAt) => createdAt >= start && createdAt <= end);
  //       });
  //     //  }
  //     // setAllData(filter);
  //     // setFilterData(filter);
  //     setData(filteredArr);
  //     // setCurrentPage(1);
  //     console.log("DAAAAAAAAAAAAAAAAAAAAAAAAAAATTTTTTTTTTTTTTTTTTTTTTTTTTEEEEEEEEEEEEEEEEEE>>>>", filteredArr);
  //   }
  // }, [startDate, endDate, data])


  console.log("data >>>>>>>>>>>>>", data);

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
                  <div className="col-md-12">
                    <div className="date-filter row" style={{ display: "flex" }}>
                      <div className="col-md-3" style={{ marginBottom: "8px" }}>
                        <Text strong>Select start date:</Text>
                        <div >
                          <DatePicker style={{ width: "216px" }}
                            selected={startDate}
                            onChange={handleStartDateChange}
                            placeholderText="Start Date"

                          />
                        </div>
                      </div>
                      <div className="col-md-3" style={{ marginBottom: "8px", marginRight: "-56px" }}>
                        <Text strong>Select end date:</Text>
                        <div >
                          <DatePicker style={{ width: "216px" }}
                            selected={endDate}
                            onChange={handleEndDateChange}
                            placeholderText="End Date"

                          />
                        </div>
                      </div>
                      <div className="col-md-3" style={{ marginBottom: "8px" }}>
                        <Text strong>Select user id:</Text>
                        <div>
                          <Select
                            style={{
                              width: "200px",
                              border: "0px",

                              marginLeft: "0px",
                            }}
                            placeholder="Select user id"
                            onChange={(value) => setUserId({ user_id: value.toString() })}
                          >
                            {uniqueArr.map((data) => (
                              <Select.Option
                                style={{ border: "0px", height: "28px" }}
                                key={data.user_id}
                                value={data.user_id}
                              >
                                {data.username}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </div>
                      <div className="col-md-3" style={{ marginBottom: "8px" }}>

                        <button
                          type="primary"
                          // className="btn btn-primary"
                          // disabled={userId ? false : true}
                          onClick={handleFilterButtonClick}
                          style={{ marginTop: "24px", marginBottom: "10px", backgroundColor: "#76c9e4" }}
                        >
                          Filter
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="date-filter col-md-9">
                    <div className="col-md-3">
                      <div className="search-input">
                        <input
                          style={{ width: "535px" }}
                          type="text"
                          placeholder="Search by Person Name, UserId, User Mobile Number, Constituency, Ac No."
                          value={searchInput}
                          onChange={handleSearchInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3" >
                      <Button className="csv-button"
                        style={{ backgroundColor: "#82c3a8", marginLeft: "44vh" }}>
                        <CSVLink
                          data={data}
                          filename={"survey_data.csv"}

                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
                          Export CSV
                        </CSVLink>
                      </Button>
                    </div>
                  </div>
                  <div className="date-filter col-md-9">
                    <div className="col-md-3">
                      {dataLength && (
                        <>
                          <Text
                            strong
                            style={{
                              // paddingRight: "50px",
                              // paddingLeft: "80px",
                              color: "blue",
                            }}
                          >{`Total survey count : ${dataLength}`}</Text>
                          {/* <Text
                        strong
                        style={{ color: "green" }}
                      >{`Total amount : ${dataLength * amount}/-`}</Text> */}
                        </>
                      )}
                    </div>
                    <div className="col-md-3">
                      <DownCircleTwoTone onClick={scrollToBottom}
                        style={{ marginBottom: '10px', marginLeft: "50vh", fontSize: "large", backgroundColor: "black" }} />
                    </div>
                  </div>

                  <Table
                    columns={columns}
                    dataSource={data}
                    loading={data.length === 0 || filterLoading}
                    scroll={{
                      x: 1500,
                    }}
                    ref={paginationRef}
                  />
                  <div className="col-md-3">
                    <UpCircleTwoTone onClick={scrollToTop} style={{ marginBottom: '10px', marginLeft: "50vh", fontSize: "large", backgroundColor: "black" }} />
                  </div>
                </CardBody>
              </div>
            </div>
            <Modal
              title="Location Map"
              visible={isMapModalOpen}
              onCancel={handleCloseLocationViewer}
              footer={null}
              width={900}

            >
              {locationInfo && (
                <div className="location-viewer">
                  <div style={{ height: "300px", width: "100%" }}>
                    <Map
                      google={props.google}
                      initialCenter={{
                        lat: locationInfo.latitude,
                        lng: locationInfo.longitude,
                      }}
                      zoom={15}
                    >
                      {markers.map((marker, index) => (
                        <Marker
                          position={{
                            lat: locationInfo.latitude,
                            lng: locationInfo.longitude,
                          }}
                        />
                      ))}
                    </Map>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
})(Survey);
