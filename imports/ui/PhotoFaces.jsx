import React, { Component, PropTypes } from 'react';

export default class PhotoFaces extends Component {
    constructor(props) {
        super(props);

        this.state = {
            scale: 0.5,
        }
    }

  getHeight(element) {
    // something bad has happened where the size values in the database no longer reflect the true, rotated height/width
    if (element) {
      var rendered_height = element.clientHeight;
      if (this.state.scale != rendered_height/960) {
        this.setState({scale: rendered_height/960});
      }
    }
  }

  render() {

    var img = this.props.photo;

    let faces = this.props.photo.openfaces;
    let faceboxes = [];

    if (faces.length > 0) {
      faceboxes = faces.map(function(face, facen) {

        // hacky hardcoded scale factors
        var style = {
          width: face.rect[2] * this.state.scale,
          height: face.rect[3] * this.state.scale,
          left: face.rect[0] * this.state.scale,
          top: face.rect[1] * this.state.scale
        };

        return <div className="highlightBox" style={style} onClick={() => FlowRouter.go('/image/' + img._id._str + '/face/' + facen, {})}></div>;
      }, this);
    }

    return (
      <div className="face-photo">
        <img ref={this.getHeight.bind(this)} id={this.props.photo._id + "_img_id" + (this.props.size === "160" ? "_tiny" : "")} key={this.props.photo._id + "_img"} src={"http://localhost:3022/" + this.props.photo.resized_uris[this.props.size]} />
        {faceboxes}
      </div>
    );
  }
}
 
PhotoFaces.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.object.isRequired,
  size: PropTypes.string.isRequired
};
