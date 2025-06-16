import { But } from '../components/But';
import { router, Link } from 'expo-router';
import { Text, StyleSheet, View, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { ImageSelector } from '../components/ImageSelector';
import * as FileSystem from 'expo-file-system';
import usersData from './users.json';

export default function Cadastro() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [cellphone, setCellphone] = useState('');
    const [cellphoneError, setCellphoneError] = useState('');
    const [password, setPassword] = useState('');
    const [database, setDatabase] = useState(usersData);
    const [image, setImage] = useState(null);

    const usersFilePath = `${FileSystem.documentDirectory}users.json`;

    useEffect(() => {
        const initializeUsersFile = async () => {
            try {
                const fileInfo = await FileSystem.getInfoAsync(usersFilePath);
                
                if (!fileInfo.exists) {
                    await FileSystem.writeAsStringAsync(
                        usersFilePath, 
                        JSON.stringify(usersData, null, 2)
                    );
                } else {
                    const fileContent = await FileSystem.readAsStringAsync(usersFilePath);
                    setDatabase(JSON.parse(fileContent));
                }
            } catch (error) {
                console.error('Error initializing users file:', error);
                Alert.alert('Error', 'Failed to load user data');
            }
        };

        initializeUsersFile();
    }, []);

    const handleImageSelected = (imageUri) => {
        setImage(imageUri);
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validateCellphone = (phone) => {
        const re = /^(\+55)?[\s-]?\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
        return re.test(phone);
    };

    const isEmailRegistered = (email) => {
        const userArray = Object.values(database);
        return userArray.some(user => user.email.toLowerCase() === email.toLowerCase());
    };

    const signUp = async () => {
        setEmailError('');
        setCellphoneError('');

        let isValid = true;

        if (!firstName || !lastName) {
            Alert.alert('Error', 'Fill the name fields');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Insert a valid email');
            isValid = false;
        } else if (isEmailRegistered(email)) {
            setEmailError('This email is already in use');
            isValid = false;
        }

        if (!validateCellphone(cellphone)) {
            setCellphoneError('Fill with a valid phone number');
            isValid = false;
        }

        if (!password) {
            Alert.alert('Error', 'Fill the password field');
            return;
        }

        if (!isValid) {
            return;
        }
        const userIds = Object.keys(database).map(Number);
        const newId = userIds.length > 0 ? Math.max(...userIds) + 1 : 0;

        const newUser = {
            name: `${firstName} ${lastName}`,
            email: email,
            password: password,
            image: image || "",
            cellphone: cellphone,
            notifications: [
                {
                    "id": 1,
                    "name": "You created an account!",
                    "message": "Welcome! We're happy to have you here.",
                    "read": false,
                },
                {
                    "id": 2,
                    "name": "What can you do here?",
                    "message": "In this app, you can browse listings, add your own, view your notifications and view and edit you profile",
                    "read": false,
                }
            ]
        };

        const updatedDatabase = {
            ...database,
            [newId]: newUser
        };

        try {
            await FileSystem.writeAsStringAsync(
                usersFilePath,
                JSON.stringify(updatedDatabase, null, 2)
            );
            
            setDatabase(updatedDatabase);

            Alert.alert('Sucess', 'User created!');
            router.replace({
                pathname: '/home',
                params: { userId: newId }
            });
        } catch (error) {
            console.error('Error saving user:', error);
            Alert.alert('Error', 'An error occured when creating the user');
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView>
                    <SafeAreaView style={style.backgroundContainer}>
                        <Text style={{fontSize: 30, fontWeight: 'bold', color: '#197540'}}>Sign up</Text>
                        <Text style={{fontSize: 20, color: 'black'}}>Fill the fields</Text>
                        
                        <View style={style.input}>
                            <Text style={style.inputText}>Name</Text>
                            <TextInput 
                                style={style.inputField} 
                                onChangeText={setFirstName}
                                value={firstName}
                                placeholder="Fill your name"
                                returnKeyType="next"
                            />
                        </View>

                        <View style={style.input}>
                            <Text style={style.inputText}>Last name</Text>
                            <TextInput 
                                style={style.inputField} 
                                onChangeText={setLastName}
                                value={lastName}
                                placeholder="Fill your last name"
                                returnKeyType="next"
                            />
                        </View>

                        <View style={style.input}>
                            <Text style={style.inputText}>Email</Text>
                            <TextInput 
                                style={[style.inputField, emailError ? style.inputError : null]} 
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (emailError) setEmailError('');
                                }}
                                value={email}
                                placeholder="Fill your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                returnKeyType="next"
                            />
                            {emailError ? <Text style={style.errorText}>{emailError}</Text> : null}
                        </View>

                        <View style={style.input}>
                            <Text style={style.inputText}>Celular</Text>
                            <TextInput 
                                style={[style.inputField, cellphoneError ? style.inputError : null]} 
                                onChangeText={(text) => {
                                    setCellphone(text);
                                    if (cellphoneError) setCellphoneError('');
                                }}
                                value={cellphone}
                                placeholder="Fill your phone (ex: 11987654321)"
                                keyboardType="phone-pad"
                                returnKeyType="next"
                            />
                            {cellphoneError ? <Text style={style.errorText}>{cellphoneError}</Text> : null}
                        </View>

                        <View style={style.input}>
                            <Text style={style.inputText}>Senha</Text>
                            <TextInput 
                                style={style.inputField} 
                                onChangeText={setPassword} 
                                value={password} 
                                placeholder="Create a password"
                                secureTextEntry={true}
                                returnKeyType="done"
                            />
                        </View>
                        <View style={[style.input, { alignItems: 'center' }]}>
                            <Text style={style.inputText}>Profile photo</Text>
                            <ImageSelector onImageSelected={handleImageSelected} />
                        </View>

                        <Link href={'/'} style={style.redirect}> Already has an account? Log in here! </Link>
                        <But text={"Sign up"} func={signUp}/>
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const style = StyleSheet.create(
    {
        backgroundContainer: {
            backgroundColor: '#f0f2d8',
            flex: 1,
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
        redirect: {
            color: 'black',
            fontSize: 16,
            marginTop: 20,
            marginBottom: 20,
            borderBottomColor: "black",
            borderBottomWidth: 2
        },
        inputField: {
            borderColor: '#197540',
            borderRadius: 20,
            borderWidth: 2,
            padding: 10, 
            backgroundColor: "white"
        },
        inputError: {
            borderColor: 'red',
        },
        inputText: {
            margin: 5
        },
        input: {
            width: '80%',
            margin: 6
        },
        errorText: {
            color: 'red',
            fontSize: 12,
            marginTop: 5,
        }
    }
);