import React, { useMemo, useState, useEffect } from "react";
import { CardBody, UncontrolledAlert, Table } from "reactstrap";
import { useParams, Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { faPodcast } from '@fortawesome/free-solid-svg-icons'; // Make sure you have the correct import path
import { faGear, faRss, faClock, faCaretDown, faCaretUp, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import TableContainer from "../../components/Common/TableContainer";
import { message, Pagination, Popconfirm } from 'antd';
import { FormOutlined, DeleteOutlined, BarChartOutlined, ShareAltOutlined } from '@ant-design/icons';
import moment from 'moment';

const EpisodesList = () => {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const { showId } = useParams();
    const [episodes, setEpisodes] = useState([]);
    const [alert, setAlert] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [updatedEp, setUpdatedEp] = useState(false);
    const [episodeData, setEpisodeData] = useState(null);
    const [data, setData] = useState({});
    const history = useHistory();
    const [selectedShowData, setSelectedShowData] = useState({});
    const [sortingOrder, setSortingOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [editEpisodeIndex, setEditEpisodeIndex] = useState(-1); // Initialize as -1
    const [formData, setFormData] = useState({})

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.episodes ? data.episodes.slice(startIndex, endIndex) : [];

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newPageSize, newPage) => {
        setPageSize(newPageSize);
        setCurrentPage(newPage); // Reset to the first page when changing page size
    };


    useEffect(() => {
        fetch(`${apiEndpoint}/api/shows/${showId}`)
            .then(response => response.json())
            .then(response => {
                if (response.status && response.result && response.result.data) {
                    setEpisodes(response.result.data.episodes || []);
                    setData(response.result.data || {});
                } else {
                    console.error('Invalid response format:', response);
                }
            })
            .catch(error => {
                console.error('Error fetching episodes:', error);
            });
    }, [showId]);

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

    const handlePodset = () => {
        history.push(`/podcast-setting/${showId}`);
    }

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

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    const toggleSortingOrder = () => {
        if (episodes && episodes.length > 0) {
            const newOrder = sortingOrder === 'asc' ? 'desc' : 'asc';
            setSortingOrder(newOrder);
            const sortedEpisodes = [...episodes].sort((a, b) => {
                if (newOrder === 'asc') {
                    return (a.episode_image || '').localeCompare(b.episode_image || '');
                } else {
                    return (b.episode_image || '').localeCompare(a.episode_image || '');
                }
            });
            setEpisodes(sortedEpisodes);
        }
    };

    const handleEditEpisode = (index) => {
        console.log("index", index)
        setEditEpisodeIndex(index);
        history.push(`/edit-ep/${showId}/episode/${index}`);
    };

    const handleDeleteUpEpisode = (index) => {
        const updatedEpisodes = [...episodes];
        console.log("::::", updatedEpisodes.splice(index, 1))
        updatedEpisodes.splice(index, 1);
        console.log("::::", updatedEpisodes)
        setEpisodes(updatedEpisodes);
    };

    useEffect(() => {
        fetch(`${apiEndpoint}/api/shows/${showId}`)
            .then(response => response.json())
            .then(response => {
                if (response.status && response.result && response.result.data) {
                    setFormData(response.result.data);

                } else {
                    console.error('Invalid response format:', response);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, [showId]);

    useEffect(() => {
        if (episodes.length) {
            formData.episodes = episodes;
        }
    }, [episodes, formData]);

    useEffect(() => {
        if (updatedEp)
            fetch(`${apiEndpoint}/api/shows/${showId}`)
                .then(response => response.json())
                .then(response => {
                    if (response.status && response.result && response.result.data) {
                        setFormData(response.result.data);
                        setUpdatedEp(false);
                    } else {
                        console.error('Invalid response format:', response);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
    }, [updatedEp])

    useEffect(() => {
        if (isDeleted)
            try {
                const response = fetch(`${apiEndpoint}/api/shows/${showId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    const data = response.json();
                    setShowSuccessModal(true);
                    setIsDeleted(false);
                    setUpdatedEp(true);
                } else {
                    setIsDeleted(false);
                    setUpdatedEp(true);
                }
            } catch (error) {
                message.error('An error occurred while deleting the episode.');
                console.error('Error:', error);
            }
    }, [isDeleted])

    const handleDeleteEpisode = (index) => {
        const updatedEpisodes = [...episodes];
        const deletedEpisode = updatedEpisodes.splice(index, 1)[0];
        setEpisodes(updatedEpisodes);
        setIsDeleted(true);
        const updatedData = {
            ...data,
            episodes: updatedEpisodes,
        };
        setData(updatedData);
        try {
            const response = fetch(`${apiEndpoint}/api/shows/${showId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData), // Send the updated data to the server
            });

            if (response.ok) {
                setShowSuccessModal(true);
                setIsDeleted(false);
                setUpdatedEp(true);
            } else {
                // Request failed                    
                // message.error('An error occurred while deleting the episode.');
                setIsDeleted(false);
                setUpdatedEp(true);
            }
        } catch (error) {
            // Handle any network or fetch error
            message.error('An error occurred while deleting the episode.');
            console.error('Error:', error);
        }
    };

    console.log("formdata >>", formData);
    console.log("isDeleted >>", isDeleted);
    console.log("episodes >>>>>>>>>>>>>>>>>>>", episodes);

    // const isPublished = moment(item.episode_publish_date + ' ' + item.episode_publish_time, 'YYYY-MM-DD HH:mm') <= moment();

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="main--content-container">
                    {showId === null || showId === "null" ? (
                        <div style={{ textAlign: "center" }}>
                            <h2>Please select a show to see Episodes</h2>
                        </div>
                    ) : (
                        <div className="main--content">
                            {alert &&
                                <UncontrolledAlert color="success">
                                    Your Podcast <Link to={`/feeds/${episodeData?.show_slug}`}>RSS Feed</Link> URL has been copied to your clipboard.
                                </UncontrolledAlert>
                            }
                            <div className="context-banner show-header d-print-none show-in-network">
                                <FontAwesomeIcon icon={faNetworkWired} className="corner-icon cursor-pointer" />
                                <img className="context-banner-artwork mr-3 mr-lg-4 is-default" src={data.show_image} alt={data.show_name} width="100" height="100" />
                                <div className="context-banner-content">
                                    <div className="context-banner-title overflow-ellipsis"> {data.show_name}</div>
                                    <div className="context-banner-sub-actions hide-tablet flex-grow-1">
                                        <button type="button" className="btn btn-tertiary mr-4 pl-0 pr-0" onClick={handlePodset}>
                                            {/* <i className="fal fa-cog mr-2"></i> */}
                                            <FontAwesomeIcon icon={faGear} className="mr-2" />
                                            Podcast Settings
                                        </button>
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
                            </div>
                            <div className="view__podcast__table">
                                <div className="card--container">
                                    <CardBody className="card-1">
                                        <h2 className="podcast-title mb-lg-4">Episodes</h2>
                                        <div>{console.log("KKKK", showId)}
                                            {showId === null || showId === "null" ? (
                                                <div>
                                                    <h2>Please select a show to see Episodes</h2>
                                                </div>
                                            ) : (
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
                                                            <th><span className="name__width">Episodes Name</span></th>
                                                            <th> <span className="status__width">Publish Time</span></th>
                                                            <th> <span className="status__width">Publish Date</span></th>
                                                            <th> <span className="time__width">Status</span></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedData.map((item, index) => (
                                                            <tr className="hover__none" key={item._id}>
                                                                <td>
                                                                    <span className="img__width">
                                                                        <img
                                                                            src={item.episode_image || 'N/A'}
                                                                            alt="episode_image"
                                                                            width="70"
                                                                            height="auto"
                                                                        />
                                                                    </span>
                                                                </td>
                                                                <td><span className="lg_name__width">{item.episode_name || 'N/A'}</span></td>
                                                                <td><span className="lg_name__width">{item.episode_publish_time || 'N/A'}</span></td>
                                                                <td><span className="name__width">{moment(item.episode_publish_date).format('DD MMM YYYY') || 'N/A'}
                                                                </span></td>
                                                                <td>
                                                                    <div className="status-cell" style={{
                                                                        backgroundColor: moment(item.episode_publish_date + ' ' + item.episode_publish_time, 'YYYY-MM-DD HH:mm') <= moment() ? "#c7f2d3" : "#fef3df",
                                                                        color: moment(item.episode_publish_date + ' ' + item.episode_publish_time, 'YYYY-MM-DD HH:mm') <= moment() ? "#00a44e" : "#c27e00",
                                                                        padding: "0 0.75rem",
                                                                        fontWeight: "500",
                                                                        fontSize: ".875rem",
                                                                        borderRadius: "2.5rem",
                                                                        height: "2.125rem",
                                                                        lineHeight: "1",
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        width: "8rem"
                                                                    }}>
                                                                        {moment(item.episode_publish_date + ' ' + item.episode_publish_time, 'YYYY-MM-DD HH:mm') <= moment() ? (
                                                                            <>
                                                                                <FontAwesomeIcon icon={faCheckCircle} /> Published
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <FontAwesomeIcon icon={faClock} /> Scheduled
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>


                                                                {/* <td>
                                                                    <div className="status-cell" style={{
                                                                        backgroundColor: item.is_published == 1 ? "#c7f2d3" : "#fef3df",
                                                                        color: item.is_published == 1 ? "#00a44e" : "#c27e00",
                                                                        padding: "0 0.75rem",
                                                                        fontWeight: "500",
                                                                        fontSize: ".875rem",
                                                                        borderRadius: "2.5rem",
                                                                        height: "2.125rem",
                                                                        lineHeight: "1",
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        width: "8rem"
                                                                    }}>
                                                                        <FontAwesomeIcon icon={item.is_published === 1 ? faCheckCircle : faClock} className="mr-1" />
                                                                        {item.is_published == 1 ? "Published" : "Scheduled"}
                                                                    </div>
                                                                </td> */}

                                                                <td>
                                                                    <span className="actions__width">
                                                                        <div className="flex-icon-row">
                                                                            <span className="edit__icon"
                                                                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                                                            //   onClick={() => toggleAndEdit(item._id)}
                                                                            >
                                                                                <ShareAltOutlined />
                                                                            </span>
                                                                            <span className="edit__icon"
                                                                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                                                            //   onClick={() => toggleAndEdit(item._id)}
                                                                            >
                                                                                <BarChartOutlined />
                                                                            </span>
                                                                            <span className="edit__icon"
                                                                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                                                                onClick={() => handleEditEpisode(index)}
                                                                            >
                                                                                <FormOutlined />
                                                                            </span>
                                                                            <span className="actions__width">
                                                                                <div className="flex-icon-row">
                                                                                    <span className="delete__icon"
                                                                                        style={{ cursor: 'pointer', marginRight: '10px' }}
                                                                                    >

                                                                                        <Popconfirm
                                                                                            title="Are you sure to delete this episode?"
                                                                                            onConfirm={() => handleDeleteEpisode(index)}
                                                                                            okText="Yes"
                                                                                            cancelText="No"
                                                                                        >
                                                                                            <DeleteOutlined />
                                                                                        </Popconfirm>
                                                                                    </span>

                                                                                </div>
                                                                            </span>

                                                                        </div>
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            )}
                                            <Pagination
                                                current={currentPage}
                                                pageSize={pageSize}
                                                total={totalItems}
                                                onChange={handlePageChange}
                                                onShowSizeChange={handlePageSizeChange}
                                            />
                                        </div>
                                    </CardBody>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
};

export default EpisodesList;