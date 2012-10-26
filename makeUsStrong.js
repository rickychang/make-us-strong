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

function extractStrengthener(hostname) {
    var strengthener = null;
    if (hostname) {
        strengthener = hostname.split(":")[0].split(".")[0].replace(/-/g," ").toUpperCase()
    }
    return strengthener;
}

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

function shouldRedirect(whatMakesUsStrong, domain) {
    return isNounPlural(whatMakesUsStrong) != isDomainPlural(domain)
}


 
http.createServer(function (httpRequest, httpResponse) {
    var captions = extractCaptions(httpRequest.headers.host);
    if (captions) {
        var caption1 = captions[0];
        var caption2 = captions[1];
        if (!caption1 || !caption2 || caption2 == "com") {
            caption1 = randomStrengthener[Math.floor(Math.random() * randomStrengthener.length)];
            var randomRedirectURL = "http://" + caption1 + ".";
                if (isNounPlural(caption1)) {
                    randomRedirectURL = randomRedirectURL + pluralDomain + ".com";
                }
                else {
                    randomRedirectURL = randomRedirectURL + singularDomain + ".com";
                }
                httpResponse.writeHead(302, {
                    'Location': randomRedirectURL
                });
                httpResponse.end();
        }
        else {
            if (shouldRedirect(caption1, caption2)) {
                var redirectURL = "http://" + caption1 + ".";
                if (isNounPlural(caption1)) {
                    redirectURL = redirectURL + pluralDomain + ".com";
                }
                else {
                    redirectURL = redirectURL + singularDomain + ".com";
                }
                httpResponse.writeHead(302, {
                    'Location': redirectURL
                });
                httpResponse.end();
            }
            else {
                caption1 = caption1.replace(/-/g, " ").toUpperCase();
                caption2 = caption2.replace(/-/g, " ").toUpperCase()
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
                            httpResponse.write('<title>' + caption1 + ' ' + caption2 + '</title>');
                            httpResponse.write('</head><body bgcolor="#000000">');
                            httpResponse.write('<div style="position: absolute; top: 50%; left: 0px; width: 100%; height: 1px; overflow: visible;">');
                            httpResponse.write('<div style="width: 500px; height: 500px; margin-left: -250px; position: absolute; top: -300px; left: 50%;">');
                            httpResponse.write('<img src="' + memeImageURL + '" height="500" width="500"/>');
                            httpResponse.write('<p><a style="font-size: 16pt; color: white" href="' + "javascript:(function()%7Bvar%20strengthener%20%3D%20prompt(%22What%20will%20make%20us%20strong%3F%22)%3Bvar%20newLocation%20%3D%20window.location.host.split('.')%3Bconsole.log(newLocation)%3Bconsole.log(strengthener)%3BnewLocation%5B0%5D%20%3D%20strengthener.replace(%2F%20%2Fg%2C'-')%3Bconsole.log(%22http%3A%2F%2F%22%20%2B%20newLocation.join('.'))%3Bwindow.open(%22http%3A%2F%2F%22%20%2B%20newLocation.join('.'))%7D)()" + '">' + 'Respond to the Pakled hail?' + '</a></p>');
                            httpResponse.write('<p><a style="font-size: 16pt; color: white" href="' + "http://en.memory-alpha.org/wiki/Pakled" + '">' + 'What?' + '</a></center></p>');
                            httpResponse.write('<p><a href="https://twitter.com/share" class="twitter-share-button" data-size="large" data-count="none" data-hashtags="makeusstrong">Tweet</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script></p>');
                            httpResponse.write('<audio src="' + randSound + '" autoplay="true" autobuffer></audio>');
                            httpResponse.write('</body></div></div></html>');
                            httpResponse.end();
                    }
                    else {
                        console.log(error);
                        console.log(httpResponse.statusCode);
                    }
                });            
            }
        }
    }
}).listen(8125)
