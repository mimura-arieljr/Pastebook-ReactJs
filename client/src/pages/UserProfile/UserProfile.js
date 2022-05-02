// Dependencies
import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
// import { LazyLoadImage } from 'react-lazy-load-image-component';
// import 'react-lazy-load-image-component/src/effects/blur.css';
// Icons
import { IconContext } from "react-icons/lib";
import { VscMail } from "react-icons/vsc";
import { RiCake2Line } from "react-icons/ri";
import { IoMaleFemaleOutline } from "react-icons/io5";
import { TiPhoneOutline } from "react-icons/ti";
import Spinner from '../../loading-spinner.gif'
// Components
import Header from '../../components/Header';
import ProfileHeader from "./ProfileHeader";
import EditDetailsModal from "./EditDetailsModal";
import CreatePostModal from '../../components/CreatePostModal';
import AddBioModal from "./AddBioModal";
import AuthContext from "../../context/auth-context";
import PostCard from "../../components/PostCard";
import AlbumThumbnail from "./AlbumThumbnail";
import placeholder from '../Albums/empty-album-placeholder.png';
// Styles
import './UserProfile.css';

function UserProfile() {
    let port = "http://localhost:5000"
    let navigate = useNavigate();
    let currentUserPage = useParams();
    let ctx = useContext(AuthContext)
    const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);
    const [showAddBioModal, setShowAddBioModal] = useState(false);
    // userProfile contains Status (Owner, Friends, NotFriends), OwnerId, Username, Bio, ImageSrc (Base64)
    const [userProfile, setUserProfile] = useState([])
    // userInfo contains FirstName, LastName, Birthday (in Timestamp, ms), Gender
    // If current user owns profile, it will also contain Email and MobileNumber (string)
    const [userInfo, setUserInfo] = useState([])
    // const [showMobileNumber, setShowMobileNumber] = useState(false)
    const pageNumber = useRef(1)
    const [loading, setLoading] = useState(false)
    const [loadingAlbums, setLoadingAlbums] = useState(false)
    const [timelinePosts, setTimelinePosts] = useState([])
    const [ isPending, setIsPending ]= useState(false);
    const prevPosts = useRef([])
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        let statuscode;
        fetch(`${port}/${currentUserPage.username}`, {
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
            .then(res => {
                statuscode = res.status
                return res.text()
            })
            .then(data => {
                if (statuscode === 200) {
                    if (data === 'invalidtoken') {
                        ctx.onLogout();
                    }
                    else if (data === 'doesnotexist') {
                        navigate("/pagenotfound", { replace: true });
                    }
                    else {
                        console.log(JSON.parse(data));
                        setIsPending(false)
                        setUserProfile(JSON.parse(data))
                        // OwnerId here is visited profile
                        GetUserInfo(JSON.parse(data).Status, JSON.parse(data).OwnerId)
                        GetAllAlbums(JSON.parse(data).OwnerId);
                    }
                }
                // Add other error handlers
            })
    // removed timelinePosts from dependency
    }, [currentUserPage.username, showEditDetailsModal, showCreatePostModal, showAddBioModal])

    function GetUserInfo(Status, OwnerId) {
        fetch(`${port}/info`, {
            headers: {
                'Status': Status,
                'OwnerId': OwnerId
            }
        })
            .then(res => res.json())
            .then(data => {
                setUserInfo(data)
            })
    }

    useEffect(() => {
        fetchPosts()
    }, [currentUserPage.username])

    function fetchPosts() {
        // Reset state when change user profile
        setTimelinePosts([])
        pageNumber.current = 1

        setLoading(true)
        fetch(`${port}/timelineposts`, {
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken'),
                'Page': pageNumber.current,
                'ProfileOwner': currentUserPage.username
            }
        })
            .then(res => res.json())
            .then(data => {
                setTimelinePosts(data)
                setLoading(false)
            })
    }

    function fetchMore() {
        if (prevPosts.current.length === timelinePosts.length) {
            return false
        }

        setLoading(true)
        fetch(`${port}/timelineposts`, {
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken'),
                'Page': pageNumber.current,
                'ProfileOwner': currentUserPage.username
            }
        })
            .then(res => res.json())
            .then(data => {
                prevPosts.current = timelinePosts
                setTimelinePosts(prevTimelinePosts => [...prevTimelinePosts, ...data]);
                setLoading(false)
            })
    }

    const observer = useRef()
    const toBeObserved = useCallback(node => {
        if (loading) return false
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                pageNumber.current = pageNumber.current + 1;
                fetchMore()
            }
        })
        if (node) observer.current.observe(node)
    }, [loading])

    function GetAllAlbums(OwnerId) {
        setLoadingAlbums(true)
        fetch(`${port}/albums`, {
            headers: {
                'OwnerId': OwnerId
            }
        })
            .then(res => res.json())
            .then(data => {
                setAlbums(data)
                setLoadingAlbums(false)
            });
    }

    function showRecentPost(newPost) {
        setTimelinePosts([newPost, ...timelinePosts])
    }

    return (
        <>
            {showCreatePostModal && <CreatePostModal setShowCreatePostModal={setShowCreatePostModal} Timeline={ctx.Profile.OwnerId !== userProfile.OwnerId ? userProfile.OwnerId : 0} showRecentPost={showRecentPost}/>}
            {showAddBioModal && <AddBioModal setShowAddBioModal={setShowAddBioModal} userProfile={userProfile} />}
            {showEditDetailsModal && <EditDetailsModal setShowEditDetailsModal={setShowEditDetailsModal} userInfo={userInfo} />}
            <Header />
            {/* Pastebook Profile */}
            <div className="page">
                <ProfileHeader userProfile={userProfile} userInfo={userInfo} isPending={isPending} setIsPending={setIsPending} />
                <div className="profile-body">
                    <div className="left-side">
                        <div className="profile-intro">
                            <div className="profile-intro-text">
                                Intro
                            </div>
                            {userProfile.Bio !== "" &&
                                <div className="user-bio">
                                    <p>{userProfile.Bio}</p>
                                </div>}
                            {userProfile.Status === 'Owner' && userProfile.Bio === "" &&
                                <button className="add-bio" onClick={() => { setShowAddBioModal(true); }}>
                                    Add Bio
                                </button>}
                            {userProfile.Status === 'Owner' && userProfile.Bio !== "" &&
                                <button className="add-bio" onClick={() => { setShowAddBioModal(true); }}>
                                    Edit Bio
                                </button>}
                            {(userProfile.Status === 'Friends' || userProfile.Status === 'Owner') &&
                                <div className="user-info">
                                    <div className="user-info-details">
                                        <IconContext.Provider value={{ color: "#8c949c", size: "0.9rem" }}><VscMail />{` ${userInfo.EmailAddress}`}</IconContext.Provider>
                                    </div>
                                    {(userInfo.MobileNumber !== "" && userInfo.MobileNumber !== "09xxxxxxxxx") &&
                                    <div className="user-info-details">
                                        <IconContext.Provider value={{ color: "#8c949c", size: "0.9rem" }}><TiPhoneOutline />{` ${userInfo.MobileNumber}`}</IconContext.Provider>
                                    </div> }
                                    <div className="user-info-details">
                                        <IconContext.Provider value={{ color: "#8c949c", size: "0.8rem" }}><RiCake2Line />{` ${new Date(userInfo.Birthday * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}</IconContext.Provider>
                                    </div>
                                    <div className="user-info-details">
                                        <IconContext.Provider value={{ color: "#8c949c", size: "0.85rem" }}><IoMaleFemaleOutline />{` ${userInfo.Gender}`}</IconContext.Provider>
                                    </div>
                                </div>}
                            {userProfile.Status === 'Owner' &&
                                <button className="edit-details" onClick={() => { setShowEditDetailsModal(true); }}>
                                    Edit details
                                </button>}
                        </div>
                        <div className="for-sticky">
                        {(userProfile.Status === 'Friends' || userProfile.Status === 'Owner') &&
                            <div className="photo-section">
                                <div className="photo-title">
                                    <div className="photos-text">Albums</div>
                                    {(albums.length !== 0 || userProfile.Status === 'Owner') &&
                                    <div className="photos-link">
                                        <Link to={`/${currentUserPage.username}/albums`}> <p className="link-to">See all albums</p></Link>
                                    </div>}
                                </div>
                                {loadingAlbums && <div style={{ display: "flex", justifyContent: "center" }}><img src={Spinner} alt='' /></div>}
                                <div className="grid-pictures">
                                    {albums.map((index, key) => {
                                        var count = index.NumPhotos;
                                        return (
                                            <AlbumThumbnail key={key}
                                                onclick={`/${currentUserPage.username}/albums/${index.Id}`}
                                                // thumbnail={count === 0 ? <img src={placeholder} /> : <LazyLoadImage effect='blur' src={index.Thumbnail} />}
                                                thumbnail={count === 0 ? <img src={placeholder} /> : <img src={index.Thumbnail} />}
                                                tooltip={index.AlbumName}
                                            />
                                        )
                                    })}
                                    {(albums.length === 0 && !loadingAlbums) && <p>No Albums.</p>}
                                </div>
                            </div>}
                        <div className="terms">
                            <p>Privacy • Terms • Advertising • Ad Choices • Cookies • More • Meta </p>
                            <p>© 2022</p>
                            {/* <p>-</p> */}
                        </div>
                        </div>
                    </div>
                    <div className="right-side">
                        {(userProfile.Status === 'Friends' || userProfile.Status === 'Owner') &&
                            <div className="posts-section">
                                <div className="post-icon">
                                    <img src={userProfile.ImageSrc} className="post-profile-pic" alt="post-profile-pic" />
                                </div>
                                <div className="post-space">
                                    <button className="post-button" onClick={() => { setShowCreatePostModal(true); }}>
                                        What's on your mind?
                                    </button>
                                </div>
                            </div>
                        }
                        {(userProfile.Status === 'Friends' || userProfile.Status === 'Owner') &&
                            <>
                                <div className="main-posts">
                                    <div className="main-post-title">Posts</div>
                                </div>
                                {timelinePosts.map((post, index) => {
                                    if (index === timelinePosts.length - 1) {
                                        return <div ref={toBeObserved}><PostCard PostInfo={post} setPosts={setTimelinePosts} posts={timelinePosts} /></div>
                                    }
                                    else {
                                        return <PostCard PostInfo={post} setPosts={setTimelinePosts} posts={timelinePosts} />
                                    }
                                })}
                                {loading && <div style={{ display: "flex", justifyContent: "center" }}><img src={Spinner} alt='' /></div>}
                                {!loading && <div className='caught-up'>
                                    <div style={{ fontWeight: "500" }}>You're all caught up.</div>
                                    <div style={{ paddingTop: "0.5rem", marginBottom: "1rem" }}><i>You've seen all new posts from the past 2 weeks.</i></div>
                                </div>}
                            </>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserProfile;