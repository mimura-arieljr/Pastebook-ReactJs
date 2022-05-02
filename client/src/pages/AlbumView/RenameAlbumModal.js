// Dependencies
import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
// Style
import './AlbumModal.css';

function RenameAlbumModal({setShowRenameAlbumModal}) {
    let port = "http://localhost:5000"
    let currentUserPage = useParams();
    var editedAlbumName = useRef('');
    const [ color, setColor ] = useState("#1770e4");

    function handleSubmit() {
        fetch(`${port}/albums/${currentUserPage.albumId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'AuthToken': localStorage.getItem('JSONWebToken')
            },
            body: JSON.stringify({AlbumName : `${editedAlbumName.current.value}`})
        })
    }

    return (
        <div className="album-modal-outer">
            <div className="album-modal-content">
                <div className="album-modal-header">
                    <p className="album-modal-header-text">Rename Album</p>
                    <div className="album-modal-close">
                        <button onClick={() => {setShowRenameAlbumModal(false);}}>
                        &times;
                        </button>    
                    </div>
                </div>
                <form id="rename-album-form">
                    <div className="album-modal-textbox">
                        <textarea ref={editedAlbumName} className="rename-album-input" type="text" maxLength="200" />
                    </div>
                    <div className="album-modal-footer">
                        <button onClick={() => {setShowRenameAlbumModal(false)}} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit"
                            className="save-btn"
                            name="save"
                            onClick={handleSubmit}
                            style={{background: `${color}`}}
                            onMouseEnter={() => setColor("#5183c5")}
                            onMouseLeave={() => setColor("#1770e4")}>
                                Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RenameAlbumModal;