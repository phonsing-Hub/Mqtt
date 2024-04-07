import { StyleSheet, Dimensions, SafeAreaView,ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { Text } from '@rneui/themed';
import { LineChart } from "react-native-chart-kit";

const ChartPage = ({tem,hum}) => {
  const [timeLabels, setTimeLabels] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLabels(generateTimeLabels());
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const screenWidth = Dimensions.get("window").width - 20;
  const chartConfig = {
    backgroundGradientFrom: "#ffff",
    backgroundGradientTo: "#ffff",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    useShadowColorFromDataset: true,
    decimalPlaces: 0, // No decimal places for vertical axis labels
    barPercentage: 0.5,
  };
  const generateTimeLabels = () => {
    const currentTime = new Date();
    let currentMinute = currentTime.getMinutes();
    let currentSecond = currentTime.getSeconds();
    const labels = [];

    for (let i = 0; i < 6; i++) {
      labels.push(
        `${currentMinute.toString().padStart(2, "0")}.${currentSecond
          .toString()
          .padStart(2, "0")}s`
      );
      currentSecond += 5;
      if (currentSecond >= 60) {
        currentSecond = currentSecond % 60;
        currentMinute += 1;
        if (currentMinute >= 60) 
          currentMinute = currentMinute % 60;
      }
    }

    return labels;
  };

  const temperature = {
    labels: timeLabels,
    datasets: [
      {
        data: tem,
        color: (opacity = 1) => `rgba(252, 162, 36, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
    ],
  };

  const humidity = {
    labels: timeLabels,
    datasets: [
      {
        data: hum,
        color: (opacity = 1) => `rgba(12, 161, 227, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView>
      <Text h3>temperature</Text>
      <LineChart
        data={temperature}
        width={screenWidth}
        height={250}
        chartConfig={chartConfig}
        bezier
        yAxisSuffix="°C"
        yAxisInterval={1}
        fromZero 
        withVerticalLabels={true}
        segments={5}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <Text h3>humidity</Text>
      <LineChart
        data={humidity}
        width={screenWidth}
        height={250}
        chartConfig={chartConfig}
        bezier
        AxisSuffix="%"
        yAxisInterval={1}
        fromZero
        segments={5}
       // withVerticalLabels={true}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChartPage;

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
});
