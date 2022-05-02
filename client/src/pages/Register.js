// Dependencies
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconContext } from "react-icons";
// Icons
import { BsFacebook } from "react-icons/bs";
// Styles
import "./Register.css";

function Register() {
    const [verifyingRegistration, setVerifyingRegistration] = useState(false)
    const [invalidEmail, setInvalidEmail] = useState(false)
    const [invalidFirstName, setInvalidFirstName] = useState(false)
    const [invalidLastName, setInvalidLastName] = useState(false)
    const [invalidMobileNumber, setInvalidMobileNumber] = useState(false)
    const [duplicateEmail, setDuplicateEmail] = useState(false)
    const [minPasswordLength, setMinPasswordLength] = useState(false)
    const [passwordMatch, setPasswordMatch] = useState(false)
    const [showSuccessfulRegistered, setShowSuccessfulRegistered] = useState(false)
    const navigate = useNavigate();
    const port = "http://localhost:5000";
    // const [startDate, setStartDate] = useState(new Date().toISOString);

    function redirectToLogin() {
        setTimeout(() => {
            navigate("/", { replace: true })
        }, 3500)
    }

    function handleSubmitRegister(e) {
        let statuscode;
        e.preventDefault();
        setVerifyingRegistration(true)
        setDuplicateEmail(false);
        setInvalidEmail(false);
        setInvalidFirstName(false);
        setInvalidLastName(false);
        setInvalidMobileNumber(false);
        setMinPasswordLength(false);
        setPasswordMatch(false);

        const registerDetails = new FormData(document.getElementById('signup-form'));
        const registerDetailsJson = Object.fromEntries(registerDetails.entries());
        var dateWithHyphen = registerDetailsJson['Birthday'].split("-");
        registerDetailsJson['Birthday'] = parseInt(new Date(dateWithHyphen[0], dateWithHyphen[1] - 1, dateWithHyphen[2]).getTime()) / 1000;

        var password = registerDetailsJson.Password;
        var passwordMatch = registerDetailsJson.PasswordMatch;
        var email = registerDetailsJson.EmailAddress;
        var fname = registerDetailsJson.FirstName;
        var lname = registerDetailsJson.LastName;
        let haveNumber;
        if (document.querySelector('#MobileNumber').value !== "")
        {
            var mobile = registerDetailsJson.MobileNumber;
            haveNumber = true
        }
        var emailPattern = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})$/;
        var namePattern = /^[a-zA-Z\s.,'-]*$/
        var mobilePattern = /^(09|\+639)\d{9}$/;

        if (!emailPattern.test(email) || !namePattern.test(fname) || !namePattern.test(lname) || (haveNumber && !mobilePattern.test(mobile)) || password.length < 8 || passwordMatch !== password) {
            setVerifyingRegistration(false);
            if (!emailPattern.test(email)) {
                setInvalidEmail(true);
            }
            if (!namePattern.test(fname)) {
                setInvalidFirstName(true);
            }
            if (!namePattern.test(lname)) {
                setInvalidLastName(true);
            }
            if (!mobilePattern.test(mobile)) {
                setInvalidMobileNumber(true);
            }
            if (password.length < 8) {
                setMinPasswordLength(true);
            }
            if (passwordMatch !== password) {
                setPasswordMatch(true);
            }
            return false;
        }

        fetch(`${port}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registerDetailsJson)
        })
            .then(res => {
                statuscode = res.status;
                return res.text()
            })
            .then(data => {
                if (statuscode === 200) {
                    if (data === "Duplicate") {
                        setVerifyingRegistration(false)
                        setDuplicateEmail(true)
                    }
                    else if (data === "User has been registered.") {
                        setVerifyingRegistration(false)
                        setShowSuccessfulRegistered(true)
                        redirectToLogin()
                    }
                }
                // Check other statuscodes as else if's
            })
    }

    function disableFutureDates() {
        var today, dd, mm, yyyy;
        today = new Date();
        mm = today.getMonth() + 1;
        if (mm <= 9) {
            mm = "0" + mm;
        }
        dd = today.getDate();
        if (dd <= 9) {
            dd = "0" + dd;
        }
        yyyy = today.getFullYear();
        return yyyy + "-" + mm + "-" + dd;
    }

    return (
        <>
            {showSuccessfulRegistered &&
                <div className="container1" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className="quick-easy" style={{ display: "flex", justifyContent: "center", fontSize: "3rem", padding: "1rem" }}>
                        Welcome to Pastebook.
                    </div>
                    <div className="quick-easy" style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
                        Redirecting you to the login page...
                    </div>
                </div>}
            {!showSuccessfulRegistered &&
                <div className="container1">
                    <div className="box1">
                        <div className="signup-header">
                            <div className="signup-header-left">
                                <div className="sign-up">
                                    Sign Up
                                </div>
                                <div className="quick-easy">
                                    It's quick and easy.
                                </div>
                            </div>
                            <div className="signup-header-right">
                                <IconContext.Provider value={{ color: "#4267B2", size: "2.5rem" }}><BsFacebook /></IconContext.Provider>
                            </div>
                        </div>
                        <div className="new-user-form">
                            <div className="new-input-fields">
                                <form id="signup-form" onSubmit={handleSubmitRegister}>
                                    <div className="input-name">
                                        <div className="input-firstname">
                                            <input type="text" placeholder="First name" name="FirstName" id="FirstName" maxLength={50} required={true} />
                                        </div>
                                        <div className="input-lastname">
                                            <input type="text" placeholder="Last name" name="LastName" id="LastName" maxLength={50} required={true} />
                                        </div>
                                    </div>
                                    {(invalidFirstName && !invalidLastName) && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Invalid first name. Only alphabet characters are allowed.</p>}
                                    {(invalidLastName && !invalidFirstName) && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Invalid last name. Only alphabet characters are allowed.</p>}
                                    {(invalidLastName && invalidFirstName) && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Invalid first and last names. Only alphabet characters are allowed.</p>}
                                    <div className="input-emailadd1">
                                        <input type="text" placeholder="Email address" name="EmailAddress" id="EmailAddress" maxLength={100} required={true} />
                                        {duplicateEmail && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Email address already in use.</p>}
                                        {invalidEmail && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Invalid email address. Format: sample@sample.com</p>}
                                    </div>
                                    <div className="input-mobile-number">
                                        <input type="text" placeholder="Mobile Number (Optional)" name="MobileNumber" id="MobileNumber" maxLength={13} />
                                        {invalidMobileNumber && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Invalid mobile number. Format: +639xxxxxxxxx or 09xxxxxxxxx.</p>}
                                    </div>
                                    <div className="input-password1">
                                        <input type="password" placeholder="Password" name="Password" id="Password" maxLength={100} required={true} />
                                        {minPasswordLength && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Password must have at least 8 characters.</p>}
                                    </div>
                                    <div className="input-password1">
                                        <input type="password" placeholder="Confirm Password" name="PasswordMatch" id="PasswordMatch" maxLength={100} required={true} />
                                        {passwordMatch && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Passwords do not match.</p>}
                                    </div>
                                    <div className="input-birthday">
                                        <input type="date" id="Birthday" name="Birthday" max={disableFutureDates()} required={true} />
                                    </div>
                                    <div className="input-gender">
                                        <select name="Gender" required={true}>
                                            <option value="" disabled hidden>Gender</option>
                                            <option value="" disabled selected hidden>Gender</option>
                                            <option className="gender" value="Female">Female</option>
                                            <option className="gender" value="Male">Male</option>
                                        </select>
                                    </div>
                                    <div className="signup-button" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <input type="submit" className="btn" name="submit" value="Sign Up" />
                                        {verifyingRegistration && <p style={{ fontSize: "0.75rem", marginBottom: "0" }}>Verifying...</p>}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>}
        </>
    );
}

export default Register;