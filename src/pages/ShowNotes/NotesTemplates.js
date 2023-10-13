import React, { useMemo, useState, useEffect } from "react";
import { CardBody, UncontrolledAlert, Table } from "reactstrap";
import { useParams, Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { faPodcast } from '@fortawesome/free-solid-svg-icons'; // Make sure you have the correct import path
import { faGear, faRss, faClock, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import TableContainer from "../../components/Common/TableContainer";
import { message, Pagination } from 'antd';
import { FormOutlined, DeleteOutlined, BarChartOutlined, ShareAltOutlined } from '@ant-design/icons';


const NotesTemplates = () => {
    const { showId } = useParams();
    const [episodes, setEpisodes] = useState([]);
    const [alert, setAlert] = useState(false);
    const [episodeData, setEpisodeData] = useState(null);
    const [data, setData] = useState({});
    const history = useHistory();
    const [selectedShowData, setSelectedShowData] = useState({});
    const [sortingOrder, setSortingOrder] = useState('asc'); // Initial sorting order
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [editEpisodeIndex, setEditEpisodeIndex] = useState(-1); // Initialize as -1
    const [formData, setFormData] = useState({
        nameHuman: '',
        showNotesTemplateText: '',
    });

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newPageSize, newPage) => {
        setPageSize(newPageSize);
        setCurrentPage(newPage); // Reset to the first page when changing page size
    };
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.episodes ? data.episodes.slice(startIndex, endIndex) : [];

    useEffect(() => {
        // Fetch episodes based on the selected show's ID (showId)
        fetch(`http://3.6.200.239:8000/api/shows/${showId}`) // Use the correct API endpoint
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
        fetch(`http://3.6.200.239:8000/api/shows/${showId}`)
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

            // Sort the episodes based on the selected sorting order
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


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
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
                        <div>
                            <h1 className="h3 mb-4">Add a New Show Notes Template</h1>
                            <form noValidate className="two-column-form">
                                <div className="row">
                                    <div className="col-12 col-lg-3 mb-3 mb-lg-0">
                                        <strong>Show Notes Template Label</strong>
                                    </div>
                                    <div className="col-12 col-lg-9">
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="nameHuman"
                                            placeholder="Short but descriptive title"
                                            value={formData.nameHuman}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-12 col-lg-3 mb-3 mb-lg-0">
                                        <strong>Show Notes Template Text</strong>
                                    </div>
                                    <div className="col-12 col-lg-9">
                                        <textarea
                                            className="form-control"
                                            name="showNotesTemplateText"
                                            placeholder="Enter show notes template text"
                                            value={formData.showNotesTemplateText}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <hr className="mt-4 mb-4 mt-lg-7 mb-lg-7"/>
                                <div className="d-flex">
                                    <Link to={`/show-notes/${showId}`} className="btn btn-outline-primary"> Cancel
                                    </Link>
                                    <button _ngcontent-yux-c387="" type="submit" className="btn btn-primary ml-auto">
                                        Create Show Notes Template
                                    </button>
                                </div>
                                {/* Add the rest of the form elements and buttons here */}

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default NotesTemplates;