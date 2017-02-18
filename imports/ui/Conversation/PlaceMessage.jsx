import React, { Component, PropTypes } from 'react';
import { Map, TileLayer, CircleMarker, Circle } from 'react-leaflet';


export default class PlaceMessage extends Component {
	render() {
		var center = this.props.content.center;
		var size = this.props.content.size;

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
