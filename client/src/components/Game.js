import * as React from 'react'
import {connect} from 'react-redux'
import { Stage, Layer } from 'react-konva';
import {Redirect} from 'react-router-dom'
import {getGames, joinGame, updateGame} from '../actions/games'
import {getUsers} from '../actions/users'
import {userId} from '../jwt'
import './Game.css'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
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

    let playerText = ''  
    let playerColor = ''
    if (game.status === 'started') {
      const tank = game.settings.tanks.filter(tank => tank.id === player.symbol)[0]
      playerText = <span style={{color: tank.color}}>You are: {tank.name}</span>
    }
     
    

    return (
      <Grid container direction="column" justify="center" alignItems="center">
      <Grid item>
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item>
            <Card className="info-card" style={{backgroundColor: playerColor}}>
              <CardContent className="info-card-content">
                <Typography variant="display2">Game {game.id}</Typography>

                <Typography variant="title">Status: {game.status} {playerText}</Typography>

                {
                  game.status === 'started' &&
                  player && player.symbol === game.turn &&
                  <Typography variant="title">It's your turn! </Typography>
                  

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
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Card className="info-card" style={{backgroundColor: playerColor}}>
              <CardContent className="info-card-content">
                <Typography variant="caption">
                  Use your arrow key to move your tank's barrel: 
                </Typography>
                <Typography>
                  UP and DOWN for fast, LEFT and RIGHT for fine tuning
                </Typography>
                <Typography>
                  Press SPACE bar to increase your Force - the power with which you shoot. 
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Grid>

        {
          game.status !== 'pending' &&
          <Grid item>
          <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
          <Layer>
            <LayerBG winner={winner}/>
          </Layer>
          <Layer>
            <LayerTerrain game={game}/>
          </Layer>
          <Layer>
            {
              game.settings.tanks.map(obj => {
                return <LayerFG key={obj.id} game={game} {...obj} local={player.symbol === obj.id} turn={game.turn} winner={winner}/>
              })
            }
          </Layer>
        </Stage>
        </Grid>
        }

      </Grid>

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