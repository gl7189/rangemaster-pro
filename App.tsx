
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, ActivityIndicator, StatusBar, TouchableOpacity, Platform, RefreshControl } from 'react-native';
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

  const handleUpdateMatch = (updatedMatch: Match) => {
    setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
  };

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}><Text style={styles.logoText}>R</Text></View>
            <View>
              <Text style={styles.brandName}>RangeMaster <Text style={{color: '#ef4444'}}>Pro</Text></Text>
              <Text style={styles.statusText}>
                {connectionError ? '🔴 BŁĄD' : pendingSync > 0 ? `⚠️ OFFLINE: ${pendingSync}` : '🟢 ONLINE'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={onRefresh}>
            <Text style={{fontSize: 16}}>🔄</Text>
          </TouchableOpacity>
        </View>

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
            <MatchManagementView 
              matches={matches} 
              onCreateMatch={(m) => setMatches([...matches, m])} 
              onUpdateMatch={handleUpdateMatch}
            />
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
      </SafeAreaView>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#030712'
  },
  safeArea: { flex: 1 },
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
  logoBox: { width: 32, height: 32, backgroundColor: '#ef4444', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: 'white', fontWeight: '900', fontSize: 16 },
  brandName: { color: 'white', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },
  statusText: { color: '#6b7280', fontSize: 8, fontWeight: '700', textTransform: 'uppercase', marginTop: 1 },
  bellBtn: { width: 36, height: 36, backgroundColor: '#1f2937', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  mainContent: { padding: 16, paddingBottom: 100 },
  emptyState: { justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 20 },
  emptyTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  primaryBtn: { backgroundColor: '#ef4444', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  primaryBtnText: { color: 'white', fontWeight: '900', fontSize: 12 }
});

export default App;
