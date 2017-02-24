import { chooseRandomResponse, makeList, reversePronouns, definiteArticles } from '../../api/nlp_helper.js';

export var StateMachine = {};

// HELPER FUNCTIONS

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

// new conversations always start in the uninitialized state
StateMachine['uninitialized'] = {
	autoTransition: function uninitializedAutoTransition(transitionCallback, props, parameters) {
		// TODO: make this intro dialog more responsive/interesting!
		
		var start_time = moment(props.cluster.start_time.utc_timestamp).utcOffset(props.cluster.start_time.tz_offset/60);
		var end_time = moment(props.cluster.end_time.utc_timestamp).utcOffset(props.cluster.end_time.tz_offset/60);

		var duration = moment.duration(end_time - start_time);

		if ((end_time.date() != start_time.date()) && (end_time.hour() >= 4)) {
			// this event spans multiple days
			var intro = 'your time';
		} else {
			var intro = 'the day you spent';
		}

        var content = "Hi! Let's talk about " + intro + " in " + props.cluster.location + " on " + start_time.format('MMMM Do') + ".";
        transitionCallback({output: {from: 'app', content: content}, newState: 'grand_central?first=y'});
	}
};


// This state is kind o the master state -- returning here will provide a new task of some kind
StateMachine['grand_central'] = {
	autoTransition: function grandCentral(transitionCallback, props, parameters) {
		// create list of people, and what image they are in
		var unrecognized_people = [];
		var recognized_people = [];

		for (var i = 0; i < props.photos.length; i++) {
			if (props.photos[i].openfaces.length > 0) {
				for (var j = 0; j < props.photos[i].openfaces.length; j++) {
					if (props.photos[i].openfaces[j].size > 10000) {
					
							if ('name' in props.photos[i].openfaces[j]) {
								recognized_people.push({image: props.photos[i]._id._str, face: j, name: props.photos[i].openfaces[j].name});
								console.log('face has been identified already: ' + props.photos[i].openfaces[j].name);
							} else {
								unrecognized_people.push({image: props.photos[i]._id._str, face: j});
							}

					}
				}
			}
		}

		var places = props.places;
		var unnamed_places = places.filter(function(p) {
			return !('name' in p);
		});

		if (unrecognized_people.length > 0) {
			var newState = 'person_in_photo?image=' + unrecognized_people[0].image + ',face=' + unrecognized_people[0].face;

			if (parameters.first === 'y') {
				var content = "Let's start by helping me identify some people you were with.";
			} else {
				var content = "There's " + ((unrecognized_people.length === 1) ? 'another person' : 'a few more people') + " I need some help with.";
			}

		} else if (unnamed_places.length > 0) {
			var newState = 'place_in_cluster?place=' + unnamed_places[0]._id._str;
			var content = "I'm going to ask about some of the places that you stopped to take photos.";
		} else {
			if (recognized_people.length > 0) {
				var nameList = recognized_people.map(function(p){ return p.name.firstName }).reduce(makeList);
				var content = "It looks like you were with " + nameList + ".";
				var newState = "most_interesting_setup";
			} else if (places.length > 0) {
				// TODO fix this
				var content = "It looks like you started at ";
				var newState = "most_interesting_setup";
			}
		}

		transitionCallback({output: {from: 'app', content: content}, newState: newState});
	}
};

// STATES FOR DETERMINING THE NAME OF PEOPLE IN PHOTOS

StateMachine['person_in_photo'] = {
	autoTransition: function personInPhotoAutoTransition(transitionCallback, props, parameters) {
		transitionCallback({output: {from: 'app_image', content: parameters.image}, newState: 'presenting_image?' + combineParameters(parameters)});
	}
};

