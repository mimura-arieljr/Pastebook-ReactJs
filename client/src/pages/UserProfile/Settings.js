//Dependencies
import React, { useContext, useState } from "react";
import AuthContext from "../../context/auth-context";
//Components
import Header from '../../components/Header';
//Style
import './Settings.css';
//Icons
import { IconContext } from "react-icons/lib";
import { VscKey } from "react-icons/vsc";


function Settings() {
    const port = "http://localhost:5000"
    const ctx = useContext(AuthContext);
    const [verifyingNewEmail, setVerifyingNewEmail] = useState(false)
    const [invalidEmail, setInvalidEmail] = useState(false)
    const [duplicateEmail, setDuplicateEmail] = useState(false)
    const [invalidPassword, setInvalidPassword] = useState(false)
    const [retypePassword, setRetypePassword] = useState(false)
    let statuscode;

    function handleSettingSubmit(e) {
        e.preventDefault();
        setVerifyingNewEmail(true);
        setDuplicateEmail(false);
        setInvalidEmail(false);
        setInvalidPassword(false);
        setRetypePassword(false);
        const updateDetails = new FormData(document.getElementById('settings-actual-form'));
        const updateDetailsJson = Object.fromEntries(updateDetails.entries())

        var email = updateDetailsJson.EmailAddress;
        var emailPattern = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})$/;
        var password = updateDetailsJson.Password;
        var retypepassword = updateDetailsJson.RetypePassword;

        if (!emailPattern.test(email) || password != retypepassword) {
            if (!emailPattern.test(email)) {
                setInvalidEmail(true)
                setVerifyingNewEmail(false)
            }
            if (password != retypepassword) {
                setRetypePassword(true)
                setVerifyingNewEmail(false)
            }
            return false
        }

        fetch(`${port}/updateusersecurity`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'AuthToken': localStorage.getItem('JSONWebToken')
            },
            body: JSON.stringify(updateDetailsJson)
        })
            .then(res => {
                statuscode = res.status;
                return res.text()
            })
            .then(data => {
                if (statuscode === 200) {
                    if (data === "Duplicate") {
                        setVerifyingNewEmail(false)
                        setDuplicateEmail(true)
                    }
                    if (data === "User security has been updated.") {
                        setVerifyingNewEmail(false)
                        ctx.onLogout();
                    }
                    else if (data === "Incorrect Password") {
                        setVerifyingNewEmail(false)
                        setInvalidPassword(true)
                    }
                    else if (data === "User token invalid or expired.") {
                        ctx.onLogout();
                    }
                }
            })
    }

    return (
        <>
            <Header />
            <div className="global-container">
                <div className="settings-body">
                    <div className="security-setting">
                        <p className="login">Login</p>
                    </div>
                    <div className="form-setting">
                        <div className="icon-container">
                            <div><IconContext.Provider value={{ color: "grey", size: "1.8rem" }}><VscKey /></IconContext.Provider></div>
                            <div><span className="form-header-1">Change username and password</span>
                                <span className="form-header-2">It's a good idea to use a strong password that you're not using
                                    elsewhere.</span></div></div>
                        <div className="form-container">
                            <div className="form">
                                <form id="settings-actual-form" onSubmit={handleSettingSubmit}>
                                    <table role="presentation" className="table-presentation">

                                        <tr className="form-actual">
                                            <th className="form-label"><label>New Email</label></th>
                                            <td className="form-input"><input type="text" className="inputtext" name="EmailAddress" id="EmailAddress" required="true" /></td>
                                            {duplicateEmail && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem", marginLeft: "8.9rem" }}>Email address already in use.</p>}
                                            {invalidEmail && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem", marginLeft: "8.9rem" }}>Email address is invalid.</p>}
                                        </tr>

                                        <tr className="form-actual">
                                            <th className="form-label"><label></label></th>
                                            <td className="form-input"><div></div></td>
                                        </tr>
                                        <tr className="form-actual">
                                            <th className="form-label"><label>Current Password</label></th>
                                            <td className="form-input"><input type="password" className="inputtext" name="CurrentPassword" id="CurrentPassword" required="true" /></td>
                                            {invalidPassword && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem", marginLeft: "8.9rem" }}>Incorrect current password.</p>}
                                        </tr>
                                        <tr class="form-actual">
                                            <th className="form-label"><label></label></th>
                                            <td className="form-input"><div></div></td>
                                        </tr>
                                        <tr className="form-actual">
                                            <th className="form-label"><label>New Password</label></th>
                                            <td className="form-input"><input type="password" className="inputtext" name="Password" id="Password" required="true" /></td>
                                        </tr>
                                        <tr className="form-actual">
                                            <th className="form-label"><label></label></th>
                                            <td className="form-input"><div></div></td>
                                        </tr>
                                        <tr className="form-actual">
                                            <th className="form-label"><label>Retype New</label></th>
                                            <td className="form-input"><input type="password" className="inputtext" name="RetypePassword" id="RetypePassword" required="true" /></td>
                                            {retypePassword && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem", marginLeft: "8.9rem" }}>Passwords do not match.</p>}
                                        </tr>
                                        <tr className="form-actual">
                                            <th className="form-label"><label></label></th>
                                            <td className="form-input"><div></div></td>
                                        </tr>
                                    </table>
                                    <div className="submit-container">
                                        <div className="submit-box">
                                            <div><input type="submit" className="submit-form" name="submit-form" value="Save changes" /></div>
                                            <div className="verifying-text-settings">{verifyingNewEmail && <p style={{ fontSize: "0.75rem", marginBottom: "0" }}>Saving changes...</p>}</div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Settings;