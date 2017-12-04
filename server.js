var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('cookie-session');
var url = require('url');
app = express();
app.set('view engine', 'ejs');
var SECRETKEY1 = 'I want to pass COMPS381F';
var SECRETKEY2 = 'Keep this to yourself';
var MongoClient = require('mongodb').MongoClient; 
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongourl = 'mongodb://user:1994514@ds141524.mlab.com:41524/chkeung';
//var fs = require('fs');
//var formidable = require('formidable');
var fileUpload = require('express-fileupload');
var users = [];
var details;

app.use(fileUpload());
app.use(session({
	name: 'session',
	keys: [SECRETKEY1,SECRETKEY2]
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(function(req,res,next) {  // logger middleware
	console.log(".......................\n"+req.method + ' ' + req.url +  ' was requested at ' + Date.now()+"\n.......................\n");
	//console.log(req);
	next();
  })

app.post('/login',function(req,res,next) {
	var criteria = {"user.id": req.body.name};
	console.log(criteria);
	confirm_user(req, res, criteria, 1);
});

//get request
app.get('/',function(req,res) {
	console.log(req.session);
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {
		res.redirect('/read');
	}
});


app.get("/login", function(req,res) {
	res.sendFile(__dirname + '/public/login.html');
//res.render('login');
});

app.get('/logout',function(req,res) {
	req.session = null;
	users = [];
	new_r = {};
	res.redirect('/');
});

app.get('/api/restaurant/read', function (req, res) {
	var criteria = req.params;
	//var result = [];
	findAll(res,criteria,0, function(result){
		if(result.length == 0){
			console.log(result);
		//res.status(200).send(result);
			res.status(200).end("{}");
		}else{
			res.status(200).send(result);
			res.status(200).end();

		}
	})
})

app.get('/api/restaurant/read/name/:name', function (req, res) {
	var criteria = {}
	criteria["name"] = req.params.name;
	//console.log(criteria)
	//var result = [];
	findAll(res,criteria,0, function(result){
		if(result.length == 0){
			console.log(result);
		//res.status(200).send(result);
			res.status(200).end("{}");
		}else{
			res.status(200).send(result);
			res.status(200).end();

		}
	})

})

app.get('/api/restaurant/read/borough/:borough', function (req, res) {
	var criteria = {}
	criteria["borough"] = req.params.borough;
	//console.log(criteria)
	//var result = [];
	findAll(res,criteria,0, function(result){
		if(result.length == 0){
			console.log(result);
		//res.status(200).send(result);
			res.status(200).end("{}");
		}else{
			res.status(200).send(result);
			res.status(200).end();

		}
	})

})

app.get('/api/restaurant/read/cuisine/:cuisine', function (req, res) {
	var criteria = {}
	criteria["cuisine"] = req.params.cuisine;
	//console.log(criteria)
	//var result = [];
	findAll(res,criteria,0, function(result){
		if(result.length == 0){
			console.log(result);
		//res.status(200).send(result);
			res.status(200).end("{}");
		}else{
			res.status(200).send(result);
			res.status(200).end();

		}
	})

})

app.get('/read',function(req,res) {
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {		
		var parsedURL = url.parse(req.url,true); 
		var queryAsObject = parsedURL.query;
		var criteria = {};
		var count = 0;
		var resCount = 0;
		var details = [];
		//console.log(JSON.stringify(queryAsObject));
		for (key in queryAsObject) {
			//console.log(key);
			switch(key){
				case "street":
					criteria["address."+key] = queryAsObject[key];
					break;
				case "building":
					criteria["address."+key] = queryAsObject[key];
					break;
				case "zipcode":
					criteria["address."+key] = queryAsObject[key];
					break;
				case "coord":
					criteria["address."+key] = queryAsObject[key];
					break;
				case "user":
					criteria["grades."+key] = queryAsObject[key];
					break;
				case "score":
					criteria["grades."+key] = queryAsObject[key];
					break;
				default:	
					criteria[key] = queryAsObject[key];
					break;
			}
			//if(key == "street") console.log("jj");
			//criteria[key] = queryAsObject[key];
			count++;
		}
		//console.log('/search criteria = '+JSON.stringify(criteria));
		//res.end();
		//console.log(count);
		if(count == 0){
			findAll(res,criteria,0, function(result){
				var temp = {};
				for(var i = 0; i<result.length;i++ ){
					details.push({"id":result[i]._id, "name": result[i].name});
					resCount++;
				}
				//console.log(details);
				res.status(200);
				res.render('secrets',{name:req.session.username, de: details, count: resCount, c: JSON.stringify(criteria)});
			});
		}else{
			findAll(res,criteria,0, function(result){				
				var temp = {};
				for(var i = 0; i<result.length;i++ ){
					details.push({"id":result[i]._id, "name": result[i].name});
					resCount++;
				}
				//console.log(details);
				res.status(200);
				res.render('secrets',{name:req.session.username, de: details, count: resCount, c: JSON.stringify(criteria)});
			});
		}

		
	}
});

app.get("/new", function(req,res) {
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {
		res.sendFile(__dirname + '/public/new.html');
		//console.log(req.session.username);
		
	}
//res.render('login');
});

app.get("/restfulcreate", function(req,res) {
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {
		res.sendFile(__dirname + '/public/restfulcreate.html');
		//console.log(req.session.username);
		
	}
//res.render('login');
});

app.get("/create", function(req,res) {
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {
		details['owner'] = req.session.username;
		res.status(200);
		res.render('display', {details: details});		
		//console.log(details);
		//var ph = "data: "+details['photoMimetype']+"; base64, /"+details['photo'];
		//console.log(ph);
		//details['owner'] = req.session.username;
		//details['ph'] = ph;
		//console.log(details);
		//if(req.pathname != '/create'){
		//	details = "";
		//}		
		//console.log(details);
		//console.log(new_r);
		//.log(req.session.username);
	}

});

app.get("/gmap", function(req,res) {
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {
		//console.log(req.query.lat);
		//console.log(req.query.lon);
		res.render("gmap", {
			lat: req.query.lat,
			lon: req.query.lon,
			title: req.query.title
		});
	}
//res.render('login');
});

app.get("/change", function(req,res) {
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {
		var owner2 = false;
		findOwner(res, req.query._id, function(owner){
			temp = owner;
			//console.log("o: "+owner.owner);
			//console.log("owner: "+req.session.username);
			if(owner.owner != req.session.username){
				owner2 = false;
				console.log("not owner");
				res.render("change", {re: owner2, o: owner});
			}else{
				owner2 = true;
				console.log("owner.....");
				res.render("change", {re: owner2, o: owner});
			}
		});
	}
//res.render('login');
});

app.get("/rate", function(req,res) {
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {
		res.render("rate", {id: req.query._id});
	}
//res.render('login');
});

app.get("/display", function(req,res) {
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {
		displayRestaurant(res, req.query._id, function(doc){
			var details = doc;
			res.render("display", {details: details});
			//console.log(doc.name);
		})		
	}
//res.render('login');
});

app.get("/remove", function(req,res) {
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {
		var result = [];
		findOwner(res, req.query._id, function(owner){

			console.log("o: "+owner.owner);
			console.log("owner: "+req.session.username);
			if(owner.owner != req.session.username){
				result["owner"] = "not owner";
				console.log("not owner");
				res.render("remove", {re: result});
			}else{
				result["owner"] = "owner";
				remove(res, req.query._id, function(re){
					result["flag"] = re;
					console.log(result);
					res.render("remove", {re: result});
				}); 
				//console.log("owner");
			}

		});
		//console.log(onwer);
				
	}
//res.render('login');
});

//post
app.post('/change',function(req,res) {
	//console.log(req.body.name);
	var temp = {};
	findOwner(res, req.body._id, function(owner){
		temp["photo"]= owner.photo;
		temp["photoMimetype"] = owner.photoMimetype;
		temp["grades"] = owner.grades;
		//console.log(temp);
		//console.log("........." );
		var id = req.body._id;
		var new_r = {};
		var address = {};
		var coord = [];

		new_r['name'] = req.body.name;
		abc = req.body.name;
		new_r['borough'] = (req.body.borough.length > 0) ? req.body.borough : "Not offered";
		new_r['cuisine'] = (req.body.cuisine.length > 0) ? req.body.cuisine : "Not offered";
		address['street'] = (req.body.street.length > 0) ? req.body.street : "Not offered";
		address['building'] = (req.body.building.length > 0) ? req.body.building : "Not offered";
		address['zipcode'] = (req.body.zipcode.length > 0) ? req.body.zipcode : "Not offered";
		coord.push((req.body.lon.length > 0) ? req.body.lon : "Not offered");
		coord.push((req.body.lat.length > 0) ? req.body.lat : "Not offered");
		address['coord'] = coord;
		//console.log(temp);
		//console.log("........." );
	
		if (isEmpty(req.files)){
			console.log('No photo were updated.');
			new_r['photo'] = temp["photo"];		
			new_r['photoMimetype'] = temp["photoMimetype"];
			new_r['address'] = address;
			new_r['grades'] = temp["grades"];
			new_r['owner'] = req.body.userid;
	
		}else{
			console.log("With photo");
			//var filename = req.files.sampleFile.name;
			var sampleFile = req.files.sampleFile;	
			new_r['photo'] = req.files.sampleFile.data.toString('base64');		
			new_r['photoMimetype'] = req.files.sampleFile.mimetype;
			//new_r['photoMimetype'];
			
			new_r['address'] = address;
			new_r['grades'] = temp["grades"];
			new_r['owner'] = req.body.userid;
			console.log("new photo");
		}
		updateRest(res, new_r, id, function(result){
			var details = new_r;
			details["_id"] = id;
			console.log(details['grades']);
			console.log("done");
			res.render("display", {details: details});
		})
		//console.log(new_r);
	})

	//console.log(JSON.stringify(temp["photo"]));
	//console.log(id);
});

app.post('/rate',function(req,res) {
	console.log(req.query._id);
	console.log(req.body.score);
	//res.redirect('/rate?_id='+req.query._id);
	//var gd = [];
	//details["id"] = req.query._id;
	//res.render("rate", {details: details});
	findOwner(res, req.query._id, function(owner){
		//console.log(owner);
		var gd = []
		var rated = false;
		var o = req.session.username;
		var s = req.body.score;
		gd = owner.grades;
		//console.log(gd);
		
		
		for(var i=0;i < gd.length; i++){
			//console.log("gg: "+gd[i].user);
			if(gd[i].user == req.session.username){
				console.log(gd[i].user);
				console.log(req.session.username);
				rated = true;
			}
		}
		console.log(rated);
		if(rated){			
			console.log("you rated");
			res.render("rated");
		}else{
			//gd = JSON.stringify(gd);
			var newOne = {};
			newOne["user"] = o;
			newOne["score"] = s;
			gd.push(newOne);
			console.log("herr: "+JSON.stringify(gd));
			updateR(res,gd, req.query._id, function(result){
				console.log("done");
				res.redirect("/display?_id="+req.query._id);
			});
			
			//console.log(gd + "\n" + o+ "\n" + s+ "\n" + JSON.stringify(newOne));
		}
		//console.log("here");
	
	})
		
	
});

app.post('/api/restaurant/create',function(req,res) {
	
	var new_r = {};
	var address = {};
	var grades = [];
	var coord = [];
	new_r['name'] = req.body.name;
	abc = req.body.name;
	new_r['borough'] = (req.body.borough == null) ? "Not offered":req.body.borough;
	new_r['cuisine'] = (req.body.cuisine == null) ? "Not offered":req.body.cuisine;
	address['street'] = (req.body.street == null) ? "Not offered":req.body.street;
	address['building'] = (req.body.building == null) ? "Not offered":req.body.building;
	address['zipcode'] = (req.body.zipcode == null) ? "Not offered":req.body.zipcode;
	coord.push((req.body.lon == null) ? "Not offered":req.body.lon);
	coord.push((req.body.lat == null) ? "Not offered":req.body.lat);
	address['coord'] = coord;

		//new_r['borough'] = (req.body.borough.length > 0) ? req.body.borough : "Not offered";
	//	new_r['cuisine'] = (req.body.cuisine.length > 0) ? req.body.cuisine : "Not offered";
	//console.log("hello: "+req.session.username);

	//if (isEmpty(req.files)){
	console.log('No photo were uploaded.');
	new_r['photo'] = "Not offered";		
	new_r['photoMimetype'] = "Not offered";
	new_r['address'] = address;
	new_r['grades'] = grades;
	//new_r['owner'] = req.session.username;

	//}else{
	//	console.log("With photo");
		//var filename = req.files.sampleFile.name;
		//var sampleFile = req.files.sampleFile;	
    	//new_r['photo'] = req.files.sampleFile.data.toString('base64');		
	//	new_r['photoMimetype'] = req.files.sampleFile.mimetype;
	//	new_r['address'] = address;
	//	new_r['grades'] = grades;
	new_r['owner'] = req.body.user;
		/*sampleFile.mv(__dirname + '/public/'+filename, function(err) {
			if (err)
			  return console.log(err);
			});*/

		//console.log(req.files.sampleFile.data);
		//console.log(req.files);
	//console.log(new_r);
	details = new_r;
	if(new_r['owner']=="" || new_r['name']==""){
		var js = {};
		js["status"] = "failed"; 
		//var json = JSON.stringify({"status": "failed"});
		//var jsonstr = JSON.stringify(json);
		//res.status(200).send(re);
		res.writeHead(200, {"Content-Type":"application/json"});
		res.end(JSON.stringify(js));
	}else{
		create2(res, new_r, function(result){
		var re = {};
	//	var status = "failed";
		//result.result.ok == 0;
	//	if(result.result.ok == 1){
	//		status = "ok";
	//		re["status"] = status;
	//		re["_id"] = result.insertedId;
	//	}else{
	//		re["status"] = status;
	//	}
		var js = {};
		js["status"] = "ok"; 
		js["_id"] = result.insertedId; 
		//var json = JSON.stringify({status: "ok", _id: result.insertedId});
		res.writeHead(200, {"Content-Type":"application/json"});
		console.log(result.result.ok);
		
		//var jsonstr = JSON.stringify(json);
		//res.status(200).send(re);
		res.end(JSON.stringify(js));
		//res.redirect('/display');
		});
	}

	//res.status(200).send(result);
	//res.status(200).end();
	//console.log(address);
	//console.log(coord);
	
});

app.post('/create',function(req,res) {
	
	var new_r = {};
	var address = {};
	var grades = [];
	var coord = [];
	new_r['name'] = req.body.name;
	abc = req.body.name;
	new_r['borough'] = (req.body.borough.length > 0) ? req.body.borough : "Not offered";
	new_r['cuisine'] = (req.body.cuisine.length > 0) ? req.body.cuisine : "Not offered";
	address['street'] = (req.body.street.length > 0) ? req.body.street : "Not offered";
	address['building'] = (req.body.building.length > 0) ? req.body.building : "Not offered";
	address['zipcode'] = (req.body.zipcode.length > 0) ? req.body.zipcode : "Not offered";
	coord.push((req.body.lon.length > 0) ? req.body.lon : "Not offered");
	coord.push((req.body.lat.length > 0) ? req.body.lat : "Not offered");
	address['coord'] = coord;
	
	//console.log("hello: "+req.session.username);

	if (isEmpty(req.files)){
		console.log('No photo were uploaded.');
		new_r['photo'] = "Not offered";		
		new_r['photoMimetype'] = "Not offered";
		new_r['address'] = address;
		new_r['grades'] = grades;
		new_r['owner'] = req.session.username;

	}else{
		console.log("With photo");
		//var filename = req.files.sampleFile.name;
		var sampleFile = req.files.sampleFile;	
    	new_r['photo'] = req.files.sampleFile.data.toString('base64');		
		new_r['photoMimetype'] = req.files.sampleFile.mimetype;
		//if(new_r['photoMimetype'].includes("image")){
		//			new_r['photoMimetype'] = req.files.sampleFile.mimetype;
		//}else{
		//		new_r['photoMimetype'] = "";
		//}
		new_r['address'] = address;
		new_r['grades'] = grades;
	 	new_r['owner'] = req.body.owner;
		/*sampleFile.mv(__dirname + '/public/'+filename, function(err) {
			if (err)
			  return console.log(err);
			});*/
	}
		//console.log(req.files.sampleFile.data);
		//console.log(req.files);
	//console.log(new_r);
	details = new_r;
	create(res, new_r, function(result){
		console.log("done");
	});
	
	//console.log(address);
	//console.log(coord);
	//res.redirect('/new');
});

//function
function findAll(res,criteria,max, callback) {
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		findAllRest(db,criteria,max,function(restaurants) {
			db.close();
			console.log('Disconnected MongoDB\n');
			callback(restaurants);
		}); 
	});
}

function findAllRest(db,criteria,max,callback) {
	var restaurants = [];
	if (max > 0) {
		cursor = db.collection('restaurants').find(criteria).limit(max); 		
	} else {
		cursor = db.collection('restaurants').find(criteria); 				
	}
	cursor.each(function(err, doc) {
		assert.equal(err, null); 
		if (doc != null) {
			restaurants.push(doc);
		} else {
			callback(restaurants); 
		}
	});
}

function updateRest(res, new_r, id, callback) {
	console.log('About to update ' + JSON.stringify(id));
	//console.log(gd);
	MongoClient.connect(mongourl,function(err,db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		updateRestaurant(db,id, new_r, function(result) {
			db.close();
			//console.log(result.result.n);
			callback(result);
		});
	});
}

function updateRestaurant(db,id, new_r, callback) {
	db.collection('restaurants').updateOne({_id: ObjectId(id)},{ $set:  new_r}, function(err,result) {
		assert.equal(err,null);
		console.log("Update was successfully");
		callback(result);
	});
}

function updateR(res, gd, id, callback) {
	console.log('About to update ' + JSON.stringify(id));
	console.log(gd);
	MongoClient.connect(mongourl,function(err,db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		updateRate(db,id, gd, function(result) {
			db.close();
			//console.log(result.result.n);
			callback(result);
		});
	});
}

function updateRate(db,id, gd, callback) {
	db.collection('restaurants').updateOne({_id: ObjectId(id)},{ $set: { "grades": gd } }, function(err,result) {
		assert.equal(err,null);
		console.log("Update was successfully");
		callback(result);
	});
}

function findOwner(res,id, callback) {
	//var o = '';
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		findRestaurants(db,id, function(result) {
			db.close();
			console.log('Disconnected MongoDB\n');
			//console.log(result.owner);
			callback(result);
		}); 
	});
}