StateMachine['presenting_image'] = {
	autoTransition: function presentingImageAutoTransition(transitionCallback, props, parameters) {
		// TODO: this should try to identify the person based on face representation first
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
              var content = "Just double checking, that's " + names[0].firstName + "?";
            } else {
              var content = "Oh, so that's " + names[0].firstName + "?";
            }

            var newState = 'confirming_person?image=' + parameters.image + ',face=' + parameters.face + ',firstName=' + names[0].firstName + ',lastName=' + names[0].lastName + ',gender=' + names[0].gender;
          } else if (names.length > 1) {
            var listed_names = names.reduce(function(list, n, i, a) {
              if (i == a.length - 1) {
                return list + " or " + n.firstName;
              } else {
                return list + ", " + n.firstName;
              }
            });
            var content = "Wait, is that " + listed_names + "?";
            var newState = 'determining_name?image=' + parameters.image;
          }

          transitionCallback({output: {from: 'app', content: content}, newState: newState})
      }}.bind(transitionCallback);

      Meteor.call('conversation.NER', text, interpretPerson);
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

				Meteor.call('conversation.associateFace', {firstName: parameters.firstName, lastName: parameters.lastName, gender: parameters.gender}, parameters.image, parameters.face, props.cluster._id._str);

				// content = 'Ok, great! What were you doing with ' + parameters.firstName + ' on that day?';
				// newState = 'gathering_clustering_information?name=' + parameters.name;

				content = 'Ok, great!';
				newState = 'grand_central';
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
					newState = 'grand_central';

					Meteor.call('conversation.associateFace', "", parameters.image, parameters.face, props.cluster._id._str);
				}

				transitionCallback({output: {from: 'app', content: content}, newState: newState});
			}
		}.bind(transitionCallback);
		Meteor.call('conversation.confirm', text, isPerson);
	}
}

// STATES FOR DETEMRINING NAME OF PLACES IN CLUSTER

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

        var place = props.places.filter(function(p) {
        	return p._id._str === parameters.place;
        })[0];

        transitionCallback({output: {from: 'app_place', content: {center: place.location.coordinates, size: place.radius}}, newState: 'presenting_place?place=' + parameters.place + ',highlighted=' + highlight_list});
  	}	
};

StateMachine['presenting_place'] = {
	autoTransition: function presentingPlaceAutoTransition(transitionCallback, props, parameters) {
		var response = chooseRandomResponse(["Where did you take these photos?", "What is the name of this place?", "Where is this?", "What do you call this area?"]);
    	transitionCallback({output: {from: 'app', content: response}, newState: 'determining_place?' + combineParameters(parameters)});
	}
};

StateMachine['determining_place'] = {
	stateTransition: function determiningPlaceTransition(transitionCallback, text, props, parameters) {

		function findLongestPhrase(err, nouns) {
			if (err) {
				alert(err);
			} else {
				var sorted_nouns = nouns.sort(function(a,b) {
					return a.length < b.length;
				});

				var name = sorted_nouns[0];
				// update the place database with the name
				Meteor.call('conversation.namePlace', name, this.place);

				// the place might have pronouns in it, (e.g. "our hotel") so we should reverse those before generating display output
				var displayName = reversePronouns(name);
				transitionCallback({output: {from: 'app', content: "Ok, I'll mark those as taken at " + displayName + "."}, newState: 'gathering_clustering_information'});

			}
		}

		Meteor.call('conversation.nounPhrases', text, findLongestPhrase.bind(parameters));
	}
}

// STATES FOR IDENTIFYING INTERESTING PHOTOS

StateMachine['most_interesting_setup'] = {
	autoTransition: function mostInterestingAutoTransition(transitionCallback, props, parameters) {
        transitionCallback({output: {from: 'app', content: "Which image from this cluster do you find most interesting? You can select from the photos displayed on the right."}, newState: 'get_interesting_photo?input=photo'});
	}
};

StateMachine['get_interesting_photo'] = {
	stateTransition: function getInterestingPhotoTransition(transitionCallback, text, props, parameters) {
		transitionCallback({output: {from: 'app', content: "That's a good one. Can you tell me about the photo? What do you like about it?"}, newState: 'gathering_clustering_information'});
	}
}

// STATE FOR GATHERING GENERIC CLUSTER INFORMATION

StateMachine['gathering_clustering_information'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('gathering_clustering_information');

		function followUp(err, response) {
			if (err) {
				alert(err);
			} else {
				var newState = 'gathering_clustering_information';
				var output = response;
				transitionCallback({output: {from: 'app', content: response}, newState: newState});
			}
		}

		Meteor.call('conversation.followUp', text, followUp);
	}
}

// STATE FOR GATHERING GENERIC IMAGE INFORMATION

StateMachine['gathering_image_information'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('gathering_image_information');

		// Meteor.call('conversation.followup', text, )
	}
}
