// Dependencies
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
// Components
import Header from '../../components/Header';
import AuthContext from "../../context/auth-context";
import ListOfLikesModal_Photo from "../../components/ListOfLikesModal_Photo";
// Icons
import { AiOutlineLike } from "react-icons/ai";
import { AiFillLike } from "react-icons/ai";
import { AiOutlineDelete } from "react-icons/ai";
import { IconContext } from "react-icons/lib";
// Styles
import './Photo.css';

function Photo() {
    let port = "http://localhost:5000"
    let currentUserPage = useParams();
    let ctx = useContext(AuthContext);
    let navigate = useNavigate();
    const [userProfile, setUserProfile] = useState([]);
    const [userInfo, setUserInfo] = useState([]);
    const [photoInfo, setPhotoInfo] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [showListOfLikesModal, setShowListOfLikesModal] = useState(false);

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
                        navigate("/pagenotfound");
                    }
                    else {
                        setUserProfile(JSON.parse(data))
                        // OwnerId here is visited profile
                        GetUserInfo(JSON.parse(data).Status, JSON.parse(data).OwnerId)
                        GetPhoto();
                        GetLikeStatus();
                        GetAlbumDetails();
                    }
                }
            })     
    }, [isLiked]);

    function GetUserInfo(Status, OwnerId) {
        fetch(`${port}/info`, {
            headers: {
                'Status': Status,
                'OwnerId': OwnerId
            }
        })
            .then(res => res.json())
            .then(data => {
                setUserInfo(data);
            })
    }

    function GetAlbumDetails() {
        fetch(`${port}/albums/${currentUserPage.albumId}`, {
            headers: {
            'Content-Type': 'application/json',
            'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
            .then(res => res.json())
            .then(data => {
                if(data.Id === 0) {
                    navigate("/pagenotfound");
                }
            });
    }

    function GetPhoto() {
        fetch(`${port}/photos/${currentUserPage.photoId}`, {
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
            .then(res => res.json())
            .then(data => {
                setPhotoInfo(data);
                if(data.Id === 0) {
                    navigate("/pagenotfound");
                }
            });
    }

    function deletePhoto(e) {
        e.preventDefault();
        fetch(`${port}/photos/${currentUserPage.photoId}`, {
            method: 'DELETE',
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
        navigate(`/${currentUserPage.username}/albums/${currentUserPage.albumId}`);
    }

    function GetLikeStatus() {
        fetch(`${port}/likes/${currentUserPage.photoId}`, {
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken'),
                'Target' : 'Photo'
            }
        })
            .then(res => res.json())
            .then(data => {
                setIsLiked(data);
            });
    }

    function likePhoto(e) {
        e.preventDefault();
        let photoData = {
            Target: "Photo",
            TargetId: currentUserPage.photoId,
            TargetUserId: userProfile.OwnerId,
            AlbumId: currentUserPage.albumId,
            Username: currentUserPage.username
        };
        fetch(`${port}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthToken': localStorage.getItem('JSONWebToken')
            },
            body: JSON.stringify(photoData)
        })
        setIsLiked(true);
    }

    function unlikePhoto(e) {
        e.preventDefault();
        fetch(`${port}/unlike/${currentUserPage.photoId}`, {
            method: 'DELETE',
            headers: {
                'Action' : 'Like Photo',
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
        setIsLiked(false);
    }

    function ShowLikes() {
        setShowListOfLikesModal(true);
    }
    
    return (
        <div id="photo-page">
            <Header />
            <div id="photo-page-container">
                <div id="photo-page-left">
                    <div id="photo-container">
                        <img src={photoInfo.ImageSrc} alt={photoInfo.Id} />
                    </div>
                </div>
                <div id="photo-page-right">
                    <div className="right-section" id="header">
                        <div id="info">
                            <Link to = {`/${currentUserPage.username}`}><LazyLoadImage effect='blur' src={userProfile.ImageSrc} id="photo-page-profile-picture"/></Link>
                            <div id="header-text">
                                <Link to = {`/${currentUserPage.username}`}><p id="photo-page-owner-name">{userInfo.FirstName} {userInfo.LastName}</p></Link>
                                <p id="photo-date">{`${new Date(photoInfo.Timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}</p>
                            </div>
                        </div>
                        {photoInfo.NumLikes === 0 &&
                            <div className="photo-likes-count-zero">{photoInfo.NumLikes} likes</div>
                        }
                        {photoInfo.NumLikes > 1 &&
                            <div className="photo-likes-count" onClick={ShowLikes}>{photoInfo.NumLikes} likes</div>
                        }
                        {photoInfo.NumLikes === 1 &&
                            <div className="photo-likes-count" onClick={ShowLikes}>{photoInfo.NumLikes} like</div>
                        }
                        {showListOfLikesModal && <ListOfLikesModal_Photo setShowListOfLikesModal={setShowListOfLikesModal} />}
                    </div>
                    <div className="right-section">
                        <div id="like-action">
                            {userProfile.Status === 'Friends' && !isLiked &&
                                <button id="like-photo" onClick={likePhoto}>
                                    <IconContext.Provider value={{ size: "1.5rem", color: "rgb(100, 100, 100)" }}><AiOutlineLike /></IconContext.Provider>
                                    Like
                                </button>}
                            {userProfile.Status === 'Friends' && isLiked &&
                                <button id="unlike-photo" onClick={unlikePhoto}>
                                    <IconContext.Provider value={{ size: "1.5rem", color: "#2d86ff" }}><AiFillLike /></IconContext.Provider>
                                    Liked
                                </button>}
                            {userProfile.Status === 'Owner' &&
                                <button id="delete-photo" onClick={deletePhoto}>
                                    <IconContext.Provider value={{ size: "1.5rem", color: "rgb(100, 100, 100)" }}><AiOutlineDelete /></IconContext.Provider>
                                    Delete
                                </button> }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Photo;