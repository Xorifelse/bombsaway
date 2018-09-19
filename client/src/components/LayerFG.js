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
  ROTATION_SPEED,
  TANK_SIZE,
  TANK_BARREL_SIZE,
  TANK_BARREL_WIDTH,
  polarProjectionX,
  polarProjectionY,
  calcDegrees
} from '../lib/constants'


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
    keysCycle: [],
    keys: [],
    force: 0,
    degrees: 0
  }


  updateProjectile(){

  }

  fireProjectile(x, y, force, degrees){
    var projectileX = x + polarProjectionX(x, TANK_BARREL_SIZE, degrees)
    var projectileY = y + polarProjectionY(y, TANK_BARREL_SIZE, degrees)
    var xVel = force/2;
    var yVel = -force/2;
    var g = 1;

    let line = [x,y]

    this.setState({
      trajectorys: [...this.state.trajectorys, line ]
    }, function (){
      let trajectorys = this.state.trajectorys
      let index = this.state.trajectorys.length - 1
      let line = this.state.trajectorys[index]

      let update = setInterval(() => {
        x += xVel
        y += yVel
        yVel += g
        projectileX = x
        projectileY = y

        line.push(projectileX, projectileY)
        trajectorys[index] = line

        this.setState({
          trajectorys: [...trajectorys]
        })

        this.render()

        console.log(projectileX, projectileY)
        
        if (y > CANVAS_HEIGHT || x < 0 || x > CANVAS_WIDTH) {
          clearInterval(update)
        }
      }, 20 )
    }.bind(this))
  }
  
  keysUpdate(keyCode){
    switch(keyCode){
      case 32: // space
        return this.setState({force: this.state.force + 1})
      case 37: // left
        return this.setState({degrees: this.state.degrees - 1 < 0 ? 359 : this.state.degrees - 1})
      case 38: // up
        return this.setState({degrees: calcDegrees(this.state.degrees, 5)})
      case 39: // right
        return this.setState({degrees: this.state.degrees + 1 > 360 ? 1 : this.state.degrees + 1})
      case 40: // down
        return this.setState({degrees: calcDegrees(this.state.degrees, -5)})
    }
  }

  onKeyUp = (e) => {
    let keyCode = Number(e.keyCode)

    KB_CODES.forEach(code => {
      if(code === keyCode){
        if(this.state.keys[keyCode]){
          this.state.keys[keyCode] = false
          clearInterval(this.state.keysCycle[keyCode])

          // Fire event
          if(keyCode === 32){
            console.log(`Fire with force of ${this.state.force}`)
            this.fireProjectile(500, 500,this.state.force, this.state.degrees)
            this.setState({force: 0})
          }
        }
      }
    })
  }

  onKeyDown = (e) => {
    let keyCode = Number(e.keyCode)

    KB_CODES.forEach(code => {
      if(code === keyCode){
        if(!this.state.keys[keyCode]){
          // create timer for keycode that stops on key released
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
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)

    // Add keys to state, no update
    KB_CODES.map(code => this.state.keys[code] = false)

    // Get player pos from socket

  }

  render() {
    return (
      <Group>
        <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="rgba(0,0,0,0.0)" />
        <Text x={10} y={10} text={"Force: " + this.state.force} />
        <Text x={10} y={20} text={"Degrees: " + this.state.degrees} />
        <Tank x={500} y={500} degrees={this.state.degrees} color="#fff" />
        {
          this.state.trajectorys.map(line => {
            return <Line points={line} stroke="red" strokeWidth={1} opacity={.5} />
          })
        }
      </Group>       
    )
  }
}

export default connect((store) => ({store}), {})(LayerFG)