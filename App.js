import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import ListScreen from './components/screens/list/ListScreen';
import MapScreen from './components/screens/map/MapScreen';
import {createBottomTabNavigator} from 'react-navigation';
import {AppLoading} from 'expo';

const MainNavigation = createBottomTabNavigator({
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
        let comp;
        if (this.state.isLoadingFromServer) {
            comp = <AppLoading/>
        } else {
            comp = <MainNavigation screenProps={{
                leds: this.state.leds,
                handleLed: this.changeLedState,
                message: this.state.message
            }}/>
        }
        return (comp)
    }

    componentDidMount() {
        this.loadFromServer();
        this.connectOverWebSocket();
    }

    componentWillUnmount() {
        if (this.websocket) {
            this.websocket.close();
        }
    }

    changeLedState = (led) => {
        this.setState({
            message: 'Updating...'
        });
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
            this.setState({
                message: ' '
            })
        })
    };

    connectOverWebSocket() {
        console.log('trying to open websocket ' + websocketUrl);
        this.websocket = new WebSocket(websocketUrl);

        this.websocket.onopen = () => {
            console.log('websocket connected');
        };

        this.websocket.onmessage = (e) => {
            console.log("WebSocket Message received: " + e.data);
            // handle websocket message
            const request = e.data.split(":");
            const id = parseInt(request[0]);
            const status = request[1] === '1';

            let tmpLeds = this.state.leds.slice();
            const tmpLed = tmpLeds.find(l =>
                l.id === id
            );
            tmpLed.status = status;

            this.setState({
                leds: tmpLeds,
                message: ' '
            })
        };

        this.websocket.onerror = (e) => {
            console.log('onerror: ' + e.message);
        };

        this.websocket.onclose = (e) => {
            console.log('websocket closed', e.reason);
        };
    }

    loadFromServer = () => {
        console.log('Loading from server...');
        this.setState({
            isLoadingFromServer: true,
        });
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
    };
}

const host = '86.119.32.225:8000/ledregistry';
const webserviceUrl = 'http://' + host + '/leds/';
const websocketUrl = 'ws://' + host + '/websocket';

App.defaultProps = {
    leds: [
        {"id": 0, "status": false},
        {"id": 1, "status": false},
        {"id": 2, "status": false},
        {"id": 3, "status": false},
        {"id": 4, "status": false}
    ]
};

styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'lightgrey'
    }
});
