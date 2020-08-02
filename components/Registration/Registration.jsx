import React from "react";
import "./Registration.css";
import axios from "axios";
import { Redirect } from "react-router";

class Registration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: "",
      last_name: "",
      login_name: "",
      password: "",
      retypePassword: "",
      location: "",
      description: "",
      occupation: "",
      registered: false
    };
    this.formSubmit = this.formSubmit.bind(this);
    this.updatefirstname = event => this.updateFirstname(event);
    this.updatelastname = event => this.updateLastname(event);
    this.updateloginname = event => this.updateLoginname(event);
    this.updatepassword = event => this.updatePassword(event);
    this.updateretypepassword = event => this.updateRetypePassword(event);
    this.updatelocation = event => this.updateLocation(event);
    this.updatedescription = event => this.updateDescription(event);
    this.updateoccupation = event => this.updateOccupation(event);
  }

  formSubmit = e => {
    e.preventDefault();
    if (this.state.login_name === null || this.state.login_name === " ") {
      alert("Invalid login name");
    }
    if (this.state.first_name === null || this.state.first_name === " ") {
      alert("Invalid first name");
    }
    if (this.state.last_name === null || this.state.last_name === " ") {
      alert("Invalid last name");
    }
    if (this.state.password !== this.state.retypePassword) {
      alert("Invalid password");
    }

    axios
      .post("/user", {
        login_name: this.state.login_name,
        password: this.state.password,
        location: this.state.location,
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        description: this.state.description,
        occupation: this.state.occupation
      })
      .then(response => {
        console.log(response.data);
        this.setState({ login_name: "" });
        this.setState({ password: "" });
        this.setState({ retypePasswordpassword: "" });
        this.setState({ location: "" });
        this.setState({ first_name: "" });
        this.setState({ last_name: "" });
        this.setState({ description: "" });
        this.setState({ occupation: "" });
        alert("Registration completed");
        this.setState({ registered: true });
      })
      .catch(error => {
        console.log(error);
        alert("User cannot be added");
      });
  };
  updateFirstname(event) {
    this.setState({ first_name: event.target.value });
  }
  updateLastname(event) {
    this.setState({ last_name: event.target.value });
  }
  updateLoginname(event) {
    this.setState({ login_name: event.target.value });
  }
  updatePassword(event) {
    this.setState({ password: event.target.value });
  }
  updateRetypePassword(event) {
    this.setState({ retypePassword: event.target.value });
  }
  updateLocation(event) {
    this.setState({ location: event.target.value });
  }
  updateDescription(event) {
    this.setState({ description: event.target.value });
  }
  updateOccupation(event) {
    this.setState({ occupation: event.target.value });
  }

  render() {
    console.log(this.state.registered);
    return (
      <div className="card-panel #ef5350 red lighten-1">
        <div className="container">
          <h1 className="brand-logo center">Registration Page</h1>
          <form onSubmit={event => this.formSubmit(event)}>
            <div id="label"> First name</div>
            <input
              type="text"
              value={this.state.first_name}
              onChange={this.updatefirstname}
              id="input"
            />
            <div id="label"> Last name</div>
            <input
              type="text"
              value={this.state.last_name}
              onChange={this.updatelastname}
              id="input"
            />
            <div id="label"> Login name</div>
            <input
              type="text"
              value={this.state.login_name}
              onChange={this.updateloginname}
              id="input"
            />
            <div id="label"> Password</div>
            <input
              type="password"
              value={this.state.password}
              onChange={this.updatepassword}
              id="input"
            />
            <div id="label"> Retype password</div>
            <input
              type="password"
              value={this.state.retypePassword}
              onChange={this.updateretypepassword}
              id="input"
            />
            <div id="label"> Location</div>
            <input
              type="text"
              value={this.state.location}
              onChange={this.updatelocation}
              id="input"
            />{" "}
            <div id="label"> Description</div>
            <input
              type="text"
              value={this.state.description}
              onChange={this.updatedescription}
              id="input"
            />
            <div id="label"> Occupation</div>
            <input
              type="text"
              value={this.state.occupation}
              onChange={this.updateoccupation}
              id="input"
            />
            <button
              type="submit"
              name="action"
              className="waves-effect waves-light btn"
            >
              Register Me
            </button>
          </form>
          {this.state.registered ? <Redirect to="/login-register" /> : <div />}
        </div>
      </div>
    );
  }
}
export default Registration;
