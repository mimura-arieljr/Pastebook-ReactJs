//Dependencies
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'
import AuthContext from "../context/auth-context";
//Style
import './FriendRequest.css';

function FriendsList() {

    const port = "http://localhost:5000"
    const [data, setData] = useState([]);
    const ctx = useContext(AuthContext);
    let statuscode;

    useEffect(() => {
        GetFriendRequests();
    }, []);

    const GetFriendRequests = () => {
        fetch(`${port}/friendrequest`, {
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
                if (statuscode === 200 && json.length !== 0) {
                    if (data.toString() === "invalidtoken") {
                        ctx.onLogout();
                    }
                    else {
                        setData(json);
                    }
                }
            });
    };

    function handleAccept(username) {
        fetch(`${port}/accept/${username}`, {
            method: 'POST',
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
        fetch(`${port}/accept/${username}`, {
            method: 'PATCH',
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
        setData(data.filter(friendrequest => friendrequest.Username !== username))
    }

    function handleDecline(username){
        fetch(`${port}/decline/${username}`, {
            method: 'DELETE',
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
    }

    return (
        <>
            <div className='globally-container'>
                <div className='inner-container'>
                    <div className='friendsbox-container'>
                        <div className='friends-container'>
                            <div className='friends-text'>
                                <span className='friend-list'>Friend Requests</span>
                            </div>
                        </div>
                    </div>
                    <div className='profile-local-container'>
                        <div className='profile-inner-container'>
                            <div className='profile-container'>
                                {data.map((datum, i) => (
                                    <div id={i} className='profile-box'>
                                        <div className='photo-box'>
                                            <Link to={`/${datum.Username}`}><img className='image' src={datum.ImageSrc}></img></Link>
                                        </div>
                                        <div className='info-box'>
                                            <div className='text-box'>
                                                <Link className='flname-link' to={`/${datum.Username}`}><span className='user-name'>{datum.FirstName} {datum.LastName}</span></Link>
                                            </div>
                                            <div className='spacer'></div>
                                            <div className='accept'>
                                                <button id={i} className='confirm-button' onClick={() => handleAccept(datum.Username)}>Confirm</button>
                                            </div>
                                            <div className='reject'>
                                                <button id={i} className='reject-button' onClick={() => handleDecline(datum.Username)}>Delete</button>
                                            </div>
                                        </div>
                                    </div>))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default FriendsList;