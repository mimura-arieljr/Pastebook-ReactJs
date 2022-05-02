// Dependencies
import React, { useRef, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
// Icons
import { IconContext } from "react-icons";
import { BsFacebook } from "react-icons/bs";
import { IoIosNotifications, IoIosLogOut, IoIosCloseCircle } from "react-icons/io";
import { IoSettingsSharp } from "react-icons/io5";
// Components
import AuthContext from "../context/auth-context";
import Notifications from "./Notifications";
import SearchDropdown from "./SearchDropdown";
// Style
import './Header.css';


const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false)
    const [searchParam, setSearchParam] = useState('')
    const searchDropdownElement = useRef(null)
    const ctx = useContext(AuthContext);
    let port = "http://localhost:5000"
    const currentUserId = useRef('');
    const [postUser, setPostUser] = useState([])
    const [postUserProfile, setPostUserProfile] = useState([])
    const [userInfo, setUserInfo] = useState([])
    const [isNewNotification, setIsNewNotification] = useState(false);
    const [isFetching, setIsFetching] = useState(false)

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

    // fetch data for search bar 
    useEffect(() => {
        setIsFetching(true)
        fetch(`${port}/search`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.text())
            .then(data => {
                setIsFetching(false)
                setUserInfo(JSON.parse(data))
            })

        var interval = setInterval(() => { notificationListener() }, 8000)
        return (() => clearInterval(interval));
    }, [])

    function notificationListener() {
        fetch(`${port}/newactivity`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
            .then(res => res.text())
            .then(data => {
                if (data === "Unread") {
                    setIsNewNotification(true);
                }
            })
    }

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

    // Open search dropdown if there is input and close it if there is none
    function handleSearchInput() {
        if (searchDropdownElement.current.value) {
            setSearchParam(searchDropdownElement.current.value);
            setShowSearchDropdown(true)
        }
        else (
            setShowSearchDropdown(false)
        )
    }

    // Resets search input
    function removeSearchParam() {
        searchDropdownElement.current.value = "";
        setShowSearchDropdown(false)
    }

    function setNotificationState(state) {
        setShowNotifications(state);

        //if state is false, update Unread Activities to Read
        if (!state) {
            fetch(`${port}/activities/read`, {
                method: 'PATCH',
                headers: {
                    'AuthToken': localStorage.getItem('JSONWebToken')
                }
            })
            setIsNewNotification(false);
        }
    }

    return (
        <div id="header-container">
            {showNotifications && <Notifications />}
            {showSearchDropdown && <SearchDropdown searchParam={searchParam} userInfo={userInfo} isFetching={isFetching} removeSearchParam={removeSearchParam}/>}

            <div id="searchbar-container">
                <Link to='/'><IconContext.Provider value={{ color: "white", size: "2.5rem" }}><BsFacebook /></IconContext.Provider></Link>
                <input id="search" ref={searchDropdownElement} placeholder="Search Pastebook..." autoComplete="off" onChange={handleSearchInput} />
                {showSearchDropdown && <IconContext.Provider value={{ color: "white", size: "2.0rem" }}><span id="remove-search-param" onClick={removeSearchParam}><IoIosCloseCircle /></span></IconContext.Provider>}
            </div>
            <div id="navigation-container">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem" }} className="header-profile-pic">
                    <Link to={`/${ctx.Profile.Username}`}><LazyLoadImage effect='blur' src={postUserProfile.ImageSrc} alt='' loading="lazy" className="icon header-profile-pic" /></Link>
                    <Link to={`/${ctx.Profile.Username}`} style={{ textDecoration: "none" }}><p style={{ color: "white" }}>{postUser.FirstName}</p></Link>
                </div>
                <div>
                    <IconContext.Provider value={{ color: "white", size: "2.0rem" }}><span className="icon" onClick={() => setNotificationState(!showNotifications)}><IoIosNotifications /></span>
                        {isNewNotification && <div className='red-dot'>•</div>}
                    </IconContext.Provider>
                </div>
                <Link to='/settings'><IconContext.Provider value={{ color: "white", size: "2.0rem" }}><span className="icon"><IoSettingsSharp /></span></IconContext.Provider></Link>
                <IconContext.Provider value={{ color: "white", size: "2.0rem" }}><span className="icon" onClick={ctx.onLogout}><IoIosLogOut /></span></IconContext.Provider>
            </div>
        </div>
    )
};

export default Header;
