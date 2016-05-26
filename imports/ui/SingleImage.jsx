import React, { Component, PropTypes } from 'react';

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

export default class SingleImage extends Component {
  constructor(props) {
      super(props);
  }

  componentDidMount() {
    if ("topOffset" in this.props) {
      offset = this.props.topOffset - 100;
      $("html, body").animate({scrollTop: offset}, 500, "swing");
    }
  }

  render() {
    let offset=0;

    if ("topOffset" in this.props) {
      offset = this.props.topOffset - 100;
    }
// 
    return (
			<div className="highlightedImage">
        <div className="offset" style={{height: offset}}>
        </div>
        <div className="bigImage">
          <ReactCSSTransitionGroup transitionName="fade" transitionAppear={true} transitionEnterTimeout={2000} transitionLeaveTimeout={2000}>
            <img key={this.props.photo._id + "_img"} src={"http://localhost:3022/" + this.props.photo.resized_uris["1280"]} />
          </ReactCSSTransitionGroup>
        </div> 
      </div>);       
  }
}
 
SingleImage.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.object.isRequired,
  topOffset: PropTypes.number.isOptional,
  photos: PropTypes.array.isRequired,
};