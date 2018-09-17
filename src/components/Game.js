import * as React from 'react'
import {connect} from 'react-redux'
import { Stage, Layer } from 'react-konva';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH
} from '../lib/canvas'

import LayerBG from './LayerBG';
import LayerFG from './LayerFG';
import LayerTerrain from './LayerTerrain';

class Game extends React.PureComponent {

  render() {
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

export default connect((store) => ({store}), {})(Game)