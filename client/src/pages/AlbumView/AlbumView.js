// Dependencies
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Icons 
import { IconContext } from "react-icons/lib";
import { MdEdit } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { GoPlus } from "react-icons/go";
import Spinner from '../../loading-spinner.gif'
// Components
import Header from '../../components/Header';
import ProfileHeader from "../UserProfile/ProfileHeader";
import PhotoThumbnail from './PhotoThumbnail';
import RenameAlbumModal from './RenameAlbumModal';
import DeleteAlbumModal from './DeleteAlbumModal';
import AddPhotoModal from "./AddPhotoModal";
import AuthContext from "../../context/auth-context";
import PageNotExisting from "../PageNotFound";
// Style
import './AlbumView.css';

function AlbumView() {
    let port = "http://localhost:5000"
    let currentUserPage = useParams();
    let navigate = useNavigate();
    let ctx = useContext(AuthContext);
    let count = 0;
    const [showRenameAlbumModal, setShowRenameAlbumModal] = useState(false);
    const [showDeleteAlbumModal, setShowDeleteAlbumModal] = useState(false);
    const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
    const [userProfile, setUserProfile] = useState([]);
    const [userInfo, setUserInfo] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [ albumInfo, setAlbumInfo ] = useState([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    
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
                    }
                    GetAllPhotos();
                }
                // Add other error handlers
            })
    }, []);

    useEffect(() => {
        GetAlbumDetails();
    }, [showAddPhotoModal])  

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

    function GetAllPhotos() {
        setLoadingPhotos(true)
        fetch(`${port}/photos`, {
            headers: {
            'AlbumId' : currentUserPage.albumId,
            'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
            .then(res => res.json())
            .then(data => {
                setPhotos(data)
                setLoadingPhotos(false)
            });
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
                setAlbumInfo(data);
                if(data.Id === 0) {
                    navigate("/pagenotfound");
                }
            });
    }

    count = photos.length;
    
    return (
        <div id="album-view">
            <Header />
            <div id="album-view-container">
                <ProfileHeader userProfile={userProfile} userInfo={userInfo} />
                <div className="album-view-body" id="album-view-header">
                    <div id="left-header">
                        <h1>{albumInfo.AlbumName}</h1>
                        {count === 1 && <p className="album-photo-count" style={{fontSize: "1rem", margin: 0}}>{count} photo</p>}
                        {count !== 1 && <p className="album-photo-count" style={{fontSize: "1rem", margin: 0}}>{count} photos</p>}
                    </div>
                    {userProfile.Status === 'Owner' &&
                        <div id="right-header">
                            <button id="edit-album-name" onClick={() => {setShowRenameAlbumModal(true)}}>
                                <IconContext.Provider value={{size: "1.5rem", color: "rgb(120, 120, 120)"}}><MdEdit /></IconContext.Provider>
                            </button>
                            {showRenameAlbumModal && <RenameAlbumModal setShowRenameAlbumModal={setShowRenameAlbumModal} />}
                            <button id="delete-album" onClick={() => {setShowDeleteAlbumModal(true)}}>
                                <IconContext.Provider value={{size: "1.5rem", color: "rgb(120, 120, 120)"}}><AiOutlineDelete /></IconContext.Provider>
                            </button>
                            {showDeleteAlbumModal && <DeleteAlbumModal setShowDeleteAlbumModal={setShowDeleteAlbumModal} />}
                        </div>}
                        
                </div>
                <div className="album-view-body" id="album-view-content">
                {userProfile.Status === 'Owner' &&
                    <div className="album-view-photo" id="add-photo-container">
                        <div id="add-photo" onClick={() => {setShowAddPhotoModal(true)}}>
                            <div id="add-photo-text">
                                <IconContext.Provider value={{size: "1.75rem"}}><GoPlus /></IconContext.Provider>
                                <p>Add to Album</p>
                            </div>
                        </div>
                    </div>}
                    {showAddPhotoModal && <AddPhotoModal setShowAddPhotoModal={setShowAddPhotoModal} SetPhotos={setPhotos} Photos={photos} Count={count} Load={setLoadingPhotos}/>}
                    {(userProfile.Status === 'Friends' && count === 0 && !loadingPhotos) && <p>This album is empty.</p>}
                    {photos.map((index,key) => {
                        return (
                            <PhotoThumbnail key = {key}
                                imgsrc = {index.ImageSrc} 
                                onclick = {`/${currentUserPage.username}/albums/${currentUserPage.albumId}/${index.Id}`} />
                        )
                    })}
                    {loadingPhotos && <div style={{ display: "flex", justifyContent: "center", width: "12rem", height: "12rem"}}><img src={Spinner} alt='' /></div>}
                </div>
                
            </div>
        </div>
    );
}

export default AlbumView;