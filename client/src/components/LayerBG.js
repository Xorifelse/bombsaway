import * as React from 'react'
import {connect} from 'react-redux'
import {Rect, Group, Star} from 'react-konva';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH
} from '../lib/canvas'

class LayerBG extends React.PureComponent {

  render() {
    return (
      <Group>
        <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#87CEFA" />
        <Star x={100} y={100} numPoints={15} innerRadius={70} outerRadius={70} fill="yellow" stroke="white" />
      </Group>
    )
  }
}

export default connect((store) => ({store}), {})(LayerBG)