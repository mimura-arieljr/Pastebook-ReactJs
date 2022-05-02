import React, { useContext, useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import AuthContext from '../context/auth-context';
import './Notifications.css'
import Spinner from '../loading-spinner.gif'

const Notifications = (props) => {

    const port = "http://localhost:5000";
    const [data, setData] = useState([]);
    const [isFetching, setIsFetching] = useState(false)
    const ctx = useContext(AuthContext);
    let statuscode;

    useEffect(() => {
        GetActivities();
    }, []);

    const GetActivities = () => {
        setIsFetching(true)
        fetch(`${port}/activities`, {
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
                setIsFetching(false)
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
        <div id="notifications-container" ref={props.ref}>
            {isFetching && <div style={{ display: "flex", justifyContent: "center" }}><img src={Spinner} alt='' style={{ height: "3rem", width: "3rem" }} /></div>}
            {data.map((datum, i) => (
                <NotificationItem link={datum.Link} desc={datum.Description} img={datum.ImageSrc} state={datum.State} date={datum.Date} />
            ))}
            {!isFetching && <div className='notifications-item' style={{ justifyContent: "center", height: "2.5rem" }}>
                <div className='notifications-action'>
                    <p className='notification-text'>You're All Caught Up</p>
                </div>
            </div>}
        </div>
    );
};

function NotificationItem(props) {
    const notifText = useRef("")

    // Truncates notification text to 90 characters then adds an ellipses
    useEffect(() => {
        if (notifText.current.textContent.length > 90) {
            notifText.current.textContent = notifText.current.textContent.substring(0, 90) + "..."
        }
    }, [])

    return (
        <Link to={props.link} style={{ textDecoration: "none" }}>
            <div className='notifications-item'>
                <div className='notifications-doneby'>
                    <img src={props.img} alt='' className='notifications-doneby-icon' />
                </div>
                <div className='notifications-action'>
                    <p className='notification-text' ref={notifText}>{props.desc}</p>
                    <p className='relative-date'>{props.date}</p>
                </div>
                {props.state === 'Unread' &&
                    <span class="dot"></span>
                }
            </div>
        </Link>
    )
}

export default Notifications;
