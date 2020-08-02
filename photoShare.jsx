import React from "react";
import ReactDOM from "react-dom";
import { Redirect } from "react-router";
import { HashRouter, Route, Switch } from "react-router-dom";

// import necessary components
import TopBar from "./components/topBar/TopBar";
import UserDetail from "./components/userDetail/UserDetail";
import UserList from "./components/userList/UserList";
import UserPhotos from "./components/userPhotos/UserPhotos";
import LoginRegister from "./components/LoginRegister/LoginRegister";
import Registration from "./components/Registration/Registration";
import Favorites from "./components/Favorites/Favorites";
import "./node_modules/materialize-css/dist/css/materialize.css";
import "./styles/main.css";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.updateContext = this.updateContext.bind(this);
    this.updateLogin = this.updateLogin.bind(this);
    this.updatefirstName = this.updatefirstName.bind(this);
    this.updateNumNewPic = this.updateNumNewPic.bind(this);
    this.getPhotos = this.getPhotos.bind(this);
    this.updateUserId = this.updateUserId.bind(this);
    this.updateLoginUserId = this.updateLoginUserId.bind(this);
    this.state = {
      context: "",
      userIsLoggedIn: null,
      firstName: "",
      numNewPic: 0,
      userId: "",
      loginUserId: ""
    };
  }

  updateLoginUserId(id) {
    this.setState({ loginUserId: id });
    console.log("inside updateLoginUserId");
    console.log(id);
  }
  updateUserId(id) {
    this.setState({ userId: id });
  }

  getPhotos(lastP, mostCommentsP) {
    this.setState({ lastPhoto: lastP });
    this.setState({ photoWithMostComments: mostCommentsP });
  }

  updateContext(str) {
    this.setState({ context: str });
  }

  componentDidUpdate() {}

  updateLogin(id) {
    this.setState({ userIsLoggedIn: id });
  }

  updateNumNewPic() {
    this.setState({ numNewPic: this.state.numNewPic + 1 });
    console.log(this.state.numNewPic);
  }

  updatefirstName(str) {
    this.setState({ firstName: str });
  }

  render() {
    var updateContext = this.updateContext;
    return (
      <HashRouter>
        <div>
          <div>
            <div className="row">
              {this.state.userIsLoggedIn !== null ? (
                <div>
                  <TopBar
                    string={this.state.context}
                    firstName={this.state.firstName}
                    updateLogin={this.updateLogin}
                    updateNumNewPic={this.updateNumNewPic}
                  />
                  <div className="center-align">
                    <UserList />
                    <Switch>
                      <Route
                        path="/favorites"
                        render={props => (
                          <Favorites
                            {...props}
                            userId={this.state.userId}
                            loginUserId={this.state.loginUserId}
                          />
                        )}
                      />
                      <Route
                        path="/users/:userId"
                        render={props => (
                          <UserDetail
                            {...props}
                            context={updateContext.bind(this)}
                            updateUserId={this.updateUserId}
                          />
                        )}
                      />
                      <Route
                        path="/photos/:userId"
                        render={props => (
                          <UserPhotos
                            {...props}
                            context={updateContext.bind(this)}
                            getPhotos={this.getPhotos}
                            userId={this.state.userId}
                            loginUserId={this.state.loginUserId}
                            numNewPic={this.state.numNewPic}
                          />
                        )}
                      />
                      <Route path="/users" component={UserList} />
                      <Redirect
                        path="/login-register"
                        to={"/users/" + this.state.userIsLoggedIn}
                      />
                    </Switch>
                  </div>
                </div>
              ) : (
                <Switch>
                  <Route
                    path="/login-register"
                    render={() => (
                      <LoginRegister
                        updateLogin={this.updateLogin}
                        updatefirstName={this.updatefirstName}
                        updateLoginUserId={this.updateLoginUserId}
                      />
                    )}
                  />
                  <Route path="/registration" render={() => <Registration />} />
                  <Redirect to="/login-register" />
                </Switch>
              )}
            </div>
          </div>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
