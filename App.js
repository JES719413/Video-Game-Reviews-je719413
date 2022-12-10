import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { A, S } from '@expo/html-elements';
import SteamImage from "./assets/steamImage.jpg";
import xboxImage from "./assets/xboxImage.jpg";
import * as SplashScreen from 'expo-splash-screen';
import * as SQLite from "expo-sqlite";
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
SplashScreen.preventAutoHideAsync();
// splash delay on line 274

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => { },
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}


var i = 0;


const db = openDatabase();

function Add({ navigation }) {
  const [gameName, setGameName] = useState("");
  const [reviewScore, setReviewScore] = useState(0);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'create table if not exists reviews (id INTEGER PRIMARY KEY NOT NULL, gameName text, reviewScore integer, review text);'
      );
    });
  });

  const add = (gameName, reviewScore, review) => {
    if (gameName === null || gameName === "" || review === null || review === "") {
      return false;
    } else {

      db.transaction(
        (tx) => {
          tx.executeSql("insert into reviews (gameName, reviewScore, review) values ( ?, ?, ?)", [gameName, reviewScore, review],
            (_, result) => {
              console.log("Data inserted");
            },
            (_, error) => {
              console.log("Error With data insert", error)
            });
        });

      return true
    }
  };

  function getData() {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from reviews;`, [], (_, { rows }) => {
          setReviews(rows._array),
            (_, result) => {
              console.log("Data Pulled");
            },
            (_, error) => {
              console.log("Error with data pull: " + error);
            }, null
        });
    });

  };

  getData();

  return (

    //closes keyboard
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
      <View style={styles.container} >
        <Image source={SteamImage} style={styles.image}></Image>
        <Image source={xboxImage} style={styles.image1}></Image>
        <Text style={styles.GameNameText}>Game Name:</Text>
        <TextInput style={styles.GameNameInput}
          placeholder='Game Name'
          value={gameName}
          onChangeText={gameName => setGameName(gameName)}
        />
        <Text style={styles.GameScoreText}>Game Score:</Text>
        <Picker
          style={styles.GameScorePicker} itemStyle={styles.onePickerItem}
          selectedValue={reviewScore}
          onValueChange={reviewScore => setReviewScore(reviewScore)}
        >
          <Picker.Item label="0" value={0} />
          <Picker.Item label="1" value={1} />
          <Picker.Item label="2" value={2} />
          <Picker.Item label="3" value={3} />
          <Picker.Item label="4" value={4} />
          <Picker.Item label="5" value={5} />
          <Picker.Item label="6" value={6} />
          <Picker.Item label="7" value={7} />
          <Picker.Item label="8" value={8} />
          <Picker.Item label="9" value={9} />
          <Picker.Item label="10" value={10} />
        </Picker>
        <Text style={styles.GameReviewText}>Game Review:</Text>
        <TextInput style={styles.GameReviewInput}
          multiline={true}
          placeholder="Enter Review"
          value={review}
          onChangeText={review => setReview(review)}
        />

        <TouchableOpacity style={styles.AddReviewButton}
          onPress={() => {
            //Passes Params to reviews page

            var check = add(gameName, reviewScore, review);
            if (check == false) {

              setGameName("");
              setReview("");
              setReviewScore(0);
              navigation.navigate("Add Review");
            } else {

              setGameName("");
              setReview("");
              setReviewScore(0);
              navigation.navigate("Reviews");


            }
          }}>
          <Text style={styles.AddButtonText}>Add Review</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
// you need to find a way to reduce i to 0 so it will reload list when a review is added.
function ReviewList({ route, navigation }) {
  const [reviews, setReviews] = useState([]);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const touchableOpacityRef = useRef();
  useEffect(() => {
    // load the initial list of reviews when the component is mounted
    if (i == 0) {
      getData();

      touchableOpacityRef.current;
      i += 1;
    } else {


      touchableOpacityRef.current;

    }
  }, [reviews]);

  //Handles High to Low button
  function getDataHighLow() {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from reviews order by reviewScore desc;`, [], (_, { rows }) => {
          setReviews(rows._array)


        });
    });
    setIsButtonPressed(true);
  };

  //Handles Low to High button
  function getDataLowHigh() {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from reviews order by reviewScore asc;`, [], (_, { rows }) => {
          setReviews(rows._array)

        });
    });
    setIsButtonPressed(true);
  };
  //handle general load of array
  function getData() {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from reviews;`, [], (_, { rows }) => {
          setReviews(rows._array)
        });
    });
  };

  //getData();



  return (

    <ScrollView style={styles.containerScroll}>
      <A style={styles.link} href="https://store.steampowered.com/"><Text style={styles.linkText}>Go to Steam</Text></A>
      <TouchableOpacity style={styles.link1}
        onPress={() => getDataHighLow()}>
        <Text style={styles.sortText}>High To Low</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link2}
        onPress={() => getDataLowHigh()}>
        <Text style={styles.sortText}>Low to High</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link3} ref={touchableOpacityRef}
        onPress={() => getData()}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
      {reviews.map(reviewLoop => (
        <TouchableOpacity style={styles.reviewClick}
          onPress={() =>
            //custom alert title
            Alert.alert("Review", reviewLoop.review, [{ text: "Ok" }])
          }>
          <Text style={styles.reviewGameName}>{reviewLoop.gameName}</Text>
          <Text style={styles.reviewGameScore}>{reviewLoop.reviewScore}{"\n"}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>

  );
}


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    //need to pick icons for nav
    <Tab.Navigator>
      <Tab.Screen name="Add Review" component={Add}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="plussquareo" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen name="Reviews" component={ReviewList}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="book" size={24} color="black" />
          ),
        }} />
    </Tab.Navigator>
  );
}


