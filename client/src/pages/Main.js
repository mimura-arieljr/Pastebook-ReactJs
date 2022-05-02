// Dependencies
import React, { useContext } from 'react';
//Components
import AuthContext from '../context/auth-context';
import Header from '../components/Header'
import Login from './Login';
import Body from '../components/Body'

const Main = () => {
    const ctx = useContext(AuthContext)

    return (
        <div>
            {ctx.isLoggedIn && <Header />}
            {ctx.isLoggedIn ? <Body /> : <Login />}
        </div>
    );
};

export default Main;
