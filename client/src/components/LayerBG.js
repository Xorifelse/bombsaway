import * as React from 'react'
import {connect} from 'react-redux'
import {Rect, Group, Star} from 'react-konva';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH
} from '../lib/canvas'

import {
  polarProjectionX,
  polarProjectionY,
  calcDegrees
} from '../lib/constants'

class LayerBG extends React.PureComponent {
  state = {
    centerX : (CANVAS_WIDTH) / 2,
    centerY : (CANVAS_HEIGHT + 300) / 2,
    offsetX : 700,
    offsetY : 400,
    timer : null,
    degrees : 360,
    backgroundColor: {r:135, g: 206, b: 250}
  }



  componentDidMount() {
    this.setState({
      timer: setInterval(() => {
        const newBgColor = {...this.state.backgroundColor}
        // newBgColor.r = (newBgColor.r / 100)-1*newBgColor.r
        // newBgColor.g = (newBgColor.g / 100)-1*newBgColor.g
        // newBgColor.b = (newBgColor.b / 100)-1*newBgColor.b
        this.setState({
          degrees: calcDegrees(this.state.degrees, 1),
          backgroundColor: newBgColor
        })
      }, 100)
    })
  }

  componentWillUnmount() {
    clearInterval(this.state.timer)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.winner !== prevProps.winner && this.props.winner !== null) {
      clearInterval(this.state.timer)
    }
  }

  render() {
    const bgColor = `rgb(${this.state.backgroundColor.r}, ${this.state.backgroundColor.g},${this.state.backgroundColor.b})`
    return (
      <Group>
        <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={bgColor} />
        <Star x={polarProjectionX(this.state.centerX, this.state.offsetX, this.state.degrees)} y={polarProjectionY(this.state.centerY, this.state.offsetY, this.state.degrees)} numPoints={15} innerRadius={70} outerRadius={70} fill="yellow" stroke="white" />
        <Star x={polarProjectionX(this.state.centerX, this.state.offsetX, calcDegrees(this.state.degrees, 180))} y={polarProjectionY(this.state.centerY, this.state.offsetY, calcDegrees(this.state.degrees, 180))} numPoints={15} innerRadius={70} outerRadius={70} fill="white" stroke="white" />
      </Group>
    )
  }
}

export default connect((store) => ({store}), {})(LayerBG)