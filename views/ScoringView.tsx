
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, Animated } from 'react-native';
import { Match, ScoreEntry, Shooter, Stage } from '../types';
import { dbService } from '../services/dbService';

interface ScoringViewProps {
  match: Match;
  onSaveScore: (score: ScoreEntry) => void;
}

const ScoringView: React.FC<ScoringViewProps> = ({ match, onSaveScore }) => {
  const [selectedShooter] = useState<Shooter | null>(match.shooters[0]);
  const [selectedStage] = useState<Stage | null>(match.stages[0]);
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [aHits, setAHits] = useState(0);
  const [cHits, setCHits] = useState(0);
  const [dHits, setDHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      const start = Date.now() - time * 1000;
      timerRef.current = setInterval(() => {
        setTime((Date.now() - start) / 1000);
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const calculateHitFactor = () => {
    const points = (aHits * 5) + (cHits * 3) + (dHits * 1) - (misses * 10);
    if (time === 0) return 0;
    return Math.max(0, points / time);
  };

  const handleSave = async () => {
    if (!selectedShooter || !selectedStage) return;
    setIsSyncing(true);
    
    const score: ScoreEntry = {
      shooterId: selectedShooter.id,
      stageId: selectedStage.id,
      time: parseFloat(time.toFixed(2)),
      aHits,
      cHits,
      dHits,
      misses,
      noShoots: 0,
      procedurals: 0,
      hitFactor: calculateHitFactor(),
      timestamp: Date.now()
    };

    const success = await dbService.saveScore(score);
    if (success) {
      onSaveScore(score);
      resetForm();
    }
    setIsSyncing(false);
  };

  const resetForm = () => {
    setTime(0);
    setIsRunning(false);
    setAHits(0);
    setCHits(0);
    setDHits(0);
    setMisses(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.shooterName}>{selectedShooter?.name || 'Wybierz zawodnika'}</Text>
        <Text style={styles.stageName}>{selectedStage?.name || 'Tor nieznany'}</Text>
      </View>

      <View style={styles.timerCard}>
        <Text style={styles.timerValue}>{time.toFixed(2)}</Text>
        <TouchableOpacity 
          onPress={() => setIsRunning(!isRunning)}
          activeOpacity={0.7}
          style={[styles.startBtn, isRunning ? styles.stopBtn : null]}
        >
          <Text style={styles.startBtnText}>{isRunning ? 'STOP ⏹' : 'START 🔫'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <ScoringButton label="ALPHA" value={aHits} color="#16a34a" onChange={setAHits} pts="+5" />
        <ScoringButton label="CHARLIE" value={cHits} color="#ca8a04" onChange={setCHits} pts="+3" />
        <ScoringButton label="DELTA" value={dHits} color="#ea580c" onChange={setDHits} pts="+1" />
        <ScoringButton label="MISS" value={misses} color="#dc2626" onChange={setMisses} pts="-10" />
      </View>

      <View style={styles.summaryBar}>
        <View style={styles.statGroup}>
          <Text style={styles.statLabel}>HIT FACTOR</Text>
          <Text style={styles.hfValue}>{calculateHitFactor().toFixed(4)}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.saveBtn, (time === 0 || isSyncing) && styles.disabledBtn]} 
          onPress={handleSave}
          disabled={isSyncing || time === 0}
        >
          <Text style={styles.saveBtnText}>{isSyncing ? '...' : 'ZAPISZ'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ScoringButton = ({ label, value, color, onChange, pts }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
    ]).start();
    onChange(value + 1);
  };

  return (
    <Animated.View style={{ width: '48%', transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[styles.scoreBtn, {backgroundColor: color}]}
        onPress={onPress}
        onLongPress={() => onChange(Math.max(0, value - 1))}
      >
        <Text style={styles.ptsLabel}>{pts}</Text>
        <Text style={styles.scoreValue}>{value}</Text>
        <Text style={styles.scoreLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  headerInfo: { backgroundColor: '#111827', padding: 12, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  shooterName: { color: 'white', fontSize: 16, fontWeight: '900' },
  stageName: { color: '#6b7280', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  timerCard: { backgroundColor: '#111827', padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  timerValue: { color: 'white', fontSize: 72, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  startBtn: { backgroundColor: '#16a34a', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 16, marginTop: 10 },
  stopBtn: { backgroundColor: '#dc2626' },
  startBtnText: { color: 'white', fontWeight: '900', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  scoreBtn: { height: 100, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scoreLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '900' },
  scoreValue: { color: 'white', fontSize: 36, fontWeight: '900' },
  ptsLabel: { position: 'absolute', top: 8, right: 12, color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '900' },
  summaryBar: { flexDirection: 'row', backgroundColor: '#111827', padding: 15, borderRadius: 24, alignItems: 'center', justifyContent: 'space-between' },
  statGroup: { flex: 1 },
  statLabel: { color: '#6b7280', fontSize: 9, fontWeight: '900' },
  hfValue: { color: '#ef4444', fontSize: 24, fontWeight: '900' },
  saveBtn: { backgroundColor: '#ef4444', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 16 },
  disabledBtn: { backgroundColor: '#374151' },
  saveBtnText: { color: 'white', fontWeight: '900', fontSize: 16 }
});

export default ScoringView;
