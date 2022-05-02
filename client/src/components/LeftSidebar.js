// Dependecies
import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
// Components
import AuthContext from '../context/auth-context';
// Icons
import { IconContext } from "react-icons";
import { FaUserFriends } from "react-icons/fa";
// Styles
import './LeftSidebar.css'

const LeftSidebar = () => {
    let port = "http://localhost:5000"
    const ctx = useContext(AuthContext)
    const currentUserId = useRef('');
    const [postUser, setPostUser] = useState([])
    const [postUserProfile, setPostUserProfile] = useState([])

    useEffect(() => {
        fetch(`${port}/getid`, {
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
            .then(res => res.text())
            .then(data => {
                if (data === 'invalidtoken') {
                    ctx.onLogout()
                }
                else {
                    currentUserId.current = data;
                    getUsernameAndImage()
                }
            })
    }, [])

    function getUsernameAndImage() {
        fetch(`${port}/getpostuserprofile/${currentUserId.current}`)
            .then(res => res.json())
            .then(data => {
                setPostUserProfile(data)
            })

        fetch(`${port}/getpostuser/${currentUserId.current}`)
            .then(res => res.json())
            .then(data => {
                setPostUser(data)
            })
    }

    return (
        <div id="sidebar-container">
            <Link to={`/${ctx.Profile.Username}`} style={{ textDecoration: "none" }}>
                <div className='sidebar-row'>
                    <div className='sidebar-images'>
                        <LazyLoadImage effect='blur' src={postUserProfile.ImageSrc} className='sidebar-icon' alt='' placeholderSrc='../loading-spinner.gif' />
                    </div>
                    <p className='sidebar-text'>{postUser.FirstName} {postUser.LastName}</p>
                </div>
            </Link>
            <Link to='/friends' style={{ textDecoration: "none" }}>
                <div className='sidebar-row'>
                    <div className='sidebar-images'>
                        <IconContext.Provider value={{ color: "#4267B2", size: "2.0rem" }}><FaUserFriends /></IconContext.Provider>
                    </div>
                    <p className='sidebar-text'>Friends</p>
                </div>
            </Link>
        </div>
    );
};

export default LeftSidebar;
