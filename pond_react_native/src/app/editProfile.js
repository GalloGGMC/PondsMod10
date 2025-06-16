import { But } from '../components/But';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, StyleSheet, View, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { ImageSelector } from '../components/ImageSelector';
import * as FileSystem from 'expo-file-system';
import usersData from './users.json';

export default function AtualizarDados() {
    const { userId } = useLocalSearchParams();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [cellphone, setCellphone] = useState('');
    const [cellphoneError, setCellphoneError] = useState('');
    const [database, setDatabase] = useState({});
    const [image, setImage] = useState(null);

    const usersFilePath = `${FileSystem.documentDirectory}users.json`;

    const loadUserData = async () => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(usersFilePath);
            let users = usersData;
            
            if (fileInfo.exists) {
                const fileContent = await FileSystem.readAsStringAsync(usersFilePath);
                users = JSON.parse(fileContent);
            }

            const user = users[userId];
            if (user) {
                const nameParts = user.name.split(' ');
                setFirstName(nameParts[0] || '');
                setLastName(nameParts.slice(1).join(' ') || '');
                setEmail(user.email || '');
                setCellphone(user.cellphone || '');
                setImage(user.image || null);
            }
            
            const otherUsers = {...users};
            delete otherUsers[userId];
            setDatabase(otherUsers);
        } catch (error) {
            console.error('Error loading user data:', error);
            Alert.alert('Erro', 'Error loading user data');
        }
    };

    const handleImageSelected = (imageUri) => {
        setImage(imageUri);
    };

    useEffect(() => {
        loadUserData();
    }, []);

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

    const updateUser = async () => {
        setEmailError('');
        setCellphoneError('');

        let isValid = true;

        if (!firstName || !lastName) {
            Alert.alert('Erro', 'Fill the name fields');
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
            setCellphoneError('Insert a valid phone number');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        try {
            const fileInfo = await FileSystem.getInfoAsync(usersFilePath);
            let users = fileInfo.exists ? 
                JSON.parse(await FileSystem.readAsStringAsync(usersFilePath)) : 
                usersData;

            users[userId] = {
                ...users[userId],
                name: `${firstName} ${lastName}`,
                email: email,
                cellphone: cellphone,
                image: image || users[userId]?.image || ""
            };

            await FileSystem.writeAsStringAsync(
                usersFilePath,
                JSON.stringify(users, null, 2)
            );

            Alert.alert('Sucess', 'Information updated');
            router.replace({
                pathname: '/home',
                params: { userId: userId }
            });
        } catch (error) {
            console.error('Error updating user:', error);
            Alert.alert('Erro', 'Error updating the information');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView>
                    <SafeAreaView style={style.fundoContainer}>
                        <Text style={{fontSize: 30, fontWeight: 'bold', color: '#197540'}}>Update you information</Text>
                        <Text style={{fontSize: 20, color: 'black'}}>Fill the fields you want to update</Text>
                        
                        <View style={style.input}>
                            <Text style={style.inputText}>Name</Text>
                            <TextInput 
                                style={style.inputField} 
                                onChangeText={setFirstName}
                                value={firstName}
                                placeholder={firstName}
                                returnKeyType="next"
                            />
                        </View>

                        <View style={style.input}>
                            <Text style={style.inputText}>Last name</Text>
                            <TextInput 
                                style={style.inputField} 
                                onChangeText={setLastName}
                                value={lastName}
                                placeholder={lastName}
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
                                placeholder={email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                returnKeyType="next"
                            />
                            {emailError ? <Text style={style.errorText}>{emailError}</Text> : null}
                        </View>

                        <View style={style.input}>
                            <Text style={style.inputText}>Phone</Text>
                            <TextInput 
                                style={[style.inputField, cellphoneError ? style.inputError : null]} 
                                onChangeText={(text) => {
                                    setCellphone(text);
                                    if (cellphoneError) setCellphoneError('');
                                }}
                                value={cellphone}
                                placeholder={cellphone}
                                keyboardType="phone-pad"
                                returnKeyType="next"
                            />
                            {cellphoneError ? <Text style={style.errorText}>{cellphoneError}</Text> : null}
                        </View>

                        <View style={[style.input, { alignItems: 'center' }]}>
                            <Text style={style.inputText}>Profile photo</Text>
                            <ImageSelector onImageSelected={handleImageSelected} />
                        </View>

                        <But text={"Update"} func={updateUser}/>
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const style = StyleSheet.create(
    {
        fundoContainer: {
            backgroundColor: '#f2f5cb',
            flex: 1,
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
        redirect: {
            color: '#693c3f',
            fontSize: 16,
            marginTop: 20,
            marginBottom: 20,
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
            margin: 10
        },
        errorText: {
            color: 'red',
            fontSize: 12,
            marginTop: 5,
        }
    }
);