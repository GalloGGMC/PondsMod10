import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar, Text, Modal, LogBox } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

const server = 'http://10.254.19.150:5000'

const GameScreen = () => {
    const [enemyCards, setEnemyCards] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [round, setRound] = useState(1);
    const [playerScore, setPlayerScore] = useState("0");
    const [enemyScore, setEnemyScore] = useState("???");
    const [showEnemyCards, setShowEnemyCards] = useState(false);
    const { difficulty } = useLocalSearchParams();
    const [showEnemyScore, setShowEnemyScore] = useState(false);
    const [aceModalVisible, setAceModalVisible] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [message, setMessage] = useState("");
    const [showJokers, setShowJokers] = useState(false);
    const [jokers, setJokers] = useState([]);
    const [jokersButtonClicked, setJokersButtonClicked] = useState(false);

    const router = useRouter();
    LogBox.ignoreAllLogs(true);

    async function startGame (){
        const req = await fetch(`${server}/start?difficulty=${difficulty}`);
        if (!req.ok) {
        console.error('Failed to start game:', req.statusText);
        return;
        }
        const data = await req.json();
        setRound(data.round);
        const reqJokers = await fetch(`${server}/jokers`);
        if (!reqJokers.ok) {
            console.error('Failed to get jokers:', reqJokers.statusText);
        } else {
            const jokersData = await reqJokers.json();
            setJokers(jokersData.jokers);
        }
    }

    useEffect(() => {
        async function setOrientation() {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        }
        ScreenOrientation.getOrientationAsync().then(orientation => {
          if (orientation !== ScreenOrientation.OrientationLock.LANDSCAPE) {
            setOrientation();
          }
        });
        startGame();
        
        return () => {
          ScreenOrientation.unlockAsync();
        };
      }, []);

    useEffect(() => {
      setJokersButtonClicked(false);
    }, [round]);

    const gameInfo = async () => {
        const reqEnemy = await fetch(`${server}/enemy_cards`);
        if (!reqEnemy.ok) {
            console.error('Failed to get enemy cards:', reqEnemy.statusText);
        } else {
            const enemyData = await reqEnemy.json();
            setEnemyCards(enemyData.enemy_cards);
            setEnemyScore(enemyData.total_value);
        }
        const reqPlayer = await fetch(`${server}/player_cards`);
        if (!reqPlayer.ok) {
            console.error('Failed to get player cards:', reqPlayer.statusText);
        } else {
            const playerData = await reqPlayer.json();
            setPlayerCards(playerData.player_cards);
            setPlayerScore(playerData.total_value);
        }
    }

    const drawCards = async () => {
        const req = await fetch(`${server}/draw`);
        if (!req.ok) {
            console.error('Failed to draw cards:', req.statusText);
            return;
        }
        const data = await req.json();
        gameInfo();
        setMessage(data.message ? data.message : "");
        if (data.state === "ace_drawn"){
            setAceModalVisible(true);
            return;
        } else if (data.state !== "continue"){
            setShowEnemyCards(true);
            setShowEnemyScore(true);
            setShowEnd(true)
        } else {
            setRound(data.round ? data.round : round);
        }
        return;
    }

    const stopGame = async () => {
        const req = await fetch(`${server}/stop`);
        if (!req.ok) {
            console.error('Failed to stop game:', req.statusText);
            return;
        }
        const data = await req.json();
        gameInfo();
        setRound(data.round ? data.round : round);
        setShowEnemyCards(true);
        setShowEnemyScore(true);
        setMessage(data.message ? data.message : "");
        setShowEnd(true);

    }

    const callAceValue = async (value) => {
        setAceModalVisible(false);
        const req = await fetch(`${server}/set_ace_value/${value}`);
        if (!req.ok) {
            console.error('Failed to set ace value:', req.statusText);
            return;
        }
        const data = await req.json();
        gameInfo();
        setMessage(data.message ? data.message : "");
        if (data.state !== "continue"){
            setShowEnemyCards(true);
            setShowEnemyScore(true);
            setShowEnd(true)
        } else {
            setRound(data.round ? data.round : round);
        }
    }

  return (
    <View style={styles.landscapeContainer}>
      <StatusBar hidden />
      <SafeAreaView style={styles.safeArea}>

        <View style={styles.sidebar}>
          <View style={styles.sidebarContent}>
            <Text style={styles.roundText}>Round {round}</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.playerScore}>You: {playerScore}</Text>
              <Text style={styles.buttonText}>-------</Text>
              <Text style={styles.enemyScore}>Enemy: {showEnemyScore? enemyScore: "???"}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.mainArea}>

            <Modal
                animationType="slide"
                transparent={true}
                visible={aceModalVisible}
                onRequestClose={() => setAceModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Ace Value</Text>
                        <TouchableOpacity 
                            style={styles.Buttons}
                            onPress={() => {
                              setAceModalVisible(false);
                              callAceValue(11);
                            }}
                        >
                            <Text style={styles.buttonText}>11</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.Buttons}
                            onPress={() => {
                                setAceModalVisible(false);
                                callAceValue(1);
                            }}
                          >
                            <Text style={styles.buttonText}>1</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showEnd}
                onRequestClose={() => setShowEnd(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{message}</Text>
                        <TouchableOpacity 
                            style={styles.Buttons}
                            onPress={() => {
                              setShowEnd(false);
                              router.replace({pathname :"/game", params: { difficulty }});
                            }}
                        >
                            <Text style={styles.buttonText}>{message === "Player wins!"? "Next round": "Restart"}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.Buttons, {backgroundColor: '#ff0000'}]}
                            onPress={() => {
                              setShowEnd(false);
                              router.replace("/");
                            }}
                        >
                            <Text style={styles.buttonText}>Main menu</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
            
                    <Modal
                animationType="slide"
                transparent={true}
                visible={showJokers}
                onRequestClose={() => setShowJokers(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Your jokers</Text>
                        { jokers.length > 0 ? (
                            jokers.map((joker) => (
                                <View style={{borderColor: "white", borderWidth: 1, padding: 10, marginVertical: 5, width: '100%', borderRadius: 10}}>
                                    <Text key={joker[0]} style={styles.buttonText}>
                                        {joker[0]}
                                    </Text>
                                    <Text key={joker[1]} style={{color: "white", fontSize: 12, textAlign: 'center'}}>
                                        {joker[1]}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.buttonText}>No jokers available</Text>
                        )}
                        <TouchableOpacity 
                            style={styles.Buttons}
                            onPress={() => {
                              setShowJokers(false);
                            }}
                        >
                            <Text style={styles.buttonText}>Close</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>

          <View style={styles.enemySection}>
            <View style={styles.cardRow}>
              {enemyCards.map((item) => (
                <Image 
                  key={`enemy-${item.code}`}
                  source={!showEnemyCards? require('../../assets/back.png'): {uri:item.image}} 
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              ))}
            </View>
          </View>
          
          <View style={styles.middleSection}>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={drawCards}>
                <Text style={styles.buttonText}>Draw</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.stopButton]} onPress={stopGame}>
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#a87f32'}]} onPress={() => {
                setShowJokers(true);
                setJokersButtonClicked(true);
              }}>
                <Text style={styles.buttonText}>Jokers</Text>
                {!jokersButtonClicked && round !== 1 && round < 4 && (
                  <View style={styles.redCircle} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.deckContainer}>
              <Image 
                source={require('../../assets/back.png')} 
                style={styles.deckImage}
                resizeMode="contain"
              />
            </View>
          </View>
          
          <View style={styles.playerSection}>
            <View style={styles.cardRow}>
              {playerCards.map((item) => (
                <Image 
                  key={`player-${item.code}`}
                  source={{uri:item.image}} 
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#008c1c',
  },
  safeArea: {
    flex: 1,
    flexDirection: 'row',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    
  },
  modalContent: {
    backgroundColor: '#333333',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '60%',
    borderRadius: 20,
  },
  
  Buttons: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  sidebar: {
    width: 130,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  sidebarContent: {
    alignItems: 'center',
    padding: 10,
  },
  roundText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#333333',
    width: '100%',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  playerScore: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  enemyScore: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mainArea: {
    flex: 1,
  },
  enemySection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    maxHeight: '25%',
    paddingBottom: 10,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '50%',
  },
  playerSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    maxHeight: '25%',
    paddingTop: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cardImage: {
    width: 60,
    height: 80,
    marginHorizontal: 5,
  },
  deckContainer: {
    marginBottom: 20,
  },
  deckImage: {
    width: 80,
    height: 120,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginHorizontal: 10,
    minWidth: 100,
    height: 45,
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  redCircle: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'red',
  },
});

export default GameScreen;