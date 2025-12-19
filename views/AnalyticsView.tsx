
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScoreEntry, Shooter } from '../types';

interface AnalyticsViewProps {
  scores: ScoreEntry[];
  shooters: Shooter[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ scores }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analityka Wyników</Text>
      
      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartText}>WYKRES TRENDU (MODUŁ AI)</Text>
        <View style={styles.mockChart}>
          {[40, 70, 50, 90, 60, 80].map((h, i) => (
            <View key={i} style={[styles.bar, {height: h}]} />
          ))}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>ŚREDNI SPLIT</Text>
          <Text style={styles.statValue}>0.24s</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>ACCURACY</Text>
          <Text style={styles.statValue}>92.4%</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Ostatnie Wyniki</Text>
      {scores.length === 0 ? (
        <Text style={styles.empty}>Brak zarejestrowanych wyników.</Text>
      ) : (
        scores.map((score, i) => (
          <View key={i} style={styles.scoreItem}>
            <Text style={styles.scoreStage}>STAGE {score.stageId}</Text>
            <Text style={styles.scoreHf}>{score.hitFactor?.toFixed(4)} HF</Text>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 20 },
  title: { fontSize: 22, fontWeight: '900', color: 'white' },
  chartPlaceholder: { backgroundColor: '#111827', padding: 20, borderRadius: 24, height: 180, justifyContent: 'center', alignItems: 'center' },
  chartText: { color: '#4b5563', fontSize: 10, fontWeight: '900', marginBottom: 20 },
  mockChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 80 },
  bar: { width: 20, backgroundColor: '#ef4444', borderRadius: 5 },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, backgroundColor: '#111827', padding: 15, borderRadius: 20 },
  statLabel: { color: '#6b7280', fontSize: 10, fontWeight: '900' },
  statValue: { color: 'white', fontSize: 20, fontWeight: '900' },
  subtitle: { color: 'white', fontSize: 18, fontWeight: '800', marginTop: 10 },
  empty: { color: '#4b5563', fontStyle: 'italic' },
  scoreItem: { backgroundColor: '#111827', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between' },
  scoreStage: { color: 'white', fontWeight: '700' },
  scoreHf: { color: '#ef4444', fontWeight: '900' }
});

export default AnalyticsView;
