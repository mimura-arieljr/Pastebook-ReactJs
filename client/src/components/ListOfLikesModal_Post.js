// Dependencies
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// Style
import "./ListOfLikesModal.css";

function ListOfLikesModal_Post(props) {
    let port = "http://localhost:5000"
    const [listOfLikes, setListOfLikes] = useState([]);

    useEffect(() => {
        fetch(`${port}/likes/list/${props.PostInfo.Id}`, {
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken'),
                'Target': 'Post'
            }
        })
            .then(res => res.json())
            .then(data => {
                setListOfLikes(data);
            });
    }, []);

    return (
        <div className="list-modal-outer">
            <div className="list-modal-content">
                <div className="list-modal-header">
                    <p className="list-modal-header-text">Liked By</p>
                    <div className="list-modal-close">
                        <button onClick={() => { props.setShowListOfLikesModal(false) }}>
                            &times;
                        </button>
                    </div>
                </div>
                <div className="list-modal-body" style={{ width: "100%" }}>
                    {listOfLikes.map((index, key) => {
                        return (
                            <>
                                <div className="list-of-likes" key={key}>
                                    <Link to={`/${index.Username}`}><img src={index.ProfilePic} alt='' /></Link>
                                    <Link to={`/${index.Username}`}><p className="liked-by-info">{index.FirstName} {index.LastName}</p></Link>
                                </div>
                            </>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default ListOfLikesModal_Post;