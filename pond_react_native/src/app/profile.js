import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import usersData from './users.json';

export default function Profile() {
    const { userId } = useLocalSearchParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const usersFilePath = `${FileSystem.documentDirectory}users.json`;

    useEffect(() => {
        async function fetchUser() {
            try {
                const fileInfo = await FileSystem.getInfoAsync(usersFilePath);
                let users = usersData;
                
                if (fileInfo.exists) {
                    const fileContent = await FileSystem.readAsStringAsync(usersFilePath);
                    users = JSON.parse(fileContent);
                }

                const foundUser = users[userId];
                if (!foundUser) {
                    throw new Error('Usuário não encontrado');
                }

                setUser(foundUser);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [userId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Erro: {error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.profileContainer}>
                <Image
                    source={user.image ? { uri: user.image } : require('../../assets/default-profile.png')}
                    style={styles.profileImage}
                    resizeMode="cover"
                />
                <View style={styles.infoContainer}>
                    <View style={styles.infoView}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.value}>{user.name}</Text>
                    </View>
                    <View style={styles.infoView}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{user.email}</Text>
                    </View>
                    <View style={styles.infoView}>
                        <Text style={styles.label}>Phone</Text>
                        <Text style={styles.value}>{user.cellphone}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => router.push({pathname:'/editProfile', params: { userId: userId }})}
                >
                    <Text style={styles.editButtonText}>Update information</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2d8',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
    },
    profileContainer: {
        padding: 20,
        alignItems: 'center',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
        backgroundColor: '#eee',
    },
    infoContainer: {
        width: '100%',
        marginBottom: 30,
        alignItems: "center"
    },
    infoView: {
        width:"80%", 
        borderColor: "gray", 
        borderBottomWidth:1, 
        borderTopWidth:1,
        alignItems: "center",
        paddingBottom:5,
        marginBottom:-1
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    editButton: {
        backgroundColor: '#197540',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 6,
        marginTop: 20,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});