import * as React from 'react'
import {connect} from 'react-redux'
import {Rect} from 'react-konva';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH
} from '../lib/canvas'

class LayerFG extends React.PureComponent {

  render() {
    return <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="rgba(0,0,0,0.0)" />
  }
}

export default connect((store) => ({store}), {})(LayerFG)