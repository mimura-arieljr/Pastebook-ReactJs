// Dependencies
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function PhotoThumbnail(props) {
    let navigate = useNavigate();
    return (
        <div className="album-view-photo" onClick={() => navigate(props.onclick)}>
            <LazyLoadImage effect='blur' className="photo-thumbnail" src={props.imgsrc} alt="thumbnail" />
        </div>
    );
}

export default PhotoThumbnail;