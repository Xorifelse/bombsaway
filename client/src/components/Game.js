import * as React from 'react'
import {connect} from 'react-redux'
import { Stage, Layer } from 'react-konva';
import {Redirect} from 'react-router-dom'
import {getGames, joinGame, updateGame} from '../actions/games'
import {getUsers} from '../actions/users'
import {userId} from '../jwt'

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH
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
    const player = this.props.game.players.find(p => p.userId === this.props.userId)

    const winner = this.props.game.players
      .filter(p => p.symbol === this.props.game.winner)
      .map(p => p.userId)[0]
  }

  joinGame = () => this.props.joinGame(this.props.game.id)

  render() {

    const {game, users, authenticated, userId} = this.props

    if (!authenticated) return (
			<Redirect to="/login" />
    )

    return (
      <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        <Layer>
          <LayerBG />
        </Layer>
        <Layer>
          <LayerTerrain />
        </Layer>
        <Layer>
          <LayerFG />
        </Layer>
      </Stage>
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