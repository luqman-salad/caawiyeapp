import React, { useState, useEffect } from "react";
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { createTicket } from "../../services/ticketService";
import Header from "../../components/Header";

export default function ReportIssueScreen() {
  const router = useRouter();
  const { issueTitle, skillRequired } = useLocalSearchParams<{ issueTitle: string, skillRequired: string }>();
  
  const [description, setDescription] = useState("");
  const [landmark, setLandmark] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } else {
        setErrorMessage("Location permission is required to report an issue.");
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!description || !landmark) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    if (!location) {
      setErrorMessage("Waiting for GPS coordinates... Please ensure location is enabled.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTicket({
        title: issueTitle,
        description,
        skill_required: skillRequired,
        landmark,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      router.replace("/(customer)/home");
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={['bottom']}>
      <Header title="Report Issue" showBack={true} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Report {issueTitle}</Text>
        
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        <Text style={styles.label}>Description of Issue</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="E.g., Red alarm light on router..." 
          placeholderTextColor="#a0aec0"
          multiline 
          onChangeText={(val) => { setDescription(val); if(errorMessage) setErrorMessage(null); }} 
        />

        <Text style={styles.label}>Nearest Landmark</Text>
        <TextInput 
          style={styles.input} 
          placeholder="E.g., Opposite Shamo Hotel" 
          placeholderTextColor="#a0aec0"
          onChangeText={(val) => { setLandmark(val); if(errorMessage) setErrorMessage(null); }} 
        />

        <TouchableOpacity 
          style={[styles.button, isSubmitting && styles.disabledButton]} 
          onPress={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Ticket</Text>
          )}
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#001a3d', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', color: '#001a3d', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20, color: '#001a3d' },
  textArea: { height: 120, textAlignVertical: 'top' },
  button: { backgroundColor: '#10b981', padding: 18, borderRadius: 12, alignItems: 'center' },
  disabledButton: { backgroundColor: '#cbd5e0' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderColor: "#fee2e2",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  errorBannerText: {
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
});