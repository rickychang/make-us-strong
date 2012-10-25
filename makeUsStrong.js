var http = require('http');
var request = require('request')
var fs = require('fs');


function extractStrengthener(hostname) {
    var strengthener = null;
    if (hostname) {
        strengthener = hostname.split(":")[0].split(".")[0].replaceAll(/-/g," ").toUpperCase()
    }
    return strengthener;
};

 
http.createServer(function (httpRequest, httpResponse) {
    var whatMakesUsStrong = extractStrengthener(httpRequest.headers.host)
    if (whatMakesUsStrong) {
        console.log(whatMakesUsStrong);
        var memeGeneratorApiURL = 'http://version1.api.memegenerator.net/Instance_Create?username=pakledSOS&password=engage&languageCode=en&generatorID=1568864&imageID=6447360&text0=' + encodeURI(whatMakesUsStrong) + '&text1=makes%20us%20strong';
        request(memeGeneratorApiURL, function (error, memeResponse, body) {
            if (!error && memeResponse.statusCode == 200) {
                    var memeImageUrl = JSON.parse(body)['result']['instanceImageUrl']
                    httpResponse.writeHead(200, { 'Content-Type': 'text/html' });
                    httpResponse.write('<!DOCTYPE html><html lang="en"><head>');
                    httpResponse.write('<meta charset="utf-8">');
                    httpResponse.write('<title>' + whatMakesUsStrong + ' MAKES US STRONG</title>');
                    httpResponse.write('</head><body bgcolor="#000000">');
                    httpResponse.write('<img src="' + memeImageUrl + '"/>');
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
