import React from "react";
import "./userPhotos.css";
import { Link } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { Form } from "react-bootstrap";
import IconButton from "@material-ui/core/IconButton";

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      photo_id: "",
      numNewComment: 0,
      favPhotoArray: [],
      numFavPhoto: 0,
      numLikePhoto: 0,
      likePhotoArray: [],
      numNewPic: 0
    };
  }

  componentDidMount() {
    this.setState({ numNewPic: this.props.numNewPic });
    axios
      .get("/photosOfUser/" + this.props.match.params.userId)
      .then(response => {
        for (var i = 0; i < response.data.length; i++) {
          console.log(response.data[0].numLikes);
          if (response.data[i].numLikes === undefined) {
            response.data[i].numLikes = 0;
          }
        }
        response.data.sort(function(a, b) {
          if (b.numLikes == a.numLikes) {
            let c = new Date(a.date_time).getTime();
            let d = new Date(b.date_time).getTime();
            return d - c;
          } else {
            return b.numLikes - a.numLikes;
          }
        });
        this.setState({ photos: response.data });
      })
      .catch(function(error) {
        console.log(error.response);
      });

    axios
      .get("/user/" + this.props.match.params.userId)
      .then(response => {
        this.props.context(
          "Photos of " +
            response.data.first_name +
            " " +
            response.data.last_name
        );
        console.log(response);
      })
      .catch(function(error) {
        console.log(error.response);
      });

    axios
      .get("/favoritePics/" + this.props.loginUserId)
      .then(response => {
        this.setState({ favPhotoArray: response.data });
        console.log(response.data);
      })
      .catch(function(error) {
        console.log(error);
      });
    axios
      .get("/likePics/" + this.props.loginUserId)
      .then(response => {
        this.setState({ likePhotoArray: response.data });

        console.log(response.data);
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      console.log("here");
      axios
        .get("/photosOfUser/" + this.props.match.params.userId)
        .then(response => {
          for (var i = 0; i < response.data.length; i++) {
            console.log(response.data[0].numLikes);
            if (response.data[i].numLikes === undefined) {
              response.data[i].numLikes = 0;
            }
          }

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
    if (prevState.numNewComment !== this.state.numNewComment) {
      axios
        .get("/photosOfUser/" + this.props.match.params.userId)
        .then(response => {
          for (var i = 0; i < response.data.length; i++) {
            console.log(response.data[0].numLikes);
            if (response.data[i].numLikes === undefined) {
              response.data[i].numLikes = 0;
            }
          }

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

    if (prevState.numFavPhoto !== this.state.numFavPhoto) {
      axios
        .get("/favoritePics/" + this.props.loginUserId)
        .then(response => {
          this.setState({ favPhotoArray: response.data });
          console.log(response.data);
        })
        .catch(function(error) {
          console.log(error);
        });
    }
    if (prevState.numLikePhoto !== this.state.numLikePhoto) {
      axios
        .get("/photosOfUser/" + this.props.match.params.userId)
        .then(response => {
          for (var i = 0; i < response.data.length; i++) {
            console.log(response.data[0].numLikes);
            if (response.data[i].numLikes === undefined) {
              response.data[i].numLikes = 0;
            }
          }

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
      axios
        .get("/likePics/" + this.props.loginUserId)
        .then(response => {
          this.setState({ likePhotoArray: response.data });
          console.log(response.data);
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }

  handleComment = event => {
    event.preventDefault();
    let comment = event.target[0].value;
    axios
      .post("/commentsOfPhoto/" + event.target.id, {
        comment: comment
      })
      .then(response => {
        console.log(response.data);
        this.setState({ numNewComment: this.state.numNewComment + 1 });
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleFavPhoto(id) {
    axios
      .post("/favPhoto/" + id, {})
      .then(response => {
        this.setState({ numFavPhoto: this.state.numFavPhoto++ });
        console.log(response.data);
      })
      .catch(err => {
        console.error(err);
      });
  }

  handleLikePhoto(id) {
    axios
      .post("/likePhoto/" + id, {})
      .then(response => {
        this.setState({ numLikePhoto: this.state.numLikePhoto++ });
        console.log(response.data);
      })
      .catch(err => {
        console.error(err);
      });
  }

  handleDisLikePhoto(id, likePhotoId) {
    axios
      .post("/disLikePhoto/" + id, {
        id: likePhotoId
      })
      .then(response => {
        this.setState({ numLikePhoto: this.state.numLikePhoto-- });
        console.log(response.data);
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
    let favStatus;
    let likeStatus;
    let array_of_photos = this.state.photos.map((photo, index) => {
      if (this.state.likePhotoArray.length === 0) {
        likeStatus = (
          <IconButton
            color="primary"
            onClick={() => this.handleLikePhoto(photo._id)}
          >
            <i className="material-icons">thumb_up_alt</i>
          </IconButton>
        );
      } else {
        likeStatus = this.state.likePhotoArray.map((likePhoto, index) => {
          if (photo.file_name == likePhoto.file_name) {
            return (
              <IconButton
                color="primary"
                key={index}
                onClick={() =>
                  this.handleDisLikePhoto(photo._id, likePhoto._id)
                }
              >
                <i className="material-icons">thumb_down_alt</i>
              </IconButton>
            );
          }
        });
      }
      if (this.state.favPhotoArray.length === 0) {
        favStatus = (
          <IconButton
            color="primary"
            onClick={() => this.handleFavPhoto(photo._id)}
          >
            <i className="material-icons">favorite_border</i>
          </IconButton>
        );
      } else {
        favStatus = this.state.favPhotoArray.map((favPhoto, index) => {
          if (photo.file_name == favPhoto.file_name) {
            return (
              <IconButton color="primary" key={index}>
                <i className="material-icons">favorite</i>
              </IconButton>
            );
          }
        });
      }

      if (favStatus.length) {
        favStatus = favStatus.filter(function(element) {
          return element !== undefined;
        });
      }

      if (likeStatus.length) {
        likeStatus = likeStatus.filter(function(element) {
          return element !== undefined;
        });
      }

      var res = moment(photo.date_time)
        .format("MM/DD/YYYY ha z")
        .split(" ");
      let comments;
      if (photo.comments === undefined) {
        comments = " ";
      } else {
        photo.comments.sort(function(a, b) {
          let c = new Date(a.date_time).getTime();
          let d = new Date(b.date_time).getTime();
          return c - d;
        });
        comments = photo.comments.map((comment, index) => {
          var dateTime = moment(comment.date_time)
            .format("MM/DD/YYYY ha z")
            .split(" ");
          return (
            <div key={index} className="comment">
              <div className="userlist collection col s12 z-depth-2 #ffebee red lighten-5">
                {" "}
                <Link
                  to={"/users/" + comment.user._id}
                  className="left waves-effect waves-teal btn-flat"
                >
                  {comment.user.first_name + " " + comment.user.last_name + ":"}
                </Link>
                <p className="text-content"> {comment.comment}</p>
                <span className="date-time">
                  Posted on: {dateTime[0]} at {dateTime[1]}
                </span>
              </div>
            </div>
          );
        });
      }
      return (
        <div className="row" key={index}>
          <div className="col s12 m7">
            <div className="card">
              <div className="card-image">
                <img src={"./images/" + photo.file_name} />
                <Form>
                  {favStatus.length ? (
                    favStatus
                  ) : (
                    <IconButton
                      color="primary"
                      onClick={() => this.handleFavPhoto(photo._id)}
                    >
                      <i className="material-icons">favorite_border</i>
                    </IconButton>
                  )}
                  {likeStatus.length ? (
                    likeStatus
                  ) : (
                    <IconButton
                      color="primary"
                      onClick={() => this.handleLikePhoto(photo._id)}
                    >
                      <i className="material-icons">thumb_up_alt</i>
                    </IconButton>
                  )}
                  <span>{photo.numLikes} likes</span>
                </Form>
                <span className="date-time">
                  Posted on: {res[0]} at {res[1]}
                </span>
              </div>
              <div className="comment-content">{comments}</div>
              <div className="userlist collection col s12 z-depth-2 #ffebee red lighten-5">
                <Form onSubmit={this.handleComment} id={photo._id}>
                  <Form.Control type="text" placeholder="Enter your comment" />
                  <button
                    className="mb-3-item"
                    variant="secondary"
                    type="submit"
                  >
                    Comment
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      );
    });

    return <div className="col s9">{array_of_photos}</div>;
  }
}

export default UserPhotos;
