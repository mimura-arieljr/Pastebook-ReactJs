// Dependencies
import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
// Components
import CreatePostModal from './CreatePostModal'
import LeftSidebar from './LeftSidebar';
// Icons
import Spinner from '../loading-spinner.gif';
//Styles
import './Body.css'
// Components for Lazy Loading
const CreatePost = lazy(() => import('./CreatePost'));
const PostCard = lazy(() => import('./PostCard'));

const Body = () => {
    let port = "http://localhost:5000"
    const pageNumber = useRef(1)
    const [showCreatePostModal, setShowCreatePostModal] = useState(false)
    const [newsfeedPosts, setNewsfeedPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const topPostTimestamp = useRef(0)
    const getTopPost = useRef(0)
    const prevPosts = useRef([])


    useEffect(() => {
        fetchPosts()
        const myInterval = setInterval(() => {autoUpdate()}, 60000)
        return () => clearInterval(myInterval)
    }, [])

    // Change top post timestamp
    useEffect(() => {
        if (newsfeedPosts.length !== 0 && getTopPost.current === 0) {
            topPostTimestamp.current = newsfeedPosts[0].Timestamp
            getTopPost.current = 1
        }
    }, [newsfeedPosts])

    function autoUpdate() {
        fetch(`${port}/autoupdate`, {
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken'),
                'Timestamp': topPostTimestamp.current
            }
        })
            .then(res => res.text())
            .then(data => {
                if(JSON.parse(data).length > 0)
                {
                    setNewsfeedPosts(oldData => [...JSON.parse(data), ...oldData]);
                    topPostTimestamp.current = JSON.parse(data)[0].Timestamp
                }
            })
    }

    function fetchPosts() {
        setLoading(true)
        fetch(`${port}/newsfeedposts`, {
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken'),
                'Page': pageNumber.current
            }
        })
            .then(res => res.json())
            .then(data => {
                setNewsfeedPosts(data);
                setLoading(false)
            })
    }

    function fetchMore() {
        if (prevPosts.current.length === newsfeedPosts.length) {
            return false
        }
        setLoading(true)
        fetch(`${port}/newsfeedposts`, {
            headers: {
                'AuthToken': localStorage.getItem('JSONWebToken'),
                'Page': pageNumber.current
            }
        })
            .then(res => res.json())
            .then(data => {
                prevPosts.current = newsfeedPosts
                setNewsfeedPosts(prevNewsfeedPosts => [...prevNewsfeedPosts, ...data]);
                setLoading(false)
            })
    }

    const observer = useRef()
    const toBeObserved = useCallback(node => {
        if (loading) return false
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                pageNumber.current = pageNumber.current + 1;
                fetchMore()
            }
        })
        if (node) observer.current.observe(node)
    }, [loading])

    function showCreatePost() {
        setShowCreatePostModal(true)
    }

    function showRecentPost(newPost) {
        setNewsfeedPosts([newPost, ...newsfeedPosts])
        getTopPost.current = 0
    }

    return (
        <Suspense fallback={
            <div className="loading">
                <div><img src={Spinner} alt='' /></div>
            </div>}>
            <div id="body">
                {showCreatePostModal && <CreatePostModal setShowCreatePostModal={setShowCreatePostModal} showRecentPost={showRecentPost} Timeline={0} />}
                <div id='right-body'>
                    <LeftSidebar />
                </div>
                <div id='center-body'>
                    <CreatePost showCreatePost={showCreatePost} />
                    {newsfeedPosts.length !== 0 && newsfeedPosts.map((post, index) => {
                        if (index === newsfeedPosts.length - 1) {
                            return <div ref={toBeObserved}><PostCard PostInfo={post} setPosts={setNewsfeedPosts} posts={newsfeedPosts} /></div>
                        }
                        else {
                            return <PostCard PostInfo={post} setPosts={setNewsfeedPosts} posts={newsfeedPosts} />
                        }
                    })}
                    {loading && <div style={{ display: "flex", justifyContent: "center" }}><img src={Spinner} alt='' /></div>}
                    {!loading && <div className='caught-up'>
                        <div style={{ fontWeight: "500" }}>You're all caught up.</div>
                        <div style={{ paddingTop: "0.5rem", marginBottom: "1rem" }}><i>You've seen all new posts from the past 2 weeks.</i></div>
                    </div>}
                </div>
            </div>
        </Suspense>
    );
};

export default Body;
