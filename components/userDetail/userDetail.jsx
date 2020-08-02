import React from "react";
import "./userDetail.css";
import { Link } from "react-router-dom";
import axios from "axios";
import moment from "moment";

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: [],
      photos: false
    };
  }

  componentDidMount() {
    axios
      .get("/user/" + this.props.match.params.userId)
      .then(response => {
        this.props.context(
          response.data.first_name + " " + response.data.last_name
        );
        this.setState({ user: response.data });
        this.props.updateUserId(this.props.match.params.userId);
        console.log(response.data);
      })

      .catch(function(error) {
        console.log(error);
      });
    axios
      .get("/photosOfUser/" + this.props.match.params.userId)
      .then(response => {
        this.setState({ photos: response.data });
      })
      .catch(function(error) {
        console.log(error.response);
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      axios
        .get("/user/" + this.props.match.params.userId)
        .then(response => {
          this.setState({ user: response.data });
          this.props.context(
            response.data.first_name + " " + response.data.last_name
          );
          this.props.updateUserId(this.props.match.params.userId);
          console.log(response.data);
        })
        .catch(function(error) {
          console.log(error.response);
        });
      axios
        .get("/photosOfUser/" + this.props.match.params.userId)
        .then(response => {
          this.setState({ photos: response.data });
        });
      axios.get("/user/" + this.props.match.params.userId).then(response => {
        this.props.context(
          "Photos of " +
            response.data.first_name +
            " " +
            response.data.last_name
        );
      });
    }
  }

  render() {
    let dateTime;
    let num_comments = 0; //use to store number of comments
    let array;
    let filename = "";
    if (this.state.photos) {
      dateTime = moment(
        this.state.photos[this.state.photos.length - 1].date_time
      )
        .format("MM/DD/YYYY ha z")
        .split(" ");
      array = this.state.photos.map(photo => {
        if (photo.comments.length > num_comments) {
          num_comments = photo.comments.length;
          filename = photo.file_name;
        }
      });
    }

    return (
      <div>
        <div className="userlist collection col s9 z-depth-2 #ffebee red lighten-5">
          <div className="title">
            First Name:
            <span className="content">
              {" " + this.state.user.first_name}{" "}
            </span>{" "}
          </div>
          <div className="title">
            Last Name:
            <span className="content">
              {" " + this.state.user.last_name}
            </span>{" "}
          </div>
          <div className="title">
            User ID:{" "}
            <span className="content">{" " + this.state.user._id}</span>{" "}
          </div>
          <div className="title">
            Location:{" "}
            <span className="content">{" " + this.state.user.location}</span>{" "}
          </div>
          <div className="title">
            Description:
            <span className="content">
              {" " + this.state.user.description}{" "}
            </span>{" "}
          </div>
          <div className="title">
            Occupation:
            <span className="content">
              {" " + this.state.user.occupation}
            </span>{" "}
          </div>
          <div>
            <Link
              to={"/photos/" + this.props.match.params.userId}
              className="waves-effect waves-light btn #ef5350 red lighten-1"
            >
              <i className="material-icons left">insert_photo</i>
              Photos
            </Link>
          </div>
        </div>
        <div className="col s12 m3">
          <div className="card">
            {this.state.photos ? (
              <Link
                to={"/photos/" + this.props.match.params.userId}
                className="card-image"
              >
                <img
                  src={
                    "./images/" +
                    this.state.photos[this.state.photos.length - 1].file_name
                  }
                />
                <h4 className="card-title">Most Recently Uploaded Photo</h4>
                <span className="date-time">
                  Posted on: {dateTime[0]} at {dateTime[1]}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
        <div className="col s12 m3">
          <div className="card">
            {this.state.photos ? (
              <Link
                to={"/photos/" + this.props.match.params.userId}
                className="card-image"
              >
                <img src={"./images/" + filename} />
                <h4 className="card-title">Most Commented Photo</h4>
                <span className="date-time">
                  Number of comments: {num_comments}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default UserDetail;
