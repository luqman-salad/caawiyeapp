import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CaawiyeRegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [techId, setTechId] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();

  const handleRegister = () => {
    // For prototype testing, register successfully and bounce them to the login screen
    alert('Account created successfully! Please log in.');
    router.replace('/(auth)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            
            {/* Green Profile Header Icon (Plus badge matching sign up) */}
            <View style={styles.iconContainer}>
              <View style={styles.greenCircle}>
                <Feather name="user-plus" size={38} color="#ffffff" />
              </View>
            </View>

            {/* Branding */}
            <Text style={styles.mainTitle}>Join Caawiye</Text>
            <Text style={styles.subTitle}>Create Field Technician Account</Text>

            {/* Input 1: Full Name */}
            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Cabdi Xasan"
                placeholderTextColor="#a0aec0"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Input 2: Phone Number */}
            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+25261XXXXXXX"
                placeholderTextColor="#a0aec0"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Input 3: Technician ID */}
            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Technician ID</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. TECH-982"
                placeholderTextColor="#a0aec0"
                autoCapitalize="characters"
                value={techId}
                onChangeText={setTechId}
              />
            </View>

            {/* Input 4: Password */}
            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#a0aec0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Green Register Button */}
            <TouchableOpacity 
              style={styles.registerButton} 
              activeOpacity={0.9}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Footer Back Link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)')}>
                <Text style={styles.footerLink}>Login</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  card: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  iconContainer: { marginBottom: 16 },
  greenCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00b047',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#001a3d',
    textAlign: 'center',
  },
  subTitle: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: '#4a7396', 
    marginTop: 4, 
    marginBottom: 24,
    textAlign: 'center',
  },
  inputFormGroup: { 
    width: '100%', 
    alignItems: 'flex-start', 
    marginBottom: 16, // Snug margins for stack form inputs
  },
  inputLabel: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#31476e', 
    marginBottom: 8,
  },
  textInput: { 
    width: '100%', 
    height: 54, 
    borderWidth: 1.5, 
    borderColor: '#cbd5e0', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    color: '#1a202c', 
    backgroundColor: '#ffffff',
  },
  registerButton: { 
    width: '100%', 
    height: 54, 
    backgroundColor: '#00b047', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 12,
    marginBottom: 24,
  },
  registerButtonText: { 
    color: '#ffffff', 
    fontSize: 17, 
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#718096',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00b047',
  },
});