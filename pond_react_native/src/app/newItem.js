import { But } from '../components/But';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, StyleSheet, View, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { ImageSelector } from '../components/ImageSelector';
import * as FileSystem from 'expo-file-system';

export default function AddItem() {
    const { userId } = useLocalSearchParams();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [priceError, setPriceError] = useState('');
    const [image, setImage] = useState(null);

    const productsFilePath = `${FileSystem.documentDirectory}products.json`;

    const validatePrice = (price) => {
        const re = /^\d+(\.\d{1,2})?$/;
        return re.test(price);
    };

    const handleImageSelected = (imageUri) => {
        setImage(imageUri);
    };

    const addItem = async () => {
        setPriceError('');
        let isValid = true;
    
        if (!name || !description) {
            Alert.alert('Erro', 'Fill all the fields');
            return;
        }
    
        if (!validatePrice(price)) {
            setPriceError('Set a valid price (ex: 10.99)');
            isValid = false;
        }
    
        if (!image) {
            Alert.alert('Error', 'Select an image for the item');
            return;
        }
    
        if (!isValid) {
            return;
        }
    
        try {
            const fileInfo = await FileSystem.getInfoAsync(productsFilePath);
            let products = {};
            
            if (fileInfo.exists) {
                const fileContent = await FileSystem.readAsStringAsync(productsFilePath);
                products = JSON.parse(fileContent);
            }

            const existingIds = Object.keys(products).map(Number);
            const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 0;

            const newProducts = {
                ...products,
                [newId]: {
                    id: newId.toString(),
                    name,
                    description,
                    price: parseFloat(price),
                    image: image || ""
                }
            };

            await FileSystem.writeAsStringAsync(
                productsFilePath,
                JSON.stringify(newProducts, null, 2)
            );

            Alert.alert('Sucess', 'Item added successfully!');
            router.replace({
                pathname: '/home',
                params: { userId }
            });
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An error occurred while adding the item');
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
                        <Text style={{fontSize: 30, fontWeight: 'bold', color: '#197540'}}>Add an item</Text>
                        <Text style={{fontSize: 20, color: 'black'}}>Fill the details of the listing</Text>
                        
                        <View style={style.input}>
                            <Text style={style.inputText}>Name</Text>
                            <TextInput 
                                style={style.inputField} 
                                onChangeText={setName}
                                value={name}
                                placeholder="Fill the item name"
                                returnKeyType="next"
                            />
                        </View>

                        <View style={style.input}>
                            <Text style={style.inputText}>Description</Text>
                            <TextInput 
                                style={style.inputField} 
                                onChangeText={setDescription}
                                value={description}
                                placeholder="Fill the item's description"
                                multiline
                                numberOfLines={3}
                                returnKeyType="next"
                            />
                        </View>

                        <View style={style.input}>
                            <Text style={style.inputText}>price</Text>
                            <TextInput 
                                style={[style.inputField, priceError ? style.inputError : null]} 
                                onChangeText={(text) => {
                                    setPrice(text.replace(',', '.'));
                                    if (priceError) setPriceError('');
                                }}
                                value={price}
                                placeholder="Fill the price (ex: 19.99)"
                                keyboardType="decimal-pad"
                                returnKeyType="next"
                            />
                            {priceError ? <Text style={style.errorText}>{priceError}</Text> : null}
                        </View>

                        <View style={[style.input, { alignItems: 'center' }]}>
                            <Text style={style.inputText}>Item's photo</Text>
                            <ImageSelector onImageSelected={handleImageSelected} />
                        </View>

                        <But text={"Add item"} func={addItem}/>
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const style = StyleSheet.create({
    fundoContainer: {
        backgroundColor: '#f2f5cb',
        flex: 1,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
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
});