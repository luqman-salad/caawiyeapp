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
import * as SecureStore from "expo-secure-store";
import { authService } from "../../services/authService";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<TextInput[]>([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  const showToast = (message: string, callback?: () => void) => {
    setToastMessage(message);
    setErrorMessage(null);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start();

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
      const result = await authService.verifyLoginOtp(phone || "", fullToken);

      // PERSIST TOKEN TO SECURE STORAGE
      if (result.token) {
        await SecureStore.setItemAsync("userToken", result.token);
      }

      if (result.role === 'technician') {
        showToast("Technician Verified!", () => router.replace("/(technician)"));
      } else {
        showToast("Access Granted!", () => router.replace("/(customer)/home"));
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Verification failed.");
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
      setErrorMessage(error.message || "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={isSubmitting}>
            <Ionicons name="arrow-back" size={24} color="#001a3d" />
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.headerContainer}>
              <Text style={styles.mainTitle}>Security Verification</Text>
              <Text style={styles.subTitle}>Enter the 4-digit code sent to <Text style={styles.phoneHighlight}>{phone || "+25261XXXXXXX"}</Text></Text>
            </View>

            {errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.otpGridContainer}>
              {otpCode.map((digit, index) => (
                <View key={index} style={[styles.otpBox, { 
                  borderColor: focusedIndex === index ? "#10b981" : (digit ? "#10b981" : "#e2e8f0"),
                  backgroundColor: "#ffffff"
                }]}>
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
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity style={[styles.verifyButton, isSubmitting && styles.disabledButton]} onPress={handleVerifySubmit} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.verifyButtonText}>Verify Token</Text>}
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
  },
  verifyButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#10b981",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: "#cbd5e0",
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
    color: "#10b981",
  },
});