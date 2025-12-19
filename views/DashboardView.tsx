
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Match } from '../types';

interface DashboardViewProps {
  matches: Match[];
  onSelectMatch: (id: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ matches, onSelectMatch }) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.title}>Twoje Zawody</Text>
          <Text style={styles.subtitle}>Nadchodzące wydarzenia i treningi</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeText}>NA ŻYWO</Text></View>
      </View>

      <View style={styles.list}>
        {matches.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Brak zaplanowanych zawodów</Text>
          </View>
        ) : (
          matches.map((match) => (
            <TouchableOpacity 
              key={match.id}
              onPress={() => onSelectMatch(match.id)}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View style={{flex: 1}}>
                  <Text style={styles.cardTitle}>{match.name}</Text>
                  <Text style={styles.cardMeta}>
                    📅 {match.date} • 🎖️ {match.type}
                  </Text>
                </View>
                <View style={styles.stageCount}>
                  <Text style={styles.stageNumber}>{match.stages.length}</Text>
                  <Text style={styles.stageLabel}>TORÓW</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.shooterCount}>+{match.shooters.length} zawodników</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Centrum Treningowe</Text>
        <Text style={styles.trainingSubtitle}>Popraw swoje czasy i celność dzięki AI.</Text>
        <View style={styles.trainingBtn}>
          <Text style={styles.trainingBtnText}>ROZPOCZNIJ DRY FIRE</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>HIT FACTOR</Text>
          <Text style={styles.statValue}>4.82</Text>
          <Text style={styles.statTrend}>↑ 12%</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>CELNOŚĆ</Text>
          <Text style={styles.statValue}>84%</Text>
          <Text style={[styles.statTrend, {color: '#eab308'}]}>→ STABLE</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '900', color: 'white', textTransform: 'uppercase' },
  subtitle: { fontSize: 13, color: '#9ca3af' },
  badge: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#ef4444', fontSize: 10, fontWeight: '900' },
  list: { gap: 12 },
  emptyCard: { padding: 40, alignItems: 'center', backgroundColor: '#111827', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#374151' },
  emptyText: { color: '#6b7280' },
  card: { backgroundColor: '#111827', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1f2937' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  cardMeta: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
  stageCount: { alignItems: 'center' },
  stageNumber: { color: '#374151', fontSize: 24, fontWeight: '900' },
  stageLabel: { color: '#6b7280', fontSize: 8, fontWeight: '800' },
  cardFooter: { marginTop: 15 },
  shooterCount: { color: '#6b7280', fontSize: 12 },
  trainingCard: { backgroundColor: '#ef4444', padding: 20, borderRadius: 24, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  trainingTitle: { color: 'white', fontSize: 20, fontWeight: '900' },
  trainingSubtitle: { color: '#fee2e2', fontSize: 14, marginBottom: 15 },
  trainingBtn: { backgroundColor: 'white', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  trainingBtnText: { color: '#ef4444', fontWeight: '900', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#111827', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#1f2937' },
  statLabel: { color: '#6b7280', fontSize: 10, fontWeight: '900' },
  statValue: { color: 'white', fontSize: 24, fontWeight: '900', marginVertical: 4 },
  statTrend: { color: '#22c55e', fontSize: 11, fontWeight: '800' }
});

export default DashboardView;