export default function App() {
  React.useEffect(() => {
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 2000);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='Video Game Reviews'
          component={Tabs}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'light grey',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerScroll: {
    flex: 1,
    backgroundColor: 'light grey',
    marginBottom: 0
  },
  GameNameText: {
    position: "absolute",
    top: 50,
    left: 50,
    fontSize: "30px",
  },
  GameNameInput: {
    position: "absolute",
    top: 90,
    left: 50,
    borderColor: "grey",
    borderWidth: 1,
    height: 40,
    width: 300,

  },
  GameScorePicker: {
    width: 60,
    height: 44,
    borderColor: 'black',
    borderWidth: 1,
    position: "absolute",
    top: 140,
    left: 290,

  },
  onePickerItem: {
    height: 44,
  },
  GameScoreText: {
    position: "absolute",
    top: 140,
    left: 50,
    fontSize: "30px",
  },
  GameReviewText: {
    position: "absolute",
    top: 200,
    left: 50,
    fontSize: "30px",
  },
  GameReviewInput: {
    position: "absolute",
    top: 240,
    left: 50,
    borderColor: "grey",
    borderWidth: 1,
    height: 300,
    width: 300,
  },
  AddReviewButton: {
    position: "absolute",
    top: 570,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    backgroundColor: "red",
    height: 35,
    width: 100,
    textAlign: 'center',
    left: 150
  },
  AddButtonText: {
    position: "absolute",
    left: 12,
    top: 8
  },
  reviewClick: {
    position: "Absolute",
    top: 75,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    backgroundColor: "white",
    height: 75,
    width: 350,
    marginBottom: 5,
    left: 20
  },
  reviewGameName: {
    position: "absolute",
    top: 20,
    left: 10,
    fontSize: "30px",
  },
  reviewGameScore: {
    position: "absolute",
    top: 20,
    left: 300,
    fontSize: "30px",

  },
  link: {
    position: "absolute",
    top: 15,
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 10,
    backgroundColor: "blue",
    color: "white",
    height: 30,
    width: 75,
    left: 20
  },
  linkText: {
    position: 'absolute',
    top: 100,
    left: 20,
    fontSize: "12"
  },
  image: {
    position: "absolute",
    top: 5,
    left: 300,
    height: 50,
    width: 50
  },
  image1: {
    position: "absolute",
    top: 5,
    left: 250,
    height: 50,
    width: 50
  },
  images: {
    position: "absolute",
    height: 480,
    width: 500,
    left: 35,
    top: 100,
  },
  link1: {
    position: "absolute",
    top: 15,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    backgroundColor: "red",
    color: "white",
    height: 30,
    width: 75,
    left: 110
  },
  link2: {
    position: "absolute",
    top: 15,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    backgroundColor: "red",
    color: "white",
    height: 30,
    width: 75,
    left: 200
  },
  link3: {
    position: "absolute",
    top: 15,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    backgroundColor: "red",
    color: "white",
    height: 30,
    width: 75,
    left: 290
  },
  sortText: {
    color: "white",
    posistion: "absolute",
    left: 2,
    top: 5,
    fontSize: "12"
  },
  refreshText: {
    color: "white",
    posistion: "absolute",
    left: 12,
    top: 5,

  }
});