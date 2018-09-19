import { 
  JsonController, Authorized, CurrentUser, Post, Param, BadRequestError, HttpCode, NotFoundError, ForbiddenError, Get, 
  Body, Patch 
} from 'routing-controllers'
import User from '../users/entity'
import { Game, Player } from './entities'
// import {IsBoard, isValidTransition, calculateWinner, finished} from './logic'
// import { Validate } from 'class-validator'
import {io} from '../index'

import {genHeightmap} from '../lib/canvas'

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PLAYER_COUNT,
  PLAYER_COLORS,
  PLAYER_START_X
} from '../lib/constants'

// class GameUpdate {

//   @Validate(IsBoard, {
//     message: 'Not a valid board'
//   })
//   board: Board
// }

interface tankstype{
  x,
  y,
  c
}

@JsonController()
export default class GameController {

  @Authorized()
  @Post('/games')
  @HttpCode(201)
  async createGame(
    @CurrentUser() user: User
  ) {
    const entity = await Game.create()

    const tanks: tankstype[] = []
    const heightMap = genHeightmap(CANVAS_WIDTH, CANVAS_HEIGHT)

    for(let i = 0; i < PLAYER_COUNT; i++){
      let x = Math.round(PLAYER_START_X[i])
      let y = heightMap[Math.round(x)]
      console.log(heightMap[x])
      let c = PLAYER_COLORS[i]

      tanks.push({x, y, c})
    }

    const settings = {
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      tanks,
      heightMap,
    }

    entity.settings = settings
    const savedEntity = await entity.save()

    await Player.create({
      game: savedEntity, 
      user,
      symbol: 'x'
    }).save()

    const game = await Game.findOneById(entity.id)

    io.emit('action', {
      type: 'ADD_GAME',
      payload: game
    })

    return game
  }

  @Authorized()
  @Post('/games/:id([0-9]+)/players')
  @HttpCode(201)
  async joinGame(
    @CurrentUser() user: User,
    @Param('id') gameId: number
  ) {
    const game = await Game.findOneById(gameId)
    if (!game) throw new BadRequestError(`Game does not exist`)
    if (game.status !== 'pending') throw new BadRequestError(`Game is already started`)

    game.status = 'started'
    await game.save()

    const player = await Player.create({
      game, 
      user,
      symbol: 'o'
    }).save()

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: await Game.findOneById(game.id)
    })

    return player
  }

  @Authorized()
  // the reason that we're using patch here is because this request is not idempotent
  // http://restcookbook.com/HTTP%20Methods/idempotency/
  // try to fire the same requests twice, see what happens
  @Patch('/games/:id([0-9]+)')
  async updateGame(
    @CurrentUser() user: User,
    @Param('id') gameId: number,
    // @Body() update: GameUpdate
  ) {
    const game = await Game.findOneById(gameId)
    if (!game) throw new NotFoundError(`Game does not exist`)

    const player = await Player.findOne({ user, game })

    if (!player) throw new ForbiddenError(`You are not part of this game`)
    if (game.status !== 'started') throw new BadRequestError(`The game is not started yet`)
    if (player.symbol !== game.turn) throw new BadRequestError(`It's not your turn`)
    // if (!isValidTransition(player.symbol, game.board, update.board)) {
    //   throw new BadRequestError(`Invalid move`)
    // }    

    // const winner = calculateWinner(update.board)
    // if (winner) {
    //   game.winner = winner
    //   game.status = 'finished'
    // }
    // else if (finished(update.board)) {
    //   game.status = 'finished'
    // }
    // else {
    //   game.turn = player.symbol === 'x' ? 'o' : 'x'
    // }
    // game.board = update.board
    await game.save()
    
    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: game
    })

    return game
  }


  /* ***********************************************************************************************
  Player has pressed key > send messages to clients - these react on this and start they're animation
  */

//  @Authorized()
 // the reason that we're using patch here is because this request is not idempotent
 // http://restcookbook.com/HTTP%20Methods/idempotency/
 // try to fire the same requests twice, see what happens
 @Patch('/games/:id([0-9]+)/pressed')
 async hasPressed(
  //  @CurrentUser() user: User,
   @Param('id') gameId: number,
   @Body() update: any
 ) {
  //  const game = await Game.findOneById(gameId)
  //  if (!game) throw new NotFoundError(`Game does not exist`)

  //  const player = await Player.findOne({ user, game })

  //  if (!player) throw new ForbiddenError(`You are not part of this game`)
  //  if (game.status !== 'started') throw new BadRequestError(`The game is not started yet`)
  //  if (player.symbol !== game.turn) throw new BadRequestError(`It's not your turn`)

  if (update.keyReleased && update.keyReleased === true) {
    io.emit('action', {
      type: 'KEY_PRESSED',
      payload: {
        keyPressed: update.key,
        keyReleased: true,
        id: gameId
      }
    })
  } else {

    io.emit('action', {
      type: 'KEY_PRESSED',
      payload: { 
        keyPressed: update.key, 
        keyReleased: false,
        id: gameId

      }
    })
  }

   return update
  }



  @Authorized()
  @Get('/games/:id([0-9]+)')
  getGame(
    @Param('id') id: number
  ) {
    return Game.findOneById(id)
  }

  @Authorized()
  @Get('/games')
  getGames() {
    return Game.find()
  }
}

