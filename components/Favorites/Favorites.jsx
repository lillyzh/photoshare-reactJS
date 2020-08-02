import React from "react";
import "./Favorites.css";
import axios from "axios";
import moment from "moment";
import { Form } from "react-bootstrap";
import IconButton from "@material-ui/core/IconButton";
import Modal from "react-modal";
Modal.setAppElement("div");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      modalIsOpen: false,
      username: ""
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount() {
    axios
      .get("/favoritePics/" + this.props.userId)
      .then(response => {
        this.setState({ photos: response.data });
        console.log(response.data);
      })
      .catch(function(error) {
        console.log(error);
      });
    axios.get("/user/" + this.props.userId).then(response => {
      this.setState({ username: response.data.first_name });
      console.log(response.data.first_name);
    });
  }

  deleteFavPhoto(id) {
    if (this.props.userId !== this.props.loginUserId) {
      return alert("Cannot delete other favorited photos");
    }
    axios
      .post("/deleteFavPhoto/" + id, {
        favPhotoUserId: this.props.userId
      })
      .then(response => {
        this.setState({ photos: response.data });
        console.log(response.data);
      })
      .catch(err => {
        console.error(err);
      });
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = "#f00";
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  render() {
    let array_of_photos = this.state.photos.map((photo, index) => {
      var res = moment(photo.date_time)
        .format("MM/DD/YYYY ha z")
        .split(" ");
      return (
        <div className="col s12 m3" key={index}>
          <div className="card">
            <div className="card-image">
              <Form onClick={() => this.deleteFavPhoto(photo._id)}>
                <IconButton color="primary">
                  <i className="material-icons">clear</i>
                </IconButton>
              </Form>
              <img
                onClick={this.openModal}
                src={"./images/" + photo.file_name}
              />
              <Modal
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                style={customStyles}
                contentLabel="Example Modal"
              >
                <img src={"./images/" + photo.file_name} />
                <h4 ref={subtitle => (this.subtitle = subtitle)}>
                  Posted on: {res[0]} at {res[1]}
                </h4>
                <IconButton color="primary" onClick={this.closeModal}>
                  <i className="material-icons">highlight_off</i>
                </IconButton>
              </Modal>
            </div>
          </div>
        </div>
      );
    });

    return (
      <div className="row">
        <div className="userlist collection col s9 z-depth-2">
          <h3>Favorites of {this.state.username}</h3>
          <div className="grid">
            <div className="grid-item">{array_of_photos}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Favorites;
