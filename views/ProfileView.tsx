
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { dbService } from '../services/dbService';

const ProfileView: React.FC = () => {
  const [stats, setStats] = useState({ pending: 0, total: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const s = await dbService.getSyncStatus();
      setStats(s);
    };
    loadStats();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image style={styles.avatar} source={{ uri: 'https://picsum.photos/seed/shooter1/200/200' }} />
        <View style={styles.rankBadge}><Text style={styles.rankText}>A-CLASS</Text></View>
        <Text style={styles.userName}>Andrzej Strzelec</Text>
        <Text style={styles.clubName}>KLUB: ZKS WARSZAWA</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>☁️ STATUS CHMURY</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Zsynchronizowane</Text>
          <Text style={[styles.statValue, {color: '#22c55e'}]}>{stats.total - stats.pending}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Oczekujące (Offline)</Text>
          <Text style={[styles.statValue, {color: stats.pending > 0 ? '#f97316' : '#4b5563'}]}>{stats.pending}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔫 ARSENAŁ</Text>
        <GunItem name="Glock 17 Gen 5" rounds={4200} />
        <GunItem name="CZ Shadow 2" rounds={1200} />
      </View>
    </View>
  );
};

const GunItem = ({ name, rounds }: any) => (
  <View style={styles.gunItem}>
    <Text style={styles.gunName}>{name}</Text>
    <Text style={styles.gunRounds}>{rounds} rds</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 20 },
  profileHeader: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#ef4444' },
  rankBadge: { backgroundColor: '#eab308', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginTop: -15 },
  rankText: { color: 'black', fontSize: 10, fontWeight: '900' },
  userName: { color: 'white', fontSize: 24, fontWeight: '900', marginTop: 10 },
  clubName: { color: '#6b7280', fontSize: 12, fontWeight: '800' },
  card: { backgroundColor: '#111827', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1f2937' },
  cardTitle: { color: '#4b5563', fontSize: 12, fontWeight: '900', marginBottom: 15 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statLabel: { color: '#9ca3af', fontSize: 14 },
  statValue: { fontWeight: '900', fontSize: 14 },
  gunItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  gunName: { color: 'white', fontWeight: '700' },
  gunRounds: { color: '#ef4444', fontWeight: '900' }
});

export default ProfileView;
