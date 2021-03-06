import { Mongo } from 'meteor/mongo';
import { createStory, updateStory } from './stories.js';

export const Photos = new Mongo.Collection('images');
export const LogicalImages = new Mongo.Collection('logical_images');
export const Stories = new Mongo.Collection('stories');
export const Clusters = new Mongo.Collection('clusters');
export const People = new Mongo.Collection('people');
export const Places = new Mongo.Collection('places');
//TODO split these into separate files

function compareImage(a,b) {
	if (('rating' in a) && ('rating' in b)) {
		return (a.rating - b.rating);
	} else if ('rating' in a) {
		return 1;
	} else if ('rating' in b) {
		return -1;
	} else {
		return (a.social_interest - b.social_interest);
	}
}

function byDate(a,b) {
	return (b.datetime.utc_timestamp - a.datetime.utc_timestamp);
}

function unusedNarrative(p) {
	if ('used' in p) {
		return p.used === 'n';
	} else {
		return true;
	}
}

function euclideanDistance(vec1, vec2) {
	if (vec1.length != vec2.length) {
		throw new Error("Cannot calculate distance between vectors of unequal length");
	}

	var sum = 0;
	for (var i = 0; i < vec1.length; i++) { sum += Math.pow(vec1[i] - vec2[i], 2); }
	return sum;
}

export {euclideanDistance};

