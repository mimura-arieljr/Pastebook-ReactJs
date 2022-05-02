// Dependencies
import React, { useContext, useState } from "react";
import { Link } from 'react-router-dom'
// Components
import AuthContext from "../context/auth-context";
// Styles
import "./Login.css";

function Login() {
    const port = "http://localhost:5000"
    const ctx = useContext(AuthContext)
    const [isValidCredentials, setIsValidCredentials] = useState(true)
    function handleSubmitLogin(e) {
        e.preventDefault()
        let statuscode;
        const loginDetails = new FormData(document.getElementById('login-form'));
        const loginDetailsJson = Object.fromEntries(loginDetails.entries())

        fetch(`${port}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginDetailsJson)
        })
            .then(res => {
                statuscode = res.status;
                return res.text()
            })
            .then(data => {
                if (statuscode === 401) {
                    // Change to front end
                    setIsValidCredentials(false)
                    return false;
                }
                else if (statuscode === 200) {
                    setIsValidCredentials(true)
                    ctx.verifiedTokenHandler(data)
                }
                else {
                    // Do something if status code is neither 401 or 200
                }
            })
    }

    return (
        <>
            <div className="container">
                <div className="left">
                    <h1>pastebook</h1>
                    <p>Pastebook helps you connect and share with the people in your life.</p>
                </div>
                <div className="right">
                    <div className="box">
                        <div className="login-header">
                            <div className="log-in">
                                Log In to Pastebook
                            </div>
                        </div>
                        <div className="user-form">
                            <div className="input-fields">
                                <form id="login-form" onSubmit={handleSubmitLogin}>
                                {!isValidCredentials && <p style={{ color: "red", fontSize: "0.75rem", marginTop: "0.25rem" }}>Invalid email or password.</p>}
                                    <div className="input-email">
                                        <input type="text" placeholder="Email" name="Email" id="Email" required={true} />
                                    </div>
                                    <div className="input-password">
                                        <input type="password" placeholder="Password" name="Password" id="Password" required={true} />
                                    </div>
                                    <div className="login-button">
                                        <input type="submit" className="btn" value="Log In"/>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="new-account">
                            <div className="create-new-account">
                                <Link to="/register"><button className="create-button">
                                    Create new account
                                </button></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;