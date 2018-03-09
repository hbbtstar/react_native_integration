const { Dimensions, Platform } = require('react-native');

const uuidv4 = require('uuid/v4');

class ParselyTracker {
    constructor(apikey, appname) {
        this.apikey = apikey;
        // if you wanted to get a persistent uuid you could use the native Android or iOS methods for that (like android's getAdKey)
        this.parsely_site_uuid = uuidv4();
        this.rootUrl = "http://srv.pixel.parsely.com/mobileproxy";
        this.os = Platform.OS;
        this.urlref = "parsely_mobile_sdk";
        this.os_version = Platform.Version;
        this.manufacturer = Platform.OS === 'ios' ? "Apple" : "Android";
        this.appname = "Sample Parsely React App";
    };

    sendAction(url) {
        let fullUrl = this.rootUrl;
        let params = {
            "data": {
                "os_version": this.os_version,
                "os": this.os,
                "idsite": this.apikey,
                "manufacturer": this.manufacturer,
                "appname": this.appname,
                "parsely_site_uuid": this.parsely_site_uuid,
                "urlref": this.urlref
            },
            "events": [
                {
                    "url": url,
                    "ts": new Date().getTime()
                }
            ]
        };
        fetch(fullUrl, {
           method: 'POST',
           headers: {
               "Content-Type": "application/x-www-form-urlencoded"
           },
            body:
                JSON.stringify(
                    {
                        "rqs": params
                    }

            )
        }).then(
            (response) => console.log(response)
        ).catch(
            (error) => console.log(error)
        );




    }
}

export { ParselyTracker };