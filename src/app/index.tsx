import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const role = await SecureStore.getItemAsync('userRole');

        if (token && role) {
          if (role === 'technician') {
            router.replace('/(technician)');
          } else {
            router.replace('/(customer)/home');
          }
        } else {
          // If no token or role, clear stored credentials for consistency
          await Promise.all([
            SecureStore.deleteItemAsync('userToken'),
            SecureStore.deleteItemAsync('refreshToken'),
            SecureStore.deleteItemAsync('userRole'),
          ]).catch(() => {});
          router.replace('/(auth)');
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace('/(auth)');
      }
    };

    checkAuthAndRedirect();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
