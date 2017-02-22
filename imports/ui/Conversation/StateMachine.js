export var StateMachine = {};

function splitParameters(state) {
  var split_state = state.split("?");

  if (split_state.length > 1) {
    var parameters = {};
    var split_parameters = split_state[1].split(",");
    for (var i = 0; i < split_parameters.length; i++) {
      var split_parameter = split_parameters[i].split("=");
      parameters[split_parameter[0]] = split_parameter[1];
    }
  } else {
    var parameters = [];
  }

  return {state: split_state[0], parameters: parameters};
}

function combineParameters(params) {
  var combined_params = '';

  for (var k in params) {
    combined_params += k + '=' + params[k] + ',';
  }

  return combined_params;
}

export { combineParameters };
export { splitParameters };

// auto transition states

StateMachine['uninitialized'] = {
	autoTransition: function uninitializedAutoTransition(transitionCallback, props, parameters) {
		// TODO: make this intro dialog more responsive/interesting!
		
		var corrected_time = moment(props.cluster.start_time.utc_timestamp).utcOffset(props.cluster.start_time.tz_offset/60);
        var content = "Hi! Let's talk about the day you spent in " + props.cluster.location + " on " + corrected_time.format('MMMM Do YYYY') + ".";
        transitionCallback({output: {from: 'app', content: content}, newState: 'check_for_people'});
	}
};

StateMachine['most_interesting_setup'] = {
	autoTransition: function mostInterestingAutoTransition(transitionCallback, props, parameters) {
        transitionCallback({output: {from: 'app', content: "Which image from this cluster do you find most interesting? You can select from the photos displayed on the right."}, newState: 'get_interesting_photo?input=photo'});
	}
};

StateMachine['unrecognized_place'] = {
	autoTransition: function unrecognizedPlaceAutoTransition(transitionCallback, props, parameters) {
        // TODO: select only unnamed places
		if (props.cluster.places.length > 0) {
          var newState = 'place_in_cluster?place=' + props.places[0]._id._str;
          var content = 'You took a few photos in a place I\'m not familiar with.';
        }

        transitionCallback({output: {from: 'app', content: content}, newState: newState});
    }
};

StateMachine['place_in_cluster'] = {
	autoTransition: function placeInClusterAutoTransition(transitionCallback, props, parameters) {
		var images_in_place = props.photos.filter(function(p) {
        	if ('place' in p) {
                return p.place.place_id._str === parameters.place;
            } else {
            	return false;
            }
        }, parameters);

        var highlight_list = images_in_place.reduce(function(a, b) {
          return a + ';' + b._id._str;
        }, '');

        highlight_list = highlight_list.slice(1, highlight_list.length);

        console.log(props.places[0]._id);

        transitionCallback({output: {from: 'app_place', content: {center: props.places[0].location.coordinates, size: props.places[0].radius}}, newState: 'presenting_place?place=' + parameters.place + ',highlighted=' + highlight_list});
  	}	
};

StateMachine['check_for_people'] = {
	autoTransition: function unrecognizedPersonAutoTransition(transitionCallback, props, parameters) {
		// find the first unrecognized person

		var foundImage = -1;
		var foundFace = -1;

		var i = 0;

		while ((i < props.photos.length) && (foundImage < 0)) {
			if (props.photos[i].openfaces.length > 0) {
				for (var j = 0; j < props.photos[i].openfaces.length; j++) {
					console.log(props.photos[i]);
					if (props.photos[i].openfaces[j].size > 10000) {
					
							if ('name' in props.photos[i].openfaces[j]) {
								console.log('face has been identified already: ' + props.photos[i].openfaces[j].name);
							} else {
								foundImage = i;
								foundFace = j;
								break;
							}

					}
				}
			}

			i++;
		}

		if (foundImage >= 0) {
			var newState = 'person_in_photo?image=' + props.photos[foundImage]._id._str + ',face=' + foundFace;
			var content = "I see some people I don't recognize.";
        } else {
			if (props.cluster.places.length > 0) {
				var newState = 'place_in_cluster?place=' + props.places[0]._id._str;
				var content = 'You took a lot of photos in a place I\'m not familiar with.';
			}
        }

        transitionCallback({output: {from: 'app', content: content}, newState: newState});
    }
};

StateMachine['person_in_photo'] = {
	autoTransition: function personInPhotoAutoTransition(transitionCallback, props, parameters) {
		transitionCallback({output: {from: 'app_image', content: parameters.image}, newState: 'presenting_image?' + combineParameters(parameters)});
	}
};

