import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function LayoutBase() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ 
                flex: 1,
                backgroundColor: '#008c1c' }}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" options={{title:"Bem Vindo"}}/>
                    <Stack.Screen name="game" options={{title: "Jogo"}} />
                </Stack>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}