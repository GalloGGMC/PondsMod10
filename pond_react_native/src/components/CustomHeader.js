import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import usersData from '../app/users.json'; 

export function CustomHeader({ route, options, back }) {
  const [profileImage, setProfileImage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationClicked, setNotificationClicked] = useState(false);

  const usersFilePath = `${FileSystem.documentDirectory}users.json`;

  const loadUserData = useCallback(async () => {
    if (!route.params?.userId) {
      console.log('No userId provided');
      return;
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(usersFilePath);
      let users = usersData;
      
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(usersFilePath);
        users = JSON.parse(fileContent);
      }

      const user = users[route.params.userId];
      if (!user) {
        console.log('User not found');
        return;
      }

      if (user?.image) {
        setProfileImage(user.image);
      } else {
        setProfileImage(null);
      }

      if (user.notifications && Array.isArray(user.notifications)) {
        const unread = user.notifications.filter(notification => !notification.read).length;
        setUnreadCount(notificationClicked ? 0 : unread);
      } else {
        setUnreadCount(0);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      setProfileImage(null);
      setUnreadCount(0);
    }
  }, [route.params?.userId, notificationClicked]);

  const handleNotificationPress = () => {
    markNotificationsAsRead();
    setUnreadCount(0)
    setNotificationClicked(true);
    router.push({ pathname: '/notifications', params: { userId: route.params.userId } });
  };

  const markNotificationsAsRead = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(usersFilePath);
      let users = usersData;
      
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(usersFilePath);
        users = JSON.parse(fileContent);
      }

      const user = users[route.params.userId];
      if (user?.notifications) {
        const updatedNotifications = user.notifications.map(notification => ({
          ...notification,
          read: true
        }));

        users[route.params.userId] = {
          ...user,
          notifications: updatedNotifications
        };

        await FileSystem.writeAsStringAsync(
          usersFilePath,
          JSON.stringify(users, null, 2)
        );
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useFocusEffect(useCallback(() => {
    loadUserData();
  }, [loadUserData]));

  return (
    <View style={styles.container}>
      {back && route.name !== "home/(tabs)/index" ? (
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
      ) : null}
      
      <Text style={styles.title}>
        {options.title ?? route.name}
      </Text>
      
      <View style={styles.iconsContainer}>
        {route.name === 'newItem' ? null : (
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/newItem', params: { userId: route.params.userId } })}
            style={styles.notificationButton}
          >
            <Image
              source={require('../../assets/new.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={handleNotificationPress}
          style={styles.notificationButton}
        >
          <Image
            source={require('../../assets/notification.png')}
            style={styles.icon}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/profile', params: { userId: route.params.userId } })}
          style={styles.profileButton}
        >
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
              onError={() => setProfileImage(null)}
            />
          ) : (
            <Image
              source={require('../../assets/default-profile.png')}
              style={styles.profileImage}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#197540',
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: 18,
    color: '#fff',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  notificationButton: {
    marginRight: 16,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});