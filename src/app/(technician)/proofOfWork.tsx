import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { completeTicket } from '../../services/ticketService';

export default function ProofOfWorkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const taskId = (params.id as string);

  const [completionNote, setCompletionNote] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setAfterPhoto(result.assets[0].uri);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async () => {
    if (!afterPhoto) {
      setErrorMessage("Please select an 'After' photo of the completed work.");
      return;
    }
    if (otpCode.length !== 4) {
      setErrorMessage("Please enter the 4-digit customer verification code.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await completeTicket(taskId, otpCode, afterPhoto, completionNote);
      setSuccessMessage("Work submitted successfully!");
      // Redirect after a short delay so the user sees the success message
      setTimeout(() => router.dismissAll(), 1500);
    } catch (err: any) {
      console.log("FULL ERROR RESPONSE:", JSON.stringify(err.response?.data, null, 2));
      const msg = err.response?.data?.message || "Failed to submit. Please try again.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.screenTitle}>Proof of Work</Text>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* Success Banner */}
          {successMessage && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginRight: 8 }} />
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          )}

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>After Photo</Text>
            <TouchableOpacity style={styles.dashedCaptureBox} onPress={handlePickImage}>
              {afterPhoto ? (
                <Image source={{ uri: afterPhoto }} style={styles.previewImage} />
              ) : (
                <><Ionicons name="camera-outline" size={28} color="#94a3b8" /><Text style={styles.captureBoxText}>Select Photo</Text></>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Completion Note</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe work completed..."
              value={completionNote}
              onChangeText={setCompletionNote}
              multiline
            />
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Customer OTP</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="0000"
              keyboardType="number-pad"
              maxLength={4}
              value={otpCode}
              onChangeText={(text) => { setOtpCode(text); setErrorMessage(null); }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomDock}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Completion</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { padding: 24, paddingBottom: 110 },
  screenTitle: { fontSize: 24, fontWeight: "800", color: "#001a3d", marginBottom: 20 },
  errorBanner: {
    backgroundColor: "#fef2f2", borderColor: "#fee2e2", borderWidth: 1,
    borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 20,
  },
  errorBannerText: { color: "#991b1b", fontSize: 13, fontWeight: "600", flex: 1 },
  successBanner: {
    backgroundColor: "#ecfdf5", borderColor: "#d1fae5", borderWidth: 1,
    borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 20,
  },
  successBannerText: { color: "#065f46", fontSize: 13, fontWeight: "600", flex: 1 },
  inputCard: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "700", color: "#001a3d", marginBottom: 8 },
  dashedCaptureBox: { height: 200, borderWidth: 1.5, borderColor: "#e2e8f0", borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: "#f7fafc" },
  previewImage: { width: '100%', height: '100%', borderRadius: 12 },
  captureBoxText: { fontSize: 12, color: "#94a3b8", fontWeight: "600", marginTop: 8 },
  textArea: { backgroundColor: "#f7fafc", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, height: 100, fontSize: 16 },
  otpInput: { backgroundColor: "#f7fafc", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, height: 54, textAlign: 'center', fontSize: 18, fontWeight: '700', letterSpacing: 4 },
  bottomDock: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: "#ffffff", padding: 24, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  submitButton: { backgroundColor: "#10b981", height: 54, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  disabledButton: { backgroundColor: "#cbd5e0" },
  submitButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});