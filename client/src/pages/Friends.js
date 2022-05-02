//Dependencies
import React, { useState } from 'react';
//Components
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import FriendsList from '../components/FriendsList';
//CSS Styles
import './Friends.css';

function Friends() {

    return (
        <>
            <Header />
            <div className='holder-two'>
                <div className='sidebar-left'>
                    <LeftSidebar />
                </div>
                <div className='body-right'>
                    <FriendsList />
                    
                </div>
            </div>
        </>
    )
}

export default Friends;