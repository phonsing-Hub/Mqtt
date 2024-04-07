import React, { Component } from 'react';
import { StyleSheet, View, Button, TextInput, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import init from 'react_native_mqtt';

let message = '';
let topicSub = 'Msg64028780';
let topicPub = 'Msg64028780';

init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
    sync: {}
});


export default class Mqttcnn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            host: 'broker.emqx.io',
            port: 8083,
            id: '',
            status: 'Disconnected',
            msg: '',
            text: '',
            statusBtnCon: true,
            statusBtnDisCon: true,
        };

        this.client = new Paho.MQTT.Client(this.state.host, this.state.port, this.state.id);
        this.client.onConnectionLost = this.onConnectionLost;
        this.client.onMessageArrived = this.onMessageArrived;
    }

    getID = () => {
        this.setState({
            id: 'APL-' + parseInt(Math.random() * 100000),
            statusBtnCon: false,
        })
    }

    connect = () => {
        console.log('connect');
        this.setState({ status: 'connected', statusBtnDisCon: false, statusBtnCon: true });
        this.client.connect({ onSuccess: this.onConnect });
    };

    onConnect = () => {
        console.log('onConnect');
        this.client.subscribe(topicSub);
        message = new Paho.MQTT.Message('Mobile-CPE451-64028780');
        message.destinationName = topicPub;
        this.client.send(message);
    };

    onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
            console.log('onConnectionLost:' + responseObject.errorMessage);
        }
    };

    onMessageArrived = (message) => {
        console.log('onMessageArrived:' + message.payloadString);
        const newMessage = message.payloadString;
        this.setState(prevState => ({
            msg: [...prevState.msg, newMessage]
        }));
    };

    onDisconnect = () => {
        console.log('onDisconnect');
        this.setState({ status: 'Disconnected', statusBtnDisCon: true, statusBtnCon: false, msg: [] });
        this.client.disconnect();
    };

    sendMessage = (msg) => {
        const { status } = this.state;
        if (status === 'connected') {
            message = new Paho.MQTT.Message(msg);
            message.destinationName = topicPub;
            this.client.send(message);
        } else {
            console.log('connection error');
        }
    };

    render() {
        const { status, msg, text, statusBtnCon, statusBtnDisCon } = this.state;
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.getid}>
                    <Text style={[styles.clienid, { color: status === 'connected' ? 'green' : 'black', }]}>
                        ClientID: {this.state.id}
                    </Text>
                    <TouchableOpacity onPress={this.getID} style={styles.btngetid}>
                        <Text style={{ color: '#fefefe' }}>GetID</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ alignItems: 'center', justifyContent: 'space-around', height: 150, width: '100%' }}>
                    <TouchableOpacity style={[styles.cnn, { backgroundColor: statusBtnCon == true ? 'rgba(141, 198, 255, 0.4)' : 'rgba(141, 198, 255,1)', }]} disabled={statusBtnCon} onPress={this.connect}>
                        <Text h4 >Connect</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.cnn, { backgroundColor: statusBtnDisCon == true ? 'rgba(141, 198, 255, 0.4)' : 'rgba(141, 198, 255,1)', }]} disabled={statusBtnDisCon} onPress={this.onDisconnect}>
                        <Text h4 >DisConnect</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 10, flexDirection: 'row', width: '100%', padding: 20 }}>
                    <TextInput
                        style={styles.input}
                        placeholder='Send message'
                        onChangeText={(text) => this.setState({ text })}
                        value={text}
                    />
                    <TouchableOpacity
                        style={styles.send}
                        onPress={() => {
                            this.sendMessage(text); 
                            this.setState({ text: '' }); 
                        }}
                    >
                        <Text style={{ color: '#fefefe' }}>Send</Text>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {

    },
    getid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20
    },
    clienid: {
        fontSize: 20,
    },
    btngetid: {
        backgroundColor: '#38598b',
        width: 60,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    cnn: {
        width: 200,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chat: {
        width: '100%',
        height: 400,
        backgroundColor: '#ffff',
        marginTop: 10,
        borderRadius: 30,
        padding: 15
    },
    input: {
        height: 40,
        marginBottom: 10,
        padding: 10,
        width: '70%',
        backgroundColor: '#ffff',
        borderRadius: 10,
    },
    send: {
        backgroundColor: '#4c9173',
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginLeft: 20
    }
})

