import {MapLayer} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

export default class LeafletRouter extends MapLayer {
  componentWillMount() {
    super.componentWillMount();
    const {map, from, to, profile, color, opacity} = this.props;

    var router = L.Routing.mapbox(Meteor.settings.public.mapbox, 
        {profile: profile,
         routingOptions: {
          alternatives: false,
          steps: true }
      });

    var waypoints = [
      {latLng: L.latLng(from[0], from[1])},
      {latLng: L.latLng(to[0], to[1])}];

    // find the route and then add the new line to the map.
    router.route (waypoints,
        function(err, routes) {
          // remove the placeholder element
          if (this.leafletElement) {
              map.removeLayer(this.leafletElement);
          }

          if (err) {
              alert(err);
          } else { 
              this.leafletElement = new L.Routing.line(routes[0],{
                addWaypoints: false, 
                // styles: [{color: color, opacity: opacity, weight: 5}, {color: 'white', opacity: opacity, weight: 1}],
                // missingRouteStyles: [{color: color, opacity: opacity, weight: 6}, {color: 'white', opacity: opacity, weight: 1}]

                styles: [{color: 'black', opacity:opacity, weight: 7}, {color: color, opacity: opacity, weight: 5}, {color: 'white', opacity: opacity, weight: 1}],
                missingRouteStyles: [{color: 'black', opacity: opacity, weight: 7}, {color: color, opacity: opacity, weight: 6}, {color: 'white', opacity: opacity, weight: 1}]
              }).addTo(map);
        }
    }.bind(this));

    // placeholder route line
    this.leafletElement = new L.Polyline([from, to], {color: color, opacity: opacity, weight: 5}).addTo(map);
  }

  render() {
    return null;
  }
}