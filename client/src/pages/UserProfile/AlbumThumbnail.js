// Dependencies
import React from 'react';
import { useNavigate } from 'react-router-dom';

function AlbumThumbnail(props) {
    let navigate = useNavigate();
    
    return (
        <div className="pic" onClick={() => navigate(props.onclick)}>
            {props.thumbnail}
            <div className="album-name-tooltip">
                {props.tooltip}
            </div>
        </div>
    );
}

export default AlbumThumbnail;