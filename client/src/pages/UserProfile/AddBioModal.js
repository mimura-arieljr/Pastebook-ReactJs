// Dependencies
import React, { useState } from "react";
import { useParams } from "react-router-dom";
// Styles
import "./AddBioModal.css";

function AddBioModal(props) {
    let port = "http://localhost:5000";
    let currentUserPage = useParams();
    let statuscode;
    const [ bioCharacterCount, setBioCharacterCount ] = useState(0);
    const count = e => {
        setBioCharacterCount(e.target.value.length);
    }

    function ModifyBio(e) {
        e.preventDefault();
        const bioDetails = new FormData(document.getElementById('addbio-form'));
        const bioDetailsJson = Object.fromEntries(bioDetails.entries());

        fetch(`${port}/${currentUserPage.username}/bio`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                'AuthToken': localStorage.getItem('JSONWebToken')
            },
            body: JSON.stringify(bioDetailsJson)
        })
            .then(res => {
                statuscode = res.status;
                return res.text()
        })
            .then(data => {
                if (statuscode === 200) {
                    if (data === "User Profile Bio has been updated.") {
                    }
                }
        })
        props.setShowAddBioModal(false);
    }

    return (
        <div id="addbio-outer">
            <div id="addbio-content">
                <div className="addbio-header">
                    <p id="addbio-header-text">Add Bio</p>
                    <div className="addbio-close">
                        <button onClick={() => { props.setShowAddBioModal(false); }}>
                        &times;
                        </button>    
                    </div>
                </div>
                <form id="addbio-form" onSubmit={ModifyBio}>
                    <div className="addbio-textbox">
                        <textarea name="Bio" className="addbio-input" type="text" defaultValue={props.userProfile.Bio} placeholder="Describe who you are..." maxLength="2000" onChange={count} />
                        <div className="character-count">
                            <p>{2000 - bioCharacterCount} characters remaining</p>
                        </div>
                    </div>
                    <div className="addbio-footer">
                        <button onClick={() => { props.setShowAddBioModal(false)}} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" className="save-btn" name="save">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddBioModal;