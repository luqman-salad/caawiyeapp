import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '../../components/Header';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getTicketById, reviewTicket } from '../../services/ticketService';

interface FeedbackTag {
  id: string;
  label: string;
}

export default function WorkProgressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['85%'], []);

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- REVIEW STATE ENGINE ---
  const [rating, setRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const feedbackTags: FeedbackTag[] = [
    { id: '1', label: 'Professional' },
    { id: '2', label: 'On Time' },
    { id: '3', label: 'Quick Resolution' },
    { id: '4', label: 'Knowledgeable' },
    { id: '5', label: 'Friendly' },
    { id: '6', label: 'Clean Work' },
  ];

  const fetchProgress = async () => {
    if (!id) return;
    try {
      const ticketRes = await getTicketById(id as string);

      // Inspecting both common return variations (.success wrapped or direct object payload)
      const ticketData = ticketRes.success ? ticketRes.data : ticketRes;

      if (ticketData) {
        setTicket(ticketData);
        
        // Auto-show rating modal when ticket changes to COMPLETED state and hasn't been rated yet
        if (ticketData.status === 'COMPLETED' && !ticketData.rating_score && !isSubmitted) {
          bottomSheetModalRef.current?.present();
        }
      }
    } catch (error) {
      console.error("Error loading progress ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProgress();
    const interval = setInterval(fetchProgress, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // --- BOTTOM SHEET INTERACTION HANDLERS ---
  const handlePresentReviewSheet = useCallback(() => {
    setRating(0);
    setSelectedTags([]);
    setComment('');
    setIsSubmitted(false);
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCloseReviewSheet = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const toggleTag = (tagLabel: string) => {
    if (selectedTags.includes(tagLabel)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagLabel));
    } else {
      setSelectedTags([...selectedTags, tagLabel]);
    }
  };

  // Inside WorkProgressScreen.tsx

const handleSubmitReview = async () => {
  if (rating === 0 || !ticket) return;
  
  if (!isSubmitted) {
    setSubmittingReview(true);
    try {
      // Matches the Swagger example perfectly
      await reviewTicket(ticket.id, {
        rating: rating,
        tags: selectedTags, // Array of strings (e.g., ["Professional", "On Time"])
        comment: comment.trim() // Text string comment
      });
      
      setIsSubmitted(true);
    } catch (err) {
      console.error("Review Submission Error:", err);
      Alert.alert("Review Failed", "Unable to submit rating at this moment.");
    } finally {
      setSubmittingReview(false);
    }
  } else {
    bottomSheetModalRef.current?.dismiss();
    router.push('/(customer)/home');
  }
};

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  if (loading && !ticket) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#00b047" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={{ color: '#e53e3e', fontWeight: '600' }}>Work progress details not found.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProgress}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- DETERMINE TIMELINE PROGRESS STATES DIRECTLY FROM TICKET STATUS ---
  const statusOrder = ['UNACCEPTED', 'AUTO_DISPATCHING', 'ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'DISPATCHED', 'COMPLETED'];
  const currentStatusIndex = statusOrder.indexOf(ticket.status || 'UNACCEPTED');

  const isCreated = true; // Always true if ticket exists
  const isDispatched = currentStatusIndex >= statusOrder.indexOf('ASSIGNED');
  const isTransit = currentStatusIndex >= statusOrder.indexOf('ON_THE_WAY');
  const isInProgress = currentStatusIndex >= statusOrder.indexOf('IN_PROGRESS');
  const isCompleted = ticket.status === 'COMPLETED';

  // Fallback formatter helper
  const formatTime = (isoString: string | undefined) => {
    if (!isoString) return 'Pending';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <Header title="Work Progress" showBack={true} />

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {/* --- SECTION 1: TIMELINE WORK PROGRESS --- */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>Work Progress - {ticket.ticket_number || 'N/A'}</Text>

              {/* Event 1: Ticket Created */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineIndicatorColumn}>
                  <View style={isCreated ? styles.completedIconCircle : styles.futurePendingIconCircle}>
                    {isCreated && <Feather name="check" size={14} color="#ffffff" />}
                  </View>
                  <View style={isDispatched ? styles.timelineLineLinkActive : styles.timelineLineLinkInactive} />
                </View>
                <View style={styles.timelineTextColumn}>
                  <Text style={styles.timelineTitleText}>Ticket Created</Text>
                  <Text style={styles.timelineTimestampText}>
                    {formatTime(ticket.created_at || ticket.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Event 2: Technician Assigned */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineIndicatorColumn}>
                  <View style={isDispatched ? styles.completedIconCircle : styles.futurePendingIconCircle}>
                    {isDispatched && <Feather name="check" size={14} color="#ffffff" />}
                  </View>
                  <View style={isTransit ? styles.timelineLineLinkActive : styles.timelineLineLinkInactive} />
                </View>
                <View style={styles.timelineTextColumn}>
                  <Text style={isDispatched ? styles.timelineTitleText : styles.timelineTitleTextPending}>Technician Assigned</Text>
                  <Text style={styles.timelineTimestampText}>
                    {isDispatched ? formatTime(ticket.assigned_at || ticket.updated_at) : 'Awaiting assignment'}
                  </Text>
                </View>
              </View>

              {/* Event 3: Technician En Route */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineIndicatorColumn}>
                  <View style={isTransit ? styles.completedIconCircle : styles.futurePendingIconCircle}>
                    {isTransit && <Feather name="check" size={14} color="#ffffff" />}
                  </View>
                  <View style={isInProgress ? styles.timelineLineLinkActive : styles.timelineLineLinkInactive} />
                </View>
                <View style={styles.timelineTextColumn}>
                  <Text style={isTransit ? styles.timelineTitleText : styles.timelineTitleTextPending}>Technician En Route</Text>
                  <Text style={styles.timelineTimestampText}>
                    {isTransit ? formatTime(ticket.transit_at || ticket.updated_at) : 'Pending transit'}
                  </Text>
                </View>
              </View>

              {/* Event 4: Work In Progress */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineIndicatorColumn}>
                  <View style={isInProgress ? styles.completedIconCircle : styles.futurePendingIconCircle}>
                    {isInProgress && <Feather name="check" size={14} color="#ffffff" />}
                  </View>
                  <View style={isCompleted ? styles.timelineLineLinkActive : styles.timelineLineLinkInactive} />
                </View>
                <View style={styles.timelineTextColumn}>
                  <Text style={isInProgress ? styles.timelineTitleText : styles.timelineTitleTextPending}>Work In Progress</Text>
                  <Text style={styles.timelineTimestampText}>
                    {isInProgress ? formatTime(ticket.started_at || ticket.updated_at) : 'Awaiting initialization'}
                  </Text>
                </View>
              </View>

              {/* Event 5: Completed */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineIndicatorColumn}>
                  <View style={isCompleted ? styles.completedIconCircle : styles.futurePendingIconCircle}>
                    {isCompleted && <Feather name="check" size={14} color="#ffffff" />}
                  </View>
                </View>
                <View style={styles.timelineTextColumn}>
                  <Text style={isCompleted ? styles.timelineTitleText : styles.timelineTitleTextPending}>Work Completed</Text>
                  <Text style={styles.timelineTimestampText}>
                    {isCompleted ? formatTime(ticket.completed_at || ticket.updated_at) : 'Incomplete'}
                  </Text>
                </View>
              </View>
            </View>

            {/* --- SECTION 2: ON-SITE VALIDATION METRICS --- */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>On-Site Validation</Text>

              <View style={styles.validationStatusRow}>
                <View style={styles.validationCheckedIconBox}>
                  <Feather name="check-circle" size={18} color="#00b047" />
                </View>
                <View style={styles.validationTextColumn}>
                  <Text style={styles.validationItemTitle}>Safety Check Completed</Text>
                  <Text style={styles.validationItemSubtitle}>Equipment integrity verified</Text>
                </View>
              </View>

              <View style={styles.dashedInteractiveBox}>
                <View style={styles.qrIconContainerBadge}>
                  <MaterialCommunityIcons name="qrcode-scan" size={22} color="#64748b" />
                </View>
                <Text style={styles.dashedBoxTitleText}>Asset Verification</Text>
                <Text style={styles.dashedBoxSubtitleText}>
                  {isInProgress ? "Technician will verify dynamic site assets" : "Pending technician arrival"}
                </Text>
              </View>
            </View>

            {/* --- SECTION 3: PHOTO DOCUMENTATION STATUS --- */}
            <View style={styles.cardSection}>
              <View style={styles.dashedInteractiveBox}>
                <View style={styles.photoIconContainerBadge}>
                  <Feather name="camera" size={22} color="#64748b" />
                </View>
                <Text style={styles.dashedBoxTitleText}>Photo Documentation</Text>
                <Text style={styles.dashedBoxSubtitleText}>
                  {isCompleted ? "Completion photos uploaded successfully." : "Awaiting completion photos"}
                </Text>
              </View>
            </View>

            {/* --- INTERACTIVE ACTION BUTTON LAYOUT FOOTER --- */}
            <View style={styles.footerActionLayoutArea}>
              <TouchableOpacity 
                style={[styles.primaryAuthButton, !isCompleted && { backgroundColor: '#cbd5e0' }]} 
                activeOpacity={0.85}
                onPress={handlePresentReviewSheet}
                disabled={!isCompleted}
              >
                <Text style={styles.primaryAuthButtonText}>Authenticate & Complete Work</Text>
              </TouchableOpacity>
              <Text style={styles.underButtonHelperText}>Verify completion and rate service</Text>
            </View>
          </ScrollView>

          {/* --- RATING & EXPERIENCE EXPERT BOTTOM MODAL SHEET --- */}
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.sheetBackground}
            handleIndicatorStyle={styles.sheetIndicator}
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
          >
            <BottomSheetScrollView 
              style={styles.sheetScrollContainer}
              contentContainerStyle={styles.sheetScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Rate Your Experience</Text>
                <TouchableOpacity onPress={handleCloseReviewSheet} style={styles.closeButtonCircle}>
                  <Feather name="x" size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.avatarCardCenterBlock}>
                <View style={styles.engineerAvatarBadge}>
                  <Text style={styles.engineerInitialsText}>EAS</Text>
                </View>
                <Text style={styles.engineerNameText}>Eng. Abdi Shakuur</Text>
                <Text style={styles.engineerSubTextTitle}>Fiber Splicing Specialist</Text>
              </View>

              <Text style={styles.ratingQuestionText}>How would you rate the service?</Text>

              <View style={styles.starRatingBarRow}>
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <TouchableOpacity
                    key={starIndex}
                    activeOpacity={0.6}
                    onPress={() => !isSubmitted && setRating(starIndex)}
                  >
                    <MaterialCommunityIcons
                      name={starIndex <= rating ? "star" : "star-outline"}
                      size={38}
                      color={starIndex <= rating ? "#00b047" : "#e2e8f0"}
                      style={styles.starMarginSpacing}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {rating > 0 && (
                <Text style={styles.dynamicRatingQualityLabel}>Great!</Text>
              )}

              {rating > 0 && (
                <View style={styles.fadeContentBlock}>
                  <Text style={styles.optionalInputHeadingText}>What did you like? (Optional)</Text>
                  
                  <View style={styles.tagsFlexWrapMatrixGrid}>
                    {feedbackTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag.label);
                      return (
                        <TouchableOpacity
                          key={tag.id}
                          style={[styles.chipTagButton, isSelected && styles.chipTagButtonActive]}
                          activeOpacity={0.7}
                          onPress={() => !isSubmitted && toggleTag(tag.label)}
                        >
                          <Text style={[styles.chipTagText, isSelected && styles.chipTagTextActive]}>
                            {tag.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.optionalInputHeadingText}>Additional comments (Optional)</Text>
                  <BottomSheetTextInput
                    style={styles.feedbackInputBlockTextArea}
                    placeholder="Share more details about your experience..."
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={3}
                    value={comment}
                    onChangeText={setComment}
                    editable={!isSubmitted}
                  />

                  <View style={styles.thankYouAlertCardBox}>
                    <View style={styles.thumbsUpCircleBadgeIcon}>
                      <Feather name="thumbs-up" size={16} color="#00b047" />
                    </View>
                    <View style={styles.thankYouTextColumn}>
                      <Text style={styles.thankYouMainTitle}>Thank you for your feedback!</Text>
                      <Text style={styles.thankYouSubDescription}>
                        Your review helps us maintain quality service
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.submitReviewSheetButton,
                  rating === 0 && styles.submitReviewSheetButtonDisabled
                ]}
                activeOpacity={0.8}
                disabled={rating === 0}
                onPress={handleSubmitReview}
              >
                <Text style={styles.submitReviewSheetButtonText}>
                  {isSubmitted ? "Done" : rating === 0 ? "Please rate the service" : "Submit Review"}
                </Text>
              </TouchableOpacity>
            </BottomSheetScrollView>
          </BottomSheetModal>
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  cardSection: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  sectionHeading: { fontSize: 15, fontWeight: '700', color: '#475569', marginBottom: 20 },
  timelineRow: { flexDirection: 'row', minHeight: 64 },
  timelineIndicatorColumn: { alignItems: 'center', marginRight: 14, width: 24 },
  completedIconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#00b047', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  timelineLineLinkActive: { width: 2, flex: 1, backgroundColor: '#00b047', marginVertical: 4 },
  timelineLineLinkInactive: { width: 2, flex: 1, backgroundColor: '#f1f5f9', marginVertical: 4 },
  futurePendingIconCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#cbd5e1', backgroundColor: '#ffffff', zIndex: 2 },
  timelineTextColumn: { flex: 1, paddingBottom: 16 },
  timelineTitleText: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  timelineTimestampText: { fontSize: 12, color: '#64748b', fontWeight: '500', marginTop: 4 },
  timelineTitleTextPending: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  validationStatusRow: { flexDirection: 'row', backgroundColor: '#f0fdf4', borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 16 },
  validationCheckedIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e6f7ed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  validationTextColumn: { flex: 1 },
  validationItemTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  validationItemSubtitle: { fontSize: 12, color: '#64748b', fontWeight: '500', marginTop: 2 },
  dashedInteractiveBox: { borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', borderRadius: 16, paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' },
  qrIconContainerBadge: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  photoIconContainerBadge: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  dashedBoxTitleText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  dashedBoxSubtitleText: { fontSize: 12, color: '#94a3b8', fontWeight: '500', textAlign: 'center', marginTop: 4 },
  footerActionLayoutArea: { marginTop: 10, alignItems: 'center' },
  primaryAuthButton: { backgroundColor: '#00b047', borderRadius: 16, width: '100%', paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  primaryAuthButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  underButtonHelperText: { fontSize: 12, color: '#64748b', fontWeight: '500', marginTop: 8 },
  sheetBackground: { borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#ffffff' },
  sheetIndicator: { backgroundColor: '#cbd5e1', width: 38 },
  sheetScrollContainer: { flex: 1, paddingHorizontal: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingBottom: 14, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  closeButtonCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  sheetScrollContent: { paddingBottom: 80 },
  avatarCardCenterBlock: { alignItems: 'center', marginTop: 20 },
  engineerAvatarBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  engineerInitialsText: { color: '#ffffff', fontSize: 20, fontWeight: '800' },
  engineerNameText: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
  engineerSubTextTitle: { fontSize: 13, color: '#64748b', fontWeight: '500', marginTop: 3 },
  ratingQuestionText: { fontSize: 14, fontWeight: '700', color: '#475569', textAlign: 'center', marginTop: 24 },
  starRatingBarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  starMarginSpacing: { marginHorizontal: 4 },
  dynamicRatingQualityLabel: { color: '#00b047', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  fadeContentBlock: { marginTop: 14 },
  optionalInputHeadingText: { fontSize: 13, fontWeight: '700', color: '#475569', marginTop: 14, marginBottom: 10 },
  tagsFlexWrapMatrixGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  chipTagButton: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, margin: 4 },
  chipTagButtonActive: { backgroundColor: '#e6f7ed', borderWidth: 1, borderColor: '#00b047', paddingHorizontal: 11, paddingVertical: 7 },
  chipTagText: { color: '#1e293b', fontSize: 13, fontWeight: '600' },
  chipTagTextActive: { color: '#00b047', fontWeight: '700' },
  feedbackInputBlockTextArea: { borderWidth: 1, borderColor: '#f1f5f9', backgroundColor: '#fafafa', borderRadius: 14, padding: 14, color: '#0f172a', fontSize: 14, fontWeight: '500', height: 80, textAlignVertical: 'top' },
  thankYouAlertCardBox: { flexDirection: 'row', backgroundColor: '#e6f7ed', borderWidth: 1, borderColor: '#00b047', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 20 },
  thumbsUpCircleBadgeIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  thankYouTextColumn: { flex: 1 },
  thankYouMainTitle: { fontSize: 14, fontWeight: '700', color: '#00b047' },
  thankYouSubDescription: { fontSize: 12, color: '#475569', fontWeight: '500', lineHeight: 16, marginTop: 2 },
  submitReviewSheetButton: { backgroundColor: '#00b047', borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  submitReviewSheetButtonDisabled: { backgroundColor: '#f1f5f9' },
  submitReviewSheetButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  retryButton: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#00b047', borderRadius: 8 }
});