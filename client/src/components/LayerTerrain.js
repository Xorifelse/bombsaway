import * as React from 'react'
import {connect} from 'react-redux'
import { Line} from 'react-konva';

import {getLineCoords} from '../lib/canvas'

import {
  TERRAIN_GRASS_COLOR,
  TERRAIN_DIRT_COLOR,
  TERRAIN_GRASS_WIDTH
} from '../lib/constants'

class LayerTerrain extends React.PureComponent {
  state = {
    points: []
  }

  componentDidMount(){
    this.setState({
      points: getLineCoords(this.props.game.settings.canvasWidth, this.props.game.settings.canvasHeight, this.props.game.settings.heightMap)
    })
  }

  render() {
    return <Line points={this.state.points} stroke={TERRAIN_GRASS_COLOR} fill={TERRAIN_DIRT_COLOR} closed={true} tension={0.5} strokeWidth={TERRAIN_GRASS_WIDTH} />
  }
}

const mapStateToProps = (state, props) => ({
  
})

export default connect(mapStateToProps, {})(LayerTerrain)