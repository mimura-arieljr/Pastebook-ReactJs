// Dependencies
import './App.css';
import { Routes, Route } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
// Components
import Register from "./pages/Register";
import Settings from './pages/UserProfile/Settings';
import Friends from './pages/Friends';
import SinglePost from './pages/SinglePost/SinglePost';
import PageNotFound from './pages/PageNotFound';
// Icons
import Spinner from './loading-spinner.gif';
// Components for Lazy Loading
const UserProfile = lazy(() => import('./pages/UserProfile/UserProfile'));
const Main = lazy(() => import('./pages/Main'));
const Albums = lazy(() => import('./pages/Albums/Albums'));
const AlbumView = lazy(() => import('./pages/AlbumView/AlbumView'));
const Photo = lazy(() => import('./pages/Photo/Photo'));

function App() {
  return (
    <Suspense fallback={
      <div className="loading">
        <div><img src={Spinner} alt='' /></div>
      </div>}>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/register" element={<Register />} />
        <Route path="/:username" element={<UserProfile />} />
        <Route path="/:username/albums" element={<Albums />} />
        <Route path="/:username/albums/:albumId" element={<AlbumView />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/:username/albums/:albumId/:photoId" element={<Photo />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/posts/:postid" element={<SinglePost />} />
        <Route path="/pagenotfound" element={<PageNotFound />} />
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
