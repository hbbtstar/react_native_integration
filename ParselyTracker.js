const { NetInfo, Platform, AsyncStorage } = require('react-native');

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
        this.appname = appname;
        this.queue_prefix = "ParselyReactEvents";
    };

    async send() {
        NetInfo.isConnected.fetch().then(
            async (isConnected) => {
                if (isConnected) {
                    let fullUrl = this.rootUrl;
                    let params = {
                        "data": {
                            "idsite": encodeURIComponent(this.apikey),
                            "parsely_site_uuid": encodeURIComponent(this.parsely_site_uuid),
                            "os": encodeURIComponent(this.os),
                            "os_version": encodeURIComponent(this.os_version),
                            "manufacturer": encodeURIComponent(this.manufacturer),
                            "appname": encodeURIComponent(this.appname)
                        }
                    };

                    params.events = JSON.parse(await AsyncStorage.getItem(this.queue_prefix));

                    fetch(fullUrl, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: "rqs=" + JSON.stringify(params)
                    }).then(
                        async (response) => {
                            console.log(response);
                            await AsyncStorage.removeItem(this.queue_prefix);
                        }
                    ).catch(
                        (error) => console.log(error)
                    );
                }
            }
        );
    }

    trackURL(url) {
        let event = {
            "url": encodeURIComponent(url),
            "ts": (new Date().getTime() / 1000)
        };

        this.pushToQueue(event).then(
            (result) => console.log("added successfully!")
        );

    }

    async pushToQueue(event) {
        let queue = await AsyncStorage.getItem(this.queue_prefix);
        let eventQueue = await JSON.parse(queue) || [];

        eventQueue.push(event);
        await AsyncStorage.setItem(this.queue_prefix, JSON.stringify(eventQueue));
        if (eventQueue.length >= 10) {
            this.send();
        }
    }
}



export { ParselyTracker };