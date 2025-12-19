
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, ActivityIndicator, StatusBar, TouchableOpacity, Platform, RefreshControl, Alert } from 'react-native';
import { Match, ScoreEntry, Shooter } from './types';
import DashboardView from './views/DashboardView';
import ScoringView from './views/ScoringView';
import MatchManagementView from './views/MatchManagementView';
import AnalyticsView from './views/AnalyticsView';
import ProfileView from './views/ProfileView';
import Navbar from './components/Navbar';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setConnectionError(false);
      const remoteMatches = await dbService.fetchMatches();
      setMatches(remoteMatches || []);
      const status = await dbService.getSyncStatus();
      setPendingSync(status.pending);
    } catch (e) {
      console.error("Błąd ładowania danych:", e);
      setConnectionError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const selectedMatch = useMemo(() => 
    matches.find(m => m.id === selectedMatchId), 
  [matches, selectedMatchId]);

  const allShooters = useMemo(() => {
    const shooterMap = new Map<string, Shooter>();
    matches.forEach(match => {
      if (match.shooters) {
        match.shooters.forEach(shooter => shooterMap.set(shooter.id, shooter));
      }
    });
    return Array.from(shooterMap.values());
  }, [matches]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>SYSTEM START...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}><Text style={styles.logoText}>R</Text></View>
          <View>
            <Text style={styles.brandName}>RangeMaster <Text style={{color: '#ef4444'}}>Pro</Text></Text>
            <Text style={styles.statusText}>
              {connectionError ? '🔴 BŁĄD POŁĄCZENIA' : pendingSync > 0 ? `⚠️ OFFLINE: ${pendingSync}` : '🟢 ONLINE'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={onRefresh}>
          <Text style={{fontSize: 18}}>🔄</Text>
        </TouchableOpacity>
      </View>

      {connectionError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Brak połączenia z serwerem. Działasz w trybie lokalnym.</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
        }
      >
        {activeTab === 'dashboard' && (
          <DashboardView 
            matches={matches} 
            onSelectMatch={(id) => { setSelectedMatchId(id); setActiveTab('scoring'); }}
          />
        )}
        {activeTab === 'matches' && (
          <MatchManagementView matches={matches} onCreateMatch={(m) => setMatches([...matches, m])} />
        )}
        {activeTab === 'scoring' && selectedMatch && (
          <ScoringView match={selectedMatch} onSaveScore={(s) => setScores([...scores, s])} />
        )}
        {activeTab === 'scoring' && !selectedMatch && (
           <View style={styles.emptyState}>
             <Text style={styles.emptyIcon}>🎯</Text>
             <Text style={styles.emptyTitle}>Wybierz zawody z listy</Text>
             <TouchableOpacity onPress={() => setActiveTab('dashboard')} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>POWRÓT DO LISTY</Text>
             </TouchableOpacity>
           </View>
        )}
        {activeTab === 'analytics' && <AnalyticsView scores={scores} shooters={allShooters} />}
        {activeTab === 'profile' && <ProfileView />}
      </ScrollView>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#030712',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0
  },
  loadingContainer: { flex: 1, backgroundColor: '#030712', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 20, fontWeight: '900', letterSpacing: 2 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1f2937', 
    backgroundColor: '#111827' 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: { width: 36, height: 36, backgroundColor: '#ef4444', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: 'white', fontWeight: '900', fontSize: 18 },
  brandName: { color: 'white', fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
  statusText: { color: '#6b7280', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  bellBtn: { width: 44, height: 44, backgroundColor: '#1f2937', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  mainContent: { padding: 16, paddingBottom: 120 },
  errorBanner: { backgroundColor: '#7f1d1d', padding: 8, alignItems: 'center' },
  errorText: { color: '#fca5a5', fontSize: 12, fontWeight: '700' },
  emptyState: { justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  primaryBtn: { backgroundColor: '#ef4444', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12 },
  primaryBtnText: { color: 'white', fontWeight: '900' }
});

export default App;
