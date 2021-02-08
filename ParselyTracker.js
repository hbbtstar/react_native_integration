import {getDeviceId, isEmulator} from 'react-native-device-info';

const {Dimensions, Platform} = require('react-native');

const uuidv4 = require('uuid/v4');

class ParselyTracker {
  constructor(apikey, appname, use_device_id = true) {
    this.apikey = apikey;
    this.parsely_site_uuid = use_device_id ? getDeviceId() : uuidv4();
    this.rootUrl = 'http://srv.pixel.parsely.com/mobileproxy';
    this.os = Platform.OS;
    this.os_version = Platform.Version;
    this.manufacturer = Platform.OS === 'ios' ? 'Apple' : 'Android';
    this.appname = 'Sample Parsely React App';
    this.eventQueue = [];
    this.insideEmulator = isEmulator();
    this.engagedStartTime = null;
    this.lastVideoPaused = null;
  }

  enqueueEvent(url, urlRef, action, metadata = null, extraData = null) {
    let parselyEvent = {
      url: url,
      urlref: urlRef,
      idsite: this.apikey,
      action: action,
    };
    if (metadata) {
      parselyEvent.metadata = metadata;
    }
    if (extraData) {
      parselyEvent.extraData = extraData;
    }
    this.eventQueue.push(parselyEvent);
    if (this.insideEmulator) {
      console.log('Event queued: ' + JSON.stringify(parselyEvent));
    }
  }

  flushQueue() {
    if (this.eventQueue.length === 0) {
      return;
    }
    let fullUrl = this.rootUrl;
    let params = {
      data: {
        idsite: encodeURIComponent(this.apikey),
        parsely_site_uuid: encodeURIComponent(this.parsely_site_uuid),
        os: encodeURIComponent(this.os),
        os_version: encodeURIComponent(this.os_version),
        manufacturer: encodeURIComponent(this.manufacturer),
        appname: encodeURIComponent(this.appname),
      },
      events: [this.eventQueue],
    };
    fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'rqs=' + JSON.stringify(params),
    })
      .then((response) => {
        if (this.insideEmulator) {
          console.log(response);
          console.log('Event queue flushed: ' + JSON.stringify(params));
        }

        this.eventQueue = [];
      })
      .catch((error) => console.log(error));
  }

  trackPageView(url, urlRef, urlMetadata, extraData) {
    this.enqueueEvent(url, urlRef, 'pageview', urlMetadata, extraData);
  }

  startEngagement(url, urlRef) {
    if (this.engagedStartTime) {
      console.log(
        'Warning: start engagement called while engagement timer already running. Please call stop engagement before starting a new engagement timer.',
      );
      return;
    }
    this.engagedStartTime = {url: url, urlRef: urlRef, startTime: Date.now()};
  }

  stopEngagement() {
    if (this.engagedStartTime === null) {
      return;
    }
    let inc = Date.now() - this.engagedStartTime.startTime;
    this.enqueueEvent({
      url: this.engagedStartTime.url,
      urlRef: this.engagedStartTime.urlRef,
      action: 'vheartbeat',
      inc: inc,
      tt: inc,
    });
    this.engagedStartTime = null;
  }

  trackPlay(url, urlRef, videoMetadata, extraData) {
    if (urlRef === null) {
      urlRef = '';
    }
    if (this.engagedStartTime) {
      // we're calling trackPlay when a video is already running: flush the original engaged time and start new
      this.stopEngagement();
    }
    this.startEngagement(url, urlRef);
    if (url !== this.lastVideoPaused) {
      this.enqueueEvent(url, urlRef, 'videostart', videoMetadata, extraData);
      this.lastVideoPaused = url;
    }
  }

  trackPause() {
    if (this.lastVideoPaused === null) {
      return;
    }
    this.stopEngagement();
  }

  resetVideo() {
    this.stopEngagement();
    this.engagedStartTime = null;
    this.lastVideoPaused = null;
  }
}

export {ParselyTracker};
