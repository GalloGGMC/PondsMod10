import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import usersData from '../app/users.json';

export default function Notifications() {
    const { userId } = useLocalSearchParams();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const usersFilePath = `${FileSystem.documentDirectory}users.json`;

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const fileInfo = await FileSystem.getInfoAsync(usersFilePath);
                let users = usersData;
                
                if (fileInfo.exists) {
                    const fileContent = await FileSystem.readAsStringAsync(usersFilePath);
                    users = JSON.parse(fileContent);
                }

                const user = users[userId];
                if (!user) {
                    throw new Error('User not found');
                }

                const userNotifications = user.notifications || [];
                const unreadNotifications = userNotifications.filter(notification => !notification.read);
                setNotifications(unreadNotifications);

                if (unreadNotifications.length > 0) {
                    const updatedNotifications = userNotifications.map(notification => ({
                        ...notification,
                        read: true
                    }));

                    users[userId] = {
                        ...user,
                        notifications: updatedNotifications
                    };

                    await FileSystem.writeAsStringAsync(
                        usersFilePath,
                        JSON.stringify(users, null, 2)
                    );
                }

            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications();
    }, []);

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
                <Text style={styles.error}>Error: {error}</Text>
            </View>
        );
    }
    if (!notifications || notifications.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyMessage}>No new notifications</Text>
            </View>
        );
    }

    const renderCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.title}>{item.name || 'Notification'}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>
                    {new Date(item.date || Date.now()).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCard}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f5cb',
    },
    list: {
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
        fontSize: 16,
        marginBottom: 20,
    },
    emptyMessage: {
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: '#fafafa',
        borderRadius: 8,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    info: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    message: {
        fontSize: 16,
        color: '#555',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
});