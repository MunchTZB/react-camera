import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { FRONT_MODE } from './constants'

export default class ReactCamera extends Component {
  constructor(props) {
    super(props)
    this.state = {
      height: props.height || window.innerHeight,
      width: props.width || window.innerWidth
    }
  }

  componentDidMount() {
    this.setCameraStream()
    window.addEventListener('resize', () => {
      this.setState({
        height: this.props.height || window.innerHeight,
        width: this.props.width || window.innerWidth
      })
    })
  }

  setCameraStream = () => {
    window.navigator.mediaDevices.getUserMedia(Object.assign(FRONT_MODE, {
      height: this.state.height,
      width: this.state.width
    })).then(mediaStream => {
      this.video.srcObject = mediaStream
      this.video.play()
    }).catch(err => {
      if (err.code === 0) {
        console.log(`User Don't allow to use camera`)
      }
    })
  }

  paintToCanvas = () => {
    if (this.video.paused || this.video.ended) {
      return
    }
    // const width = this.video.videoWidth || 1
    // const height = this.video.videoHeight || 1
    const width = this.state.width || 1
    const height = this.state.width / (this.video.videoWidth / this.video.videoHeight) || 1

    this.canvas.drawImage(this.video, 0, 0, this.video.videoWidth, this.videoHeight, 0, 0, width, height)
    this.canvas.drawImage(this.video, 0, 0, width, height)
    let frame = this.canvas.getImageData(0, 0, width, height)
    let l = frame.data.length / 4
    for (let i = 0; i < l; i++) {
      let r = frame.data[i * 4 + 0]
      let g = frame.data[i * 4 + 1]
      let b = frame.data[i * 4 + 2]
      let gray = r * 0.299 + g * 0.587 + b * 0.114
      frame.data[i * 4 + 0] = 0
      frame.data[i * 4 + 1] = 0
      frame.data[i * 4 + 2] = 0
      frame.data[i * 4 + 3] = 255 - gray
    }
    this.canvas.putImageData(frame, 0, 0)
    window.requestAnimationFrame(this.paintToCanvas)
  }

  render() {
    return (
      <Fragment>
        <video
          style={{
            display: 'none'
          }}
          height={this.state.height}
          width={this.state.width}
          playsInline
          controls
          onPlay={this.paintToCanvas}
          ref={ref => (this.video = ref)} />
        <canvas
          height={this.state.height}
          width={this.state.width}
          ref={ref => (this.canvas = ref && ref.getContext('2d'))} />
      </Fragment>
    )
  }
}

ReactCamera.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number
}
