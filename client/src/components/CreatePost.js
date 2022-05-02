// Dependencies
import React, { useContext } from 'react';
import AuthContext from '../context/auth-context';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
// Styles
import './CreatePost.css'

const CreatePost = (props) => {
    const ctx = useContext(AuthContext)
    function showCreatePost()
    {
        props.showCreatePost()
    }

    return (
        <div className='post-container'>
            
            <div className='post-comments-self'>
                    {/* insert profile picture here */}
                    <Link to={`/${ctx.Profile.Username}`}><LazyLoadImage effect='blur' src={ctx.Profile.ImageSrc} alt='' className='post-information-profile-picture' /></Link>
                    <button id="open-create-post-modal" onClick={showCreatePost}>What's on your mind, User?</button>
                </div>
        </div>
    )

};

export default CreatePost;
