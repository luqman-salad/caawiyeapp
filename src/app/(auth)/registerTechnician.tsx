import React, { useState, useRef } from 'react';
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
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiClient } from '../../utils/apis';

export default function CaawiyeRegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [currentSkillInput, setCurrentSkillInput] = useState('');
  const [zoneAssignment, setZoneAssignment] = useState('');
  
  // Focus and layout activity states
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom Premium UI feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const router = useRouter();

  // Animation values for smooth notification slides
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  // Handles executing the custom success banner before executing navigation jumps
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
    }, 2200);
  };

  // Live monitor typing text stream to intercept commas and format skills instantly
  const handleSkillsInputChange = (text: string) => {
    if (errorMessage) setErrorMessage(null);
    
    if (text.includes(',')) {
      const parts = text.split(',');
      const newSkill = parts[0].trim();
      
      if (newSkill && !skillsList.includes(newSkill)) {
        setSkillsList([...skillsList, newSkill]);
      }
      // Keep whatever text was typed after the comma (if anything)
      setCurrentSkillInput(parts[1] || '');
    } else {
      setCurrentSkillInput(text);
    }
  };

  // Allow transforming the remaining text inside input field on blur
  const handleSkillsBlur = () => {
    setFocusedField(null);
    const finalSkill = currentSkillInput.trim();
    if (finalSkill && !skillsList.includes(finalSkill)) {
      setSkillsList([...skillsList, finalSkill]);
      setCurrentSkillInput('');
    }
  };

  // Remove a structured skill pill tag from list array representation
  const removeSkillTag = (indexToRemove: number) => {
    setSkillsList(skillsList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRegister = async () => {
    setErrorMessage(null);

    // Form Client-Side Validation Guard
    if (!name.trim() || !phone.trim() || !email.trim() || !zoneAssignment.trim()) {
      setErrorMessage("Please fill out all required configuration fields.");
      return;
    }

    setIsSubmitting(true);

    // If there is still uncommitted text remaining inside the entry line, parse it out
    let finalSkills = [...skillsList];
    if (currentSkillInput.trim() && !finalSkills.includes(currentSkillInput.trim())) {
      finalSkills.push(currentSkillInput.trim());
    }

    // Restructuring body context matching your exact backend data contract
    const registrationPayload = {
      phone: phone.trim(),
      email: email.trim(),
      name: name.trim(),
      skills: finalSkills.length > 0 ? finalSkills : ["General Maintenance"],
      zone_assignment: zoneAssignment.trim(),
      latitude: 2.0396,   // Baseline coordinates for Mogadishu tracking
      longitude: 45.3182  
    };

    try {
      // Corrected target endpoint to use clean v1 resource routing
      const response = await apiClient.post('/technicians', registrationPayload);

      if (response.data) {
        showToast("Technician profile configured successfully!", () => {
          router.replace('/(auth)'); 
        });
      }
    } catch (error: any) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Unable to process technician verification request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (text: string, setterFn: (val: string) => void) => {
    setterFn(text);
    if (errorMessage) setErrorMessage(null);
  };

  const getInputWrapperStyle = (fieldName: string, value: string) => {
    if (errorMessage && !value.trim() && fieldName !== 'skillsText') {
      return styles.inputWrapperError;
    }
    if (focusedField === fieldName) {
      return styles.inputWrapperFocused;
    }
    return value.trim().length > 0 ? styles.inputWrapperFilled : {};
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Floating Animated Success Toast */}
      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Top Back Navigation Header Button */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
          disabled={isSubmitting}
        >
          <Ionicons name="arrow-back" size={24} color="#001a3d" />
        </TouchableOpacity>
      </View>

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
            
            {/* Field Technician Top Header Brand Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.greenCircle}>
                <Feather name="shield" size={34} color="#ffffff" />
              </View>
            </View>

            <Text style={styles.mainTitle}>Join Caawiye</Text>
            <Text style={styles.subTitle}>Create Field Technician Account</Text>

            {/* Premium Inline Error Banner */}
            {errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            {/* Input Form Fields */}
            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputWrapper, getInputWrapperStyle('name', name)]}>
                <Feather name="user" size={18} color={focusedField === 'name' || name.length > 0 ? '#10b981' : '#a0aec0'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, isSubmitting && styles.disabledInput]}
                  placeholder="e.g. Abdi Farah"
                  placeholderTextColor="#a0aec0"
                  value={name}
                  onChangeText={(text) => handleInputChange(text, setName)}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[styles.inputWrapper, getInputWrapperStyle('phone', phone)]}>
                <Feather name="phone" size={18} color={focusedField === 'phone' || phone.length > 0 ? '#10b981' : '#a0aec0'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, isSubmitting && styles.disabledInput]}
                  placeholder="e.g. +252616660200"
                  placeholderTextColor="#a0aec0"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(text) => handleInputChange(text, setPhone)}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputWrapper, getInputWrapperStyle('email', email)]}>
                <Feather name="mail" size={18} color={focusedField === 'email' || email.length > 0 ? '#10b981' : '#a0aec0'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, isSubmitting && styles.disabledInput]}
                  placeholder="e.g. technician@hormuud.com"
                  placeholderTextColor="#a0aec0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => handleInputChange(text, setEmail)}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Zone Assignment</Text>
              <View style={[styles.inputWrapper, getInputWrapperStyle('zoneAssignment', zoneAssignment)]}>
                <Feather name="map-pin" size={18} color={focusedField === 'zoneAssignment' || zoneAssignment.length > 0 ? '#10b981' : '#a0aec0'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, isSubmitting && styles.disabledInput]}
                  placeholder="e.g. Waberi"
                  placeholderTextColor="#a0aec0"
                  value={zoneAssignment}
                  onChangeText={(text) => handleInputChange(text, setZoneAssignment)}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField('zoneAssignment')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.inputFormGroup}>
              <Text style={styles.inputLabel}>Specialized Skills (Separate with commas)</Text>
              
              {/* Render Skill Tag Box Blocks Row Layout */}
              {skillsList.length > 0 && (
                <View style={styles.skillsTagsContainer}>
                  {skillsList.map((skill, index) => (
                    <View key={index} style={styles.skillTagPill}>
                      <Text style={styles.skillTagText}>{skill}</Text>
                      <TouchableOpacity 
                        onPress={() => removeSkillTag(index)} 
                        style={styles.skillTagDeleteButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close-circle" size={16} color="#065f46" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={[
                styles.inputWrapper, 
                focusedField === 'skillsText' && styles.inputWrapperFocused,
                skillsList.length > 0 && focusedField !== 'skillsText' && styles.inputWrapperFilled
              ]}>
                <Feather name="layers" size={18} color={focusedField === 'skillsText' || skillsList.length > 0 ? '#10b981' : '#a0aec0'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, isSubmitting && styles.disabledInput]}
                  placeholder={skillsList.length > 0 ? "Add another skill..." : "e.g. Fiber Optic, Router Setup"}
                  placeholderTextColor="#a0aec0"
                  value={currentSkillInput}
                  onChangeText={handleSkillsInputChange}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField('skillsText')}
                  onBlur={handleSkillsBlur}
                />
              </View>
            </View>

            {/* Submission Action Button Container */}
            <TouchableOpacity 
              style={[styles.registerButton, isSubmitting && styles.disabledButton]} 
              activeOpacity={0.9}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.registerButtonText}>Sign Up as Technician</Text>
              )}
            </TouchableOpacity>

            {/* Footer Form Redirect Navigation link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already registered? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)')} disabled={isSubmitting}>
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
    backgroundColor: '#ffffff',
  },
  navigationHeader: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 64 : 24,
    left: 24,
    right: 24,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  toastText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    alignSelf: 'center',
    alignItems: 'center',
  },
  iconContainer: { 
    marginBottom: 16,
    marginTop: 8,
  },
  greenCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#718096', 
    marginTop: 6, 
    marginBottom: 28,
    textAlign: 'center',
  },
  errorBanner: {
    width: '100%',
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorBannerText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputFormGroup: { 
    width: '100%', 
    alignItems: 'flex-start', 
    marginBottom: 20,
  },
  inputLabel: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#001a3d', 
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 54,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f7fafc',
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: '#10b981',
    backgroundColor: '#ffffff',
  },
  inputWrapperFilled: {
    borderColor: '#10b981',
    backgroundColor: '#ffffff',
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fdf2f2',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: { 
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '600',
    color: '#001a3d',
  },
  disabledInput: {
    opacity: 0.6,
  },
  skillsTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 8,
    gap: 6,
  },
  skillTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  skillTagText: {
    color: '#065f46',
    fontSize: 13,
    fontWeight: '700',
  },
  skillTagDeleteButton: {
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButton: { 
    width: '100%', 
    height: 54, 
    backgroundColor: '#10b981', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#cbd5e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  footerText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#718096',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
});