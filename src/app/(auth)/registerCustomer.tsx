import { Feather, Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function CustomerSignupScreen() {
  const router = useRouter();

  // Form State Management matching your exact API model requirements
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // Field Focus Control states for clean UI borders
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Network Pending State
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    // 1. Client-Side Validation
    if (!name.trim() || !phone.trim() || !email.trim() || !address.trim() || !accountNumber.trim()) {
      Alert.alert("Missing Fields", "Please populate all registration entries.");
      return;
    }

    // Begin Loading State
    setIsSubmitting(true);

    try {
      // 2. Resolve target metadata for tracking headers programmatically
      let deviceId = "unknown_device";
      if (Platform.OS === "android") {
        const androidId = await Application.getAndroidId();
        deviceId = androidId || "fallback_android_id";
      } else if (Platform.OS === "ios") {
        const iosId = await Application.getIosIdForVendorAsync();
        deviceId = iosId || "fallback_ios_id";
      }

      const deviceName = `${Device.brand || ""} ${Device.modelName || "Mobile-Device"}`.trim();

      // 3. Dispatch data object and device parameters forward to authService
      await authService.registerCustomer(
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          address: address.trim(),
          account_number: accountNumber.trim(),
        },
        {
          deviceId: deviceId,
          deviceName: deviceName,
        }
      );

      // 4. Success Handlers & Routing Redirect
      Alert.alert(
        "Account Created",
        "Your customer profile has been registered successfully! Let's take you to login.",
        [{ text: "Proceed", onPress: () => router.replace("/(auth)") }]
      );
    } catch (error: any) {
      // 5. Handle structural backend error notifications transparently
      Alert.alert("Registration Failed", error.message || "An unexpected network error occurred.");
    } finally {
      // End Loading State
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
          {/* Top Back Navigation Header Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
            disabled={isSubmitting}
          >
            <Ionicons name="arrow-back" size={24} color="#001a3d" />
          </TouchableOpacity>

          <View style={styles.card}>
            {/* Branding Header Area */}
            <View style={styles.headerContainer}>
              <Text style={styles.mainTitle}>Create Account</Text>
              <Text style={styles.subTitle}>Join Caawiye as a Customer</Text>
            </View>

            {/* Full Name Input */}
            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === "name" && styles.inputWrapperFocused,
                name.length > 0 && focusedField !== "name" && styles.inputWrapperFilled
              ]}>
                <Feather name="user" size={18} color={focusedField === "name" || name.length > 0 ? "#10b981" : "#a0aec0"} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Hassan Ali"
                  placeholderTextColor="#a0aec0"
                  value={name}
                  onChangeText={setName}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === "phone" && styles.inputWrapperFocused,
                phone.length > 0 && focusedField !== "phone" && styles.inputWrapperFilled
              ]}>
                <Feather name="phone" size={18} color={focusedField === "phone" || phone.length > 0 ? "#10b981" : "#a0aec0"} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. +252615550100"
                  placeholderTextColor="#a0aec0"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === "email" && styles.inputWrapperFocused,
                email.length > 0 && focusedField !== "email" && styles.inputWrapperFilled
              ]}>
                <Feather name="mail" size={18} color={focusedField === "email" || email.length > 0 ? "#10b981" : "#a0aec0"} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. customer@hormuud.com"
                  placeholderTextColor="#a0aec0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Address Input */}
            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === "address" && styles.inputWrapperFocused,
                address.length > 0 && focusedField !== "address" && styles.inputWrapperFilled
              ]}>
                <Feather name="map-pin" size={18} color={focusedField === "address" || address.length > 0 ? "#10b981" : "#a0aec0"} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Maka Al Mukarama, Mogadishu"
                  placeholderTextColor="#a0aec0"
                  value={address}
                  onChangeText={setAddress}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField("address")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Account Number Input Field */}
            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Account Number</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === "accountNumber" && styles.inputWrapperFocused,
                accountNumber.length > 0 && focusedField !== "accountNumber" && styles.inputWrapperFilled
              ]}>
                <Feather name="hash" size={18} color={focusedField === "accountNumber" || accountNumber.length > 0 ? "#10b981" : "#a0aec0"} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. AC-98124"
                  placeholderTextColor="#a0aec0"
                  autoCapitalize="characters"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField("accountNumber")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Primary Action Registration Button */}
            <TouchableOpacity
              style={[styles.signupButton, isSubmitting && styles.disabledButton]}
              activeOpacity={0.9}
              onPress={handleSignup}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up as Customer</Text>
              )}
            </TouchableOpacity>

            {/* Footer Workspace Routing link */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)")} disabled={isSubmitting}>
                <Text style={styles.footerLink}>Log In</Text>
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
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    alignItems: "flex-start",
    marginBottom: 28,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#001a3d",
  },
  subTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#718096",
    marginTop: 6,
  },
  inputFormGroup: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#001a3d",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 54,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#f7fafc",
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: "#10b981",
    backgroundColor: "#ffffff",
  },
  inputWrapperFilled: {
    borderColor: "#10b981",
    backgroundColor: "#ffffff",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "600",
    color: "#001a3d",
  },
  signupButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#10b981",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#cbd5e0",
    shadowOpacity: 0,
    elevation: 0,
  },
  signupButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#718096",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },
});