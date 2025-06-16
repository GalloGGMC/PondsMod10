import { But } from '../components/But';
import { router, Link } from 'expo-router';
import { Text, StyleSheet, View, TextInput, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import usersData from './users.json';

export default function TelaPrincipal() {
    const [email, setEmail] = useState('');  
    const [senha, setSenha] = useState(''); 
    const [database, setDatabase] = useState({});
    
    const usersFilePath = `${FileSystem.documentDirectory}users.json`;

    const loadUsers = useCallback(async () => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(usersFilePath);
            let users = usersData; 
            
            if (fileInfo.exists) {
                const fileContent = await FileSystem.readAsStringAsync(usersFilePath);
                users = JSON.parse(fileContent);
            }
            
            setDatabase(users);
        } catch (error) {
            console.error('Error loadding the users:', error);
            Alert.alert('Error', 'Unable to load user data');
            setDatabase({});
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const getUserId = (email) => {
        const userArray = Object.values(database);
        const user = userArray.find(user => user.email.toLowerCase() === email.toLowerCase());
        return user ? Object.keys(database).find(key => database[key].email === user.email) : null;
    };

    const isEmailRegistered = (email) => {
        const userArray = Object.values(database);
        return userArray.some(user => user.email.toLowerCase() === email.toLowerCase());
    };
    
    const isPasswordValid = (email, password) => {
        const userArray = Object.values(database);
        const user = userArray.find(user => user.email.toLowerCase() === email.toLowerCase());
        return user && user.password === password;
    };

    const handleLogin = () => {
        if (!email || !senha) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!isEmailRegistered(email)) {
            Alert.alert('Error', 'Email not registered');
            return;
        }

        if (!isPasswordValid(email, senha)) {
            Alert.alert('Error', 'Incorrect password');
            return;
        }

        const userId = getUserId(email);
        router.replace({
            pathname: "/home",
            params: { userId: userId }
        });
    }

    return (
        <View style={style.backgroundContainer}>
            <Text style={{fontSize: 30, fontWeight: 'bold', color: '#197540'}}>Welcome!</Text>
            <Text style={{fontSize: 20, color: 'black'}}>Log in to continue</Text>
            <View style={style.input}>
                <Text style={style.inputText}>Email</Text>
                <TextInput 
                    style={style.inputField} 
                    onChangeText={setEmail}
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder='Fill your email'
                />
            </View>
            <View style={style.input}>
                <Text style={style.inputText}>Password</Text>
                <TextInput 
                    style={style.inputField} 
                    onChangeText={setSenha} 
                    value={senha} 
                    secureTextEntry={true}
                    placeholder='Fill your password'
                />
            </View>
            <Link href={'/signup'} style={style.redirect}> Don't have an account? Sign up here </Link>
            <But text={"Log in"} func={handleLogin}/>
        </View>
    );
}

const style = StyleSheet.create({
    backgroundContainer: {
        backgroundColor: '#f2f5cb',
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
    inputText: {
        margin: 10
    },
    input: {
        width: '80%',
        margin: 10
    }
});