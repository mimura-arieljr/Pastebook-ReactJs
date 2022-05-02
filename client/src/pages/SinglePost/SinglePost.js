// Dependencies
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Components
import Header from '../../components/Header';
import PostCard from '../../components/PostCard';
// Styles
import './SinglePost.css'

const SinglePost = () => {
    let port = "http://localhost:5000"
    const postId = useParams()
    const navigate = useNavigate();
    const [postInfo, setPostInfo] = useState([])

    useEffect(() => {
        fetch(`${port}/posts/${postId.postid}`)
            .then(res => res.text())
            .then(data => {
                if (data === 'doesnotexist') {
                    navigate("/pagenotfound", { replace: true })
                }
                else {
                    setPostInfo(JSON.parse(data));
                }
            })
    }, [])

    return (
        <div id="single-post"> 
            <Header />
            <div id="single-post-card">      
                {postInfo.length !== 0 && <PostCard PostInfo={postInfo} />}
            </div>
        </div>
    );
};

export default SinglePost;
