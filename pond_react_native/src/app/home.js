import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
    Modal
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { faker } from '@faker-js/faker';

export default function Home() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const productsFilePath = `${FileSystem.documentDirectory}products.json`;

    const generateFakeProducts = () => {
        const products = {};
        for (let i = 0; i < 10000; i++) {
            products[i] = {
                id: i.toString(),
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                price: parseFloat(faker.commerce.price(10, 1000, 2)),
                image: `https://loremflickr.com/300/300/${faker.lorem.word()}?lock=${i}`
            };
        }
        return products;
    };

    const loadProducts = async () => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(productsFilePath);
            
            if (!fileInfo.exists) {
                const fakeProducts = generateFakeProducts();
                await FileSystem.writeAsStringAsync(
                    productsFilePath,
                    JSON.stringify(fakeProducts, null, 2)
                );
                const sortedProducts = Object.values(fakeProducts).sort((a, b) => b.id - a.id);
                setItems(Object.values(sortedProducts));
            } else {
                const fileContent = await FileSystem.readAsStringAsync(productsFilePath);
                const products = JSON.parse(fileContent);
                const sortedProducts = Object.values(products).sort((a, b) => b.id - a.id);
                setItems(sortedProducts);
            }
        } catch (e) {
            console.error('Error loading products:', e);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
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
                <Text style={styles.error}>Erro: {error}</Text>
            </View>
        );
    }
    if (!items || items.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>No item available</Text>
            </View>
        );
    }

    const openModal = (item) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    const renderCard = ({ item }) => (
        <TouchableOpacity 
            onPress={() => openModal(item)}
            style={styles.cardContainer}
        >
            <View style={styles.card}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.price}>$ {item.price.toFixed(2)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderCard}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
            />

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedItem && (
                            <>
                                <Image
                                    source={{ uri: selectedItem.image }}
                                    style={styles.modalImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                                <Text style={styles.modalDescription}>
                                    {selectedItem.description}
                                </Text>
                                <Text style={styles.modalPrice}>
                                    $ {selectedItem.price.toFixed(2)}
                                </Text>
                            </>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    list: {
        padding: 8,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    cardContainer: {
        width: '48%',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#fafafa',
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        aspectRatio: 0.68,
    },
    image: {
        width: '100%',
        height: undefined,
        aspectRatio: 1,
    },
    info: {
        padding: 12,
        flex: 1,
        justifyContent: 'space-between',
        minHeight: 80,
        alignItems: "center"
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F0F0F',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderColor: "#197540",
        borderWidth: 3,
        borderRadius: 8,
        padding: 16,
        alignItems: "center"
    },
    modalImage: { 
        width: '100%', 
        height: 180, 
        borderRadius: 4, 
        marginBottom: 12 
    },
    modalTitle: { 
        fontSize: 20, 
        fontWeight: '700', 
        marginBottom: 8, 
        color: '#333' 
    },
    modalDescription: { 
        fontSize: 16, 
        lineHeight: 22, 
        color: '#555', 
        marginBottom: 12 
    },
    modalPrice: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#0F0F0F', 
        marginBottom: 16 
    },
    closeButton: {
        backgroundColor: '#197540',
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
        width: "100%"
    },
    closeButtonText: { 
        color: '#ffF', 
        fontSize: 16, 
        fontWeight: '500' 
    },
});