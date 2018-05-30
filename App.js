import React from 'react';
import { StyleSheet, Text, View, Platform, StatusBar, AppState } from 'react-native';
import ListScreen from './components/screens/list/ListScreen';
import MapScreen from './components/screens/map/MapScreen';
import { createMaterialTopTabNavigator } from 'react-navigation';
import { SafeAreaView } from 'react-navigation'

const MainNavigation = createMaterialTopTabNavigator({
  List: ListScreen,
  Map: MapScreen
},
  {
    tabBarOptions: {
      activeTintColor: 'white',
      inactiveTintColor: 'darkgrey',
      labelStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      },
      style: {
        backgroundColor: 'grey',
        paddingTop: StatusBar.currentHeight
      },
    }
  });


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leds: props.leds,
      isLoadingFromServer: false,
      message: ' '
    }
  }

  render() {
    var comp = <SafeAreaView style={styles.container} forceInset={{ top: 'always' }}><MainNavigation screenProps={{
      leds: this.state.leds,
      handleLed: this.changeLedState,
      message: this.state.message
    }} /></SafeAreaView>
    // var comp = <MapScreen leds={this.state.leds} handleLed={this.changeLedState}/>
    // var comp = <ListScreen leds={this.state.leds} handleLed={this.changeLedState}/>
    return (comp)
  }

  changeLedState = (led) => {
    fetch("http://86.119.32.225:8000/ledregistry/leds")
      .then(response =>
        response.json()
      )
      .then(json => {
        json[led.id].status = led.status;
        this.setState({
          leds: json
        })
        fetch("http://86.119.32.225:8000/ledregistry/leds/" + led.id, {
          method: 'PUT',
          body: JSON.stringify({status: json[led.id].status})
        });
      })
      .catch(error => {
        console.log("error")
        })
      }
 /*   console.log('Led ' + JSON.stringify(led));
    // Treat led array as immutable object, so make a copy of the array.
    // (Important if working with redux for example)
    let tmpLeds = this.state.leds.slice();
    var tmpLed = tmpLeds.find(l =>
      l.id === led.id
    );
    tmpLed.status = led.status;
    this.setState({
      leds: tmpLeds
    })
    console.log(leds)
  }*/

  changeLedState = (led) => {
    console.log('Updating LED ...');
    this.setState({
      message: 'Updating...'
    })
    let url = webserviceUrl + led.id;
    fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: led.status,
      })
    }).then(() => {
      let tmpLeds = this.state.leds.slice();
      var tmpLed = tmpLeds.find(l =>
        l.id === led.id
      );
      tmpLed.status = led.status;
      this.setState({
        leds: tmpLeds,
        message: ' '
      })
      console.log('Updated LED ' + led.id);
    })
  }


}

loadFromServer = () => {
  console.log('Loading from server...');
  this.setState({
    isLoadingFromServer: true,
  })
  fetch(webserviceUrl).then(response => {
    if (!response.ok) {
      throw Error('network unreachable')
    }
    return response.json()
  }).then(res => {
    this.setState({
      leds: res,
      isLoadingFromServer: false
    })
    console.log('Received #LEDs from server: ' + this.state.leds.length);
  }).catch(err =>
    this.setState({
      error: true,
      isLoadingFromServer: false
    })
  )
}


const host = 'http://86.119.32.225:8000/ledregistry';
const webserviceUrl = host + '/leds/';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'lightgrey'
  }
});

App.defaultProps = {
  leds: [
    { "id": 0, "status": false },
    { "id": 1, "status": false },
    { "id": 2, "status": false },
    { "id": 3, "status": false },
    { "id": 4, "status": false }
  ]
}
