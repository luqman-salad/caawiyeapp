import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();

  // OTP Input State (4-digit structure block matching backend)
  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<TextInput[]>([]);

  // Professional UI Feedback State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Animation setup for modern Toast notification
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  // Trigger professional toast notification banner
  const showToast = (message: string, callback?: () => void) => {
    setToastMessage(message);
    setErrorMessage(null); // Clear errors on success actions

    // Animate In
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start();

    // Auto dismiss after 2 seconds and run navigation callback
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -20, duration: 250, useNativeDriver: true })
      ]).start(() => {
        setToastMessage(null);
        if (callback) callback();
      });
    }, 2000);
  };

  const handleOtpChange = (text: string, index: number) => {
    if (errorMessage) setErrorMessage(null);

    const sanitizedText = text.replace(/[^0-9]/g, "");
    const updatedOtp = [...otpCode];
    
    updatedOtp[index] = sanitizedText.slice(-1);
    setOtpCode(updatedOtp);

    // Automatically shift focus forward
    if (sanitizedText && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!otpCode[index] && index > 0) {
        const updatedOtp = [...otpCode];
        updatedOtp[index - 1] = "";
        setOtpCode(updatedOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifySubmit = async () => {
    const fullToken = otpCode.join("");
    if (fullToken.length < 4) {
      setErrorMessage("Please fill in all 4 verification boxes.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Execute token auth check with automated claims decoding inside service layer
      const result = await authService.verifyLoginOtp(phone || "", fullToken);

      // Route with absolute certainty based on real backend profile settings
      if (result.role === 'technician') {
        showToast("Technician Verified! Loading Portal...", () => {
          router.replace("/(technician)");
        });
      } else {
        showToast("Access Granted! Welcome Back...", () => {
          router.replace("/(customer)/home");
        });
      }

    } catch (error: any) {
      setErrorMessage(error.message || "Invalid or expired verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!phone) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await authService.requestLoginOtp(phone);
      showToast("A fresh secure code has been sent.");
    } catch (error: any) {
      setErrorMessage(error.message || "Unable to process dynamic OTP request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Floating Animated Toast Component */}
      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
            disabled={isSubmitting}
          >
            <Ionicons name="arrow-back" size={24} color="#001a3d" />
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.headerContainer}>
              <Text style={styles.mainTitle}>Security Verification</Text>
              <Text style={styles.subTitle}>
                Enter the 4-digit verification code sent to{" "}
                <Text style={styles.phoneHighlight}>{phone || "+25261XXXXXXX"}</Text>
              </Text>
            </View>

            {/* Premium Inline Error Banner */}
            {errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.otpGridContainer}>
              {otpCode.map((digit, index) => {
                let boxBorderColor = "#e2e8f0"; 
                let boxBgColor = "#f7fafc";

                if (focusedIndex === index) {
                  boxBorderColor = "#10b981"; // Active border matches green theme
                  boxBgColor = "#ffffff";
                } else if (digit.length > 0) {
                  boxBorderColor = "#10b981"; // Filled boxes change to brand color
                  boxBgColor = "#ffffff";
                } else if (errorMessage) {
                  boxBorderColor = "#ef4444";
                  boxBgColor = "#fff5f5";
                }

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      { borderColor: boxBorderColor, backgroundColor: boxBgColor }
                    ]}
                  >
                    <TextInput
                      ref={(el) => {
                        inputRefs.current[index] = el as TextInput;
                      }}
                      style={styles.otpInputText}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      editable={!isSubmitting}
                      selectTextOnFocus
                    />
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, isSubmitting && styles.disabledButton]}
              activeOpacity={0.9}
              onPress={handleVerifySubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify Token</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the SMS? </Text>
              <TouchableOpacity onPress={handleResendOtp} disabled={isSubmitting}>
                <Text style={styles.resendLink}>Resend Code</Text>
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
  toastContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 64 : 24,
    left: 24,
    right: 24,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 999,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  toastText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
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
    marginBottom: 32,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
  },
  headerContainer: {
    alignItems: "flex-start",
    marginBottom: 24,
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
    lineHeight: 22,
    marginTop: 8,
  },
  phoneHighlight: {
    color: "#001a3d",
    fontWeight: "700",
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderColor: "#fee2e2",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  errorBannerText: {
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  otpGridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 36,
  },
  otpBox: {
    width: 58,
    height: 64,
    borderWidth: 1.5,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  otpInputText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#001a3d",
    width: "100%",
    height: "100%",
    textAlign: "center",
    ...Platform.select({
      ios: { paddingBottom: 0 },
      android: { paddingVertical: 0 }
    }),
  },
  verifyButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#10b981", // Brand Theme Green
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
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
  verifyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#718096",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981", // Link text updated to brand green
  },
});