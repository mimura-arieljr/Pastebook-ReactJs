// Dependencies
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Icons
import { AiOutlinePlus } from "react-icons/ai";
import { IconContext } from "react-icons/lib";
import Spinner from '../../loading-spinner.gif'
// Components
import AuthContext from "../../context/auth-context";
import Header from '../../components/Header';
import ProfileHeader from "../UserProfile/ProfileHeader";
import AlbumItem from "./AlbumItem";
import CreateAlbumModal from '../AlbumView/CreateAlbumModal';
import placeholder from './empty-album-placeholder.png';
// Style
import './Albums.css';

function Albums() {
    let port = "http://localhost:5000"
    let currentUserPage = useParams();
    let ctx = useContext(AuthContext);
    let navigate = useNavigate();
    const [userProfile, setUserProfile] = useState([]);
    const [userInfo, setUserInfo] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loadingAlbums, setLoadingAlbums] = useState(false)
    const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);

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
                        GetAllAlbums(JSON.parse(data).OwnerId);
                    }
                }
                // Add other error handlers
            })
    }, []);

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

   function GetAllAlbums(OwnerId) {
    setLoadingAlbums(true)
    fetch(`${port}/albums`, {
        headers: {
            'OwnerId' : OwnerId
        }
    })
        .then(res => res.json())
        .then(data => {
            setAlbums(data)
            setLoadingAlbums(false)
        });    
    }

    return (
        <div id="albums-page">
            <Header />
            <div id="albums-page-container">
                <div id="albums-page-header">
                    <ProfileHeader userProfile={userProfile} userInfo={userInfo} />
                </div>
                <div id="albums-page-body">
                    <h1>Albums</h1>
                    <div id="albums-item-container">
                        {userProfile.Status === 'Owner' &&
                            <div className="album-item" id="create-album-container" onClick={() => {setShowCreateAlbumModal(true);}}>
                                <div id="create-album">
                                    <IconContext.Provider value={{ size: "2rem" }}><AiOutlinePlus /></IconContext.Provider>
                                </div>
                                <p className="album-title" id="create-album-text">Create Album</p>
                            </div>}
                        {showCreateAlbumModal && <CreateAlbumModal setShowCreateAlbumModal={setShowCreateAlbumModal} />}
                        {loadingAlbums && <div><div style={{ display: "flex", justifyContent: "center" }}><img src={Spinner} alt='' /></div></div>}
                        {albums.map((index, key) => {
                            return (
                                <AlbumItem key={key}
                                    onclick = {`/${currentUserPage.username}/albums/${index.Id}`}
                                    thumbnail = {index.NumPhotos === 0 ? <img className="thumbnail" src={placeholder}/> : <img className="thumbnail" src={index.Thumbnail}/>} 
                                    title = {index.AlbumName} 
                                    count = {index.NumPhotos === 1 ? <>{index.NumPhotos} photo </> : <>{index.NumPhotos} photos</>} 
                                />
                            );
                            
                        })}
                    </div>
                </div>
            </div> 
        </div>
    );
}

export default Albums;