import * as React from 'react'
import {connect} from 'react-redux'
import { Line} from 'react-konva';

import {getLineCoords} from '../lib/canvas'

class LayerTerrain extends React.PureComponent {
  state = {
    points: []
  }

  componentDidMount(){
    this.setState({
      points: getLineCoords()
    })
  }

  render() {
    return <Line ref={node => this.node = node} points={this.state.points} stroke="#567d46" fill="#402905" closed={true} tension={0.5} strokeWidth={10} />
  }
}

export default connect((store) => ({store}), {})(LayerTerrain)