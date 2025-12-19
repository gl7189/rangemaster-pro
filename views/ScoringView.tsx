
import React, { useState, useEffect, useRef } from 'react';
// Added Platform to imports
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Platform } from 'react-native';
import { Match, ScoreEntry, Shooter, Stage } from '../types';
import { dbService } from '../services/dbService';
import { analyzeTargetImage, TargetAnalysisResult } from '../services/geminiService';

interface ScoringViewProps {
  match: Match;
  onSaveScore: (score: ScoreEntry) => void;
}

const ScoringView: React.FC<ScoringViewProps> = ({ match, onSaveScore }) => {
  const [selectedShooter, setSelectedShooter] = useState<Shooter | null>(match.shooters[0]);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(match.stages[0]);
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
    const points = (aHits * 5) + (cHits * 3) + (dHits * 1) - (misses * 10) - (noShoots * 10) - (procedurals * 10);
    if (time === 0) return 0;
    return Math.max(0, points / time);
  };

  const handleAiAnalyze = async () => {
    setIsAnalyzing(true);
    // W prawdziwej aplikacji tutaj wywołalibyśmy ImagePicker
    // Na potrzeby demo symulujemy przesłanie obrazu do Gemini
    try {
      // Przykład base64 (uproszczony)
      const mockBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      const result: TargetAnalysisResult = await analyzeTargetImage(mockBase64);
      
      setAHits(prev => prev + result.aCount);
      setCHits(prev => prev + result.cCount);
      setDHits(prev => prev + result.dCount);
      setMisses(prev => prev + result.missCount);
      
      Alert.alert("AI Analiza Zakończona", `Wykryto: A:${result.aCount}, C:${result.cCount}, D:${result.dCount}. Pewność: ${(result.confidence * 100).toFixed(0)}%`);
    } catch (error) {
      Alert.alert("Błąd AI", "Nie udało się przeanalizować tarczy.");
    } finally {
      setIsAnalyzing(false);
    }
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
      noShoots,
      procedurals,
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
    setNoShoots(0);
    setProcedurals(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.syncStatus}>
        <Text style={styles.syncText}>{isSyncing ? "⏳ SYNCHRONIZACJA..." : "✅ TRYB OFFLINE"}</Text>
        <TouchableOpacity onPress={resetForm}><Text style={styles.resetBtn}>RESET</Text></TouchableOpacity>
      </View>

      <View style={styles.timerCard}>
        <Text style={styles.timerLabel}>CZAS PRZEJAZDU</Text>
        <Text style={styles.timerValue}>{time.toFixed(2)}</Text>
        <TouchableOpacity 
          onPress={() => setIsRunning(!isRunning)}
          style={[styles.startBtn, isRunning ? styles.stopBtn : null]}
        >
          <Text style={styles.startBtnText}>{isRunning ? 'STOP' : 'START'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.aiAssistHeader}>
        <Text style={styles.aiTitle}>ASRYSTENT AI</Text>
        <TouchableOpacity 
          style={[styles.aiBtn, isAnalyzing && {opacity: 0.5}]} 
          onPress={handleAiAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={{fontSize: 16, marginRight: 8}}>📸</Text>
              <Text style={styles.aiBtnText}>SKANUJ TARCZĘ</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <ScoringButton label="ALPHA" value={aHits} color="#16a34a" onChange={setAHits} />
        <ScoringButton label="CHARLIE" value={cHits} color="#ca8a04" onChange={setCHits} />
        <ScoringButton label="DELTA" value={dHits} color="#ea580c" onChange={setDHits} />
        <ScoringButton label="MISS" value={misses} color="#dc2626" onChange={setMisses} />
      </View>

      <View style={styles.resultsBox}>
        <View>
          <Text style={styles.resultLabel}>HIT FACTOR</Text>
          <Text style={styles.resultValue}>{calculateHitFactor().toFixed(4)}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.resultLabel}>PUNKTY</Text>
          <Text style={[styles.resultValue, {fontSize: 20, color: '#9ca3af'}]}>
            {((aHits * 5) + (cHits * 3) + (dHits * 1) - (misses * 10))}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.saveBtn} 
        onPress={handleSave}
        disabled={isSyncing || time === 0}
      >
        <Text style={styles.saveBtnText}>{isSyncing ? 'ZAPISYWANIE...' : 'ZATWIERDŹ WYNIK'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const ScoringButton = ({ label, value, color, onChange }: any) => (
  <TouchableOpacity 
    style={[styles.scoreBtn, {backgroundColor: color}]}
    onPress={() => onChange(value + 1)}
    onLongPress={() => onChange(Math.max(0, value - 1))}
  >
    <Text style={styles.scoreLabel}>{label}</Text>
    <Text style={styles.scoreValue}>{value}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { gap: 15 },
  syncStatus: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111827', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#1f2937' },
  syncText: { color: '#6b7280', fontSize: 10, fontWeight: '900' },
  resetBtn: { color: '#ef4444', fontSize: 10, fontWeight: '900' },
  timerCard: { backgroundColor: '#111827', padding: 30, borderRadius: 32, alignItems: 'center', borderWidth: 2, borderColor: '#ef444433' },
  timerLabel: { color: '#4b5563', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  // Fixed error by adding Platform to imports
  timerValue: { color: 'white', fontSize: 64, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', marginVertical: 10 },
  startBtn: { backgroundColor: '#16a34a', paddingVertical: 15, paddingHorizontal: 60, borderRadius: 20, marginTop: 10 },
  stopBtn: { backgroundColor: '#dc2626' },
  startBtnText: { color: 'white', fontWeight: '900', fontSize: 18 },
  aiAssistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1b4b', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#4338ca' },
  aiTitle: { color: '#818cf8', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  aiBtn: { flexDirection: 'row', backgroundColor: '#4338ca', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  aiBtnText: { color: 'white', fontWeight: '800', fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  scoreBtn: { width: '48%', height: 90, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 5 },
  scoreLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '900' },
  scoreValue: { color: 'white', fontSize: 32, fontWeight: '900' },
  resultsBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111827', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1f2937' },
  resultLabel: { color: '#6b7280', fontSize: 10, fontWeight: '900' },
  resultValue: { color: 'white', fontSize: 32, fontWeight: '900' },
  saveBtn: { backgroundColor: '#ef4444', padding: 20, borderRadius: 24, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: '900', fontSize: 16 }
});

export default ScoringView;
