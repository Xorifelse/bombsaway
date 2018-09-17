import * as React from 'react'
import {connect} from 'react-redux'
import {Rect} from 'react-konva';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH
} from '../lib/canvas'

class LayerFG extends React.PureComponent {

  onKeyDown(e){
    switch(Number(e.keyCode)){
      case 38: console.log('up'); break
      case 40: console.log('down'); break
      case 37: console.log('left'); break
      case 39: console.log('right'); break

      default:
        console.log(e.keyName)
        return null 
    }
  }

  componentWillUnmount(){
    window.removeEventListener('keydown', this.onKeyDown)
  }

  componentDidMount(){  
    window.addEventListener('keydown', this.onKeyDown)

    // Get player pos from socket

  }

  render() {
    return <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="rgba(0,0,0,0.0)" />
  }
}

export default connect((store) => ({store}), {})(LayerFG)