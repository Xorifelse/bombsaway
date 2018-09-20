import * as React from 'react'
import {connect} from 'react-redux'
import {
  Rect,
  Circle,
  Group,
  Text,
  Line
} from 'react-konva'

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH
} from '../lib/canvas'

import {
  TANK_SIZE,
  TANK_BARREL_SIZE,
  TANK_BARREL_WIDTH,
  polarProjectionX,
  polarProjectionY,
  calcDegrees,
  deg2rad
} from '../lib/constants'

import {hasPressed, hasReleased, hasFired, switchFired, hasHit} from '../actions/games'


const KB_CODES = [
  // defines what keyboard codes to listen to

  32, // space
  37, // left
  38, // up
  39, // right
  40, // down
]


function Tank({x, y, degrees, color}){
  return (
    <Group>
      <Circle x={x} y={y} radius={TANK_SIZE} fill={color}/>
      <Line points={[x, y, polarProjectionX(x, TANK_BARREL_SIZE, degrees), polarProjectionY(y, TANK_BARREL_SIZE, degrees)]} strokeWidth={TANK_BARREL_WIDTH} stroke={color} />
    </Group>
  )
}

class LayerFG extends React.PureComponent {
  state = {
    trajectorys: [],
    explosions: [],
    keysCycle: [],
    keys: [],
    force: 0,
    degrees: 270,
    color: this.props.color,
  }

  createExplosion(x, y, radius){
    let circle = {
      x,
      y,
      fillRadialGradientStartPoint: 0,
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: 0,
      fillRadialGradientEndRadius: radius,
      fillRadialGradientColorStops: [0, 'yellow', 0.6, 'orange', 1, 'red'],
      radius: 0,
      expand: true
    }

    this.setState({
      explosions: [...this.state.explosions, circle]
    }, function(){
      let explosions = this.state.explosions
      let index = this.state.explosions.length - 1
      let circle = this.state.explosions[index]

      let update = setInterval(() => {
        if(circle.expand){
          if(circle.radius <= radius){
            circle.radius += 2
            this.setState({ explosions: [...explosions]})
          } else {
            circle.expand = false
            this.setState({ explosions: [...explosions]})
          }
        } else {
          if(circle.radius > 0){
            circle.radius -= 2
            this.setState({ explosions: [...explosions]})
          } else {
            clearInterval(update)
            explosions.length = 0 // dirty way to remove element from array, multiple explosions requires this to change.
            this.setState({ explosions: [...explosions]})
          }
        }
        circle.radius
      }, 50)
    }.bind(this))
  }

  fireProjectile(x, y, force, degrees){
    if(this.props.turn !== this.props.id) return

    x = polarProjectionX(x, TANK_BARREL_SIZE, degrees)
    y = polarProjectionY(y, TANK_BARREL_SIZE, degrees)

    let rad = deg2rad(degrees)
    let projectileX = x
    let projectileY = y
    let xVel = force/2;
    let yVel = -force/2;
    let g = 1;

    let line = [x,y]

    this.setState({
      trajectorys: [...this.state.trajectorys, line ]
    }, function (){
      let trajectorys = this.state.trajectorys
      let index = this.state.trajectorys.length - 1
      let line = this.state.trajectorys[index]

      let update = setInterval(() => {
        if(degrees >= 0 && degrees <= 180){
          // down, disabled
          clearInterval(update)
          //x += xVel * Math.cos(rad)
          //y += yVel * Math.sin(rad) 
        } else {
          // up
          x += xVel * Math.cos(rad)
          y -= yVel * Math.sin(rad) 
        }
        yVel += g

        projectileX = x
        projectileY = y

        line.push(projectileX, projectileY)
        trajectorys[index] = line

        this.setState({
          trajectorys: [...trajectorys]
        })

        // Remove projectile?
        if (y > CANVAS_HEIGHT || x < 0 || x > CANVAS_WIDTH) {
          if (this.props.local) {
            this.props.hasHit(this.props.game.id)
          }
          return clearInterval(update)
        }

        // Explode projectile?
        if(this.props.game.settings.heightMap[Math.round(x)] <= y){
          if (this.props.local) {
            this.props.hasHit(this.props.game.id)
          }
          return clearInterval(update)
        }
      }, 20 )
    }.bind(this))
  }
  
