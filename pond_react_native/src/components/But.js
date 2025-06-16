import { Text, StyleSheet, TouchableOpacity } from 'react-native';

export function But({text, func}) {
    return (
            <TouchableOpacity style={style.but} onPress={func?? null}>
                <Text style={style.textBut}>{text}</Text>
            </TouchableOpacity>
    );
}

const style = StyleSheet.create(
    {
        but: {
            width: "80%",
            padding: 8,
            margin: 10,
            borderWidth: 2,
            borderColor: '#197540',
            backgroundColor: '#229955',
            borderRadius: 15,
        },
        textBut: {
            fontSize: 24,
            color: '#f0f0f0',
            padding: 16,
            textAlign: 'center',
        },
    }
);