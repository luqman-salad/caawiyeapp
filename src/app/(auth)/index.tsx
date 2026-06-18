import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../../services/authService";

export default function UnifiedLoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    setErrorMessage(null);
    const sanitizedPhone = phone.trim();

    if (!sanitizedPhone || sanitizedPhone.length < 8) {
      setErrorMessage("Please enter a valid mobile phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      // The authService now handles 'LOGIN' as a default parameter
      // This call will send the correct JSON payload to your backend
      await authService.requestLoginOtp(sanitizedPhone); 
      
      router.push({
        pathname: "/(auth)/verifyOtp",
        params: { phone: sanitizedPhone },
      });
    } catch (error: any) {
      // This captures the error message from the backend or the service layer
      setErrorMessage(error.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand and Form Design preserved exactly as requested */}
          <View style={styles.brandContainer}>
            <Text style={styles.logoText}>Caawiye</Text>
            <Text style={styles.welcomeTitle}>Secure Sign In</Text>
            <Text style={styles.welcomeSubtitle}>
              Enter your phone number to request a secure verification code for your account.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={[styles.inputWrapper, errorMessage ? styles.inputWrapperError : null]}>
              <Ionicons name="call-outline" size={20} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g., +25261XXXXXXX"
                placeholderTextColor="#a0aec0"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                editable={!isSubmitting}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              activeOpacity={0.8}
              onPress={handleRequestOtp}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Send Security Code</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Don't have an account?</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.linksVerticalStack}>
              <TouchableOpacity 
                style={styles.actionLinkRow}
                onPress={() => router.push("/(auth)/registerCustomer" as any)} 
                disabled={isSubmitting}
              >
                <Ionicons name="person-add-outline" size={18} color="#10b981" />
                <Text style={styles.primaryLinkText}>Create Customer Account</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionLinkRow, { marginTop: 16 }]}
                onPress={() => router.push("/(auth)/registerTechnician" as any)} 
                disabled={isSubmitting}
              >
                <Ionicons name="build-outline" size={18} color="#10b981" />
                <Text style={styles.primaryLinkText}>Register as Technician</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... (Your existing styles remain here)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 },
  brandContainer: { alignItems: "flex-start", marginBottom: 36, width: "100%", maxWidth: 320, alignSelf: "center" },
  logoText: { fontSize: 24, fontWeight: "900", color: "#10b981", marginBottom: 16 },
  welcomeTitle: { fontSize: 28, fontWeight: "800", color: "#001a3d" },
  welcomeSubtitle: { fontSize: 15, fontWeight: "500", color: "#718096", lineHeight: 22, marginTop: 8 },
  formContainer: { width: "100%", maxWidth: 320, alignSelf: "center" },
  errorBanner: { backgroundColor: "#fef2f2", borderColor: "#fee2e2", borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 20 },
  errorBannerText: { color: "#991b1b", fontSize: 13, fontWeight: "600", flex: 1 },
  inputLabel: { fontSize: 14, fontWeight: "700", color: "#001a3d", marginBottom: 8 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f7fafc", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 14, height: 54, marginBottom: 24 },
  inputWrapperError: { borderColor: "#ef4444", backgroundColor: "#fff5f5" },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, color: "#001a3d", fontSize: 16, fontWeight: "600", height: "100%" },
  submitButton: { width: "100%", height: 54, backgroundColor: "#10b981", borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 24, elevation: 3 },
  disabledButton: { backgroundColor: "#cbd5e0" },
  submitButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e2e8f0" },
  dividerText: { fontSize: 13, color: "#a0aec0", paddingHorizontal: 10, fontWeight: "500" },
  linksVerticalStack: { width: "100%", marginTop: 8 },
  actionLinkRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 12, height: 48, width: "100%" },
  primaryLinkText: { fontSize: 14, fontWeight: "700", color: "#10b981", marginLeft: 8 },
});