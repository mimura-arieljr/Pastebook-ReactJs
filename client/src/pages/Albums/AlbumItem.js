import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AlbumItem.css';

const AlbumItem = (props) => {
    let navigate = useNavigate();
    return (
        <div className="album-item" onClick={() => navigate(props.onclick)}>
            <div className="album-thumbnail">
                {props.thumbnail}
            </div>
            <p className="album-title">{props.title}</p>
            <p className="album-photo-count" style={{margin:0}}>{props.count}</p>
        </div>
    );
}

export default AlbumItem;