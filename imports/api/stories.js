import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';
import { Clusters, Stories, LogicalImages } from './photos.js';
import { Conversations } from './conversation.js';

function compareImage(a,b) {
	if ('rating' in a) {
		if (a.rating == 3) {
			return -1;
		}

		if (a.rating == 1) {
			return 1;
		}
	}

	if ('rating' in b) {
		if (b.rating == 3) {
			return 1;
		}

		if (b.rating == 1) {
			return -1;
		}
	}

	return (b.interest_score - a.interest_score);
}

function compareImageWithTime(a,b) {
	if ('rating' in a) {
		if (a.rating == 3) {
			return -1;
		}

		if (a.rating == 1) {
			return 1;
		}
	}

	if ('rating' in b) {
		if (b.rating == 3) {
			return 1;
		}

		if (b.rating == 1) {
			return -1;
		}
	}

	if ((Math.abs(this.start - a.datetime.utc_timestamp)/(1000*60*60) > 0.5) && (Math.abs(this.start - b.datetime.utc_timestamp)/(1000*60*60) > 0.5) && (Math.abs(this.stop - a.datetime.utc_timestamp)/(1000*60*60) > 0.5) && (Math.abs(this.stop - b.datetime.utc_timestamp)/(1000*60*60) > 0.5)) {
		return (b.interest_score - a.interest_score);
	} else {
		var midtime = new Date(this.start.getTime() + (this.stop - this.start) / 2);
		return ((Math.abs(midtime - a.datetime.utc_timestamp)/(1000*60*60)) - (Math.abs(midtime - b.datetime.utc_timestamp)/(1000*60*60)));
	}
}

function byDate(a,b) {
	return (a.datetime.utc_timestamp - b.datetime.utc_timestamp);
}

function unusedNarrative(p) {
	if ('used' in p) {
		return !p.used;
	} else {
		return true;
	}
}

function updateStory(clusterId) {
	console.log('checking story prior to updating');

	let cluster_id_obj = new Meteor.Collection.ObjectID(clusterId);
	let story = Stories.find({'cluster_id': cluster_id_obj}).fetch();

	if (story.length == 0) {
		createStory(clusterId);
		return false;
	} else {
		story = story[0];
	}

	let conversation = Conversations.find({'cluster_id': cluster_id_obj}).fetch();

	if (conversation.length > 0) {
		var conversationLength = conversation[0].history.length;
	} else {
		var conversationLength = 0;
	}

	if (conversationLength != story.conversationLengthAtLastBuild) {
		// okay, we probably need to update the story
		console.log('conversation length mismatch, attempting update');
		let story_content = story.content;

		// get unused cluster narrative elements
		let gotcluster = getUnusedClusterNarrative(clusterId);
		let cluster = gotcluster.cluster;
		let cluster_narrative = gotcluster.narrative;

		if (cluster_narrative.length > 0) {
			console.log('new cluster narrative content');
			// if there are really new cluster narrative elements
			// determine where to stick the new cluster narrative elements
			let insert_point = 0;
			let found_image = true;
			while(insert_point < story.content.length) {
				if ((story_content[insert_point].type === 'image') && !(found_image)) {
					found_image = true;
				} else if ((story_content[insert_point].type == 'image') && (found_image)) {
					break;
				}

				insert_point++;
			}

			var paragraphs = '';

			for (var i = 0; i < cluster_narrative.length; i++) {
				paragraphs += ('<p>' + cluster_narrative[i].answer + '</p>');
			}

			story_content.splice(insert_point+1, 0, {type: 'paragraph', data: paragraphs});
		}

		// now find unused image narrative elements
		var images = getImagesFromCluster(cluster);
		
		// find images with narrative content
		var images_with_narrative_content = images.filter(function(p) {
			if ('narrative' in p) {
				for (var i = 0; i < p.narrative.length; i++) {
					if ('used' in p.narrative[i]) {
						if (!p.narrative[i].used) {
							return true;
						}
					}
				}
			}

			return false;
		});

		if (images_with_narrative_content.length > 0) {
			console.log('new image narrative content');
			// if there are images with new narrative content
			images_with_narrative_content = images_with_narrative_content.sort(byDate);

			for (var i = 0; i < images_with_narrative_content.length; i++) {
				// is the image already in the story?

				for (var j = 0; j < story_content.length; j++) {
					if (story_content[j].type === 'image') {
						if (story_content[j].data.image_id._str === images_with_narrative_content[i]._id._str) {
							break;
						}
					}
				}

				console.log('image found at: ' + j);

				if (j === story_content.length) {
					console.log('image not found');
					// image not found, find the place to insert it

					// start k at 2 to skip the title and setting photo
					for (var k = 2; k < story_content.length; k++) {
						if (story_content[k].type === 'image') {
							if (story_content[k].data.datetime.utc_timestamp > images_with_narrative_content[i].datetime.utc_timestamp) {
								break;
							}
						}
					}

					story_content.splice(k, 0, {type: 'image', data: {image_id: images_with_narrative_content[i]._id, datetime: images_with_narrative_content[i].datetime, resized_uris: images_with_narrative_content[i].resized_uris}})

					var insert_point = k+1;
				} else {
					if (((j+1) < story_content.length) && (story_content[j+1].type === 'paragraph')) {
						// new text should go after last paragraph
						var insert_point = j+2;
					} else {
						var insert_point = j+1;
					}
				}

				var image_narrative = images_with_narrative_content[i].narrative.filter(unusedNarrative);
				var paragraphs = '';

				for (var i = 0; i < image_narrative.length; i++) {
					paragraphs += ('<p>' + image_narrative[i].answer + '</p>');
				}

				story_content.splice(insert_point, 0, {type: 'paragraph', data: paragraphs});
			}
		}

		Stories.update({'cluster_id': cluster_id_obj}, {'$set': {'content': story_content}});

		// and, mark all of the narrative elements as used again
		markNarrativeUsed(clusterId);
	}
}

