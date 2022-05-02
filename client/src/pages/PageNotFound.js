//Dependencies
import React from 'react';
import { Link } from 'react-router-dom'
//Components
import Header from '../components/Header';
//CSS
import './PageNotFound.css';
//Icons
import { IconContext } from "react-icons/lib";
import { ImHeartBroken } from "react-icons/im";

function PageNotExisting() {

    return (
        <>
            <Header />
            <div className='global-container-nonexistentpage'>
                <div className='spacer-div-1'></div>
                <div className='container-nonexistentpage'>
                    <div className='nep-icon'>
                        <IconContext.Provider value={{ color: "#65676b", size: "5rem" }}><ImHeartBroken /></IconContext.Provider>
                    </div>
                    <div className='this-page-text-box'>
                        <span className='this-page-text'>This Page Isn't Available</span><br></br>
                        <span className='link-broken-text'>The link may be broken, or
                            the page may have been removed. Check to see if link you're
                            trying to open is correct or contact Pastebook.</span>
                    </div>
                    <div className='news-feed-buttonbox'>
                        <Link to="/"><button className='news-feed-button'>Go to News Feed</button></Link>
                    </div>
                </div>
                <div className='spacer-div-2'></div>
            </div>
        </>
    )
}

export default PageNotExisting;