  keysUpdate(keyCode){
    switch (keyCode) {
      case 32: // space
        return this.setState({ force: this.state.force + 1 })
      case 37: // left
        // counter clock
        if (this.state.degrees === 181) return
        return this.setState({ degrees: this.state.degrees - 1 < 0 ? 359 : this.state.degrees - 1 })
      case 38: // up
        // clockwise
        if (calcDegrees(this.state.degrees, 5) > 0 && calcDegrees(this.state.degrees, 5) < 180) return
        return this.setState({ degrees: calcDegrees(this.state.degrees, 5) })
      case 39: // right
        // clockwise
        if (this.state.degrees === 359) return
        return this.setState({ degrees: this.state.degrees + 1 > 360 ? 1 : this.state.degrees + 1 })
      case 40: // down
        // counter clock
        if (this.state.degrees - 5 <= 181) return
        return this.setState({ degrees: calcDegrees(this.state.degrees, -5) })
    }
  }

  onKeyUp = (e) => {
    let keyCode = Number(e.keyCode)

    KB_CODES.forEach(code => {
      if(code === keyCode){
        if(this.state.keys[keyCode]){
          
          this.state.keys[keyCode] = false
          clearInterval(this.state.keysCycle[keyCode])
          this.props.hasReleased(this.props.game.id, this.props.id, keyCode)

          // Fire event
          if(keyCode === 32){
            console.log(`Fire with force of ${this.state.force}`)
            this.props.hasFired(this.props.game.id, this.state.degrees, this.state.force)
            this.setState({force: 0})
          }
        }
      }
    })
  }

  onKeyDown = (e) => {
    if(this.props.turn !== this.props.id){
      console.log('Not yours to update layer: ' + this.props.name)
      return
    }
    
    let keyCode = Number(e.keyCode)

    KB_CODES.forEach(code => {
      if(code === keyCode){
        if(!this.state.keys[keyCode]){
          // create timer for keycode that stops on key released
          this.props.hasPressed(this.props.game.id, this.props.id, keyCode)
          this.state.keys[keyCode] = true
          this.state.keysCycle[keyCode] = setInterval(() => this.keysUpdate(keyCode), 25)
        }
      }
    })
  }

  componentWillUnmount(){
    window.removeEventListener('keydown', () => this.onKeyDown)
    window.removeEventListener('keyup', () => this.onKeyUp)

    KB_CODES.map(code => clearInterval(this.state.keysCycle[code]))
  }

  componentDidMount(){
    if(this.props.local){
      console.log('binding events of layer ' + this.props.name + ' to ' + this.props.id)
      window.addEventListener('keydown', this.onKeyDown)
      window.addEventListener('keyup', this.onKeyUp)
    }

    // Add keys to state, no update
    KB_CODES.map(code => this.state.keys[code] = false)
  }
  

  componentDidUpdate(prevProps, prevState){
    // Peter -> check prevProps or prevState first to see what prop has changed!
    // return immidiatly on action!

    if (this.props.game.keyPressed !== 32 && this.props.game.keyReleased === false) {
      this.onKeyDown({ keyCode: this.props.game.keyPressed })
    } else if (this.props.game.keyPressed !== 32 && this.props.game.keyReleased === true) {
      this.onKeyUp({ keyCode: this.props.game.keyPressed })
    }
    if (prevProps.game.hasFired !== this.props.game.hasFired) {
      this.props.switchFired(this.props.game.id)

        this.fireProjectile(this.props.x, this.props.y, this.props.game.force, this.props.game.degrees)
    }
  }

  render() {
    return (
      <Group>
        <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="rgba(0,0,0,0.0)" />
        {this.props.local && <Text x={10} y={10} text={"Force: " + this.state.force} />}
        {this.props.local && <Text x={10} y={20} text={"Degrees: " + this.state.degrees} />}
        
        <Tank x={this.props.x} y={this.props.y} degrees={this.state.degrees} color={this.props.color} />
        {this.state.trajectorys.map((line, i) => <Line key={i} points={line} stroke={this.props.color} strokeWidth={1} opacity={.5} />)}
        {this.state.explosions.map((explosion, i) => {
          return <Circle {...explosion} />
        })
        }
      </Group>       
    )
  }
}

const mapStateToProps = (state, props) => ({
})

const mapDispatchToProps = {
  hasPressed, hasReleased, hasFired, switchFired, hasHit
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerFG)