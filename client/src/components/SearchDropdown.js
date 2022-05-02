// Dependencies
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
// Styles
import './SearchDropdown.css'
import Spinner from '../loading-spinner.gif'

const SearchDropdown = (props) => {
    let userInfo = props.userInfo;
    const [filteredFriends, setFilteredFriends] = useState(userInfo)

    useEffect(() => {
        if (props.searchParam) {
            setFilteredFriends(userInfo.filter((friend) =>
                friend.Username.toLowerCase().includes(props.searchParam.replace(/\s/g, "").toLowerCase())))
        }
    }, [props.searchParam])

    return (
        <div id="searchdropdown-container" key={props.searchParam}>
            {props.isFetching && <div style={{ display: "flex", justifyContent: "center" }}><img src={Spinner} alt='' style={{ height: "3rem", width: "3rem" }} /></div>}
            {filteredFriends.map((frienditem) => {
                return (
                    <SearchItem
                        FirstName={frienditem.FirstName}
                        LastName={frienditem.LastName}
                        Username={frienditem.Username}
                        ImageSrc={frienditem.ImageSrc}
                        removeSearchParam={props.removeSearchParam}
                    />
                )
            })}
            {(filteredFriends.length === 0 && !props.isFetching) &&
                <div className='searchdropdown-item'>
                    <div className='searchdropdown-person'>
                        <p className='searchdropdown-name'>No matched user</p>
                    </div>
                </div>}
        </div>
    )
};

function SearchItem(props) {
    return (
        <Link to={`/${props.Username}`} style={{ textDecoration: "none" }} onClick={() => props.removeSearchParam()}>
            <div className='searchdropdown-item'>
                <div className='searchdropdown-doneby'>
                    <LazyLoadImage effect='blur' src={props.ImageSrc} alt=''
                        className='searchdropdown-doneby-icon' />
                </div>
                <div className='searchdropdown-person'>
                    <p className='searchdropdown-name'>{`${props.FirstName} ${props.LastName}`}</p>
                </div>
            </div>
        </Link>
    );
}

export default SearchDropdown;