function findRestaurants(db,id,callback) {
	db.collection('restaurants').findOne({_id: ObjectId(id)},function(err,result) {
		assert.equal(err,null);
		console.log("Find was successfully");
		callback(result);
	});
}

function remove(res,id, callback) {
	console.log('About to delete ' + JSON.stringify(id));
	MongoClient.connect(mongourl,function(err,db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		deleteRestaurant(db,id, function(result) {
			db.close();
			console.log(result.result.n);
			callback(result.result.n);
		});
	});
}

function deleteRestaurant(db,id, callback) {
	db.collection('restaurants').deleteOne({_id: ObjectId(id)},function(err,result) {
		assert.equal(err,null);
		console.log("Delete was successfully");
		callback(result);
	});
}

function displayRestaurant(res, id, callback) {
	var result = {};
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		db.collection('restaurants').findOne({_id: ObjectId(id)},function(err, doc) {				
				assert.equal(err,null);
				db.close();
				result = doc;
				console.log('Disconnected from MongoDB\n');
				//console.log(result);
				callback(result);
		});
	});
	//console.log(result);	
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

function create2(res, new_r, callback) {
	//console.log('About to insert: ' + JSON.stringify(new_r));
	MongoClient.connect(mongourl, function(err,db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		insertRestaurant(db,new_r,function(result) {
			db.close();
			//console.log(JSON.stringify(result));
			//console.log(JSON.stringify(new_r));
			console.log("\ninsert was successful!");
			console.log('Uploaded!');

			callback(result);		
		});
	});
}

