import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import LoginPage from './components/login/LoginPage'
import SignupPage from './components/signup/SignupPage'
import GamesList from './components/games/GamesList'
//import GameDetails from './components/games/GameDetails'
import LogoutPage from './components/logout/LogoutPage'
import './App.css'
import TopBar from './components/layout/TopBar'
import Game from './components/Game';

import {baseUrl} from './constants'


class App extends Component {
  render() {
    console.log(`Api base url: ${baseUrl}`)
    return (
      <Router>
        <div className="App">
          {/* <Game /> */}
          <nav>
            <TopBar />
          </nav>
          <main style={{marginTop:75}}>
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/logout" component={LogoutPage} />
            <Route exact path="/signup" component={SignupPage} />
            <Route exact path="/games" component={GamesList} />
            <Route exact path="/games/:id" component={Game} /> {/* was GameDetails*/}
            <Route exact path="/" render={ () => <Redirect to="/games" /> } />
          </main>
        </div>
      </Router>
    );
  }
}

export default App;
  