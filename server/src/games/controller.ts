import { 
  JsonController, Authorized, CurrentUser, Post, Param, BadRequestError, HttpCode, NotFoundError, ForbiddenError, Get, 
  Body, Patch 
} from 'routing-controllers'
import User from '../users/entity'
import { Game, Player } from './entities'
// import {IsBoard, isValidTransition, calculateWinner, finished} from './logic'
// import { Validate } from 'class-validator'
import {io} from '../index'

import {genHeightmap, getRndInt} from '../lib/canvas'

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PLAYER_COUNT,
  PLAYER_COLORS,
  PLAYER_START_X,
  PLAYER_NAMES,
  PLAYER_ID,
  between
} from '../lib/constants'


interface Tank{
  x,     // x cord
  y,     // y cord
  color, // color
  id,    // player
  name,   // color name
  health
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

    const tanks: Tank[] = []
    let heightMap = genHeightmap(CANVAS_WIDTH, CANVAS_HEIGHT)

    let startx = [
      getRndInt(50, CANVAS_WIDTH / 2 - 50),
      getRndInt((CANVAS_WIDTH / 2 + 50), CANVAS_WIDTH - 50)
    ]

    for(let i = 0; i < PLAYER_COUNT; i++){
      let x = startx[i]
      tanks.push({
        id: PLAYER_ID[i],
        x, 
        y: heightMap[x], 
        name: PLAYER_NAMES[i],
        color: `rgb(${PLAYER_COLORS[i].r}, ${PLAYER_COLORS[i].g}, ${PLAYER_COLORS[i].b})`,
        health: 100
      })
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
    // @CurrentUser() user: User,
    @Param('id') gameId: number,
    // @Body() update: GameUpdate
  ) {
    const game = await Game.findOneById(gameId)
    if (!game) throw new NotFoundError(`Game does not exist`)

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

 @Authorized()
 // the reason that we're using patch here is because this request is not idempotent
 // http://restcookbook.com/HTTP%20Methods/idempotency/
 // try to fire the same requests twice, see what happens
 @Patch('/games/:id([0-9]+)/pressed')
 async hasPressed(
  //  @CurrentUser() user: User,
   @Param('id') gameId: number,
   @Body() update: any
 ) {

  if (update.keyReleased && update.keyReleased === true) {
    io.emit('action', {
      type: 'KEY_PRESSED',
      payload: {
        keyPressed: update.key,
        keyReleased: true,
        layerId: update.layerId,
        id: gameId
      }
    })
  } else {

    io.emit('action', {
      type: 'KEY_PRESSED',
      payload: { 
        keyPressed: update.key, 
        keyReleased: false,
        layerId: update.layerId,
        id: gameId
      }
    })
  }

   return update
  }

  @Authorized()
  // the reason that we're using patch here is because this request is not idempotent
  // http://restcookbook.com/HTTP%20Methods/idempotency/
  // try to fire the same requests twice, see what happens
  @Patch('/games/:id([0-9]+)/fired')
  async hasFired(
   //  @CurrentUser() user: User,
    @Param('id') gameId: number,
    @Body() update: any
  ) {
 
     io.emit('action', {
       type: 'HAS_FIRED',
       payload: { 
         degrees: update.degrees,
         force: update.force,
         id: gameId,
         hasFired: true
       }
     })
 
    return update
   }

   @Authorized()
   // the reason that we're using patch here is because this request is not idempotent
   // http://restcookbook.com/HTTP%20Methods/idempotency/
   // try to fire the same requests twice, see what happens
   @Patch('/games/:id([0-9]+)/hit')
   async hasHit(
     @CurrentUser() user: User,
     @Param('id') gameId: number,
     @Body() update: any
   ) {

    let { x, y, radius , tanks} = update

    x = Math.floor(x)
    y = Math.floor(y)

    const game = await Game.findOneById(gameId)
    if (!game) throw new NotFoundError(`Game does not exist`)

    const player = await Player.findOne({ user, game })

    if (!player) throw new ForbiddenError(`You are not part of this game`)
    if (game.status !== 'started') throw new BadRequestError(`The game is not started yet`)
    if (player.symbol !== game.turn) throw new BadRequestError(`It's not your turn`)

    game.turn = player.symbol === 'x' ? 'o' : 'x'

    let hm = game.settings.heightMap

    // edit hightmight on explosion
    radius = radius + radius / 4
    for(let i = 0; i < radius; i++){
      let sub = Math.sqrt((radius*radius)-(i*i))
      let bottom = y - sub

      if(x+i < game.settings.canvasWidth && bottom < hm[x+i]){
        hm[x+i] += Math.min(sub*2, hm[x+i]-bottom)
      }
      if(x-i >= 0 && i != 0 && bottom < hm[x-i]){
        hm[x-i] += Math.min(sub*2, hm[x-i]-bottom)
      }
    }
    game.settings.hm = hm

    // dirty update y pos
    game.settings.tanks[0].y = Math.floor(hm[tanks[0].x]) 
    game.settings.tanks[1].y = Math.floor(hm[tanks[1].x])

  
    for(let i=0; i<PLAYER_COUNT; i++){
      let serverX = PLAYER_START_X[i]
      let serverY = game.settings.heightMap[Math.round(serverX)] ///******************* */
      console.log(serverY)

      if(serverY >= game.settings.canvasHeight){
        tanks[i].health = 0
        game.status = 'finished'
        game.winner = game.settings.tanks.filter(tank => tank.id !== game.settings.tanks[i].id)[0].id
        await game.save()
      } else {
        if(between(x, serverX - radius, serverX + radius) && between(y, serverY - radius, serverY + radius)){ // calc in rectangle

          let distX = Math.abs(serverX - x)
          let distY = Math.abs(serverY - y)
          let damage = Math.abs(radius - (distX + distY))
  
          game.settings.tanks[i].health -= damage + radius

          if (game.settings.tanks[i].health <= 0) {
            game.settings.tanks[i].health = 0
           
            game.status = 'finished'
            game.winner = game.settings.tanks.filter(tank => tank.id !== game.settings.tanks[i].id)[0].id
            await game.save()
          }
        }
      }
    }

    await game.save()

    io.emit('action', {
      type: 'HAS_HIT',
      payload: {
        settings: game.settings,
        gameId: gameId,
        turn: game.turn,
        gameStatus : game.status,
        winner: game.status === 'finished' && game.winner
      }
    })
  
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

