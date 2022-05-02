// Dependencies
import React, { useEffect, useRef, useContext } from 'react';
import AuthContext from "../context/auth-context";
import autosize from 'autosize';
// Styles
import './CreatePostModal.css'

const CreatePostModal = (props) => {
    const postContent = useRef('')
    let postImage = "";
    const ctx = useContext(AuthContext)
    const port = "http://localhost:5000"
    useEffect(() => {
        autosize(document.querySelectorAll('textarea'));
    }, [])

    function exitModal() {
        props.setShowCreatePostModal(false)
    }

    function SubmitPost() {
        let postData = {
            // Timeline = 0 if posted on NewsFeed
            Timeline: props.Timeline,
            Content: postContent.current.value,
            ImageSrc: postImage
        };
        fetch(`${port}/createpost`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthToken': localStorage.getItem('JSONWebToken')
            },
            body: JSON.stringify(postData)
        })
            .then(res => res.text())
            .then(data => {
                props.showRecentPost(JSON.parse(data))
            })

        exitModal()
    }

    function encodeImageFileAsURL() {
        postImage = "";
        var filesSelected = document.getElementById("upload-image").files;
        if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];
            var fileReader = new FileReader();
            fileReader.onload = function (fileLoadedEvent) {
                postImage = fileLoadedEvent.target.result;
            }
            fileReader.readAsDataURL(fileToLoad);
        }
    }

    return (
        <div id="outer-createpost">
            <div id="inner-createpost">
                <div className='createpost-section createpost-section-title'>
                    <p id="createpost-header">Create Post</p>
                    <button id="createpost-exit" onClick={exitModal}>X</button>
                </div>
                <hr className='horizontal-divider' />
                <div className='createpost-section' style={{ justifyContent: "center" }}>
                    <img src={ctx.Profile.ImageSrc} alt='' id='createpost-profile-picture' />
                    <br />
                </div>
                <div className='createpost-section' style={{ width: "100%" }}>
                    <textarea ref={postContent} className="createpost-input" type="text" placeholder="What's on your mind?" maxLength="1000" rows="1" />
                </div>

                <div className='createpost-section' style={{ gap: "1rem" }}>
                    <p>Upload an image: </p>
                    {/* <input type="text"/> */}
                    <input id="upload-image" type="file" accept=".png, .jpg, .jpeg .gif" onChange={encodeImageFileAsURL} />
                </div>
                <hr className='horizontal-divider' />
                <div className='createpost-section' style={{ width: "100%" }}>
                    <button id="createpost-button" onClick={SubmitPost}>Post</button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
