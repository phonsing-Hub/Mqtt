import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Switch, Image } from 'react-native';
import { Text } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import init from 'react_native_mqtt';

let message = '';
let topicSub = '64028780/data';
let topicPub = '64028780/Msg';

init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
    sync: {}
});

const Dashboard = () => {
    const [humidity, setHumidity] = useState(null);
    const [temperature, setTemperature] = useState(null);
    const [ledState, setLedState] = useState(false);
    const [relayState, setRelayState] = useState(false);

    const clientRef = useRef(null);

    useEffect(() => {
        const client = new Paho.MQTT.Client('broker.emqx.io', 8083, 'APL_C' + parseInt(Math.random() * 100000));
        clientRef.current = client;

        const onConnect = () => {
            console.log('onConnect');
            client.subscribe(topicSub);
        };

        const onConnectionLost = (responseObject) => {
            if (responseObject.errorCode !== 0) {
                console.log('onConnectionLost:' + responseObject.errorMessage);
            }
        };

        const onMessageArrived = (message) => {
            try {
                const data = JSON.parse(message.payloadString);
                const newHumidity = data.humidity.toFixed(1);
                const newTemperature = data.temperature.toFixed(1);

                setHumidity(newHumidity);
                setTemperature(newTemperature);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;

        client.connect({ onSuccess: onConnect });

        return () => {
            client.disconnect();
        };
    }, []);

    const toggleLED = (value) => {
        const ledState = value;
        const messagePayload = JSON.stringify({ "LED": ledState });
        const message = new Paho.MQTT.Message(messagePayload);
        message.destinationName = topicPub;
        clientRef.current.send(message);
        setLedState(ledState);
    };

    const toggleRelay = (value) => {
        const relayState = value;
        const messagePayload = JSON.stringify({ "Relay1": relayState });
        const message = new Paho.MQTT.Message(messagePayload);
        message.destinationName = topicPub;
        clientRef.current.send(message);
        setRelayState(relayState);
    };

    return (
        <SafeAreaView>
            <View style={styles.temperature}>
                <Image
                    style={styles.temLogo}
                    source={require('../img/temperature.png')}
                />
                <Text h2>{temperature} °C</Text>
            </View>
            <View style={styles.temperature}>
                <Image
                    style={styles.temLogo}
                    source={require('../img/humidity.png')}
                />
                <Text h2>{humidity} %</Text>
            </View>

            <View style={styles.swt}>
                <Switch
                    value={ledState}
                    onValueChange={toggleLED}
                    style={{ transform: [{ scaleX: 2 }, { scaleY: 2 }] }}
                />
                <Text h1> LED</Text>
            </View>
            <View style={styles.swt}>
                <Switch
                    value={relayState}
                    onValueChange={toggleRelay}
                    style={{ transform: [{ scaleX: 2 }, { scaleY: 2 }] }}
                />
                <Text h1> Relay</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    temperature: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 20
    },
    temLogo: {
        width: 180,
        height: 200,
        borderRadius: 100 / 2,
        marginRight: 45,
        resizeMode: 'stretch',
    },
    swt: {
        flexDirection: 'row',
        width: '100%',
        height: 100,
        alignItems: 'center',
        padding: 20,
        justifyContent: 'space-around'
    }
});

export default Dashboard;
