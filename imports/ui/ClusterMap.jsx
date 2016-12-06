import React, { Component, PropTypes } from 'react';
import { Map, Marker, Polyline, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import LeafletRouter from './LeafletRouter.jsx';
import L from 'leaflet';

export default class ClusterMap extends Component {
  constructor(props) {
      super(props);
  }

  componentDidMount() {
  }

  render() {
    Array.prototype.sum = function() {
      return this.reduce(function(a,b){return a+b;});
    };

    Array.prototype.max = function() {
      return this.reduce(function(a,b){if (a > b) { return a; } else { return b; }});
    };

    Array.prototype.min = function() {
      return this.reduce(function(a,b){if (a < b) { return a; } else { return b; }});
    };

    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    // var colormap = [[10, 2, 53], [11, 2, 53], [12, 2, 53], [12, 2, 54], [13, 2, 54], [14, 2, 55], [15, 2, 55], [16, 2, 55], [17, 2, 56], [18, 2, 56], [19, 2, 57], [20, 2, 57], [22, 2, 58], [23, 1, 58], [24, 1, 59], [26, 1, 59], [27, 1, 60], [28, 1, 60], [30, 1, 61], [31, 1, 62], [33, 1, 62], [34, 1, 63], [36, 1, 63], [37, 1, 64], [39, 1, 65], [40, 1, 65], [42, 1, 66], [43, 1, 67], [45, 1, 67], [46, 1, 68], [48, 1, 68], [49, 1, 69], [51, 1, 70], [52, 1, 70], [54, 0, 71], [55, 1, 71], [57, 1, 72], [58, 0, 73], [59, 0, 73], [61, 0, 74], [64, 0, 75], [67, 0, 77], [70, 0, 77], [72, 0, 78], [74, 0, 79], [76, 0, 80], [80, 0, 84], [86, 0, 90], [93, 0, 98], [101, 0, 106], [109, 0, 114], [118, 0, 124], [128, 0, 134], [137, 0, 143], [146, 0, 153], [156, 0, 162], [164, 0, 171], [172, 0, 179], [179, 0, 186], [185, 0, 193], [189, 0, 197], [187, 2, 198], [182, 5, 199], [176, 8, 201], [170, 11, 203], [163, 15, 205], [156, 19, 207], [148, 24, 210], [140, 28, 212], [131, 33, 214], [122, 38, 217], [114, 43, 220], [105, 48, 222], [95, 54, 225], [86, 59, 228], [78, 64, 231], [68, 69, 233], [59, 74, 236], [50, 79, 239], [44, 84, 241], [41, 87, 242], [38, 91, 243], [35, 94, 245], [33, 98, 246], [31, 101, 247], [30, 105, 248], [29, 109, 249], [28, 112, 251], [28, 115, 251], [28, 118, 252], [29, 121, 253], [30, 124, 254], [32, 126, 254], [36, 128, 254], [39, 130, 254], [43, 132, 254], [46, 134, 254], [50, 136, 254], [53, 138, 254], [56, 140, 254], [60, 142, 254], [64, 144, 254], [67, 146, 254], [71, 148, 254], [74, 150, 254], [78, 152, 254], [81, 154, 254], [85, 156, 254], [88, 158, 254], [92, 160, 254], [95, 162, 254], [98, 164, 254], [102, 166, 254], [104, 168, 254], [107, 169, 254], [111, 171, 254], [114, 173, 254], [116, 174, 254], [118, 176, 254], [121, 177, 254], [124, 179, 254], [126, 180, 254], [128, 181, 253], [129, 182, 255], [130, 183, 255], [131, 184, 255], [131, 183, 255], [129, 182, 255], [127, 181, 255], [126, 180, 254], [124, 179, 254], [122, 177, 254], [119, 176, 254], [117, 174, 254], [114, 173, 254], [111, 172, 254], [108, 170, 254], [105, 168, 254], [102, 166, 254], [99, 164, 254], [96, 162, 254], [92, 160, 254], [89, 159, 254], [85, 157, 254], [82, 155, 254], [79, 153, 254], [75, 151, 254], [71, 149, 254], [68, 146, 254], [65, 144, 254], [61, 142, 254], [57, 140, 254], [54, 138, 254], [50, 137, 254], [47, 134, 254], [43, 132, 254], [40, 130, 254], [37, 128, 254], [33, 126, 254], [30, 125, 254], [28, 123, 254], [24, 121, 254], [21, 120, 254], [19, 118, 254], [16, 116, 254], [11, 114, 254], [7, 112, 254], [4, 110, 254], [1, 108, 255], [4, 108, 250], [15, 110, 239], [29, 112, 225], [45, 114, 209], [64, 116, 191], [82, 119, 172], [102, 122, 152], [124, 125, 130], [145, 128, 110], [165, 131, 90], [185, 134, 70], [204, 137, 51], [220, 139, 35], [235, 141, 20], [248, 143, 7], [255, 144, 0], [255, 144, 0], [255, 144, 0], [255, 144, 0], [255, 143, 0], [251, 135, 0], [245, 124, 0], [239, 111, 0], [233, 98, 0], [226, 83, 0], [218, 67, 0], [211, 53, 0], [205, 39, 0], [198, 25, 0], [192, 13, 0], [188, 4, 0], [185, 0, 0], [180, 0, 0], [175, 0, 0], [168, 0, 0], [161, 0, 0], [153, 0, 0], [145, 0, 0], [136, 0, 0], [127, 0, 0], [119, 0, 0], [111, 0, 0], [103, 0, 0], [96, 0, 0], [90, 0, 0], [85, 0, 0], [80, 0, 1], [77, 0, 3], [75, 0, 5], [74, 0, 6], [72, 0, 7], [71, 0, 8], [69, 0, 9], [68, 0, 10], [66, 0, 11], [64, 0, 13], [63, 0, 14], [61, 0, 15], [59, 0, 17], [57, 0, 18], [55, 0, 19], [53, 0, 21], [51, 0, 22], [49, 0, 24], [47, 0, 25], [45, 0, 27], [43, 0, 28], [41, 0, 30], [40, 0, 31], [38, 0, 33], [35, 0, 34], [34, 0, 36], [32, 0, 37], [30, 0, 38], [28, 0, 40], [26, 0, 41], [25, 0, 43], [23, 0, 44], [21, 0, 45], [19, 0, 46], [18, 0, 47], [16, 0, 49], [15, 0, 50], [13, 0, 51], [12, 0, 52], [11, 0, 53], [10, 0, 53]];
    var colormap = [[59, 48, 102],[37, 23, 85],[38, 23, 86],[39, 23, 87],[40, 23, 88],[42, 23, 90],[43, 23, 92],[44, 23, 93],[46, 23, 95],[47, 23, 96],[49, 23, 98],[50, 23, 100],[52, 23, 102],[54, 23, 104],[56, 23, 106],[57, 23, 108],[59, 23, 110],[61, 23, 112],[63, 23, 114],[66, 23, 116],[68, 23, 118],[70, 23, 120],[73, 23, 122],[75, 23, 124],[77, 23, 126],[80, 23, 128],[83, 23, 129],[86, 24, 131],[89, 26, 133],[92, 28, 134],[95, 30, 135],[99, 33, 137],[103, 36, 139],[108, 40, 140],[113, 44, 141],[118, 48, 142],[124, 52, 143],[130, 58, 144],[135, 63, 145],[141, 68, 146],[148, 73, 147],[154, 79, 148],[160, 84, 149],[166, 90, 150],[171, 96, 151],[177, 102, 152],[183, 107, 153],[189, 113, 154],[194, 118, 155],[199, 124, 156],[204, 129, 158],[208, 134, 159],[211, 139, 161],[215, 144, 162],[218, 148, 164],[220, 152, 166],[221, 156, 168],[221, 161, 171],[221, 166, 175],[221, 170, 179],[221, 174, 183],[220, 178, 187],[218, 182, 192],[214, 185, 197],[211, 189, 201],[207, 192, 206],[204, 195, 211],[200, 198, 215],[197, 201, 220],[193, 203, 224],[190, 206, 228],[187, 208, 232],[184, 211, 236],[183, 213, 239],[182, 215, 242],[182, 217, 243],[182, 217, 244],[182, 218, 244],[182, 219, 245],[182, 220, 246],[182, 220, 247],[182, 221, 247],[183, 222, 248],[183, 222, 248],[184, 223, 249],[184, 224, 249],[185, 224, 250],[186, 225, 250],[186, 225, 251],[187, 226, 251],[188, 226, 252],[188, 227, 252],[189, 227, 252],[190, 228, 252],[191, 228, 253],[191, 229, 253],[192, 229, 253],[193, 230, 253],[194, 230, 253],[195, 230, 254],[196, 231, 253],[197, 231, 253],[197, 231, 254],[198, 232, 254],[199, 232, 254],[200, 232, 254],[201, 232, 254],[201, 233, 254],[202, 233, 254],[203, 233, 254],[204, 234, 254],[204, 233, 254],[205, 234, 254],[205, 234, 254],[206, 234, 254],[207, 234, 254],[207, 234, 254],[207, 234, 255],[207, 235, 254],[208, 234, 254],[208, 234, 254],[208, 234, 255],[208, 235, 255],[208, 235, 255],[208, 235, 255],[208, 235, 255],[208, 235, 255],[207, 235, 255],[207, 234, 255],[206, 234, 255],[205, 235, 255],[204, 234, 255],[203, 234, 255],[202, 234, 255],[201, 234, 255],[199, 233, 255],[198, 233, 255],[197, 233, 255],[195, 232, 255],[194, 232, 255],[192, 232, 255],[191, 232, 255],[189, 231, 255],[187, 231, 255],[186, 231, 255],[184, 230, 255],[183, 229, 255],[181, 229, 255],[179, 229, 255],[178, 228, 255],[176, 228, 255],[175, 227, 255],[173, 226, 255],[172, 226, 255],[171, 225, 255],[169, 225, 255],[168, 224, 255],[167, 223, 255],[166, 223, 255],[165, 222, 255],[165, 221, 255],[164, 221, 255],[163, 220, 255],[163, 219, 255],[163, 219, 255],[163, 218, 255],[163, 218, 255],[163, 217, 255],[163, 216, 255],[164, 215, 252],[166, 213, 248],[169, 212, 243],[172, 210, 237],[176, 209, 232],[180, 207, 226],[185, 205, 219],[190, 204, 212],[195, 202, 205],[200, 200, 198],[205, 199, 191],[210, 197, 183],[216, 195, 176],[220, 192, 168],[225, 190, 161],[230, 188, 153],[234, 186, 147],[238, 184, 140],[241, 181, 133],[243, 179, 127],[245, 176, 122],[246, 174, 117],[246, 171, 112],[245, 167, 107],[243, 163, 103],[240, 159, 99],[236, 155, 95],[231, 151, 92],[225, 146, 89],[219, 141, 86],[212, 137, 84],[205, 132, 82],[198, 127, 81],[190, 122, 79],[182, 117, 77],[175, 112, 76],[167, 107, 74],[160, 102, 73],[153, 97, 71],[147, 92, 70],[142, 87, 68],[137, 83, 66],[132, 78, 64],[127, 73, 62],[122, 68, 59],[117, 63, 57],[112, 57, 55],[108, 52, 53],[103, 46, 51],[99, 41, 49],[95, 36, 47],[90, 31, 45],[87, 27, 43],[83, 22, 42],[79, 18, 41],[75, 14, 40],[72, 11, 40],[69, 8, 40],[65, 6, 40],[63, 5, 40],[61, 5, 41],[59, 5, 41],[58, 5, 42],[56, 5, 43],[55, 5, 45],[53, 5, 46],[53, 5, 48],[51, 5, 50],[50, 5, 51],[49, 6, 53],[47, 7, 55],[46, 8, 58],[45, 8, 59],[45, 10, 62],[44, 11, 64],[43, 12, 66],[42, 13, 68],[41, 15, 70],[41, 16, 72],[40, 17, 74],[40, 18, 76],[39, 19, 78],[39, 20, 79],[38, 21, 81],[37, 22, 82],[37, 23, 83],[58, 47, 101]]

    var latitudes = this.props.cluster.locations.coordinates.map(function(l) { return l[1]; })
    var longitudes = this.props.cluster.locations.coordinates.map(function(l) { return l[0]; })

    var center_latitude = latitudes.sum()/this.props.cluster.locations.coordinates.length;
    var center_longitude = longitudes.sum()/this.props.cluster.locations.coordinates.length;

    var reversed_coords = this.props.cluster.locations.coordinates.map(function(l) { return [l[1], l[0]]; });

    // generate list of polylines and router elements
    var cluster_path = [];
    var start_coords = reversed_coords[0];

    for (var i = 1; i < reversed_coords.length; i++) {
      var corrected_start_time = moment(this.props.photos[i].datetime.utc_timestamp).utcOffset(this.props.photos[i].datetime.tz_offset/60);
      var corrected_end_time = moment(this.props.photos[i-1].datetime.utc_timestamp).utcOffset(this.props.photos[i-1].datetime.tz_offset/60);
      var time_value = Math.round(0.5 * ((corrected_start_time.hour() * 60 + corrected_start_time.minute())/1440 * 255) + 0.5 * ((corrected_end_time.hour() * 60 + corrected_end_time.minute())/1440 * 255));

      var color = colormap[time_value];

      color = rgbToHex(color[0], color[1], color[2])

      var distance = Math.sqrt(Math.pow(reversed_coords[i][0] - start_coords[0], 2) + Math.pow(reversed_coords[i][1] - start_coords[1], 2));

      var opacity = Math.min(1.0, Math.pow(0.01/distance, 0.5));

      if (distance > 0.005) {
        if (distance > 0.02) {
          var profile = 'mapbox/driving';
        } else {
          var profile = 'mapbox/walking';
        }

        cluster_path.push(<LeafletRouter from={start_coords} to={reversed_coords[i]} profile={profile} color={color} opacity={opacity}/>);
      } else {
        cluster_path.push(<Polyline positions={[start_coords, reversed_coords[i]]} color='black' opacity={opacity} weight={7} zIndex={1}/>);
        cluster_path.push(<Polyline positions={[start_coords, reversed_coords[i]]} color={color} opacity={opacity} weight={6} zIndex={1} />);
        cluster_path.push(<Polyline positions={[start_coords, reversed_coords[i]]} color='white' opacity={opacity} weight={1} zIndex={1}/>);
      }

      start_coords = reversed_coords[i];
    }

    var image_markers = [];

    var myIcon = L.icon({
      iconUrl: '/icons/image_marker.png',
      iconRetinaUrl: '/icons/image_marker_2x.png',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -6]
    });

    var myIconHighlighted = L.icon({
      iconUrl: '/icons/image_marker_highlighted.png',
      iconRetinaUrl: '/icons/image_marker_highlighted_2x.png',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -6]
    });


    for (var i = 0; i < reversed_coords.length; i++) {

      var popup = [];

      if (this.props.popup) {
        popup = <Popup>
              <span style={{width: "320px"}}><img src={"http://localhost:3022/" + this.props.photos[i].resized_uris["320"]} /></span>
            </Popup>;
      }

      if (("zoomTo" in this.props) && (this.props.zoomTo == i) ) {
        image_markers.push(
          <Marker position={reversed_coords[i]} icon={myIconHighlighted} zIndexOffset={5000}>
            {popup}
          </Marker>);
      } else {
        image_markers.push(<Marker position={reversed_coords[i]} icon={myIcon} zIndexOffset={-5000}>
            {popup}
          </Marker>);
      }

    }

    if (("zoomTo" in this.props) && (this.props.zoomTo >= 0)) {
      var min_latitude = this.props.cluster.locations.coordinates[this.props.zoomTo][1] - 0.004;
      var max_latitude = this.props.cluster.locations.coordinates[this.props.zoomTo][1] + 0.004;
      var min_longitude = this.props.cluster.locations.coordinates[this.props.zoomTo][0] - 0.004;
      var max_longitude = this.props.cluster.locations.coordinates[this.props.zoomTo][0] + 0.004;
    } else {
      var min_latitude = latitudes.min() - (latitudes.max() - latitudes.min()) * 0.05;
      
      if (this.props.offset) {
        var min_longitude = longitudes.min() - (longitudes.max() - longitudes.min()) * 4.00;
      } else {
        var min_longitude = longitudes.min() - (longitudes.max() - longitudes.min()) * 0.05;
      }

      var max_latitude = latitudes.max() + (latitudes.max() - latitudes.min()) * 0.05;
      var max_longitude = longitudes.max() + (longitudes.max() - longitudes.min()) * 0.05;
    }

    return (
          <Map key={this.props.cluster._id + "_map"} bounds={[[min_latitude, min_longitude], [max_latitude, max_longitude]]}>
            <TileLayer
              // url='http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
              subdomains='ab'
            />
            {image_markers}
            {cluster_path}
          </Map>
        );       
   
  }
}
 
ClusterMap.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  cluster: PropTypes.object.isRequired,
  photos: PropTypes.array.isRequired,
  zoomTo: PropTypes.number.isOptional,
  popup: PropTypes.bool.isOptional,
  offset: PropTypes.bool.isOptional
};

