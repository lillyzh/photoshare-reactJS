import React from "react";
import "./TopBar.css";
import axios from "axios";
import { Link } from "react-router-dom";
/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleUploadbutton = event => this.handleUploadButton(event);
  }

  logOut() {
    axios
      .post("/admin/logout", {})
      .then(response => {
        console.log(response);
        this.props.updateLogin(null);
      })
      .catch(error => {
        console.log(error.response);
      });
  }

  handleUploadButton = event => {
    event.preventDefault();

    if (this.uploadInput.files.length > 0) {
      const domForm = new FormData();

      domForm.append("uploadedphoto", this.uploadInput.files[0]);
      axios
        .post("/photos/new", domForm)
        .then(response => {
          console.log(response);
          this.props.updateNumNewPic();
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  render() {
    var string = this.props.string;
    let firstName = this.props.firstName;
    if (firstName !== "") {
      firstName = "Hi " + firstName + "!";
    }

    return (
      <nav>
        <div className="nav-wrapper #ef5350 red lighten-1">
          <a href="#" className="brand-logo">
            {firstName}
          </a>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li>{string}</li>
            <li>
              {" "}
              <Link to="/favorites/" className="waves-effect waves-light btn">
                <i className="material-icons left">favorite</i>
                Favorites
              </Link>
            </li>
            <li>
              <form onSubmit={this.handleUploadButton}>
                <button
                  className="waves-effect waves-light btn"
                  type="submit"
                  name="action"
                >
                  Add Photos
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={domFileRef => {
                    this.uploadInput = domFileRef;
                  }}
                />
              </form>
            </li>
            <li>
              <a
                className="waves-effect waves-light btn"
                onClick={this.logOut.bind(this)}
              >
                Logout
              </a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default TopBar;
