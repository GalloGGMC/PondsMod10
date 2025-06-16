// _layout.js
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { CustomHeader } from '../components/CustomHeader';

export default function LayoutBase() {
    const params = useLocalSearchParams();
    const userId = params.userId;

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ 
                flex: 1,
                backgroundColor: '#F9F6EE',
                }}>
                <Stack screenOptions={{
                    headerStyle: {
                        backgroundColor: '#6fa154',
                    },
                    headerTitle: '',
                    header: (props) => <CustomHeader {...props} userId={userId} />,
                }}>
                    <Stack.Screen 
                        name="index" 
                        options={{
                            title: "Login",
                            headerShown: false
                        }}
                    />
                    <Stack.Screen 
                        name="signup" 
                        options={{
                            title: "SignUp",
                            headerShown: false
                        }} 
                    />
                    <Stack.Screen 
                        name="home" 
                        options={{
                            title: "Listings",
                            headerShown: true
                        }}
                    />
                    <Stack.Screen 
                        name="newItem" 
                        options={{
                            title: "Add Item",
                            headerShown: true
                        }}
                    />
                    <Stack.Screen 
                        name="notifications"
                        options={{
                            title: "Notifications",
                            headerShown: true
                        }} 
                    />
                    <Stack.Screen 
                        name="profile" 
                        options={{
                            title: "Profile",
                            headerShown: true
                        }}
                    />
                    <Stack.Screen 
                        name="editProfile" 
                        options={{
                            title: "Edit Profile",
                            headerShown: true
                        }}
                    />
                </Stack>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}