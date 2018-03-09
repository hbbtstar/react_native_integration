const { Dimensions, Platform } = require('react-native');

const uuidv4 = require('uuid/v4');

class ParselyTracker {
    constructor(apikey, appname) {
        this.apikey = apikey;
        // if you wanted to get a persistent uuid you could use the native Android or iOS methods for that (like android's getAdKey)
        this.parsely_site_uuid = uuidv4();
        this.rootUrl = "http://srv.pixel.parsely.com/mobileproxy";
        this.os = Platform.OS;
        this.os_version = Platform.Version;
        this.manufacturer = Platform.OS === 'ios' ? "Apple" : "Android";
        this.appname = "Sample Parsely React App";
    };

    sendAction(url) {
        let fullUrl = this.rootUrl;
        let params = {
            "data": {
                "idsite": encodeURIComponent(this.apikey),
                "parsely_site_uuid": encodeURIComponent(this.parsely_site_uuid),
                "os": encodeURIComponent(this.os),
                "os_version": encodeURIComponent(this.os_version),
                "manufacturer": encodeURIComponent(this.manufacturer),
                "appname": encodeURIComponent(this.appname)
            },
            "events": [
                {
                    "url": encodeURIComponent(url),
                    "ts": (new Date().getTime() / 1000)
                }
            ]
        };

        console.log(JSON.stringify(params));
        fetch(fullUrl, {
           method: 'POST',
           headers: {
               "Content-Type": "application/x-www-form-urlencoded"
           },
            body: "rqs=" + JSON.stringify(params)
        }).then(
            (response) => console.log(response)
        ).catch(
            (error) => console.log(error)
        );




    }
}

export { ParselyTracker };