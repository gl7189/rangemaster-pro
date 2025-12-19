
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, Animated, Modal, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Match, ScoreEntry, Shooter, Stage } from '../types';
import { dbService } from '../services/dbService';
import { analyzeTargetImage } from '../services/geminiService';

interface ScoringViewProps {
  match: Match;
  onSaveScore: (score: ScoreEntry) => void;
}

const ScoringView: React.FC<ScoringViewProps> = ({ match, onSaveScore }) => {
  const [selectedShooter, setSelectedShooter] = useState<Shooter | null>(match.shooters[0] || null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(match.stages[0] || null);
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [aHits, setAHits] = useState(0);
  const [cHits, setCHits] = useState(0);
  const [dHits, setDHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [noShoots, setNoShoots] = useState(0);
  const [procedurals, setProcedurals] = useState(0);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showShooterModal, setShowShooterModal] = useState(false);
  
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

  const handleAiScan = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Błąd', 'Aplikacja potrzebuje dostępu do kamery.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setIsAnalyzing(true);
      try {
        const analysis = await analyzeTargetImage(result.assets[0].base64);
        setAHits(prev => prev + (analysis.aCount || 0));
        setCHits(prev => prev + (analysis.cCount || 0));
        setDHits(prev => prev + (analysis.dCount || 0));
        setMisses(prev => prev + (analysis.missCount || 0));
        Alert.alert('Analiza AI Zakończona', `Dodano trafienia do bieżącego wyniku.`);
      } catch (e) {
        Alert.alert('Błąd AI', 'Nie udało się przeanalizować zdjęcia.');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const calculateHitFactor = () => {
    const points = (aHits * 5) + (cHits * 3) + (dHits * 1) 
                   - (misses * 10) - (noShoots * 10) - (procedurals * 10);
    if (time <= 0) return 0;
    return Math.max(0, points / time);
  };

  const handleSave = async () => {
    if (!selectedShooter || !selectedStage) {
      Alert.alert('Błąd', 'Wybierz strzelca i tor.');
      return;
    }
    setIsSyncing(true);
    
    const score: ScoreEntry = {
      shooterId: selectedShooter.id,
      stageId: selectedStage.id,
      time: parseFloat(time.toFixed(2)),
      aHits,
      cHits,
      dHits,
      misses,
      noShoots,
      procedurals,
      hitFactor: calculateHitFactor(),
      timestamp: Date.now()
    };

    const success = await dbService.saveScore(score);
    if (success) {
      onSaveScore(score);
      Alert.alert('Sukces', `Wynik dla ${selectedShooter.name} zapisany! HF: ${score.hitFactor?.toFixed(4)}`);
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
    setNoShoots(0);
    setProcedurals(0);
  };

  return (
    <View style={styles.container}>
      {/* Header z wyborem zawodnika */}
      <TouchableOpacity 
        style={styles.headerInfo} 
        onPress={() => setShowShooterModal(true)}
      >
        <View style={{flex: 1}}>
          <Text style={styles.shooterLabel}>STRZELEC (KLIKNIJ BY ZMIENIĆ):</Text>
          <Text style={styles.shooterName}>{selectedShooter?.name || 'Wybierz zawodnika'}</Text>
          <Text style={styles.stageName}>{selectedStage?.name || 'Wybierz tor'}</Text>
        </View>
        <TouchableOpacity style={styles.aiScanBtn} onPress={handleAiScan} disabled={isAnalyzing}>
          {isAnalyzing ? <ActivityIndicator color="white" /> : <Text style={styles.aiBtnText}>📸 AI SCAN</Text>}
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Timer */}
      <View style={styles.timerCard}>
        <Text style={styles.timerValue}>{time.toFixed(2)}</Text>
        <TouchableOpacity 
          onPress={() => setIsRunning(!isRunning)}
          activeOpacity={0.8}
          style={[styles.startBtn, isRunning ? styles.stopBtn : null]}
        >
          <Text style={styles.startBtnText}>{isRunning ? 'STOP ⏹' : 'START 🔫'}</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Punktacji */}
      <View style={styles.grid}>
        <ScoringButton label="ALPHA" value={aHits} color="#16a34a" onChange={setAHits} pts="+5" />
        <ScoringButton label="CHARLIE" value={cHits} color="#ca8a04" onChange={setCHits} pts="+3" />
        <ScoringButton label="DELTA" value={dHits} color="#ea580c" onChange={setDHits} pts="+1" />
        <ScoringButton label="MISS" value={misses} color="#dc2626" onChange={setMisses} pts="-10" />
        <ScoringButton label="NO SHOOT" value={noShoots} color="#4b5563" onChange={setNoShoots} pts="-10" />
        <ScoringButton label="PROCEDURE" value={procedurals} color="#7c3aed" onChange={setProcedurals} pts="-10" />
      </View>

      {/* Footer / HF / Zapis */}
      <View style={styles.summaryBar}>
        <View style={styles.statGroup}>
          <Text style={styles.statLabel}>HIT FACTOR</Text>
          <Text style={styles.hfValue}>{calculateHitFactor().toFixed(4)}</Text>
        </View>
        <View style={styles.actionButtons}>
           <TouchableOpacity style={styles.resetBtn} onPress={resetForm}>
              <Text style={styles.resetBtnText}>CLR</Text>
           </TouchableOpacity>
           <TouchableOpacity 
            style={[styles.saveBtn, (time === 0 || isSyncing) && styles.disabledBtn]} 
            onPress={handleSave}
            disabled={isSyncing || time === 0}
          >
            <Text style={styles.saveBtnText}>{isSyncing ? '...' : 'ZAPISZ'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal wyboru strzelca */}
      <Modal visible={showShooterModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Wybierz Strzelca</Text>
            <FlatList
              data={match.shooters}
              keyExtractor={(item) => item.id}
              renderItem={({item}) => (
                <TouchableOpacity 
                  style={[styles.shooterOption, selectedShooter?.id === item.id && styles.selectedOption]}
                  onPress={() => { setSelectedShooter(item); setShowShooterModal(false); }}
                >
                  <Text style={styles.optionName}>{item.name}</Text>
                  <Text style={styles.optionClub}>{item.club} | {item.division}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeModal} onPress={() => setShowShooterModal(false)}>
              <Text style={styles.closeModalText}>ZAMKNIJ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ScoringButton = ({ label, value, color, onChange, pts }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 40, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 40, useNativeDriver: true }),
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
  container: { gap: 10 },
  headerInfo: { backgroundColor: '#111827', padding: 16, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  shooterLabel: { color: '#ef4444', fontSize: 8, fontWeight: '900', marginBottom: 2 },
  shooterName: { color: 'white', fontSize: 18, fontWeight: '900' },
  stageName: { color: '#6b7280', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  aiScanBtn: { backgroundColor: '#6366f1', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  aiBtnText: { color: 'white', fontSize: 10, fontWeight: '900' },
  timerCard: { backgroundColor: '#111827', padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  timerValue: { color: 'white', fontSize: 72, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  startBtn: { backgroundColor: '#16a34a', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 16, marginTop: 10 },
  stopBtn: { backgroundColor: '#dc2626' },
  startBtnText: { color: 'white', fontWeight: '900', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  scoreBtn: { height: 95, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scoreLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  scoreValue: { color: 'white', fontSize: 36, fontWeight: '900' },
  ptsLabel: { position: 'absolute', top: 8, right: 12, color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '900' },
  summaryBar: { flexDirection: 'row', backgroundColor: '#111827', padding: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'space-between', marginTop: 5 },
  statGroup: { flex: 1 },
  statLabel: { color: '#6b7280', fontSize: 9, fontWeight: '900' },
  hfValue: { color: '#ef4444', fontSize: 28, fontWeight: '900' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  resetBtn: { backgroundColor: '#374151', padding: 16, borderRadius: 16, justifyContent: 'center' },
  resetBtnText: { color: 'white', fontWeight: '900', fontSize: 12 },
  saveBtn: { backgroundColor: '#ef4444', paddingVertical: 16, paddingHorizontal: 30, borderRadius: 16 },
  disabledBtn: { backgroundColor: '#1f2937' },
  saveBtnText: { color: 'white', fontWeight: '900', fontSize: 14 },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111827', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  shooterOption: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  selectedOption: { backgroundColor: '#1f2937', borderRadius: 12 },
  optionName: { color: 'white', fontSize: 16, fontWeight: '800' },
  optionClub: { color: '#6b7280', fontSize: 12 },
  closeModal: { marginTop: 20, backgroundColor: '#374151', padding: 15, borderRadius: 15, alignItems: 'center' },
  closeModalText: { color: 'white', fontWeight: '900' }
});

export default ScoringView;
