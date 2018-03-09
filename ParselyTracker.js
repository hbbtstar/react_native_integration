const { Dimensions } = require('react-native');

const uuidv4 = require('uuid/v4');

class ParselyTracker {
    constructor(apikey) {
        this.apikey = apikey;
        // if you wanted to get a persistent uuid you could use the native Android or iOS methods for that (like android's getAdKey)
        this.data = JSON.stringify({"parsely-site-id": uuidv4()});
        // you'd want to get the public IP here via some other means if that matters to you
        this.ip_address = "0.0.0.0";
        this.rootUrl = "http://srv.pixel.parsely.com/plogger/";
        this.ua = "Parsely mobileproxy";
    };

    static getScreenParsely() {
        let height = Dimensions.get("window").height;
        let width = Dimensions.get("window").width;
        let screenString = height + "x" + width;
        return screenString + "|" + screenString + "|" + "24";
    };

    sendAction(url) {
        let fullUrl = this.rootUrl + "?idsite=" + this.apikey;
        fullUrl += "&date=" + new Date().toString();
        fullUrl += "&ip_address" + this.ip_address;
        fullUrl += "&url=" + url;
        fullUrl += "&urlref=" + "";
        fullUrl += "&screen=" + ParselyTracker.getScreenParsely();
        fullUrl += "&action=" + "pageview";
        fullUrl += "&data=" + this.data;

        let headers = {"User-Agent": this.ua};
        console.log("URL request being sent is: "  + fullUrl);
        fetch(encodeURI(fullUrl), {
         headers: headers
        }).then(
            (response) => console.log(response)
        ).catch(
            (error) => console.log(error)
        );



    }
}

export { ParselyTracker };