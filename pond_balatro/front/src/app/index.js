import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';


const MainMenu = () => {
  const router = useRouter();
  const [difficultyModalVisible, setDifficultyModalVisible] = useState(false);

  const startGame = async (difficulty) => {
    console.log(`Starting game with ${difficulty} difficulty`);
    setDifficultyModalVisible(false);

    router.push({pathname :"/game", params: { difficulty }});

  }

  return (
    <View style={styles.landscapeContainer}>
      <StatusBar hidden />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Blacklatro</Text>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => setDifficultyModalVisible(true)}
        >
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={difficultyModalVisible}
          onRequestClose={() => setDifficultyModalVisible(false)}
          supportedOrientations={['landscape']}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.difficultyButton}
                onPress={() => {
                  setDifficultyModalVisible(false);
                  startGame('easy');
                }}
              >
                <Text style={styles.buttonText}>Easy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.difficultyButton}
                onPress={() => {
                  setDifficultyModalVisible(false);
                  startGame('medium');
                }}
              >
                <Text style={styles.buttonText}>Medium</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.difficultyButton}
                onPress={() => {
                  setDifficultyModalVisible(false);
                  startGame('hard');
                }}
              >
                <Text style={styles.buttonText}>Hard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setDifficultyModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#008c1c',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  startButton: {
    backgroundColor: '#fc4903',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    transform: [{ rotate: '90deg' }],
    
  },
  modalContent: {
    backgroundColor: '#333333',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '60%',
  },
  difficultyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MainMenu;