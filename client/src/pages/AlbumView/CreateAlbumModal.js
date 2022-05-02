// Dependencies
import React, { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Style
import './AlbumModal.css';

function CreateAlbumModal(props) {
    let port = "http://localhost:5000";
    let currentUserPage = useParams();
    var navigate = useNavigate();
    var albumName = useRef('');
    
    function createAlbum(e) {
        e.preventDefault();
        fetch(`${port}/create-album`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthToken': localStorage.getItem('JSONWebToken')
            },
            body: JSON.stringify({AlbumName : `${albumName.current.value}`})
        })
        .then(res => res.json())
        .then(data => {
            navigate(`/${currentUserPage.username}/albums/${data}`);
        });
    }

    return (
        <div className="album-modal-outer">
            <div className="album-modal-content">
                <div className="album-modal-header">
                    <p className="album-modal-header-text">Create Album</p>
                    <div className="album-modal-close">
                        <button onClick={() => {props.setShowCreateAlbumModal(false);}}>
                        &times;
                        </button>    
                    </div>
                </div>
                <div>
                    <div className="album-modal-textbox" id="create-album-textbox">
                        <textarea ref={albumName} className="album-name-input" type="text" maxLength="200" placeholder="Album name" />
                    </div>
                    <div className="album-modal-footer">
                        <button onClick={() => {props.setShowCreateAlbumModal(false)}} className="cancel-btn">
                            Cancel
                        </button>
                        <button className="create-btn" name="create" onClick={createAlbum}>Create</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateAlbumModal;