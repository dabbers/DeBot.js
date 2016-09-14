
var request = require('request');
var url = require("url");

var DeBot = require('../core/Module');

var Urls = {
	'www.youtube.com': [getYoutubeLabel, function(parse) { return parse.query.v; } ],
	'youtube.com': [getYoutubeLabel, function(parse) { return parse.query.v; } ],
	'youtu.be': [getYoutubeLabel, function(parse) { return parse.pathname.substring(1); } ],
	'www.youtu.be': [getYoutubeLabel, function(parse) { return parse.pathname.substring(1); } ],
	'www.imdb.com': [getImdbLabel, function(parse) { return parse.pathname.split('/')[2]; } ],
	'imdb.com': [getImdbLabel, function(parse) { return parse.pathname.split('/')[2]; } ],
	'open.spotify.com': [getSpotifyLabel, function(parse) { var pths = parse.pathname.split('/'); if (pths[1] == 'track') return pths[2]; } ],
	'vimeo.com': [getVimeoLabel, function(parse) { return parse.pathname.substring(1); } ],
	'www.vimeo.com': [getVimeoLabel, function(parse) { return parse.pathname.substring(1); } ],
	'music.microsoft.com' : [getGrooveMusic, function(parse) { return parse.pathname.split('/')[2] } ],
};




// Tests
/*createlabel({"Parts":["", "", "", ":https://www.youtube.com/watch?v=PMu9G8vovZc"]});
createlabel({"Parts":["", "", "", ":https://youtu.be/PMu9G8vovZc"]});
createlabel({"Parts":["", "", "", ":https://youtu.be/PMu9G8vovZc?t=3s"]});
createlabel({"Parts":["", "", "", ":https://www.youtube.com/watch?t=3s&v=PMu9G8vovZc"]});
createlabel({"Parts":["", "", "", ":https://youtube.com/watch?v=PMu9G8vovZc"]});
createlabel({"Parts":["", "", "", ":https://open.spotify.com/track/6f3slULfHE3new2P0uALKS"]});
createlabel({"Parts":["", "", "", ":http://www.imdb.com/title/tt2975590/?ref_=hm_hp_cap_pri_1&pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=2395419482&pf_rd_r=021HV1X3CZ5W2VXDJKSJ&pf_rd_s=hero&pf_rd_t=15061&pf_rd_i=homepage"]});
createlabel({"Parts":["", "", "", ":http://www.imdb.com/title/tt0944947/?ref_=hm_hp_cap_pri_3&pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=2395419482&pf_rd_r=021HV1X3CZ5W2VXDJKSJ&pf_rd_s=hero&pf_rd_t=15061&pf_rd_i=homepage "]});
createlabel({"Parts":["", "", "", ":http://www.imdb.com/title/tt0944947/episodes?season=3&ref_=tt_eps_sn_3"]});
createlabel({"Parts":["", "", "", ":http://www.imdb.com/title/tt3514324/?ref_=fn_al_tt_1"]});
createlabel({"Parts":["", "", "", ":http://imdb.com/title/tt3514324/?ref_=fn_al_tt_1"]});
createlabel({"Parts":["", "", "", ":https://vimeo.com/3568757"]}, function(d) { console.log(d);});
createlabel({"Parts":["", "", "", ":https://music.microsoft.com/Track/4CC5C009-0100-11DB-89CA-0019B92A3933"]}, function(d) { console.log(d);});
createlabel({"Parts":["", "", "", ":https://music.microsoft.com/Track/30100-11DB-89CA-0019B92A3933"]}, function(d) { console.log(d);});
createlabel({"Parts":["", "", "", ":https://music.microsoft.com/Album/37C5C009-0100-11DB-89CA-0019B92A3933"]}, function(d) { console.log(d);});
translateSpotify("The Lonley Island", "Trip to Spain", "Popstar: Never Stop Never Stopping", function(d) { console.log(d); } );
*/



function createlabel(ircMsg, cb) {

	parseAndExecute(ircMsg.Parts[3].substring(1), cb);

	for(var i = 4; i < ircMsg.Parts.length; i++) {

		parseAndExecute(ircMsg.Parts[i], cb);

	}
}

function parseAndExecute(ur, cb) {
		if (ur.substring(0,4) == "http") {

			var uri = url.parse(ur, true);
			//console.log(uri);

			if (Urls[uri.host]) {
				console.log('matched');
				Urls[uri.host][0](Urls[uri.host][1](uri), cb || function(res) { console.log(res);});
			}
		}
}

function getYoutubeLabel(video_id, respCb) {
    const host = "https://www.googleapis.com/";
    const type = "youtube";
    const version = "v3";

    const urlHost = "https://www.googleapis.com/youtube/v3/videos?part=statistics%2Csnippet%2CcontentDetails";

    var durationRegex = /PT(((\d{0,})H)*((\d{0,})M)*((\d{0,})S)*)/

    request.get({
        'url': urlHost + "&id=" + video_id + "&key=" + Core.config.Modules.Titles.YouTube,
    }, function(response, body, callback) {



    	body.body = JSON.parse(body.body);
    	var response = "[You0,4Tube] ";

    	if (body.body.items.length != 0) {


	    	response += body.body.items[0].snippet.title + " ";


	    	response += " by " + body.body.items[0].snippet.channelTitle;



	    	// 3: Hours
	    	// 5: minutes
	    	// 7: seconds
	    	var rg = durationRegex.exec(  body.body.items[0].contentDetails.duration);

	    	response += " [View count: " + body.body.items[0].statistics.viewCount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "]";

	    	response += " [" +
	    		 (rg[3] ? " " + (rg[3] < 10?"0":"") + parseInt(rg[3]) : "00") + 
	    		 (rg[5] ? ":" + (rg[5] < 10?"0":"") + parseInt(rg[5]) : ":00") + 
	    		 (rg[7] ? ":" + (rg[7] < 10?"0":"") + parseInt(rg[7]) : ":00") + "]";
    		respCb(response);

    	}


	});

}

