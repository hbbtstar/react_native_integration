/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useRef, useState, useEffect} from 'react';
import {
  AppState,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {ParselyTracker} from './ParselyTracker';

const App = (props) => {
  const [tracker, setTracker] = useState(
    new ParselyTracker('elevatedtoday.com'),
  );
  const trackPageView = (url) => {
    tracker.trackPageView(url);
  };


  // Make sure to add and remove listeners to make sure event queue flushes on every state change and videos always pause (if applicable)
  useEffect(() => {
    AppState.addEventListener('change', flushQueueOnStateChange);

    return () => {
      AppState.removeEventListener('change', flushQueueOnStateChange);
    };
  }, []);

  const flushQueueOnStateChange = (nextAppState) => {
    tracker.flushQueue();
    tracker.trackPause();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <Header />
          <Button
            title={'Track Page View'}
            onPress={() => {
              tracker.trackPageView('https://www.foo.com');
            }}
          />

          <Button
            title={'Start Video'}
            onPress={() => {
              tracker.trackPlay('video_id_12345', '', {
                title: 'Example Video',
              });
            }}
          />
          <Button title={'Pause Video'} onPress={() => tracker.trackPause()} />
          <Button title={'Reset Video State'} onPress={() => tracker.resetVideo()}/>
          <Button
            title={'Flush Event Queue'}
            onPress={() => tracker.flushQueue()}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
