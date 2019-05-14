import * as React from 'react';
import { Text, View, StyleSheet, FlatList, TextInput, TouchableHighlight } from 'react-native';
import { Constants } from 'expo';

//firebase
import * as firebase from 'firebase';
import 'firebase/firestore';
import { firebaseConfig } from './src/configs/config';

//yellowboxproblemfix
import { YellowBox } from 'react-native';
import _ from 'lodash';

YellowBox.ignoreWarnings(['Setting a timer']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer') <= -1) {
    _console.warn(message);
  }
};

//firebase initialize
firebase.initializeApp(firebaseConfig);
//firebase entry
const db = firebase.firestore();

let colUserRef = db.collection('user')
let docUserARef=colUserRef.doc('userA')

let colRoomRef = db.collection('room')
let docroomARef=colRoomRef.doc('roomA')

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.unsubscribe = null;
    this.state = ({
      roomInfo: [{
        roomName: '',
      }],
      totalDayCount: [],
      loading: false,
      inputText: ''
    });
  }
  componentDidMount() {
    this.unsubscribe = colRoomRef.onSnapshot(this.onCollectionUpdate)
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onCollectionUpdate = (querySnapshot) => {
    const roominfos = [];
    querySnapshot.forEach((doc) => {
      const { totalDayCount } = doc.data();
      roominfos.push(totalDayCount);
    });
    console.log("update")
    this.setState({
      totalDayCount: roominfos,
      loading: false,
   });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.textbg}>
          <TextInput
          style={styles.textinput}
          keyboardType='default'
          placeholderTextColor='white'
          placeholder='Search'
          autoCapitalize='none'
          onChangeText={(text) => this.setState({inputText: text})}
          value={this.state.inputText}>
          </TextInput>
          <TouchableHighlight
            underlayColor='tomato'
            onPress={this.onPressAdd}>
            <Text>add</Text>
          </TouchableHighlight>
        </View>
        <FlatList
        data={this.state.roomInfo}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item})=>{
          return (
            <Text style={styles.text}>
              {item.roomName}
              <Text style={styles.text}>
                {item.totalDayCount}
              </Text>
            </Text>
          )
        }}>
        </FlatList>
          <Text style={styles.text}>
            {this.state.totalDayCount}
          </Text>
      </View>
    );
  }

  onPressAdd = () => {
    let isFind=this.SerchRoom();
    isFind=false;
    // if(isFind) this
  }

  SerchRoom=()=>{
    const AA = colRoomRef.where("roomName", "==", this.state.inputText)
    let rooms = [];
    AA.get().then(querySnapshot => {
      querySnapshot.forEach(docSnapshot => {
        console.log(docSnapshot.data().roomName)
        rooms.push({
          roomName: docSnapshot.data().roomName,
          totalDayCount: docSnapshot.data().totalDayCount
        })
      }) 
      if(querySnapshot.empty) {
        console.log("falsea")
        return false;
      }
      console.log("rooms"+rooms[0].roomName)
      this.setState({
        roomInfo: rooms
      })
      console.log("t="+this.state.roomInfo)
      console.log("truea")
      return true;
    }).catch(err => {
      console.log('Error getting documents', err) 
    })
  }

  SetDayCount = (number=20) => {
    docUserARef.set({
      app: number
  })
    .then(function () {
      console.log('Document successfully written!')
    })
    .catch(function (error) {
      console.error('Error writing document: ', error)
    })

    this.ReadRoomDayCount(number);
  }

  ReadRoomDayCount = (number) => { 
    docroomARef.get().then(doc => {
      if (doc.exists) {
        let addNumber;
        addNumber= doc.data().totalDayCount
        this.AddRoomDayCount(number,addNumber)
      }
      else {
          console.log("No such document object!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });
  }

  AddRoomDayCount = (number,city) => {
    docroomARef.set({
      totalDayCount: city+number,
    })
    .then(function () {
      console.log('set')
    })
    .catch(function (error) {
      console.error('Error set: ', error)
    })
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingTop: Constants.statusBarHeight,
      backgroundColor: '#ecf0f1',
      padding: 10,
    },
    text: {
      margin: 24,
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    textbg:{
      backgroundColor: 'green',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: 64,
      margin: 10
    },
    textinput: {
      height:40,
      width: 200,
      padding: 10,
      borderColor: 'white',
      borderWidth: 1,
      color: 'white'
    }
  });
  