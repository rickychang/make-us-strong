var http = require('http');
var request = require('request')
var fs = require('fs');
var Mixpanel = require('mixpanel');

var trekSounds = [
'http://www.trekcore.com/audio/computer/sequences/astrometrics_controls.mp3',
'http://www.trekcore.com/audio/computer/hailbeep_clean.mp3', 
'http://www.trekcore.com/audio/computer/computerbeep_69.mp3', 
'http://www.trekcore.com/audio/computer/computerbeep_37.mp3',
'http://www.trekcore.com/audio/computer/computer_work_beep.mp3',
'http://www.trekcore.com/audio/computer/processing2.mp3',
'http://www.trekcore.com/audio/computer/scrscroll2.mp3',
'http://www.trekcore.com/audio/computer/sequences/tactical_beep_sequence.mp3'
];

var mptoken = 'ef5b291edf26ff71635e429f774314aa';

var mixpanel = Mixpanel.init(mptoken);

function extractStrengthener(hostname) {
    var strengthener = null;
    if (hostname) {
        strengthener = hostname.split(":")[0].split(".")[0].replace(/-/g," ").toUpperCase()
    }
    return strengthener;
};

function extractCaptions(hostname) {
    var captions = [];
    if (hostname) {
        captions = hostname.replace(/-/g, " ").toUpperCase().split(":")[0].split(".").slice(0,2);
	    }
    return captions;
};

function resizeImageURL(imageURL, width) {
    return imageURL.replace(/400x/, width + 'x');
}

function logInMixPanel(whatMakesUsStrong, httpRequest) {
    var remoteIp = httpRequest.headers['x-forwarded-for'];
    if (!remoteIp) {
        remoteIp = httpRequest.connection.remoteAddress;
    }
    mixpanel.track("view", {
        distinct_id: remoteIp,
        strengthener: whatMakesUsStrong
    });
};
 
http.createServer(function (httpRequest, httpResponse) {
    var captions = extractCaptions(httpRequest.headers.host);
    if (captions) {
        var caption1 = captions[0];
        var caption2 = captions[1];
        console.log(caption1 + " : " + new Date());
        logInMixPanel(caption1, httpRequest);
        var memeGeneratorApiURL = 'http://version1.api.memegenerator.net/Instance_Create?username=pakledSOS&password=engage&languageCode=en&generatorID=1568864&imageID=6447360&text0=' + encodeURI(caption1) + '&text1=' + encodeURI(caption2);
        var randSound = trekSounds[Math.floor(Math.random() * trekSounds.length)]
        request(memeGeneratorApiURL, function (error, memeResponse, body) {
            if (!error && memeResponse.statusCode == 200) {
                    var memeImageURL = resizeImageURL(JSON.parse(body)['result']['instanceImageUrl'], 1200);
                    httpResponse.writeHead(200, { 'Content-Type': 'text/html' });
                    httpResponse.write('<!DOCTYPE html><html lang="en"><head>');
                    httpResponse.write('<meta charset="utf-8">');
                    httpResponse.write('<title>' + caption1 + ' ' + caption2 + ' MAKES US STRONG</title>');
                    httpResponse.write('</head><body bgcolor="#000000">');
                    httpResponse.write('<img src="' + memeImageURL + '"/>');
                    httpResponse.write('<audio src="' + randSound + '" autoplay="true" autobuffer></audio>');
                    httpResponse.write('</body></html>');
                    httpResponse.end();
            }
            else {
                console.log(error);
                console.log(httpResponse.statusCode);
            }
        });
    }
}).listen(8125);
