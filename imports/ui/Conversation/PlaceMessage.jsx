import React, { Component, PropTypes } from 'react';
import { Map, TileLayer, CircleMarker, Circle } from 'react-leaflet';


export default class PlaceMessage extends Component {
	render() {
		console.log(this.props.content.center);
		var rev_center = this.props.content.center;
		var center = rev_center.slice(0);
		center[0] = rev_center[1];
		center[1] = rev_center[0];

		var size = this.props.content.size;

		console.log(center);
		console.log(rev_center);

		// set map bounds based on size of circle (meters -> degrees conversion)
		var bounds = [[center[0] - 2*(size/111111), center[1] - 2*(size/(Math.cos(center[0]*2*Math.PI/360)*111111))], 
		              [center[0] + 2*(size/111111), center[1] + 2*(size/(Math.cos(center[0]*2*Math.PI/360)*111111))]];

		return <div className={"conversation " + this.props.idTag}>
			<Map bounds={bounds} >
	            <TileLayer
	              url = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
	              subdomains='abcd'
	            />
	            <Circle center={center} radius={size} />
	        </Map>
		</div>
	}
}

PlaceMessage.propTypes = {
	content: PropTypes.object.isRequired,
	idTag: PropTypes.string.isRequired
};