StateMachine['presenting_image'] = {
	autoTransition: function presentingImageAutoTransition(transitionCallback, props, parameters) {
		var image = props.photos.filter(function(p) {
        	return p._id._str == parameters.image
        }, parameters)[0];

		var faceCenter = image.openfaces[parameters.face].rect[0] + image.openfaces[parameters.face].rect[2]/2;
        var width = 1280*image.size[0]/image.size[1];

        if (faceCenter <= width/3) {
        	var output = 'Who is that, on the left?';
        } else if (faceCenter >= 2*width/3) {
        	var output = 'Who is on the right?';
        } else {
        	var output = 'Who is in the middle of this picture?'
        }

        transitionCallback({output: {from: 'app', content: output}, newState: 'determining_name?' + combineParameters(parameters) + ',highlighted=' + parameters.image});
	}
};

StateMachine['presenting_place'] = {
	autoTransition: function presentingPlaceAutoTransition(transitionCallback, props, parameters) {
    	transitionCallback({output: {from: 'app', content: 'What is the name of this place?'}, newState: 'determining_place?' + combineParameters(parameters)});
	}
};

// states that transition on input

StateMachine['determining_name'] = {
	stateTransition: function determiningNameTransition(transitionCallback, text, props, parameters) {
		var interpretPerson = function interpretPerson(err, names) {
        if (err) {
          alert(err);
        } else {
          if (names.length == 0) {
            var content =  "Sorry, I'm not sure I got that. Is there a person in this image?";
            var newState = 'are_there_people?' + combineParameters(parameters);

          } else if (names.length == 1) {
            if (Math.random() > 0.5) {
              var content = "Just double checking, that's " + names[0] + "?";
            } else {
              var content = "Oh, so that's " + names[0] + "?";
            }

            var newState = 'confirming_person?image=' + parameters.image + ',face=' + parameters.face + ',name=' + names[0];
          } else if (names.length > 1) {
            var listed_names = names.reduce(function(list, n, i, a) {
              if (i == a.length - 1) {
                return list + " or " + n
              } else {
                return list + ", " + n
              }
            });
            var content = "Wait, is that " + listed_names + "?";
            var newState = 'determining_name?image=' + parameters.image;
          }

          transitionCallback({output: {from: 'app', content: content}, newState: newState})
      }}.bind(transitionCallback);

      Meteor.call('conversation.whoIs', text, interpretPerson);
  }
}

StateMachine['determining_place'] = {
	stateTransition: function determiningPlaceTransition(transitionCallback, text, props, parameters) {
        transitionCallback({output: {from: 'app', content: 'Got it.'}, newState: 'most_interesting_setup'});
	}
}

StateMachine['confirming_person'] = {
	stateTransition: function confirmingPersonTransition(transitionCallback, text, props, parameters) {
		var confirmName = function confirmName(err, yn) {
		if (err) {
			alert(err);
		} else {

			if (yn) {
				// add name to names database

				Meteor.call('conversation.associateFace', parameters.name, parameters.image, parameters.face, props.cluster._id._str);

				content = 'Ok, great! What were you doing with ' + parameters.name + ' on that day?';
				newState = 'gathering_clustering_information?name=' + parameters.name;

			} else {

				// could not confirm name
				content = 'Oh, so who is it?';
				newState = 'determining_name?' + combineParameters(parameters);
			}

			transitionCallback({output: {from: 'app', content: content}, newState: newState});

		}
		}.bind(transitionCallback);

        Meteor.call('conversation.confirm', text, confirmName);
	}
}

StateMachine['get_interesting_photo'] = {
	stateTransition: function getInterestingPhotoTransition(transitionCallback, text, props, parameters) {
		transitionCallback({output: {from: 'app', content: "That's a good one. Can you tell me about the photo? What do you like about it?"}, newState: 'gathering_clustering_information'});
	}
}

StateMachine['are_there_people'] = {
	stateTransition: function areTherePeopleTransition(transitionCallback, text, props, parameters) {
		var isPerson = function isPerson(err, yn) {
			if (err) {
				alert(err);
			} else {
				if (yn) {
					content = 'Okay, so who is it?';
					newState = 'determining_name?' + combineParameters(parameters);
				} else {
					content = 'Oh, sorry about that.';
					newState = 'unrecognized_place';

					Meteor.call('conversation.associateFace', "", parameters.image, parameters.face, props.cluster._id._str);
				}

				transitionCallback({output: {from: 'app', content: content}, newState: newState});
			}
		}.bind(transitionCallback);
		Meteor.call('conversation.confirm', text, isPerson);
	}
}

StateMachine['gathering_clustering_information'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('gathering_clustering_information');
	}
}

