import * as React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AntDesign from 'react-native-vector-icons/AntDesign';

//components
import Mqttcnn from './src/components/Mqtt-cnn'
import Dashboard from './src/components/Dashboard';
import ShowChart from './src/components/ShowChart';

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
    initialRouteName="Tab3"
    screenOptions={{
     tabBarActiveTintColor: '#3646a3',
     tabBarStyle: {
        position: 'absolute' ,
        bottom: 25,
        left: 20,
        right: 20,
        borderRadius: 15,
        height: 90,
        backgroundColor: '#fefefe',
        ...styles.shadow
       }
   }}>
        <Tab.Screen name="Tab1" component={Mqttcnn} options={{
           headerShown: false,
           tabBarLabel: 'connection',
           tabBarIcon: ({ color, size }) => (
            <AntDesign name="earth" color={color} size={36} />
          )}}/>

        <Tab.Screen name="Tab2" component={Dashboard} options={{ 
          headerShown: false ,
          tabBarLabel: 'Dashboard',
           tabBarIcon: ({ color, size }) => (
            <AntDesign name="dashboard" color={color} size={36} />
          )}}/>

        <Tab.Screen name="Tab3" component={ShowChart} options={{ 
          headerShown: false ,
          tabBarLabel: 'Chart',
           tabBarIcon: ({ color, size }) => (
            <AntDesign name="barschart" color={color} size={36} />
          )}}/>

    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shadow:{
    shadowColor: '#333333',
    shadowOffset:{
      width: 0,
      height: 10
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5
  }
})