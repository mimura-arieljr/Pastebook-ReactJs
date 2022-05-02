// Dependencies
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Style
import './AlbumModal.css';

function AddPhotoModal(props) {
    let port = "http://localhost:5000";
    let currentUserPage = useParams();
    const [isFileSizeValid, setIsFileSizeValid] = useState(true);
    let albumPhoto = "";
    
    function encodeImageFileAsURL() {
        var filesSelected = document.getElementById("upload-photo").files;  
        if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];
            if(fileToLoad.size/1024/1000 > 10) {
                setIsFileSizeValid(false)
                return false
            }
            var fileReader = new FileReader();
            
            fileReader.onload = function (fileLoadedEvent) {
                albumPhoto = fileLoadedEvent.target.result;
                
            }
            fileReader.readAsDataURL(fileToLoad);
        }
    }

    function addPhoto() {
        props.Load(true)
        let photoData = {
            AlbumId : currentUserPage.albumId,
            ImageSrc : albumPhoto
        }
        fetch(`${port}/add-photo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(photoData)
        })
        .then(res => res.json())
        .then(data => {
            props.SetPhotos(Photos => [...Photos, data]);
            props.Load(false)
        }); 
        props.setShowAddPhotoModal(false);
    }

    return (
        <div className="album-modal-outer">
            <div className="album-modal-content">
                <div className="album-modal-header">
                    <p className="album-modal-header-text">Add Photo</p>
                    <div className="album-modal-close">
                        <button onClick={() => {props.setShowAddPhotoModal(false);}}>
                        &times;
                        </button>    
                    </div>
                </div>
                {props.Photos.length <= 49 && props.Photos.length >= 0 &&
                <div style={{width: "100%"}}>
                    <div className="album-modal-textbox" id="create-album-textbox">
                        <input id="upload-photo" type="file" accept=".png, .jpg, .jpeg .gif" onChange={encodeImageFileAsURL} />
                        {!isFileSizeValid && <p style={{ color: "red", fontSize: "0.75rem", marginTop: "0.25rem" }}>Maximum file size is 10MB.</p>}
                        
                    </div>
                    <div className="album-modal-footer">
                        <button onClick={() => {props.setShowAddPhotoModal(false)}} className="cancel-btn">
                            Cancel
                        </button>
                        <button type ="submit" className="upload-btn" name="upload" onClick={addPhoto}>Upload</button>
                    </div>
                </div>}
                {props.Photos.length === 50 && 
                    <div className="max-num-of-photos" style={{width: "100%"}}>
                        <p>You've reached the maximum allowed photos (<span>50</span>) in an album.</p>
                    </div>}
            </div>
        </div>
    );
}

export default AddPhotoModal;
