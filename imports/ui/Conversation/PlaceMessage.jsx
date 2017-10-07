import React, { Component, PropTypes } from 'react';
import { Map, TileLayer, CircleMarker, Circle } from 'react-leaflet';
import ClusterMap from '../ClusterMap.jsx';

export default class PlaceMessage extends Component {
	render() {
		var center = this.props.content.center.slice(0);
		center[0] = this.props.content.center[1];
		center[1] = this.props.content.center[0];

		console.log(this.props.content);
		var size = this.props.content.size;
		console.log(size);

		// set map bounds based on size of circle (meters -> degrees conversion)
		var bounds = [[center[0] - 2*(size/111111), center[1] - 2*(size/(Math.cos(center[0]*2*Math.PI/360)*111111))], 
		              [center[0] + 2*(size/111111), center[1] + 2*(size/(Math.cos(center[0]*2*Math.PI/360)*111111))]];

		console.log(bounds);
		return <div className={"conversation " + this.props.idTag}>
	        <ClusterMap cluster={this.props.cluster} photos={this.props.photos} bounds={bounds} additionalMarker={<Circle center={center} radius={size} />}/>
		</div>
	}
}

PlaceMessage.propTypes = {
	content: PropTypes.object.isRequired,
	idTag: PropTypes.string.isRequired,
	cluster: PropTypes.object.isRequired
};
