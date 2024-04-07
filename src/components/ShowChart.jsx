import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, SafeAreaView, Switch, Image } from "react-native";
import { Text } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import init from "react_native_mqtt";
import ChartPage from "./Chart";
import { create } from "react-test-renderer";

let topicSub = "64028780/data";
let topicPub = "64028780/Msg";

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});

const ShowChart = () => {
  const [humidity, setHumidity] = useState([0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
  const [temperature, setTemperature] = useState([
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  ]);
  const [ledState, setLedState] = useState(false);
  const [relayState, setRelayState] = useState(false);

  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Paho.MQTT.Client(
      "broker.emqx.io",
      8083,
      "APL_L" + parseInt(Math.random() * 100000)
    );
    clientRef.current = client;

    const onConnect = () => {
      console.log("onConnect");
      client.subscribe(topicSub);
    };

    const onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
      }
    };

    const onMessageArrived = (message) => {
      try {
        const data = JSON.parse(message.payloadString);
        if (
          data &&
          typeof data.humidity === "number" &&
          typeof data.temperature === "number"
        ) {
          const newHumidity = data.humidity;
          const newTemperature = data.temperature;

          setHumidity((prevHumidity) => {
            const updatedHumidity = [...prevHumidity.slice(-5), newHumidity];
            return updatedHumidity;
          });

          setTemperature((prevTemperature) => {
            const updatedTemperature = [
              ...prevTemperature.slice(-5),
              newTemperature,
            ];
            return updatedTemperature;
          });
        } else {
          console.error("Received invalid data:", data);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
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
    const messagePayload = JSON.stringify({ LED: ledState });
    const message = new Paho.MQTT.Message(messagePayload);
    message.destinationName = topicPub;
    clientRef.current.send(message);
    setLedState(ledState);
  };

  const toggleRelay = (value) => {
    const relayState = value;
    const messagePayload = JSON.stringify({ Relay1: relayState });
    const message = new Paho.MQTT.Message(messagePayload);
    message.destinationName = topicPub;
    clientRef.current.send(message);
    setRelayState(relayState);
  };

  return (
    <View>
      <ChartPage tem={temperature} hum={humidity} />
      <View style={styles.swt}>
        <Switch
          value={ledState}
          onValueChange={toggleLED}
          style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
        />
        <Text h4> LED</Text>
        <Switch
          value={relayState}
          onValueChange={toggleRelay}
          style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
        />
        <Text h4> Relay</Text>
      </View>
    </View>
  );
};

export default ShowChart;

styles = StyleSheet.create({
  swt: {
    flexDirection: "row",
    width: "100%",
    height: 100,
    alignItems: "center",
    padding: 20,
    justifyContent: "space-around",
  },
});
