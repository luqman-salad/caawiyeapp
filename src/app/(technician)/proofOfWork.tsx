import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ProofOfWorkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const taskId = (params.id as string) || 'T001';

  // Form State Management
  const [completionNote, setCompletionNote] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);

  // Photo Library Picker matching the latest Docs API syntax
  const handlePickImage = async (type: 'before' | 'after') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Using the exact string literal array syntax from the documentation
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      if (type === 'before') {
        setBeforePhoto(selectedUri);
      } else {
        setAfterPhoto(selectedUri);
      }
    }
  };

  const handleSubmit = () => {
    if (!completionNote.trim()) {
      Alert.alert('Missing Info', 'Please add a completion note summarizing the work done.');
      return;
    }
    if (otpCode.length < 4) {
      Alert.alert('Verification Required', 'Please enter the 4-digit customer OTP verification code.');
      return;
    }

    Alert.alert(
      'Job Completed',
      `Proof of work for Ticket #${taskId} has been submitted successfully!`,
      [
        {
          text: 'Return to Dashboard',
          onPress: () => router.dismissAll(), 
        },
      ]
    );
  };

  const isFormValid = completionNote.trim().length > 0 && otpCode.length === 4;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* PHOTO COMPONENT ROW */}
          <View style={styles.photoGrid}>
            {/* Before Photo Card */}
            <View style={styles.photoCard}>
              <Text style={styles.cardLabel}>Before Photo</Text>
              <TouchableOpacity 
                style={[styles.dashedCaptureBox, beforePhoto && styles.activeCaptureBox]} 
                onPress={() => handlePickImage('before')}
                activeOpacity={0.7}
              >
                {beforePhoto ? (
                  <Image source={{ uri: beforePhoto }} style={styles.previewImage} />
                ) : (
                  <>
                    <Feather name="image" size={28} color="#94a3b8" />
                    <Text style={styles.captureBoxText}>Select Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* After Photo Card */}
            <View style={styles.photoCard}>
              <Text style={styles.cardLabel}>After Photo</Text>
              <TouchableOpacity 
                style={[styles.dashedCaptureBox, afterPhoto && styles.activeCaptureBox]} 
                onPress={() => handlePickImage('after')}
                activeOpacity={0.7}
              >
                {afterPhoto ? (
                  <Image source={{ uri: afterPhoto }} style={styles.previewImage} />
                ) : (
                  <>
                    <Feather name="image" size={28} color="#94a3b8" />
                    <Text style={styles.captureBoxText}>Select Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* COMPLETION PROGRESS SUMMARY NOTE */}
          <View style={styles.inputCard}>
            <Text style={styles.cardLabel}>Completion Note</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the work completed, parts used, etc."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={completionNote}
              onChangeText={setCompletionNote}
            />
          </View>

          {/* CUSTOMER VERIFICATION TOKEN */}
          <View style={styles.inputCard}>
            <Text style={styles.cardLabel}>Customer OTP Code</Text>
            <Text style={styles.cardHelperText}>Ask the customer for their 4-digit verification code</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="0000"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              maxLength={4}
              value={otpCode}
              onChangeText={setOtpCode}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FOOTER BAR ACTION DOCK */}
      <View style={styles.bottomDock}>
        <TouchableOpacity 
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <Feather name="check-circle" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.submitButtonText}>Submit Completion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  photoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  photoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  dashedCaptureBox: {
    height: 120,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  activeCaptureBox: {
    borderColor: '#00b047',
    borderStyle: 'solid',
    backgroundColor: '#ffffff',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  captureBoxText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 8,
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHelperText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 12,
    marginTop: -4,
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#0f172a',
    height: 100,
    fontWeight: '500',
  },
  otpInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    height: 52,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 4,
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: '#00b047',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});