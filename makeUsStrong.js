function makeUsStrong() {
    var strengthener = window.getSelection();
    if (!strengthener) {
        strengthener = prompt('What will make us strong?'); 
    }
    if (strengthener) {
        var memeGeneratorApiURL = 'http://version1.api.memegenerator.net/Instance_Create?username=pakledSOS&password=engage&languageCode=en&generatorID=1568864&imageID=6447360&text0=' + encodeURI(strengthener) + '&text1=makes%20us%20strong';
        var memeGeneratorRequest = new XMLHttpRequest();
        memeGeneratorRequest.onreadystatechange= function() {
            if (memeGeneratorRequest.readyState==4) {
                if (memeGeneratorRequest.status==200 || window.location.href.indexOf("http")==-1) {
                    var jsonResponse = JSON.parse(memeGeneratorRequest.response);
                    try {
                        memeInstanceURL = jsonResponse['result']['instanceImageUrl'];
                        if (memeInstanceURL) {
                            window.location = memeInstanceURL
                        }
                    }
                    catch (err) {
                        return;
                    }
                }
            }   
        }
        memeGeneratorRequest.open("GET", memeGeneratorApiURL, true);
        memeGeneratorRequest.send(null);
    }   
};
