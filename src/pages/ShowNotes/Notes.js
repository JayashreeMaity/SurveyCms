import React, { useMemo, useState, useEffect } from "react";
import { CardBody, UncontrolledAlert, Table } from "reactstrap";
import { useParams, Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { faPodcast } from '@fortawesome/free-solid-svg-icons'; // Make sure you have the correct import path
import { faGear, faRss,faList, faClock, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import TableContainer from "../../components/Common/TableContainer";
import { message, Pagination } from 'antd';
import { FormOutlined, DeleteOutlined, BarChartOutlined, ShareAltOutlined } from '@ant-design/icons';


const Notes = () => {
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
                        <div className="app-show-notes-manager">
                            <h1 className="show-h2 mb-4">Show Notes Manager</h1>
                            <ul className="nav nav-tabss" role="tablist">
                                <li className="nav-itemm">
                                    {/* <Link to="*"
                                        className="nav-link active"
                                        role="tab"
                                        aria-selected="true"
                                        aria-disabled="false"
                                    > */}
                                        <FontAwesomeIcon icon={faList} className="tab-icon mr-2" />
                                        Templates
                                    {/* </Link> */}
                                </li>
                            </ul>
                            <div className="router-outlet"></div>
                            <div className="app-dynamic-text-list">
                                <p className="mw-text-900">
                                    Build your Templates to suit your episode content type. Construct
                                    them using a combination of regular text, Blocks and Shortcodes, and if
                                    you use the same Template regularly, set it as your default to save
                                    you even more time.
                                </p>
                                <div className="entity-empty-card mt-6">
                                    <Link
                                        className="btn btn-primary"
                                        to={`/show-notes-templates/${showId}`}
                                    >
                                        Add Your First Show Notes Template
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Notes;


{/* <div className="app-show-notes-manager">
                            <h1 className="h2 mb-4">Show Notes Manager</h1>
                            <ul className="nav nav-tabs" role="tablist">
                                <li className="nav-item">
                                    <a
                                        href="/dashboard/podcast/b1eeb0dd-d439-474f-af41-cfdb7271c80f/show-notes-manager/templates"
                                        className="nav-link active"
                                        role="tab"
                                        aria-selected="true"
                                        aria-disabled="false"
                                    >
                                        <img
                                            alt=""
                                            className="tab-icon mr-2"
                                            src="/assets/images/tab-icon-templates.svg"
                                        />
                                        Templates
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        href="/dashboard/podcast/b1eeb0dd-d439-474f-af41-cfdb7271c80f/show-notes-manager/blocks"
                                        className="nav-link"
                                        role="tab"
                                        aria-selected="false"
                                        aria-disabled="false"
                                    >
                                        <img
                                            alt=""
                                            className="tab-icon mr-2"
                                            src="/assets/images/tab-icon-snippets.svg"
                                        />
                                        Blocks
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        href="/dashboard/podcast/b1eeb0dd-d439-474f-af41-cfdb7271c80f/show-notes-manager/shortcodes"
                                        className="nav-link"
                                        role="tab"
                                        aria-selected="false"
                                        aria-disabled="false"
                                    >
                                        <img
                                            alt=""
                                            className="tab-icon mr-2"
                                            src="/assets/images/tab-icon-variables.svg"
                                        />
                                        Custom Shortcodes
                                    </a>
                                </li>
                            </ul>
                            <div className="router-outlet"></div>
                            <div className="app-dynamic-text-list">
                                <p className="mw-text-900">
                                    Build your Templates to suit your episode content type. Construct
                                    them using a combination of regular text, Blocks and Shortcodes and if
                                    you use the same Template regularly, set it as your default to save
                                    you even more time.
                                </p>
                                <div className="entity-empty-card mt-6">
                                    <a
                                        className="btn btn-primary"
                                        href="/dashboard/podcast/b1eeb0dd-d439-474f-af41-cfdb7271c80f/show-notes-manager/templates/create"
                                    >
                                        Add Your First Show Notes Template
                                    </a>
                                    <img
                                        src="/assets/images/show-notes-manager-empty.svg"
                                        alt=""
                                        className="d-block mw-100 mx-auto mt-6"
                                    />
                                </div>
                            </div>
                        </div> */}



                    //     <div className="app-show-notes-manager">
                    //     <h1 className="h2 mb-4">Show Notes Manager</h1>
                    //     <ul className="nav nav-tabs" role="tablist">
                    //       <li className="nav-item">
                    //         <Link to="/notes/templates" className="nav-link">
                    //           Templates
                    //         </Link>
                    //       </li>
                    //       <li className="nav-item">
                    //         <Link to="/notes/blocks" className="nav-link">
                    //           Blocks
                    //         </Link>
                    //       </li>
                    //       <li className="nav-item">
                    //         <Link to="/notes/shortcodes" className="nav-link">
                    //           Custom Shortcodes
                    //         </Link>
                    //       </li>
                    //     </ul>
                    //     <div className="router-outlet">
                    //       <Switch>
                    //         <Route path="/notes/templates">
                    //           <Templates />
                    //         </Route>
                    //         <Route path="/notes/blocks">
                    //           <Blocks />
                    //         </Route>
                    //         <Route path="/notes/shortcodes">
                    //           <Shortcodes />
                    //         </Route>
                    //       </Switch>
                    //     </div>
                    //   </div>                        