import React, { Component, PropTypes } from 'react';
 
function getClockTime(now){
   var hour   = now.getHours();
   var minute = now.getMinutes();
   var ap = "AM";
   if (hour   > 11) { ap = "PM";             }
   if (hour   > 12) { hour = hour - 12;      }
   if (hour   == 0) { hour = 12;             }
   if (minute < 10) { minute = "0" + minute; }
   var timeString = hour + ':' + minute + " " + ap;
   return timeString;
}

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
					{getClockTime(this.props.date)}
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
