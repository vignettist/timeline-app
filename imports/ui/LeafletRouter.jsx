import {MapLayer} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

export default class LeafletRouter extends MapLayer {
  componentWillMount() {
    super.componentWillMount();
    const {map, from, to, profile, color} = this.props;

    this.leafletElement = L.Routing.control({
      position: 'topleft',

      waypoints: [
        L.latLng(from[0], from[1]),
        L.latLng(to[0], to[1]),
      ],

      plan: new L.Routing.Plan([L.latLng(from[0], from[1]),L.latLng(to[0], to[1])],
         {addWaypoints: false, 
          draggableWaypoints: false,
          createMarker: function(i, wp) {}}),

      lineOptions: {
        addWaypoints: false, 
        styles: [{color: 'black', opacity:1.0, weight: 7}, {color: color, opacity: 1.0, weight: 5}, {color: 'white', opacity: 1.0, weight: 1}],
        missingRouteStyles: [{color: 'black', opacity: 1.0, weight: 7}, {color: color, opacity: 1.0, weight: 6}, {color: 'white', opacity: 1.0, weight: 1}]
      },

      router: (new L.Routing.Mapbox(Meteor.settings.public.mapbox, 
        {profile: profile})),

      fitSelectedRoutes: false
    }).addTo(map);
    //
  }

  render() {
    return null;
  }
}