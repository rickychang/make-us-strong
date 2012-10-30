var http = require('http');
var request = require('request')
var fs = require('fs');
var Mixpanel = require('mixpanel');
var natural = require('natural');

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

var randomStrengthener = ['shields', 'impulse-drive', 'warp-corp-breaches', 'www', 'kidnapping-your-chief-engineer', 'distress-signals'];

var mptoken = 'ef5b291edf26ff71635e429f774314aa';
var singularDomain = 'makes-us-strong';
var pluralDomain = 'make-us-strong';

var nounInflector = new natural.NounInflector();


var mixpanel = Mixpanel.init(mptoken);

function extractCaptions(hostname) {
    var captions = [];
    if (hostname) {
        captions = hostname.split(":")[0].split(".").slice(0,2);
	    }
    return captions;
}

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
}

function isNounPlural(whatMakesUsStrong) {
    return (nounInflector.singularize(whatMakesUsStrong) != whatMakesUsStrong);
}

function isDomainPlural(domain) {
    return (domain == pluralDomain)
}

function needsNounInflectionRedirect(whatMakesUsStrong, domain) {
    return isNounPlural(whatMakesUsStrong) != isDomainPlural(domain)
}

function needsRandomRedirect(whatMakesUsStrong, domain) {
    return !whatMakesUsStrong || !domain || domain == "com"
}

function redirect(response, whatMakesUsStrong) {
    var redirectURL = "http://" + whatMakesUsStrong + ".";
    if (isNounPlural(whatMakesUsStrong)) {
        redirectURL += pluralDomain + ".com";
    }
    else {
        redirectURL += singularDomain + ".com";
    }
    response.writeHead(302, {
        'Location': redirectURL
    });
    response.end();
}

// TODO: refactor this into multiple functions.  One for calling memegenerator API, another for actually writing response
// TODO: use some kind of node templating library here to avoid ugly res.write(...) calls
function handleRequest(req, res, caption1, caption2) {
    caption1 = caption1.replace(/-/g, " ").toUpperCase();
    caption2 = caption2.replace(/-/g, " ").toUpperCase();
    console.log(caption1 + " : " + new Date());
    logInMixPanel(caption1, req);
    var memeGeneratorApiURL = 'http://version1.api.memegenerator.net/Instance_Create?username=pakledSOS&password=engage&languageCode=en&generatorID=1568864&imageID=6447360&text0=' + encodeURI(caption1) + '&text1=' + encodeURI(caption2);
    var randSound = trekSounds[Math.floor(Math.random() * trekSounds.length)]
    request(memeGeneratorApiURL, function (error, memeResponse, body) {
        if (!error && memeResponse.statusCode == 200) {
                var memeImageURL = resizeImageURL(JSON.parse(body)['result']['instanceImageUrl'], 1200);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('<!DOCTYPE html><html lang="en"><head>');
                res.write('<meta charset="utf-8">');
                res.write('<title>' + caption1 + ' ' + caption2 + '</title>');
                res.write('</head><body bgcolor="#000000">');
                res.write('<div style="position: absolute; top: 50%; left: 0px; width: 100%; height: 1px; overflow: visible;">');
                res.write('<div style="width: 500px; height: 500px; margin-left: -250px; position: absolute; top: -300px; left: 50%;">');
                res.write('<img src="' + memeImageURL + '" height="500" width="500"/>');
                res.write('<p><a style="font-size: 16pt; color: white" href="' + "javascript:(function()%7Bvar%20strengthener%20%3D%20prompt(%22What%20will%20make%20us%20strong%3F%22)%3Bvar%20newLocation%20%3D%20window.location.host.split('.')%3Bconsole.log(newLocation)%3Bconsole.log(strengthener)%3BnewLocation%5B0%5D%20%3D%20strengthener.replace(%2F%20%2Fg%2C'-')%3Bconsole.log(%22http%3A%2F%2F%22%20%2B%20newLocation.join('.'))%3Bwindow.open(%22http%3A%2F%2F%22%20%2B%20newLocation.join('.'))%7D)()" + '">' + 'Respond to the Pakled hail?' + '</a></p>');
                res.write('<p><a style="font-size: 16pt; color: white" href="' + "http://en.memory-alpha.org/wiki/Pakled" + '">' + 'What?' + '</a></center></p>');
                res.write('<p><a href="https://twitter.com/share" class="twitter-share-button" data-size="large" data-count="none" data-hashtags="makeusstrong">Tweet</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script></p>');
                res.write('<audio src="' + randSound + '" autoplay="true" autobuffer></audio>');
                res.write('</body></div></div></html>');
                res.end();
        }
        else {
            console.log(error);
            console.log(res.statusCode);
        }
    });            
}

 
http.createServer(function (httpRequest, httpResponse) {
    // ignore favicon requests
    if (httpRequest.url === '/favicon.ico') {
        httpResponse.writeHead(200, {'Content-Type': 'image/x-icon'} );
        httpResponse.end();
        return;
    }
    var captions = extractCaptions(httpRequest.headers.host);
    if (captions) {
        var caption1 = captions[0];
        var caption2 = captions[1];
        if (needsRandomRedirect(caption1, caption2)) {
            caption1 = randomStrengthener[Math.floor(Math.random() * randomStrengthener.length)];
            redirect(httpResponse, caption1);
            return;
        }
        if (needsNounInflectionRedirect(caption1, caption2)) {
            redirect(httpResponse, caption1);
            return;
        }
        else {
            handleRequest(httpRequest, httpResponse, caption1, caption2);
        }
    }
}).listen(8125)
