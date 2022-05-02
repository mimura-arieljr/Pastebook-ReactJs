//Dependencies
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'
import AuthContext from "../context/auth-context";
//Components
import FriendRequest from './FriendRequests';
//Style
import './FriendsList.css';

function FriendsList() {

    const port = "http://localhost:5000"
    const [data, setData] = useState([]);
    const ctx = useContext(AuthContext);
    const [showFriendRequest, setShowFriendRequest] = useState(false);
    const [showFriendList, setShowFriendList] = useState(true);
    const [buttonFriend, setButtonFriend] = useState(true);
    const [buttonFriendRequest, setButtonFriendRequest] = useState(false);
    const [searchWord, setSearchWord] = useState('');
    let statuscode;

    useEffect(() => {
        GetFriends();
    }, [buttonFriend, buttonFriendRequest]);

    const GetFriends = () => {
        fetch(`${port}/friends`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
            .then((res) => {
                statuscode = res.status;
                return res.json();
            })
            .then((json) => {
                if (statuscode === 200) {
                    if (data === "invalidtoken") {
                        ctx.onLogout();
                    }
                    else {
                        setData(json);
                    }
                }
            });
    };

    return (
        <>
            <div className='friend-request'>
                <button style={{ backgroundColor: buttonFriend && "#4267b2" }} className='friend-button' onClick={() => { setShowFriendRequest(false); setShowFriendList(true); setButtonFriend(true); setButtonFriendRequest(false); }}>Friends</button>
                <button style={{ backgroundColor: buttonFriendRequest && "#4267b2" }} className='friend-request-button' onClick={() => { setShowFriendRequest(true); setShowFriendList(false); setButtonFriendRequest(true); setButtonFriend(false) }}>Friend Requests</button>
            </div>

            {showFriendRequest && <FriendRequest />}
            {showFriendList && <div className='global-holder'>
                <div className='friends-holder'>
                    <div className='friendlist-text'>
                        <span className='text-friend'>Friends</span>
                    </div>
                    <div className='search-friend'>
                        <input type="search" placeholder='Search' className='search-field' onChange={(e) => { setSearchWord(e.target.value) }}></input>
                    </div>
                </div>

                <div className='box-wrapper'>
                    {data.filter((datum) => {
                        if (searchWord == "") 
                        {
                            return datum
                        }
                        else if (datum.FirstName.toLowerCase().includes(searchWord.toLowerCase())
                        || datum.LastName.toLowerCase().includes(searchWord.toLocaleLowerCase()))
                        {
                            return datum
                        }
                    }).map((datum, i) => (
                        <div id={i} className='friend-profile-box'>
                            <div className='friend-profile-pic'>
                                <Link to={`/${datum.Username}`}><img className='image-sample-friend' src={datum.ImageSrc}></img></Link>
                            </div>
                            <div className='friend-name'>
                                <Link className='flname-link' to={`/${datum.Username}`}><span className='flname'>{datum.FirstName} {datum.LastName}</span></Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>}
        </>
    )
}

export default FriendsList;