function create(res, new_r, callback) {
	//console.log('About to insert: ' + JSON.stringify(new_r));
	MongoClient.connect(mongourl, function(err,db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		insertRestaurant(db,new_r,function(result) {
			db.close();
			//console.log(JSON.stringify(result));
			//console.log(JSON.stringify(new_r));
			console.log("\ninsert was successful!");
			console.log('Uploaded!');
			res.redirect('/create');
			callback(result);		
		});
	});
}

function insertRestaurant(db,r,callback) {
	db.collection('restaurants').insertOne(r,function(err,result) {
		assert.equal(err,null);
		console.log("Insert was successful!");
		callback(result);
	});
}

function confirm_user(req, res, criteria, max) {
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		findUser(db,criteria,max,function(users) {
			db.close();
			console.log('Disconnected MongoDB\n');
			console.log(users);
			if (users.length == 0) {
				console.log("No that user");
				res.redirect('/login');
			} else {
				if (users[0].user.id == req.body.name &&
					users[0].user.password == req.body.password) {
					req.session.authenticated = true;
					req.session.username = users[0].user.id;
					res.redirect('/read');
					console.log(req.session.username);
				}else{
					res.redirect('/login');
				}
				//console.log("user: "+users[0].user.id);
				//console.log("user: "+users[0].user.password);
			}
			return(users);
		}); 
	});
}

function findUser(db,criteria,max,callback) {

	if (max > 0) {
		cursor = db.collection('user').find(criteria).limit(max); 		
	} else {
		cursor = db.collection('user').find(criteria); 				
	}
	cursor.each(function(err, doc) {
		assert.equal(err, null); 
		if (doc != null) {
			users.push(doc);
		} else {
			callback(users); 
		}
	});
}


app.listen(app.listen(process.env.PORT || 8099));