export {updateStory};

function getUnusedClusterNarrative(clusterId) {
	let cluster_id_obj = new Meteor.Collection.ObjectID(clusterId);
	let cluster = Clusters.find({'_id': cluster_id_obj}).fetch()[0];
	if ('narrative' in cluster) {
		var cluster_narrative = cluster.narrative;
	} else {
		var cluster_narrative = [];
	}

	cluster_narrative = cluster_narrative.filter(function(n) {
		if ('used' in n) {
			return !n.used;
		} else {
			return true;
		}
	});

	return {cluster: cluster, narrative: cluster_narrative};
}

function getImagesFromCluster(cluster) {
	let image_id_or_statement = cluster.photos.map(function(p) {
		return {'_id': p};
	});
	var images =  LogicalImages.find({$or: image_id_or_statement}, {fields: {'narrative': 1, 'rating': 1, 'datetime': 1, 'role': 1, 'resized_uris': 1, 'interest_score': 1}}).fetch();
	images = images.sort(byDate);
	return images;
}

function createStory(clusterId) {
	console.log('creating new story');
	let cluster_id_obj = new Meteor.Collection.ObjectID(clusterId);

	// narrative can be in cluster
	let cluster = Clusters.find({'_id': cluster_id_obj}).fetch()[0];
	if ('narrative' in cluster) {
		var cluster_narrative = cluster.narrative;
	} else {
		var cluster_narrative = [];
	}

	// or narrative can be images
	var images = getImagesFromCluster(cluster);

	var story_content = [];

	// we need to	
	//    - have a title
	if ('title' in cluster) {
		story_content.push({type: 'heading', data: cluster.title});
	} else {
		var corrected_time = moment(cluster.start_time.utc_timestamp).utcOffset(cluster.start_time.tz_offset/60);
		var initial_title = corrected_time.format('MMMM Do YYYY');
		story_content.push({type: 'heading', data: initial_title});
	}

	//    - have a setting photo (w/o narrative content?)
	let setting_photos = images.filter(function(p) {
		if ('role' in p) {
			return p.role === 'setting';
		} else {
			return false;
		}
	});

	if (setting_photos.length > 0) {
		var intro_photo_id = setting_photos[0]._id._str;
		story_content.push({type: 'image', data: {image_id: setting_photos[0]._id, datetime: setting_photos[0].datetime, resized_uris: setting_photos[0].resized_uris}});
	} else {
		//        - Most interesting photo from the first 3 hours without narrative content
		let start_time = cluster.start_time;
		let first_photos = images.filter(function(p) {
			return ((p.datetime.utc_timestamp - start_time.utc_timestamp)/(1000*60*60) <= 3);
		});

		if (first_photos.length < 2) {
			first_photos = images.slice(0,3);
		}

		best_first_photos = first_photos.sort(compareImage);

		var intro_photo_id = best_first_photos[0]._id._str;
		story_content.push({type: 'image', data: {image_id: best_first_photos[0]._id, datetime: best_first_photos[0].datetime, resized_uris: best_first_photos[0].resized_uris}});
	}

	// find images with narrative content
	var images_with_narrative_content = images.filter(function(p) {
		if ('rating' in p) {
			if (p.rating === 3) {
				if (p._id._str != intro_photo_id) {
					return true;
				} else {
					return false;
				}
			}
		}

		if ('narrative' in p) {
			if (p._id._str != intro_photo_id) {
				return true;
			}
		}

		return false;
	});

	images_with_narrative_content = images_with_narrative_content.sort(byDate);

	//    - follow that with cluster narrative info
	if (cluster_narrative.length > 0) {
		var paragraphs = '';
		for (var i = 0; i < cluster_narrative.length; i++) {
			paragraphs += ('<p>' + cluster_narrative[i].answer + '</p>');
		}
		story_content.push({type: 'paragraph', data: paragraphs});
	}

	//    - have regular images after that, including every image with narrative content and with a rating of 3
	if (images_with_narrative_content.length > 0) {
		for (var i = 0; i < images_with_narrative_content.length; i++) {
			story_content.push({type: 'image', data: {image_id: images_with_narrative_content[i]._id, datetime: images_with_narrative_content[i].datetime, resized_uris: images_with_narrative_content[i].resized_uris}});
			if ('narrative' in images_with_narrative_content[i]) {
				var paragraphs = '';
				for (var j = 0; j < images_with_narrative_content[i].narrative.length; j++) {
					paragraphs += ('<p>' + images_with_narrative_content[i].narrative[j].answer + '</p>');
				}
				story_content.push({type: 'paragraph', data: paragraphs});
			}
		}
	}

	//        - at least one image every 3 hours
	var flag = true;
	while(flag) {
		flag = false;
		var time_a = 0;
		var new_story = story_content.slice();

		for (var i = 0; i < (story_content.length+1); i++) {
			var time_b = 0;

			if (i === story_content.length) {
				if (time_a === 0) {
					console.log('uhhhhh, no images')
					time_a = cluster.start_time.utc_timestamp;
				}
				time_b = cluster.end_time.utc_timestamp;
			} else {
				if (story_content[i].type === 'image') {
					if (time_a === 0) {
						time_a = story_content[i].data.datetime.utc_timestamp;
					} else {
						time_b = story_content[i].data.datetime.utc_timestamp;
					}
				}
			}

			if (time_b != 0) {
				var time_delta = (time_b - time_a) / (1000 * 60 * 60);

				// time gap is larger than 3 hours
				if (time_delta > 3) {
					var photos_in_range = images.filter(function(p) {
						return ((p.datetime.utc_timestamp > new Date(time_a.getTime() + 1000*60*60*0.5)) && (p.datetime.utc_timestamp < new Date(time_b.getTime() - 1000*60*60*0.5)));
					});

					if (photos_in_range.length > 0) {
						flag = true;
						photos_in_range = photos_in_range.sort(compareImageWithTime.bind({'start': time_a, 'stop': time_b}));
					
						new_story.splice(i,0,{type: 'image', data: {image_id: photos_in_range[0]._id, datetime: photos_in_range[0].datetime, resized_uris: photos_in_range[0].resized_uris}});
						break;
					}
				}

				time_a = time_b;
			}
		}

		story_content = new_story.slice();

	}

	// insert the new story!
	Stories.insert({'cluster_id': cluster_id_obj, 'content': story_content});

	// and update the old narrative elements
	markNarrativeUsed(clusterId);
}

