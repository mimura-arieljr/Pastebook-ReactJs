// Dependencies
import { useNavigate } from "react-router-dom";
import React, { useState, useContext, useRef } from "react";
// Components
import AuthContext from "../../context/auth-context";
// Icons
import { IconContext } from "react-icons";
import { CgProfile } from "react-icons/cg";
import { TiPhoneOutline } from "react-icons/ti";
import { RiCake2Line } from "react-icons/ri";
// Styles
import "./EditDetailsModal.css";
import Spinner from '../../loading-spinner.gif'

function EditDetailsModal(props)
{
  const port = "http://localhost:5000";
  const ctx = useContext(AuthContext);
    let navigate = useNavigate();
  const birthday = useRef("")
  const [invalidFirstName, setInvalidFirstName] = useState(false)
  const [invalidLastName, setInvalidLastName] = useState(false)
  const [invalidMobileNumber, setInvalidMobileNumber] = useState(false);
  const [loadingNewProfile, setLoadingNewProfile] = useState(false)

  function handleSaveChanges(e) {
    e.preventDefault();
    setLoadingNewProfile(true)
    setInvalidFirstName(false);
    setInvalidLastName(false);
    setInvalidMobileNumber(false);

    let statuscode;
    const editDetails = new FormData(document.getElementById('edit-form'));
    const editDetailsJson = Object.fromEntries(editDetails.entries());
    if(birthday.current != "") {
      editDetailsJson.Birthday = birthday.current.value;
    }
    if(document.getElementById("Birthday").value != "") {
      var dateWithHyphen = editDetailsJson['Birthday'].split("-");
    editDetailsJson['Birthday'] = parseInt(new Date(dateWithHyphen[0], dateWithHyphen[1] - 1, dateWithHyphen[2]).getTime()) / 1000; 
    }

    var fname = editDetailsJson.FirstName;
    var lname = editDetailsJson.LastName;
    var mobile = editDetailsJson.MobileNumber;

    var namePattern = /^([ \u00c0-\u01ffa-zA-Z'\-])+$/;
    var mobilePattern = /^(09|\+639)(\d{9}|x{9})$/;
    // var mobilePatternx = /^(09|\+639)\d{9}$/;

    
    if (!namePattern.test(fname) && fname) {
          if(!namePattern.test(fname)) {
            setInvalidFirstName(true);
            return false
        }
    }
    if (!namePattern.test(lname) && lname) {    
          if(!namePattern.test(lname)) {
            setInvalidLastName(true);
            return false
        }
    }
    if (!mobilePattern.test(mobile) && mobile) { 
          if(!mobilePattern.test(mobile)) {
            setInvalidMobileNumber(true);
            return false
        }
    } 
      
    fetch(`${port}/info`, {
      method: "PUT",
      headers: {
          "Content-Type": "application/json",
          'AuthToken': localStorage.getItem('JSONWebToken')
      },
      body: JSON.stringify(editDetailsJson)
      })
      .then(res => {
        statuscode = res.status;
        return res.text()
      })
      .then(data => {
        setTimeout(() => {
          navigate(`/${data}`, { replace: true })
          props.setShowEditDetailsModal(false);
          setLoadingNewProfile(false)
        }, 3000)
        
      })
  }

  function disableFutureDates() {
    var today, dd, mm, yyyy;
    today = new Date();
    mm = today.getMonth()+1;
    if(mm <= 9 ) {
        mm = "0"+mm;
    }
    dd = today.getDate();
    if(dd <= 9 ) {
        dd = "0"+dd;
    }
    yyyy = today.getFullYear();
    return yyyy+"-"+mm+"-"+dd;
}
  
  return (
    <>
    {loadingNewProfile && <div style={{ display: "flex", justifyContent: "center", position: "fixed", top: "40%", width: "100vw", zIndex: "999999" }}><img src={Spinner} alt='' style={{height: "10rem", width: "10rem"}}/></div>}
    <div id="modal-outer">
      <div id="modal-content">
        <div className="modal-header">
          <p className="modal-header-text">Edit Details</p>
          <div className="title-close-btn">
            <button onClick={() => { props.setShowEditDetailsModal(false); }}>
              &times;
            </button>    
          </div>
        </div>
        <div className="modal-body">
          <p className="modal-subheader-text">Customize Your Intro</p>
          <form id="edit-form" onSubmit={handleSaveChanges}>
            <div className="edit-form-body">
              <div className="edit-name">
                <div className="edit-firstname">
                  <IconContext.Provider value={{ color: "gray", size: "2rem" }}>
                      <CgProfile />
                  </IconContext.Provider> 
                  <input type="text" placeholder="First name" name="FirstName" id="FirstName" maxLength={50} defaultValue={props.userInfo.FirstName} required/>
                </div>
                <div className="edit-lastname">
                  <IconContext.Provider value={{ color: "gray", size: "2rem" }}>
                      <CgProfile />
                  </IconContext.Provider> 
                  <input type="text" placeholder="Last name" name="LastName" id="LastName" maxLength={50} defaultValue={props.userInfo.LastName} required/>
                </div>
                </div>
                  {(invalidFirstName && !invalidLastName) && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Invalid first name. Only alphabet characters are allowed.</p>}
                  {(invalidLastName && !invalidFirstName) && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Invalid last name. Only alphabet characters are allowed.</p>}
                  {(invalidLastName && invalidFirstName) && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Invalid first and last names. Only alphabet characters are allowed.</p>}
              {(props.userInfo.MobileNumber === "") &&
              <div className="edit-mobile">
                <IconContext.Provider value={{ color: "gray", size: "2rem" }}>
                    <TiPhoneOutline />
                </IconContext.Provider> 
                <input type="text" placeholder="Mobile number" name="MobileNumber" id="MobileNumber" maxLength={13} defaultValue="09xxxxxxxxx" required/>
              </div> }
              {(props.userInfo.MobileNumber !== "") &&
              <div className="edit-mobile">
                <IconContext.Provider value={{ color: "gray", size: "2rem" }}>
                    <TiPhoneOutline />
                </IconContext.Provider> 
                <input type="text" placeholder="Mobile number" name="MobileNumber" id="MobileNumber" maxLength={13} defaultValue={props.userInfo.MobileNumber} required/>
              </div> }
                  {invalidMobileNumber && <p style={{ color: "red", fontSize: "0.75rem", margin: "0.25rem" }}>Invalid mobile number. Format: +639xxxxxxxxx or 09xxxxxxxxx.</p>}
              <div className="edit-birthday">
                <IconContext.Provider value={{ color: "gray", size: "2rem" }}>
                    <RiCake2Line />
                </IconContext.Provider> 
                <input type="date" id="Birthday" ref={birthday} max={disableFutureDates()} defaultValue={new Date(props.userInfo.Birthday*1000).toLocaleDateString('pt-br').split( '/' ).reverse( ).join( '-' )} required/>
              </div>
            </div>
            <div className="footer">
              <button onClick={() => { props.setShowEditDetailsModal(false)}} className="cancel-btn">
                Cancel
              </button>
              <div className="save-button">
              <input type="submit" className="save-btn" name="save" value="Save"/></div>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  )
}

export default EditDetailsModal;