function getSpotifyLabel(video_id, respCb) {

	var spotify_host = "https://api.spotify.com/v1/tracks/";



    request.get({
        'url': spotify_host + video_id,
    }, function(response, body, callback) {

    	var response = "[10Spotify] ";

    	body.body = JSON.parse(body.body);
    	if (! body.body.error) {
    		console.log(body.body);
	    	response += body.body.name;
	    	response += " by " + body.body.artists.map(function(artist) { return artist.name; }).join(", ");
	    	response += " [" + toHHMMSS( parseInt(body.body.duration_ms/1000)) + "]";  
    		respCb(response);  		
    	}



	});	
}

function getVimeoLabel(video_id, respCb) {
	var vimeo_host = "https://api.vimeo.com/videos/"; 
		
	var auth_token = "https://api.vimeo.com/oauth/authorize/client?grant_type=client_credentials";
	
    request.post({
        'url': auth_token,
		headers: {
			'Authorization': 'basic ' + Core.config.Modules.Titles.Vimeo
		}
    }, function(response, bdy, callback) {
		bdy.body = JSON.parse(bdy.body);
		
		request.get({
			'url': vimeo_host + video_id,
			headers: {
				'Authorization': 'Bearer ' + bdy.body.access_token
			}
		}, function(response, body, callback) {

			var response = "[vimeo] ";

			body.body = JSON.parse(body.body);
			
			if (! body.body.error) {
				response += body.body.name;
				response += " by " + body.body.user.name;
				response += " [" + toHHMMSS(body.body.duration) + "]"; 
				response += " [View count: " + body.body.stats.plays.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "]";
				
				respCb(response);  		
			}



		});	
	});	
	
}

function toHHMMSS(v) {
    var sec_num = parseInt(v, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

function getImdbLabel(video_id, respCb) {

	const imdb_host = "http://www.omdbapi.com/?plot=short&r=json&i=";


    request.get({
        'url': imdb_host + video_id,
    }, function(response, body, callback) {

    	var response = "1,8[IMDb] ";

    	body.body = JSON.parse(body.body);

    	if (body.body.Response == "True") {
	    	response += body.body.Title;

	    	response += " (" + body.body.Year + ")";

			response += " Rated: " + body.body.Rated;

	    	response += " Rating: " + body.body.imdbRating;

	    	response += " Votes: " + body.body.imdbVotes;

    		respCb(response);
    	}



	});

}

function getGrooveMusic(video_id, respCb) {
	//datamarket authentication endpoint, must be https
	var service = "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13";

	//the clientId from step 5
	var clientId = "dabot_irc_api";

	//the secret from step 5
	var clientSecret = Core.config.Modules.Titles.Groove;
	var scope = "http://music.xboxlive.com";
    var grantType = "client_credentials";

	var postdata = { "client_id" : clientId,  "client_secret" : clientSecret, "scope" : scope, "grant_type" : grantType };

	request.post( { url: service, form: postdata }, function(err,httpResponse,body) {
		var at = encodeURIComponent(JSON.parse(body).access_token);

		var url = "https://music.xboxlive.com/1/content/music." + video_id + "/lookup?accessToken=Bearer+" + at

		request.get( {url: url },function(e,h,b) {
			var re =  JSON.parse(b);
			if (!re.Error && re.Tracks) {
				var bb = re.Tracks.Items[0];
				
				var response = "[4,0Groove] ";
				var artist = bb.Artists.map(function(artist) { return artist.Artist.Name; }).join(", ");

				response += bb.Name;
				response += " by " + artist;
				response += " [" + bb.Duration + "]";  
				respCb(response);
				translateSpotify(artist, bb.Name, bb.Album.Name, respCb);
			}  	
		});

	});


}



function translateSpotify(artist, title, album, respCb) {
	var vimeo_host = "https://api.spotify.com/v1/search"; 	
	var auth_token = "https://api.vimeo.com/oauth/authorize/client?grant_type=client_credentials";

	request.get({
		'url': vimeo_host + "?q=" + encodeURIComponent(title)  + "&type=track",
	}, function(response, body, callback) {
		var jsbody = JSON.parse(body.body);

		var items = jsbody.tracks.items;

		items.map(function(item) {
			if (item.album.name == album) {
				var anyArtists = item.artists.map(function(art) { return art.name == artist; })

				if (anyArtists.length > 0) {
					var url = item.external_urls.spotify;

					var response = "[10Spotify] " + url;
					respCb(response)
				}
			}
			} );
	});	
}

var _group = undefined;

module.exports = new (DeBot.module(function (bot, group) {
	if (bot) {
		throw "This module can only be used by a BotGroup";
	}
	
	_group = group;

	group.on('OnPrivmsg', function(svr, msg) {

		if (!group.botIsExecutor(svr.alias, _group.passer.alias, svr.Channels[msg.Parts[2]] || {"isChannel":false, "Display":msg.Parts[2]})) {
		    return;
		}

		var tmpBot = _group.passer;
		
		createlabel(msg, function(response) {
		
			tmpBot.say(svr.alias, msg.Parts[2], response);
		});
	});
}))();