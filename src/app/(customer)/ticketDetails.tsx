import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getTicketById, dispatchTicketToTechnician } from '../../services/ticketService';

interface TicketData {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  landmark: string;
  otp_code: string;
  created_at: string;
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await getTicketById(id as string);
        if (response.success) {
          setTicket(response.data);
        } else {
          setErrorMessage(response.message || "Failed to load ticket");
        }
      } catch (err) {
        setErrorMessage("Could not connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleDispatch = async () => {
    if (!ticket) return;
    setErrorMessage(null);
    setIsDispatching(true);
    try {
      const result = await dispatchTicketToTechnician(ticket.id);
      if (result.success) {
        setTicket(prev => prev ? { ...prev, status: 'DISPATCHED' } : null);
      } else {
        setErrorMessage(result.message || "Failed to dispatch.");
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Unable to assign a technician.");
    } finally {
      setIsDispatching(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ticket details not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{ticket.title}</Text>
        <Text style={styles.ticketNumber}>{ticket.ticket_number}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, { color: ticket.status === 'REPORTED' ? '#e53e3e' : '#10b981' }]}>
          {ticket.status}
        </Text>
        
        <View style={styles.divider} />

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{ticket.description}</Text>
        
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{ticket.category}</Text>
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Priority</Text>
            <Text style={styles.value}>{ticket.priority}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        
        <Text style={styles.label}>Verification OTP</Text>
        <Text style={styles.otp}>{ticket.otp_code}</Text>
        <Text style={styles.hint}>Present this code to the technician upon arrival.</Text>

        {ticket.status === 'REPORTED' && (
          <TouchableOpacity 
            style={[styles.dispatchButton, isDispatching && { backgroundColor: '#cbd5e0' }]} 
            onPress={handleDispatch}
            disabled={isDispatching}
          >
            {isDispatching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Dispatch to Nearest Technician</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#001a3d' },
  ticketNumber: { fontSize: 16, color: '#718096', marginTop: 4 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 40 },
  label: { fontSize: 11, fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 16, color: '#001a3d', marginVertical: 8, fontWeight: '500' },
  row: { flexDirection: 'row', marginTop: 10 },
  half: { flex: 1 },
  otp: { fontSize: 36, fontWeight: '900', color: '#10b981', marginVertical: 10, letterSpacing: 2 },
  hint: { fontSize: 13, color: '#718096', fontStyle: 'italic', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#f0f4f8', marginVertical: 15 },
  errorText: { color: '#e53e3e', fontSize: 16 },
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
  dispatchButton: { backgroundColor: '#001a3d', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' }
});