export {createStory};

function markNarrativeUsed(clusterId) {
	// mark all cluster narrative elements as used
	let cluster_id_obj = new Meteor.Collection.ObjectID(clusterId);
	cluster = Clusters.find({'_id': cluster_id_obj}).fetch()[0];
	if ('narrative' in cluster) {
		var markedClusterNarrative = cluster.narrative;

		for (var i = 0; i < cluster.narrative.length; i++) {
			markedClusterNarrative[i]['used'] = true;
		}

		Clusters.update({'_id': cluster_id_obj}, {'$set': {'narrative': markedClusterNarrative}});
	}

	// for logical images, update each individually
	let image_id_or_statement = cluster.photos.map(function(p) {
		return {'_id': p};
	});
	images = LogicalImages.find({$or: image_id_or_statement}, {fields: {'narrative': 1}}).fetch();
	for (var i = 0; i < images.length; i++) {
		if ('narrative' in images[i]) {
			var newNarrative = images[i].narrative;

			for (var j = 0; j < newNarrative.length; j++) {
				newNarrative[j]['used'] = true;
			}

			LogicalImages.update({'_id': images[i]._id}, {'$set': {'narrative': newNarrative}});
		}
	}

	// add "conversation at last build"
	let conversation = Conversations.find({"cluster_id": cluster_id_obj}).fetch();

	if (conversation.length > 0) {
		var conversationLength = conversation[0].history.length;
	} else {
		console.log("no conversations?");
		var conversationLength = 0;
	}

	Stories.update({'cluster_id': cluster_id_obj}, {'$set': {'conversationLengthAtLastBuild': conversationLength}});
}

