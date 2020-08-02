import React from "react";
import "./userList.css";
import { Link } from "react-router-dom";
import axios from "axios";

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    };
  }
  componentDidMount() {
    axios
      .get("/user/list")
      .then(response => {
        this.setState({ users: response.data });
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  render() {
    let array_of_users = this.state.users.map((user, index) => {
      return (
        <div className="list" key={index}>
          <Link
            to={"/users/" + user._id}
            className="waves-effect waves-light btn-large #ef5350 red lighten-1"
          >
            <i className="material-icons left">person</i>
            {user.first_name + " " + user.last_name}{" "}
          </Link>
        </div>
      );
    });
    return (
      <div className="userlist collection col s3 z-depth-2">
        <div className="col s12">
          <h4 className="flow-text">List of users</h4>
          <ul className="list_of_users"> {array_of_users} </ul>
        </div>
      </div>
    );
  }
}

export default UserList;
