// Dependencies
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Style
import './AlbumModal.css';

function DeleteAlbumModal({setShowDeleteAlbumModal}) {
    let port = "http://localhost:5000"
    let navigate = useNavigate();
    let currentUserPage = useParams();
    const [ color, setColor ] = useState("#1770e4");

    function deleteAlbum(e) {
        e.preventDefault();
        fetch(`${port}/albums/${currentUserPage.albumId}`, {
            method: 'DELETE',
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
        navigate(`/${currentUserPage.username}/albums`);
    }

    return (
        <div className="album-modal-outer">
            <div className="album-modal-content">
                <div className="album-modal-header">
                    <p className="album-modal-header-text">Delete Album?</p>
                    <div className="album-modal-close">
                        <button onClick={() => {setShowDeleteAlbumModal(false);}}>
                        &times;
                        </button>    
                    </div>
                </div>
                <div>
                    <div className="album-modal-textbox">
                        <div id="delete-confirmation-text">
                            All media in this album will also be deleted. Are you sure that you want to delete this?
                        </div>
                    </div>
                    <div className="album-modal-footer">
                        <button onClick={() => {setShowDeleteAlbumModal(false)}} className="cancel-btn">
                            Cancel
                        </button>
                        <button className="delete-album-btn" 
                            onClick={deleteAlbum} 
                            style={{background: `${color}`}}
                            onMouseEnter={() => setColor("#5183c5")}
                            onMouseLeave={() => setColor("#1770e4")}>
                                Delete Album
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteAlbumModal;