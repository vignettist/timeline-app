import React, { Component, PropTypes } from 'react';

// Task component - represents a single todo item
export default class Spacer extends Component {
  render() {
  	spacerStyle = {
  		height: this.props.height + "px"
  	}

  	if (this.props.height < 50) {
	  	return (
	      <div className="spacer" style={spacerStyle}>
	      </div>
	    );
  	} else {
  		return (
			<div className="spacer" style={spacerStyle}>
				<div className="spacerText">
					{this.props.date.format("h:mm A")}
				</div>
	     	</div>
	     );
  	}

    
  }
}
 
Spacer.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  height: PropTypes.number.isRequired,
  date: PropTypes.object.isRequired,
};
