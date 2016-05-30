import React, { Component, PropTypes } from 'react';

export default class Photo extends Component {
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

    selectImage(img) {
      console.log('routing to select image');
      positionOffset = $("#" + img._id._str + "_img_id").offset();

      FlowRouter.go('/image/' + img._id._str, {}, {top: positionOffset.top});
    }

    render() {
        let duplicateBlockClass = this.state.expanded ? "duplicateBlock expanded" : "duplicateBlock";

        var selectImage = this.selectImage;

        return (
            <div className={duplicateBlockClass}>
    			  <div className="timelinePhoto">
                  {this.props.photos.map(function(img) {
                    return(
                      <button key={img._id + "_button"} onClick={() => this.selectImage(img)}>
                        <img id={img._id + "_img_id"} key={img._id + "_img"} src={"http://localhost:3022/" + img.resized_uris["640"]} />
                      </button>);
                  }, this)}
                </div>

                {(this.props.photos.length > 1) ? <button className="revealDuplicates" onClick={this.expandThisDuplicate.bind(this)}>
                  </button> : ''}
            </div>
    );
  }
}
 
Photo.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photos: PropTypes.array.isRequired,
};
