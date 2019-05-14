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
      addnumber: 0,
      totalDayCount: [],
      loading: false,
      text: ''
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
        <View style={styles.test}>
          <TouchableHighlight
            underlayColor='tomato'
            onPress={this.onPressAdd}>
            <Text>add</Text>
          </TouchableHighlight>
        </View>
          <Text style={styles.paragraph}>
            {this.state.totalDayCount}
          </Text>
      </View>
    );
  }

  onPressAdd = () => {
    this.SetDayCount();
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
        let addnumber;
        addnumber= doc.data().totalDayCount
        this.AddRoomDayCount(number,addnumber)
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
    paragraph: {
      margin: 24,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    test: {
      backgroundColor: 'green',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: 64,
      margin: 10
    }
  });
  