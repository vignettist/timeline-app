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

    render() {
        let duplicateBlockClass = this.state.expanded ? "duplicateBlock expanded" : "duplicateBlock";

        return (
            <div className={duplicateBlockClass}>
    			<div className="timelinePhoto">
                  {this.props.photos.map(function(img) {
                    return(<img src={"http://localhost:3022/" + img.filename} />)
                  })}
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
