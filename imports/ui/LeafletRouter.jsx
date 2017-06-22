import {MapLayer} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

export default class LeafletRouter extends MapLayer {
  componentWillMount() {
    super.componentWillMount();
    const {map, from, to, profile, color, opacity} = this.props;
    console.log(Meteor.settings.public.mapbox);

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
        // styles: [{color: color, opacity: opacity, weight: 5}, {color: 'white', opacity: opacity, weight: 1}],
        // missingRouteStyles: [{color: color, opacity: opacity, weight: 6}, {color: 'white', opacity: opacity, weight: 1}]

        styles: [{color: 'black', opacity:opacity, weight: 7}, {color: color, opacity: opacity, weight: 5}, {color: 'white', opacity: opacity, weight: 1}],
        missingRouteStyles: [{color: 'black', opacity: opacity, weight: 7}, {color: color, opacity: opacity, weight: 6}, {color: 'white', opacity: opacity, weight: 1}]
      },

      router: (L.Routing.mapbox(Meteor.settings.public.mapbox, 
        {profile: profile,
         requestParameters: {
          alternatives: false,
          steps: true }
      })),

      fitSelectedRoutes: false
    }).addTo(map);
    //
  }

  render() {
    return null;
  }
}