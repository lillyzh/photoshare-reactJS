import React from "react";
import "./LoginRegister.css";
import axios from "axios";
import { Link } from "react-router-dom";

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      isLogin: false,
      password: ""
    };
    this.updatepassword = event => this.updatePassword(event);
    this.updateUserName = event => this.updateName(event);
    this.updateUserName = this.updateUserName.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
  }

  updateName(event) {
    this.setState({ username: event.target.value });
  }
  updatePassword(event) {
    this.setState({ password: event.target.value });
  }

  formSubmit = e => {
    e.preventDefault();
    axios
      .post("/admin/login", {
        login_name: this.state.username,
        password: this.state.password
      })
      .then(response => {
        console.log(response.data);
        this.props.updateLogin(response.data._id);
        this.props.updateLoginUserId(response.data._id);
        this.props.updatefirstName(response.data.first_name);
      })
      .catch(error => {
        console.log(error);
        alert("Log in failed. Please try again.");
      });
  };

  render() {
    return (
      <div className="card-panel #ef5350 red lighten-1">
        <div className="container">
          <h1 className="brand-logo center">Login Page </h1>
          <form onSubmit={event => this.formSubmit(event)}>
            <div id="label"> Username</div>
            <input
              type="text"
              value={this.state.username}
              onChange={this.updateUserName}
              id="input"
            />
            <div id="label"> Password</div>
            <input
              type="password"
              value={this.state.password}
              onChange={this.updatepassword}
              id="input"
            />
            <button type="submit" className="btn btn-default">
              Login
            </button>
            <Link to="/registration" className="btn btn-default">
              Create an account
            </Link>
          </form>
        </div>
      </div>
    );
  }
}

export default LoginRegister;