if (Meteor.isServer) {
	// let start = new Date('2014-12-20T00:01:00Z');
	// let end = new Date('2015-01-06T00:01:00Z');
	
	Meteor.publish('single_photo', function singlePhotoPublication(imageId) {
		photo = Photos.find({'_id': imageId, 'user_id': this.userId});
		return photo;
	});

	Meteor.publish('single_logical_image', function singleLogicalImage(imageId) {
		return LogicalImages.find({'_id': imageId, 'user_id': this.userId});
	});

	Meteor.publish('photos', function photoPublication(startDate, endDate) {
		return Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}, 'user_id': this.userId}, 
			{fields: 
				{'datetime': 1, 'geolocation': 1, 'longitude': 1, 'latitude': 1, 'interest_score': 1, 'resized_uris': 1, 'original_uri': 1, 'syntactic_fingerprint': 1, 'openfaces': 1}});
	});

	Meteor.publish('photos_location', function photoPublication(startDate, endDate) {
		return Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}, 'user_id': this.userId}, {fields: {'datetime': 1, 'geolocation': 1}});
	});

	Meteor.publish('photos_near', function photosNearPublication(imageId) {
		let photo = Photos.find({'_id': imageId, 'user_id': this.userId}).fetch();
		let photoDate = photo[0].datetime.utc_timestamp;

		let startDate = new Date(photoDate.getTime() - 2*1000*60*60*24);
		let endDate = new Date(photoDate.getTime() + 3*1000*60*60*24);

		return Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}, 'user_id': this.userId},
			{'datetime': 1, 'geolocation': 1, 'longitude': 1, 'latitude': 1, 'interest_score': 1, 'resized_uris': 1, 'original_uri': 1, 'syntactic_fingerprint': 1});
	});

	Meteor.publish('people', function allPeople() {
		return People.find({'user_id': this.userId});
	});

	// find documents in the People database with a median rep close to the input face rep
	Meteor.publish('people_like', function peopleWithFacesLike(imageId) {
		let photo = LogicalImages.find({'_id': imageId, 'user_id': this.userId}).fetch();
		let people = People.find({'user_id': this.userId}).fetch();
		let best_people = [];


		for (let facen = 0; facen < photo[0].openfaces.length; facen++) {

			let face_rep = photo[0].openfaces[facen].rep;

			let min_sim = 10000;
			let best_person = '';

			for (var i = 0; i < people.length; i++) {
				var sim = euclideanDistance(people[i].median_rep, face_rep);

				if (sim < min_sim) {
					min_sim = sim;
					best_person = people[i]._id;
				}
			}

			best_people[facen] = ({'_id': best_person});
		}

		console.log(best_people);
		return People.find({$or: best_people});
	});

	Meteor.publish('faces_like', function photosWithFacesLike(imageId, facen) {
		let photo = LogicalImages.find({'_id': imageId, 'user_id': this.userId}).fetch();
		var face = photo[0].openfaces[facen].rep;

		var aggregate = LogicalImages.aggregate( [ {$match: {'user_id': this.userId}}, {$project: {'datetime': 1, 'resized_uris': 1, 'openfaces': 1}}, { $unwind : "$openfaces" } ], {"allowDiskUse": true} );
		var similarity = [];

		for (var i = 0; i < aggregate.length; i++) {
			var sim = euclideanDistance(aggregate[i].openfaces.rep, face);

			similarity.push({'_id': aggregate[i]._id.toString(), 'similarity': sim});
		}

		similarity.sort(function(a,b) { return a.similarity - b.similarity});

		// similarity is now a javascript list of _ids and similarity values
		// sort by similarity value and do a query on the five most similar images
		// return that query

		var idquery = [];

		for (var i = 0; i <= 5; i++ ) {
			idquery.push({'_id': new Meteor.Collection.ObjectID(similarity[i]._id)});
		}

		return LogicalImages.find({$or: idquery, 'user_id': this.userId}, {fields: {'datetime': 1, 'latitude': 1, 'longitude': 1, 'resized_uris': 1, 'interest_score': 1, 'openfaces': 1}});

	});

	Meteor.publish('photos_nearby', function photosNearbyPhoto(imageId) {
		let photo = Photos.find({'_id': imageId, 'user_id': this.userId}).fetch();
		let photoLat = photo[0].latitude;
		let photoLon = photo[0].longitude;

		let nearbyPhotos = Photos.find({'latitude': {$gte: photoLat-0.025, $lt: photoLat+0.025}, 'longitude': {$gte: photoLon-0.025, $lt: photoLon+0.025}, 'user_id': this.userId});

		let uniqueDates = _.uniq(Photos.find({'latitude': {$gte: photoLat-0.025, $lt: photoLat+0.025}, 'longitude': {$gte: photoLon-0.25, $lt: photoLon+0.025}, 'user_id': this.userId}, {
			    sort: {'datetime.utc_timestamp': 1}, fields: {'datetime.utc_timestamp': true}
			}).fetch().map(function(x) {
			    return x.datetime.utc_timestamp.toDateString();
			}), true);

		var dateQuery = [];

		// WTF is happening here
		for(var i = 0; i < uniqueDates.length; i++) {
			dateQuery.push({'datetime.utc_timestamp': {$gte: new Date(new Date(uniqueDates[i]).getTime() - new Date(uniqueDates[i]).getTimezoneOffset()*60*1000 - 0*1000*60*60*24), $lt: new Date(new Date(uniqueDates[i]).getTime() - new Date(uniqueDates[i]).getTimezoneOffset()*60*1000 + 1000*60*60*24)}});			
		}
	
		return Photos.find({$or: dateQuery, 'user_id': this.userId}, {fields: {
			'datetime': 1, 'geolocation': 1, 'longitude': 1, 'latitude': 1, 'interest_score': 1, 'resized_uris': 1, 'original_uri': 1, 'syntactic_fingerprint': 1
		}});
	});

	Meteor.publish('stories', function allStories() {
		return Stories.find({'user_id': this.userId});
	});

	Meteor.publish('clusters_with_stories', function clustersWithStories() {
		var stories = Stories.find({'user_id': this.userId}).fetch();
		var or_query = [];

		for (var i = 0; i < stories.length; i++) {
			or_query.push({'_id': stories[i].cluster_id});
		}

		console.log(or_query);

		return Clusters.find({$or: or_query}, {fields: {'start_time': 1, 'end_time': 1, 'location': 1, 'title': 1, 'people': 1, 'places': 1, 'top_images': 1}});
	});

	Meteor.publish('clusters', function clustersByDate(startDate, endDate) {
		console.log(this.userId);
		return Clusters.find({$and: [{'start_time.utc_timestamp': { $lt: endDate}}, {'end_time.utc_timestamp': {$gte: startDate}}], 'user_id': this.userId});
	});

	Meteor.publish('cluster', function clusterById(id) {
		return Clusters.find({'_id': id, 'user_id': this.userId});
	})

	Meteor.publish('cluster_photos', function clusterPhotosByDate(startDate, endDate) {

		// shitty left join. this should be denormalized, in all likelihood
		let clusters = Clusters.find({$and: [{'start_time.utc_timestamp': { $lt: endDate}}, {'end_time.utc_timestamp': {$gte: startDate}}], 'user_id': this.userId}).fetch();
		console.log(clusters);
		var id_or_statement = [];

		for (var i = 0; i < clusters.length; i++) {
			let photo_ids = clusters[i].photos;

			for (var j = 0; j < photo_ids.length; j++) {
				id_or_statement.push({'_id': photo_ids[j]});
			}
		}

		return LogicalImages.find({$or: id_or_statement, 'user_id': this.userId}, {fields: {'datetime': 1, 'latitude': 1, 'longitude': 1, 'resized_uris': 1, 'interest_score': 1, 'openfaces': 1, 'geolocation': 1, 'size': 1, 'identified_faces': 1, 'place': 1, 'rating': 1}});
	});

	Meteor.publish('story_photos', function storyPhotos() {
		let story = Stories.find({}).fetch()[0];
		let photos = story.images_used;

		return Photos.find({'_id': {$in: photos}, 'user_id': this.userId});
	});

	Meteor.publish('single_cluster_photos', function clusterPhotos(clusterId) {
		let cluster = Clusters.find({'_id': clusterId, 'user_id': this.userId}).fetch();
		let id_or_statement = [];
		let photo_ids = cluster[0].photos;

		for (var j = 0; j < photo_ids.length; j++) {
			id_or_statement.push({'_id': photo_ids[j]});
		}

		return LogicalImages.find({$or: id_or_statement, 'user_id': this.userId}, {fields: {'datetime': 1, 'latitude': 1, 'longitude': 1, 'resized_uris': 1, 'interest_score': 1, 'openfaces': 1, 'all_photos': 1, 'geolocation': 1, 'size': 1, 'place': 1, 'identified_faces': 1, 'rating': 1}});
	});

	Meteor.publish('single_cluster_places', function clusterPlaces(clusterId) {
		let cluster = Clusters.find({'_id': clusterId, 'user_id': this.userId}).fetch();
		let id_or_statement = [];
		let places_ids = cluster[0].places;

		if ('places' in cluster[0]) {
			if (places_ids.length > 0) {
				for (var j = 0; j < places_ids.length; j++) {
					id_or_statement.push({'_id': places_ids[j].place_id});
				}

				return Places.find({$or: id_or_statement, 'user_id': this.userId});
			}
		}
		
		return Places.find({'_id': 'RETURN NO RESULTS'});
	});

	Meteor.publish('single_cluster_story', function singleClusterStory(clusterId) {
		console.log('single_cluster_story subscribe method');
		let story = Stories.find({'cluster_id': clusterId, 'user_id': this.userId}).fetch();

		if (story.length === 0) {
			// if there's no story document yet, we need to create one
			createStory.bind(this)(clusterId._str);
			return Stories.find({'cluster_id': clusterId, 'user_id': this.userId});

		} else {
			updateStory(clusterId._str);
			return Stories.find({'cluster_id': clusterId, 'user_id': this.userId});
		}
	});

	Meteor.publish('single_cluster_story_no_changes', function singleClusterStoryNoChanges(clusterId) {
		return Stories.find({'cluster_id': clusterId, 'user_id': this.userId});
	});

}