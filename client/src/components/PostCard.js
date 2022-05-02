// Dependencies
import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom'
import autosize from 'autosize';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
// Icons
import { IconContext } from "react-icons";
import { FaThumbsUp } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs"
import { MdPlayArrow } from "react-icons/md"
import Spinner from '../loading-spinner.gif'
// Components
import AuthContext from '../context/auth-context';
import ListOfLikesModal_Post from './ListOfLikesModal_Post';
// Styles
import './PostCard.css'

const PostCard = (props) => {
    let port = "http://localhost:5000"
    // let updatePostImage = ""
    const [updatePostImage, setUpdatePostImage] = useState(props.PostInfo.ImageSrc)
    const updatePostContent = useRef('')
    const CurrentUserComment = useRef('')
    const ctx = useContext(AuthContext)
    const [isPostOwner, setIsPostOwner] = useState(false)
    const [showModifyMenu, setShowModifyMenu] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [isFileSizeValid, setIsFileSizeValid] = useState(true)
    const [postUser, setPostUser] = useState([])
    const [postUserProfile, setPostUserProfile] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [targetUser, setTargetUser] = useState([])
    const [isLiked, setIsLiked] = useState(false)
    const [comments, setComments] = useState([])
    const [showListOfLikesModal, setShowListOfLikesModal] = useState(false)
    const [loadingComments, setLoadingComments] = useState(false)

    useEffect(() => {
        autosize(document.querySelectorAll('textarea'));
        fetch(`${port}/getpostuser/${props.PostInfo.OwnerId}`)
            .then(res => res.json())
            .then(data => {
                GetLikeStatus()
                setPostUser(data)
                getUsernameAndImage()
            })

        // If current user id is equal to post ownerid, then its his post
        checkIfOwner();
        if (props.PostInfo.Timeline !== 0) {
            GetTargetUser()
        }

        GetComments()
    }, [ctx.Profile, props.PostInfo.OwnerId])

    function checkIfOwner() {
        setIsPostOwner(false)
        if (ctx.Profile.OwnerId && props.PostInfo.OwnerId && ctx.Profile.OwnerId === props.PostInfo.OwnerId) {
            setIsPostOwner(true)
        }
    }

    function getUsernameAndImage() {
        fetch(`${port}/getpostuserprofile/${props.PostInfo.OwnerId}`)
            .then(res => res.json())
            .then(data => {
                setPostUserProfile(data)
            })
    }

    function deletePost() {
        fetch(`${port}/posts/${props.PostInfo.Id}`, {
            method: "DELETE",
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
            .then(res => res.text())
            .then(data => {
                if (data === 'invalidtoken') {
                    ctx.onLogout();
                }
                else {
                    deletePostFromArray()
                }
            })
    }

    function deletePostFromArray() {
        let myArray = props.posts
        myArray = myArray.filter((post) => post.Id !== props.PostInfo.Id)
        props.setPosts(myArray)
    }

    function submitEdit() {
        setIsUploading(true)
        let postData = {
            Content: updatePostContent.current.value,
            ImageSrc: updatePostImage
        };
        fetch(`${port}/posts/${props.PostInfo.Id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': "application/json",
                'AuthToken': localStorage.getItem('JSONWebToken')
            },
            body: JSON.stringify(postData)
        })
            .then(res => res.text())
            .then(data => {
                if (data === 'invalidtoken') {
                    ctx.onLogout();
                }
                else {
                    setEditMode(false)
                    setIsUploading(false)
                }
            })
        editPostFromArray()
    }

    function editPostFromArray() {
        let myArray = props.posts
        let indexOfPost = myArray.map((post) => post.Id).indexOf(props.PostInfo.Id)
        myArray[indexOfPost].Content = updatePostContent.current.value
        myArray[indexOfPost].ImageSrc = updatePostImage
        props.setPosts(myArray)
    }

    function GetTargetUser() {
        fetch(`${port}/gettargetuser`, {
            headers: {
                'Content-Type': "application/json",
                'TargetUserId': props.PostInfo.Timeline
            }
        })
            .then(res => res.json())
            .then(data => {
                setTargetUser(data);
            })
    }

    function encodeImageFileAsURL() {
        setIsFileSizeValid(true);
        setUpdatePostImage("")
        var filesSelected = document.getElementById("change-post-image").files;
        if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];
            if (fileToLoad.size / 1024 / 1000 > 10) {
                document.getElementById("change-post-image").value = ""
                setIsFileSizeValid(false)
                return false
            }
            var fileReader = new FileReader();
            fileReader.onload = function (fileLoadedEvent) {
                setUpdatePostImage(fileLoadedEvent.target.result);
            }
            fileReader.readAsDataURL(fileToLoad);
        }
    }

    function convertTimestampToRelative() {
        let type; // s, m, h, w
        let timeValue;
        const timeSecondsAgo = Math.floor((new Date() - props.PostInfo.Timestamp) / 1000)
        if (timeSecondsAgo < 60) {
            type = 's'
            timeValue = (timeSecondsAgo).toString()
            return "A few seconds ago"
        }
        else if (timeSecondsAgo >= 60 && timeSecondsAgo < 3600) {
            type = 'm'
            timeValue = (timeSecondsAgo / 60).toString().split(".")[0]
            return timeValue + type
        }
        else if (timeSecondsAgo >= 3600 && timeSecondsAgo < 86400) {
            type = 'h'
            timeValue = (timeSecondsAgo / 60 / 60).toString().split(".")[0]
            return timeValue + type
        }
        else if (timeSecondsAgo >= 86400 && timeSecondsAgo < 604800) {
            type = 'd'
            timeValue = (timeSecondsAgo / 60 / 60 / 24).toString().split(".")[0]
            return timeValue + type
        }
        else if (timeSecondsAgo >= 604800) {
            type = 'w'
            timeValue = (timeSecondsAgo / 60 / 60 / 24 / 7).toString().split(".")[0]
            return timeValue + type
        }
        else {
            return "Invalid time"
        }
    }

    function GetLikeStatus() {
        fetch(`${port}/likes/${props.PostInfo.Id}`, {
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken'),
                'Target': 'Post'
            }
        })
            .then(res => res.json())
            .then(data => {
                setIsLiked(data);
            });
    }

    function likePost(e) {
        e.preventDefault();
        let postData = {
            Target: "Post",
            TargetId: props.PostInfo.Id,
            TargetUserId: props.PostInfo.OwnerId,
            Username: postUserProfile.Username
        };
        fetch(`${port}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthToken': localStorage.getItem('JSONWebToken')
            },
            body: JSON.stringify(postData)
        })
        setIsLiked(true);
        props.PostInfo.NumLikes += 1;
    }

    function unlikePost(e) {
        e.preventDefault();
        fetch(`${port}/unlike/${props.PostInfo.Id}`, {
            method: 'DELETE',
            headers: {
                'Action': 'Like Post',
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
        fetch(`${port}/unlike/post/${props.PostInfo.Id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'AuthToken': localStorage.getItem('JSONWebToken')
            }
        })
        setIsLiked(false);
        props.PostInfo.NumLikes -= 1;
    }

    function ShowLikes() {
        setShowListOfLikesModal(true);
    }


    function SubmitComment(event) {
        if (event.keyCode === 13 && CurrentUserComment.current.value.replace(/\s+/g, '') === "") {
            event.preventDefault();
            return false;
        }

        if (event.keyCode === 13) {
            event.preventDefault();
            let postComment = {
                OwnerId: ctx.Profile.OwnerId,
                PostId: props.PostInfo.Id,
                TargetUserId: props.PostInfo.OwnerId,
                Content: CurrentUserComment.current.value
            }
            fetch(`${port}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'AuthToken': localStorage.getItem('JSONWebToken')
                },
                body: JSON.stringify(postComment)
            })
                .then(res => res.text())
                .then(data => {
                    setComments([...comments, JSON.parse(data)])
                })
            // GetComments()
            CurrentUserComment.current.value = ""
        }
    }

    function GetComments() {
        setLoadingComments(true)
        fetch(`${port}/comments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'PostId': props.PostInfo.Id
            }
        })
            .then(res => res.json())
            .then(data => {
                let sortedData = data.sort(function (a, b) {
                    return parseInt(a.Timestamp) - parseInt(b.Timestamp)
                })
                setComments(sortedData);
                setLoadingComments(false)
            })
    }

    return (
        <div className='post-container' >
            <div className='post-information'>
                <div className='post-information-column'>
                    <Link to={`/${postUserProfile.Username}`}>
                        <LazyLoadImage effect='blur' src={postUserProfile.ImageSrc} alt='' className='post-information-profile-picture' />
                    </Link>
                </div>
                <div className='post-information-column'>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <Link to={`/${postUserProfile.Username}`} style={{ textDecoration: "none" }}>
                            <p className='post-owner'>{postUser.FirstName} {postUser.LastName}</p>
                        </Link>
                        {props.PostInfo.Timeline !== 0 &&
                            <>
                                <IconContext.Provider value={{ size: "1rem" }}><span>&nbsp;&nbsp;</span><MdPlayArrow /></IconContext.Provider>
                                <Link to={`/${targetUser.Username}`} style={{ textDecoration: "none" }}>
                                    <p className='post-owner'>{targetUser.FirstName} {targetUser.LastName}</p>
                                </Link>
                            </>
                        }
                    </div>
                    <Link to={`/posts/${props.PostInfo.Id}`} style={{ textDecoration: "none" }}>
                        <p className='post-date'>{convertTimestampToRelative()}</p>
                    </Link>
                </div>
                {editMode &&
                    <div className='modify-post edit-mode-options' style={{ gap: "0.5rem" }}>
                        <p style={{ background: "#4267B2", color: "white" }} onClick={() => { submitEdit(); setEditMode(false) }}>Save</p>
                        <p style={{ background: "white" }} onClick={() => { setEditMode(false); setUpdatePostImage(props.PostInfo.ImageSrc) }}>Cancel</p>
                    </div>
                }
                {showModifyMenu &&
                    <div className='post-information-column modify-options'>
                        <p className='option-item' onClick={() => { setEditMode(true); setShowModifyMenu(false) }}>Edit Post</p>
                        {!confirmDelete && <p className='option-item' onClick={() => setConfirmDelete(true)}>Delete Post</p>}
                        {confirmDelete && <p className='confirm-delete' onClick={() => { deletePost(); setShowModifyMenu(false); setConfirmDelete(false) }}>Confirm Delete</p>}
                    </div>}
                {isPostOwner && !editMode &&
                    <div className='post-information-column modify-post'>
                        <span className='three-dots' onClick={() => { setShowModifyMenu(!showModifyMenu); setConfirmDelete(false) }}><IconContext.Provider value={{ color: "black", size: "1.5rem" }}><BsThreeDots /></IconContext.Provider></span>
                    </div>
                }
            </div>
            <div className='post-content'>
                {!editMode && <p>{props.PostInfo.Content}</p>}
                {editMode && <textarea type="text" ref={updatePostContent} maxLength="1000" rows='1' className="edit-mode-textarea" defaultValue={props.PostInfo.Content} placeholder="What's on your mind?"></textarea>}
                {editMode &&
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                        <p>Update post image: </p>
                        <input id="change-post-image" type="file" accept=".png, .jpg, .jpeg .gif" onChange={encodeImageFileAsURL} />
                        {!isFileSizeValid && <p style={{ color: "red", fontSize: "0.9rem", padding: "0" }}>Max file size is 10 MB.</p>}
                    </div>}
                {isUploading && <img src={Spinner} alt='' className='spinner' />}
            </div>
            <div id="post-image">
                {!editMode && props.PostInfo.ImageSrc && <LazyLoadImage effect='blur' src={props.PostInfo.ImageSrc} alt='' className='post-content-image' />}
                {editMode && <LazyLoadImage effect='blur' src={updatePostImage} alt='' className='post-content-image' />}
            </div>
            <hr className='horizontal-divider' />

            <div className='post-stats'>
                <div className='post-stat-likes' onClick={ShowLikes}>
                    <IconContext.Provider value={{ color: "#4267B2", size: "1rem" }}><FaThumbsUp /></IconContext.Provider>
                    <p className='post-likes-number' id="number-of-likes" >{props.PostInfo.NumLikes}</p>

                </div>
                {showListOfLikesModal && <ListOfLikesModal_Post setShowListOfLikesModal={setShowListOfLikesModal} PostInfo={props.PostInfo} />}
                <div className='post-stat-comments'>
                    <p className='post-likes-number'>{props.PostInfo.NumComments} Comments</p>
                </div>
            </div>
            <hr className='horizontal-divider' />
            <div className='post-actions'>
                {!isLiked && <button className='post-action post-action-like' onClick={likePost}>Like</button>}
                {isLiked && <button className='post-action post-action-like' onClick={unlikePost} style={{ background: "#2d86ff", color: "white" }}>Liked</button>}
                <button className='post-action post-action-comment' onClick={() => document.querySelector(".post-comments-self-input").focus()}>Comment</button>
            </div>
            <hr className='horizontal-divider' />
            <div className='post-comments'>
                {/* insert the comments */}
                {loadingComments && <div style={{display:"flex", justifyContent:"center"}}><img src={Spinner} alt='' style={{height: "3rem", width: "3rem"}}/></div>}
                {(!loadingComments && comments.length !== 0) && comments.map((comment) => {
                    if (props.PostInfo.Id === comment.PostId) {
                        return (<>
                            <div className='post-comments-others'>
                                {/* insert profile picture here */}
                                <Link to={`/${comment.Username}`}><LazyLoadImage effect='blur' src={comment.ImageSrc} alt='' className='post-comment-profile-picture' /></Link>
                                <div>
                                    <p className='post-comments-others-entry'>
                                        <Link to={`/${comment.Username}`} style={{ textDecoration: "none", color: "black" }}><span className='hover-underline'>{comment.FirstName} {comment.LastName}</span></Link>
                                        <br />
                                        {comment.Content}</p>
                                </div>
                            </div>
                        </>)
                    }

                })}
                <div className='post-comments-self' style={{marginBottom: "0"}}>
                    <Link to={`/${ctx.Profile.Username}`}><LazyLoadImage effect='blur' src={ctx.Profile.ImageSrc} alt='' className='post-comment-profile-picture' /></Link>
                    <textarea ref={CurrentUserComment} className="post-comments-self-input" type="text" placeholder='Write a comment...' maxLength="1000" rows='1' onKeyDown={SubmitComment} />
                </div>
            </div>
        </div>
    );
};

export default PostCard;
