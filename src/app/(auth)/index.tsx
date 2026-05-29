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

type LoginTab = 'phone' | 'id';

export default function CaawiyeLoginScreen() {
  const [activeTab, setActiveTab] = useState<LoginTab>('phone');
  const [inputValue, setInputValue] = useState('');
  const router = useRouter(); 

  const handleLogin = () => {
    router.replace('/(technician)'); 
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
            
            {/* Green Profile Header Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.greenCircle}>
                <Feather name="user" size={40} color="#ffffff" />
              </View>
            </View>

            {/* Branding */}
            <Text style={styles.mainTitle}>Caawiye Login</Text>
            <Text style={styles.subTitle}>Field Technician App</Text>

            {/* Segmented Tab Control */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'phone' && styles.activeTabButton]}
                activeOpacity={0.8}
                onPress={() => { setActiveTab('phone'); setInputValue(''); }}
              >
                <Ionicons name="call-outline" size={18} color={activeTab === 'phone' ? '#00b047' : '#4a5568'} />
                <Text style={[styles.tabButtonText, activeTab === 'phone' && styles.activeTabButtonText]}>Phone</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'id' && styles.activeTabButton]}
                activeOpacity={0.8}
                onPress={() => { setActiveTab('id'); setInputValue(''); }}
              >
                <Feather name="user" size={18} color={activeTab === 'id' ? '#00b047' : '#4a5568'} />
                <Text style={[styles.tabButtonText, activeTab === 'id' && styles.activeTabButtonText]}>ID</Text>
              </TouchableOpacity>
            </View>

            {/* Input Section */}
            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>
                {activeTab === 'phone' ? 'Phone Number' : 'Technician ID'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={activeTab === 'phone' ? '+25261XXXXXXX' : 'e.g. TECH-982'}
                placeholderTextColor="#a0aec0"
                keyboardType={activeTab === 'phone' ? 'phone-pad' : 'default'}
                value={inputValue}
                onChangeText={setInputValue}
              />
            </View>

            {/* Green Login Button */}
            <TouchableOpacity 
              style={styles.loginButton} 
              activeOpacity={0.9}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Updated Sign Up Footer Section */}
            <View style={styles.footerContainer}>
              <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
              </View>
              <View style={styles.footerRow}>
              <Text style={styles.footerText}>I'm Customer? </Text>
              <TouchableOpacity onPress={() => router.push('/(customer)/home')}>
                <Text style={styles.footerLink}>Customer App</Text>
              </TouchableOpacity>
              </View>
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
    paddingVertical: 24,
  },
  card: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    color: '#001a3d' 
  },
  subTitle: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: '#4a7396', 
    marginTop: 4, 
    marginBottom: 32 
  },
  tabContainer: { 
    flexDirection: 'row', 
    width: '100%', 
    backgroundColor: '#f1f3f7', 
    borderRadius: 12, 
    padding: 4, 
    marginBottom: 28 
  },
  tabButton: { 
    flex: 1, 
    flexDirection: 'row', 
    height: 46, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  activeTabButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#4a5568', 
    marginLeft: 8 
  },
  activeTabButtonText: { 
    color: '#00b047', 
    fontWeight: '700' 
  },
  inputFormGroup: { 
    width: '100%', 
    alignItems: 'flex-start', 
    marginBottom: 24 
  },
  inputLabel: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#31476e', 
    marginBottom: 10 
  },
  textInput: { 
    width: '100%', 
    height: 56, 
    borderWidth: 1.5, 
    borderColor: '#cbd5e0', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    color: '#1a202c', 
    backgroundColor: '#ffffff' 
  },
  loginButton: { 
    width: '100%', 
    height: 54, 
    backgroundColor: '#00b047', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  loginButtonText: { 
    color: '#ffffff', 
    fontSize: 17, 
    fontWeight: '700' 
  },
  footerContainer:{
    flexDirection: 'column',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  footerText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#718096' 
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00b047',
  },
});