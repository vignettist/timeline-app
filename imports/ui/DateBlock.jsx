import React, { Component, PropTypes } from 'react';

export default class DateBlock extends Component {
	render() {
		return <div className="weekday" key={this.props.date.format("dddd-MMM-D-YYYY")}>
			<div className="label">
			<div className="day-of-week">{this.props.date.format("dddd")}</div>
			<div className="day-of-month">{this.props.date.format("MMM D")}</div>
			<div className="year">{this.props.date.format("YYYY")}</div>
			</div>
			</div>
	}
}

DateBlock.propTypes = {
  date: PropTypes.object.isRequired
};