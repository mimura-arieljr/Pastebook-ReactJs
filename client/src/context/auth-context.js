import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = React.createContext({
    isLoggedIn: false,
    onLogout: () => { },
    verifiedTokenHandler: (token) => { },
    Profile: {}
})

export function AuthContextProvider(props) {
    const navigate = useNavigate()
    const port = "http://localhost:5000"
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    // Profile (of logged in user) contains: OwnerId, Username, Bio, ImageSrc
    const [profile, setProfile] = useState([])

    useEffect(() => {
        // Checks if there's a token in the local storage and if its not expires nor tampered with
        if (localStorage.getItem('JSONWebToken')) {

            fetch(`${port}/verifylocalstoragetoken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'AuthToken': localStorage.getItem('JSONWebToken')
                }
            })
                .then(res => res.text())
                .then(data => {
                    if (data === 'VALID') {
                        verifiedTokenHandler(localStorage.getItem('JSONWebToken'))
                    }
                })
        }
    }, [])

    function getProfile(authToken) {
        fetch(`${port}/getcurrentprofile`, {
            method: 'POST',
            headers: {
                'AuthToken': authToken
            }
        })
            .then(res => res.json())
            .then(data => {
                setProfile(data)
            })
    }

    function logoutHandler() {
        localStorage.removeItem('JSONWebToken')
        navigate("/", { replace: true });
        setIsLoggedIn(false)
    }

    function verifiedTokenHandler(verifiedToken) {
        localStorage.setItem('JSONWebToken', verifiedToken)
        getProfile(verifiedToken)
        setIsLoggedIn(true)
    }

    return <AuthContext.Provider value={{
        isLoggedIn: isLoggedIn,
        onLogout: logoutHandler,
        verifiedTokenHandler: verifiedTokenHandler,
        Profile: profile
    }}>{props.children}</AuthContext.Provider>
}
export default AuthContext;
