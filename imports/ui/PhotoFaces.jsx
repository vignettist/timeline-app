import React, { Component, PropTypes } from 'react';

export default class PhotoFaces extends Component {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
        }
    }

	expandThisDuplicate() {
        this.setState({
            expanded: !this.state.expanded,
        })	}

  selectFace(img, facen) {
    console.log('routing to select image');
  }

  render() {
    let duplicateBlockClass = this.state.expanded ? "duplicateBlock expanded" : "duplicateBlock";

    var selectImage = this.selectImage;

    var displayDuplicates = false;

    var img = this.props.photo;

    if ("displayDuplicates" in this.props) {
      displayDuplicates = this.props.displayDuplicates;
    }

    let faces = this.props.photo.openfaces;
    let faceboxes = [];

    if (faces.length > 0) {
      faceboxes = faces.map(function(face, facen) {
        console.log(face);
        console.log(facen)

        // hacky hardcoded scale factors
        var style = {
          width: face.rect[2] * 0.3125,
          height: face.rect[3] * 0.3125,
          left: face.rect[0] * 0.3125,
          top: face.rect[1] * 0.3125
        };

        return <div className="highlightBox" style={style} onClick={() => FlowRouter.go('/image/' + img._id._str + '/face/' + facen, {})}></div>;
      });
    }

    return (
      <div className={duplicateBlockClass}>
	      <div className="timelinePhoto">
          <button key={this.props.photo._id + "_button"}>
            <img id={this.props.photo._id + "_img_id" + (this.props.size === "160" ? "_tiny" : "")} key={this.props.photo._id + "_img"} src={"http://localhost:3022/" + this.props.photo.resized_uris[this.props.size]} />
          </button>
        </div>
        {faceboxes}
      </div>
    );
  }
}
 
PhotoFaces.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.array.isRequired,
  size: PropTypes.string.isRequired,
  displayDuplicates: PropTypes.bool.isOptional
};
