  import React, { Component, PropTypes } from 'react';
  import { createContainer } from 'meteor/react-meteor-data';
  import {Clusters, Photos, LogicalImages} from '../api/photos.js';
  import Cluster from './Cluster.jsx';
  import ReactDOM from 'react-dom';
  import PhotoFaces from './PhotoFaces.jsx';
  import ClusterMap from './ClusterMap.jsx';

  export class ClusterTimeline extends Component {

    constructor(props) {
      super(props);

      this.state = {
        zoomTo: -1
      }
    }

    // add state for zoomTo position
    // zoomTo = new prop on the ClusterMap

    handleScroll() {
      var scrollTop = $(window).scrollTop();
      var newZoomTo = Math.round(scrollTop/376);

      if (newZoomTo != this.state.zoomTo) {
        this.setState({zoomTo: newZoomTo});
        console.log(this.state);
      }
    }

    componentDidMount() {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    render() {

      var colormap = [[59, 48, 102],[37, 23, 85],[38, 23, 86],[39, 23, 87],[40, 23, 88],[42, 23, 90],[43, 23, 92],[44, 23, 93],[46, 23, 95],[47, 23, 96],[49, 23, 98],[50, 23, 100],[52, 23, 102],[54, 23, 104],[56, 23, 106],[57, 23, 108],[59, 23, 110],[61, 23, 112],[63, 23, 114],[66, 23, 116],[68, 23, 118],[70, 23, 120],[73, 23, 122],[75, 23, 124],[77, 23, 126],[80, 23, 128],[83, 23, 129],[86, 24, 131],[89, 26, 133],[92, 28, 134],[95, 30, 135],[99, 33, 137],[103, 36, 139],[108, 40, 140],[113, 44, 141],[118, 48, 142],[124, 52, 143],[130, 58, 144],[135, 63, 145],[141, 68, 146],[148, 73, 147],[154, 79, 148],[160, 84, 149],[166, 90, 150],[171, 96, 151],[177, 102, 152],[183, 107, 153],[189, 113, 154],[194, 118, 155],[199, 124, 156],[204, 129, 158],[208, 134, 159],[211, 139, 161],[215, 144, 162],[218, 148, 164],[220, 152, 166],[221, 156, 168],[221, 161, 171],[221, 166, 175],[221, 170, 179],[221, 174, 183],[220, 178, 187],[218, 182, 192],[214, 185, 197],[211, 189, 201],[207, 192, 206],[204, 195, 211],[200, 198, 215],[197, 201, 220],[193, 203, 224],[190, 206, 228],[187, 208, 232],[184, 211, 236],[183, 213, 239],[182, 215, 242],[182, 217, 243],[182, 217, 244],[182, 218, 244],[182, 219, 245],[182, 220, 246],[182, 220, 247],[182, 221, 247],[183, 222, 248],[183, 222, 248],[184, 223, 249],[184, 224, 249],[185, 224, 250],[186, 225, 250],[186, 225, 251],[187, 226, 251],[188, 226, 252],[188, 227, 252],[189, 227, 252],[190, 228, 252],[191, 228, 253],[191, 229, 253],[192, 229, 253],[193, 230, 253],[194, 230, 253],[195, 230, 254],[196, 231, 253],[197, 231, 253],[197, 231, 254],[198, 232, 254],[199, 232, 254],[200, 232, 254],[201, 232, 254],[201, 233, 254],[202, 233, 254],[203, 233, 254],[204, 234, 254],[204, 233, 254],[205, 234, 254],[205, 234, 254],[206, 234, 254],[207, 234, 254],[207, 234, 254],[207, 234, 255],[207, 235, 254],[208, 234, 254],[208, 234, 254],[208, 234, 255],[208, 235, 255],[208, 235, 255],[208, 235, 255],[208, 235, 255],[208, 235, 255],[207, 235, 255],[207, 234, 255],[206, 234, 255],[205, 235, 255],[204, 234, 255],[203, 234, 255],[202, 234, 255],[201, 234, 255],[199, 233, 255],[198, 233, 255],[197, 233, 255],[195, 232, 255],[194, 232, 255],[192, 232, 255],[191, 232, 255],[189, 231, 255],[187, 231, 255],[186, 231, 255],[184, 230, 255],[183, 229, 255],[181, 229, 255],[179, 229, 255],[178, 228, 255],[176, 228, 255],[175, 227, 255],[173, 226, 255],[172, 226, 255],[171, 225, 255],[169, 225, 255],[168, 224, 255],[167, 223, 255],[166, 223, 255],[165, 222, 255],[165, 221, 255],[164, 221, 255],[163, 220, 255],[163, 219, 255],[163, 219, 255],[163, 218, 255],[163, 218, 255],[163, 217, 255],[163, 216, 255],[164, 215, 252],[166, 213, 248],[169, 212, 243],[172, 210, 237],[176, 209, 232],[180, 207, 226],[185, 205, 219],[190, 204, 212],[195, 202, 205],[200, 200, 198],[205, 199, 191],[210, 197, 183],[216, 195, 176],[220, 192, 168],[225, 190, 161],[230, 188, 153],[234, 186, 147],[238, 184, 140],[241, 181, 133],[243, 179, 127],[245, 176, 122],[246, 174, 117],[246, 171, 112],[245, 167, 107],[243, 163, 103],[240, 159, 99],[236, 155, 95],[231, 151, 92],[225, 146, 89],[219, 141, 86],[212, 137, 84],[205, 132, 82],[198, 127, 81],[190, 122, 79],[182, 117, 77],[175, 112, 76],[167, 107, 74],[160, 102, 73],[153, 97, 71],[147, 92, 70],[142, 87, 68],[137, 83, 66],[132, 78, 64],[127, 73, 62],[122, 68, 59],[117, 63, 57],[112, 57, 55],[108, 52, 53],[103, 46, 51],[99, 41, 49],[95, 36, 47],[90, 31, 45],[87, 27, 43],[83, 22, 42],[79, 18, 41],[75, 14, 40],[72, 11, 40],[69, 8, 40],[65, 6, 40],[63, 5, 40],[61, 5, 41],[59, 5, 41],[58, 5, 42],[56, 5, 43],[55, 5, 45],[53, 5, 46],[53, 5, 48],[51, 5, 50],[50, 5, 51],[49, 6, 53],[47, 7, 55],[46, 8, 58],[45, 8, 59],[45, 10, 62],[44, 11, 64],[43, 12, 66],[42, 13, 68],[41, 15, 70],[41, 16, 72],[40, 17, 74],[40, 18, 76],[39, 19, 78],[39, 20, 79],[38, 21, 81],[37, 22, 82],[37, 23, 83],[58, 47, 101]]

      function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }

      function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
      }

      if (FlowRouter.subsReady()) {
        var photo_list = this.props.photos.map(function(img, i) {
          var t = new moment(img.datetime.utc_timestamp).utcOffset(img.datetime.tz_offset/60);
          var alternate_lists = [];

          if (img.all_photos.length > 0) {
            var alternate_lists = img.all_photos.map(function(img2) {
              return <PhotoFaces key={img2._id._str} photo={img2} displayDuplicates={false} size="320" />
            });
          }

          var cluster_style={};

          var corrected_time = moment(img.datetime.utc_timestamp).utcOffset(img.datetime.tz_offset/60);

          var time_value = Math.round((corrected_time.hour() * 60 + corrected_time.minute())/1440 * 255);

          var color = colormap[time_value];

          if ((color[0] + color[1] + color[2]) < 384) {
            var textColor = 'white';
          } else {
            var textColor = 'black';
          }

          color = rgbToHex(color[0], color[1], color[2])

          cluster_style = {backgroundColor: color, color: textColor};

          if (i == this.state.zoomTo) {
            cluster_style = {backgroundColor: color, color: textColor, border: "5px solid blue", padding: 0};
          } else {
            cluster_style = {backgroundColor: color, color: textColor};
          }

          return (
            <div className="cluster-debug-row" style={cluster_style}>
              <div className="cluster-debug-info">
                <div className="cluster-debug-time">
                  {t.format("h:mm:ss a dddd, MMM D YYYY")}
                </div>
                <div className="cluster-debug-faces">
                  {img.openfaces.length} faces
                </div>
                <div className="cluster-debug-geo">
                  {img.geolocation.results[1].formatted_address}
                </div>
              </div>
              <PhotoFaces photo={img} displayDuplicates={false} size="640" />
            </div>
          );
        }, this
        );

        if (this.props.cluster.length > 0) {
          var clustermap = (<ClusterMap cluster={this.props.cluster[0]} photos={this.props.photos} zoomTo={this.state.zoomTo} popup={true}/>);
        } else {
          var clustermap = [];
        }

        return (
          <div className="cluster-debug-timeline">
            <div className="cluster-debug-map">
              {clustermap}
            </div>
            {photo_list}
          </div>
          );
      } else {
        return <div className="loading">Loading</div>
      }
    }
  }

  ClusterTimeline.propTypes = {
    photos: PropTypes.array.isRequired,
    cluster: PropTypes.object.isRequired
  };

  export default createContainer(() => {
    return {
      photos: LogicalImages.find({}).fetch(),
      cluster: Clusters.find({}).fetch()
    };

  }, ClusterTimeline);
