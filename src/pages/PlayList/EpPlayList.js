import TableContainer from "../../components/Common/TableContainer";
import AWS from 'aws-sdk';

//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardBody, Container, Modal, ModalHeader, ModalBody, Form, Row, Col, Label, Input, Button } from "reactstrap";
import { message } from 'antd';
import { FormOutlined, SettingOutlined, CopyOutlined, AppstoreOutlined } from '@ant-design/icons';

import { products, } from "../../common/data/ecommerce";
import axios from "axios";
import { useParams, useNavigate, Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { faPodcast } from '@fortawesome/free-solid-svg-icons'; // Make sure you have the correct import path
import { faGear, faRss } from '@fortawesome/free-solid-svg-icons';

const EpPlayList = () => {
    const { showId } = useParams();
    const [episodes, setEpisodes] = useState([]);
    const [data, setData] = useState({});
    const history = useHistory();
    const [selectedShowData, setSelectedShowData] = useState({});

    useEffect(() => {
        // Fetch episodes based on the selected show's ID (showId)
        fetch(`http://3.6.200.239:8000/api/playlists/${showId}`) // Use the correct API endpoint
            .then(response => response.json())
            .then(response => {
                if (response.status && response.result && response.result.data) {
                    setEpisodes(response.result.data.playlist_episodes || []);
                    setData(response.result.data || {});
                } else {
                    console.error('Invalid response format:', response);
                }
            })
            .catch(error => {
                console.error('Error fetching episodes:', error);
            });
    }, [showId]);
    const columns = useMemo(
        () => [
            {
                Header: "Episode Name",
                accessor: "episode_name",
                disableFilters: true,
                filterable: false,
            },
            {
                Header: "Episode Duration",
                accessor: "episode_duration",
                disableFilters: true,
                filterable: false,
            },
        ],
        []
    );
    const breadcrumbItems = [
        { title: "PlayList", link: "/view/playlist-list" },
        { title: "All PlayList", link: "#" },
    ]
    return (
        <React.Fragment>
            <div className="page-content">
                <div className="main--content-container">
                    <Breadcrumbs
                        breadcrumbItems={breadcrumbItems}
                    />
                    <div className="main--content">
                        <div className="view__podcast__table">
                            <div className="card--container">
                                <CardBody className="card-1">
                                    <h2 className="podcast-title mb-lg-4">Episodes</h2>
                                    <TableContainer
                                        className="episode-table"
                                        columns={columns}
                                        data={data.playlist_episodes || []}
                                        isPagination={false}
                                        iscustomPageSize={false}
                                        isBordered={false}
                                        customPageSize={10}
                                        loading={false}
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

export default EpPlayList;
