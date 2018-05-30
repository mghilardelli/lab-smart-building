import React from 'react';
import { Text, StyleSheet } from 'react-native';

const StatusBar = ({ message }) => {
    return (
        <Text style={styles.message}>{message}</Text>
    );
};

const styles = StyleSheet.create({
    message: {
        paddingTop: 10,
        paddingLeft: 10,
        fontSize: 14,
        color: 'white',
        backgroundColor: '#666666',
        height: 45,
        width: "100%",
    }
});

export default StatusBar;