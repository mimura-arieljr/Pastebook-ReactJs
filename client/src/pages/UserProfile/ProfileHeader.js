// Dependencies
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// Components
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
// Icons
import { TiCameraOutline } from "react-icons/ti";
import { BsFillPersonPlusFill } from "react-icons/bs";
import { BsFillPersonCheckFill } from "react-icons/bs";
import { BsFillPersonFill } from "react-icons/bs";
import { IconContext } from "react-icons/lib";
// Styles
import './ProfileHeader.css';

function ProfileHeader(props) {
    let port = "http://localhost:5000";
    let statuscode;
    let srcData = "";
    let currentUserPage = useParams();
    
    const [saveChanges, setSaveChanges] = useState(false);
    const [isFileSizeValid, setIsFileSizeValid] = useState(true);

    function encodeImageFileAsURL() {
        var filesSelected = document.getElementById("upload-image").files;
        if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];
            if(fileToLoad.size/1024/1000 > 10) {
                setIsFileSizeValid(false)
                return false
            }
            var fileReader = new FileReader();
            fileReader.onload = function (fileLoadedEvent) {
                srcData = fileLoadedEvent.target.result;
            }
            fileReader.readAsDataURL(fileToLoad);
        }
    }

    function ChangePic() {
        let postPic = {
            ImageSrc: srcData
        };
        fetch(`${port}/${currentUserPage.username}/pic`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                'AuthToken': localStorage.getItem('JSONWebToken')
            },
            body: JSON.stringify(postPic)
            })
            .then(res => {
                statuscode = res.status;
                return res.text()
            })
            .then(data => {
                if (statuscode === 200) {
                    if (data === "User Profile Picture has been updated.") {
                    }
                }
            })
        window.location.reload();
    }

    function handleAddFriend(e) {
        e.preventDefault()
        fetch(`${port}/request/${currentUserPage.username}`, {
            method: 'POST',
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
        props.setIsPending(true);
    }

    function handleAccept(e) {
        e.preventDefault()
        
        fetch(`${port}/accept/${currentUserPage.username}`, {
            method: 'POST',
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
        fetch(`${port}/accept/${currentUserPage.username}`, {
            method: 'PATCH',
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
        window.location.reload();
    }
    
    return (
        <div className="profile-top">
            <div className="profile-cover">
                <div className="profile-picture">
                    <LazyLoadImage effect='blur' src={props.userProfile.ImageSrc} id="uploaded-profile-pic" alt="uploaded-profile-pic"/>
                    {props.userProfile.Status === 'Owner' &&
                        <div className="change-profile-pic-icon">
                            <label htmlFor="upload-image" className="custom-file-upload" onClick={() => { setSaveChanges(true); }} >
                                <IconContext.Provider value={{color: "white", size: "2rem" }}><TiCameraOutline /></IconContext.Provider>
                            </label>
                            <input type="file" accept=".png, .jpg, .jpeg .gif" onChange={encodeImageFileAsURL}  id="upload-image"/>
                        </div>}
                </div>
            </div>
            {saveChanges && 
            <div className="save-container1">
                <div className="save-changes1">
                    {!isFileSizeValid && <div style={{ color: "red", fontSize: "0.75rem" }}>Maximum file size is 10MB.</div>}
                    <div>
                        <button className="sv-btn" onClick={ChangePic} >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div> }
            <div className="profile-picture-with-name">
                <div className="profile-name">{props.userInfo.FirstName} {props.userInfo.LastName}</div>
            
            </div>
            <div className="add-friend">
                {props.userProfile.Status === 'NotFriends' && !props.isPending &&
                    <button id="add-friend-button" onClick={handleAddFriend}>
                        <IconContext.Provider value={{color: "white", size: "1.25rem" }}><BsFillPersonPlusFill />Add Friend</IconContext.Provider>  
                    </button>}
                {props.userProfile.Status === 'Friends' &&
                    <button id="friends-profile-header">
                        <IconContext.Provider value={{color: "black", size: "1.25rem" }}><BsFillPersonCheckFill />Friends</IconContext.Provider>  
                    </button>}
                {props.userProfile.Status === 'PendingRequest' &&
                    <button id="pending-friend-request">
                        <IconContext.Provider value={{color: "black", size: "1.25rem" }}><BsFillPersonFill />Pending</IconContext.Provider>  
                    </button>}
                {props.userProfile.Status === 'PendingAccept' &&
                    <button id="accept" onClick={handleAccept}>
                        <IconContext.Provider value={{color: "white", size: "1.25rem" }}><BsFillPersonFill />Accept</IconContext.Provider>  
                    </button>}
                {props.isPending &&
                    <button id="pending-friend-request">
                        <IconContext.Provider value={{color: "black", size: "1.25rem" }}><BsFillPersonFill />Pending</IconContext.Provider>  
                    </button>}
            </div>
        </div>
    );
}

export default ProfileHeader;