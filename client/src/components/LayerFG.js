import * as React from 'react'
import {connect} from 'react-redux'
import {Rect} from 'react-konva'

import {
  Group,
  Text
} from 'react-konva';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH
} from '../lib/canvas'

const KB_CODES = [
  // defines what keyboard codes to listen to

  32, // space
  37, // left
  38, // up
  39, // right
  40, // down
]

class LayerFG extends React.PureComponent {
  state = {
    keysCycle: [],
    keys: [],
    force: 0

  }

  
  keysUpdate(keyCode){
    switch(keyCode){
      case 32: // space
        this.setState({
          force: this.state.force + 1
        })
        break
      case 37: // left
        console.log('left is hold')
        break
      case 38: // up
        console.log('up is hold')
        break
      case 39: // right
        console.log('right is hold')
        break
      case 40: // down
        console.log('down is hold')
        break
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
          console.log('create timer')
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
      </Group> 
      
    )
  }
}

export default connect((store) => ({store}), {})(LayerFG)