Meteor.methods({
	'story.insertHeader'(story_id, position) {
		check(story_id, String);
		check(position, Number);

		try {
			Stories.update({'_id': story_id}, {'$push': {'content': {'$each': [{'type': 'heading', 'data': 'New header'}], '$position': position}}});
		} catch(e) {
			console.log(e);
			return false;
		}
	},

	'story.insertParagraph'(story_id, position) {
		check(story_id, String);
		check(position, Number);

		try {
			Stories.update({'_id': story_id}, {'$push': {'content': {'$each': [{'type': 'paragraph', 'data': ['<p>New paragraph</p>']}], '$position': position}}});
		} catch(e) {
			console.log(e);
			return false;
		}
	},

	'story.updateText'(story_id, position, new_paragraph) {
		check(story_id, String);
		check(position, Number);
		check(new_paragraph, String);

		try {
			currentStory = Stories.find({'_id': story_id}).fetch()[0];

			var newContent = currentStory.content;

			if (new_paragraph === '') {
				newContent.splice(position, 1);
			} else { 
				newContent[position].data = new_paragraph;
			}

			Stories.update({'_id': story_id}, {'$set': {'content': newContent}});
		} catch(e) {
			console.log(e);
			return false;
		}
	},

	'story.insertImage'(story_id, image_id, position) {
		check(story_id, String);
		check(position, Number);

		try {
			var image_id_obj = new Meteor.Collection.ObjectID(image_id);
			var image = LogicalImages.find({'_id': image_id_obj}, {fields: {'datetime': 1, 'resized_uris': 1}}).fetch()[0];

			var new_image = {};
			new_image['image_id'] = image_id;
			new_image['resized_uris'] = image.resized_uris;
			new_image['datetime'] = image.datetime;

			Stories.update({'_id': story_id}, {'$push': {'content': {'$each': [{'type': 'image', 'data': new_image}], '$position': position}}});
		} catch(e) {
			console.log(e);
			return false;
		}
	}
})