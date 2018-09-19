import * as React from 'react'
import {connect} from 'react-redux'
import { Stage, Layer } from 'react-konva';
import {Redirect} from 'react-router-dom'
import {getGames, joinGame, updateGame} from '../actions/games'
import {getUsers} from '../actions/users'
import {userId} from '../jwt'
import './games/GameDetails.css'

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  getRndInt
} from '../lib/canvas'

import LayerBG from './LayerBG';
import LayerFG from './LayerFG';
import LayerTerrain from './LayerTerrain';

class Game extends React.PureComponent {

  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames()
      if (this.props.users === null) this.props.getUsers()
    }
  }

  componentDidUpdate() {

  }

  joinGame = () => this.props.joinGame(this.props.game.id)

  render() {

    const {game, users, authenticated, userId} = this.props

    if (!authenticated) return (
			<Redirect to="/login" />
    )

    if (game === null || users === null) return 'Loading...'
    if (!game) return 'Not found'

    const player = game.players.find(p => p.userId === userId)

    const winner = game.players
      .filter(p => p.symbol === game.winner)
      .map(p => p.userId)[0]

    // layer settings for each tank
    const x = []
    const y = []
    x[0] = Math.round(getRndInt(10, game.settings.canvasWidth / 2))
    y[0] = game.settings.heightMap[x[0]]
    x[1] = Math.round(getRndInt(game.settings.canvasWidth / 2, game.settings.canvasWidth - 10))
    y[1] = game.settings.heightMap[x[1]]

    return (
      <div>
        <h1>Game #{game.id}</h1>

        <p>Status: {game.status}</p>

        {
          game.status === 'started' &&
          player && player.symbol === game.turn &&
          <div>It's your turn!</div>
        }

        {
          game.status === 'pending' &&
          game.players.map(p => p.userId).indexOf(userId) === -1 &&
          <button onClick={this.joinGame}>Join Game</button>
        }

        {
          winner &&
          <p>Winner: {users[winner].firstName}</p>
        }

        <hr />

        {
          game.status !== 'pending' &&
          <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
          <Layer>
            <LayerBG />
          </Layer>
          <Layer>
            <LayerTerrain game={game}/>
          </Layer>
          <Layer>
            <LayerFG game={game} player='x' color="#f00" x={x[0]} y={y[0]} />
            <LayerFG game={game} player='o' color="#00f" x={x[1]} y={y[1]} />
          </Layer>
        </Stage>
        }

      </div>

    )
  }
}

const mapStateToProps = (state, props) => ({
  authenticated: state.currentUser !== null,
  userId: state.currentUser && userId(state.currentUser.jwt),
  game: state.games && state.games[props.match.params.id],
  users: state.users
})

const mapDispatchToProps = {
  getGames, getUsers, joinGame, updateGame
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)