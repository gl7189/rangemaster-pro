
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { Match, MatchType, Division, Category, Shooter } from '../types';

interface MatchManagementViewProps {
  matches: Match[];
  onCreateMatch: (match: Match) => void;
  onUpdateMatch?: (match: Match) => void; // Zakładamy dodanie tej funkcji w App.tsx
}

const MatchManagementView: React.FC<MatchManagementViewProps> = ({ matches, onCreateMatch, onUpdateMatch }) => {
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [newMatchName, setNewMatchName] = useState('');
  
  // Stan dla formularza strzelca
  const [isAddingShooter, setIsAddingShooter] = useState(false);
  const [sName, setSName] = useState('');
  const [sLicense, setSLicense] = useState('');
  const [sClub, setSClub] = useState('');
  const [sDivision, setSDivision] = useState<Division>(Division.PRODUCTION);

  const handleCreateMatch = () => {
    if (!newMatchName) return;
    const newMatch: Match = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMatchName,
      date: new Date().toISOString().split('T')[0],
      type: MatchType.IPSC,
      stages: [
        { id: 's1', name: 'Tor 1', minRounds: 12, targets: 6, scoringType: 'Comstock' }
      ],
      shooters: []
    };
    onCreateMatch(newMatch);
    setIsCreatingMatch(false);
    setNewMatchName('');
  };

  const handleAddShooter = () => {
    if (!sName || !selectedMatch) {
      Alert.alert('Błąd', 'Podaj przynajmniej imię i nazwisko.');
      return;
    }

    const newShooter: Shooter = {
      id: Math.random().toString(36).substr(2, 9),
      name: sName,
      licenseNumber: sLicense,
      club: sClub,
      division: sDivision,
      category: Category.OVERALL,
      powerFactor: 'Minor'
    };

    const updatedMatch = {
      ...selectedMatch,
      shooters: [...selectedMatch.shooters, newShooter]
    };

    setSelectedMatch(updatedMatch);
    if (onUpdateMatch) onUpdateMatch(updatedMatch);
    
    // Reset formularza
    setSName('');
    setSLicense('');
    setSClub('');
    setIsAddingShooter(false);
  };

  if (selectedMatch) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedMatch(null)}>
            <Text style={styles.backBtn}>← POWRÓT</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{selectedMatch.name}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>STRZELCY</Text>
            <Text style={styles.miniStatValue}>{selectedMatch.shooters.length}</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>TORY</Text>
            <Text style={styles.miniStatValue}>{selectedMatch.stages.length}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>LISTA STARTOWA</Text>
          <TouchableOpacity style={styles.addBtnSmall} onPress={() => setIsAddingShooter(true)}>
            <Text style={styles.addBtnText}>+ DODAJ</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.listScroll}>
          {selectedMatch.shooters.length === 0 ? (
            <Text style={styles.emptyText}>Brak zawodników na liście.</Text>
          ) : (
            selectedMatch.shooters.map(s => (
              <View key={s.id} style={styles.shooterCard}>
                <View>
                  <Text style={styles.shooterNameText}>{s.name}</Text>
                  <Text style={styles.shooterMetaText}>{s.division} • {s.club || 'Brak klubu'}</Text>
                </View>
                <Text style={styles.shooterLicense}>{s.licenseNumber}</Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Modal Dodawania Strzelca */}
        <Modal visible={isAddingShooter} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Nowy Strzelec</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Imię i Nazwisko" 
                placeholderTextColor="#4b5563"
                value={sName}
                onChangeText={setSName}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Nr Licencji" 
                placeholderTextColor="#4b5563"
                value={sLicense}
                onChangeText={setSLicense}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Klub" 
                placeholderTextColor="#4b5563"
                value={sClub}
                onChangeText={setSClub}
              />
              
              <Text style={styles.inputLabel}>DYWIZJA:</Text>
              <View style={styles.pickerRow}>
                {[Division.PRODUCTION, Division.STANDARD, Division.OPEN].map(div => (
                  <TouchableOpacity 
                    key={div}
                    style={[styles.pickerBtn, sDivision === div && styles.pickerBtnActive]}
                    onPress={() => setSDivision(div)}
                  >
                    <Text style={[styles.pickerBtnText, sDivision === div && styles.pickerBtnTextActive]}>{div}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleAddShooter}>
                  <Text style={styles.confirmBtnText}>DODAJ DO LISTY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddingShooter(false)}>
                  <Text style={styles.cancelBtnText}>ANULUJ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Konfiguracja</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsCreatingMatch(true)}>
          <Text style={styles.addBtnText}>+ NOWY MECZ</Text>
        </TouchableOpacity>
      </View>

      {isCreatingMatch && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Nowe Zawody</Text>
          <TextInput 
            style={styles.input}
            placeholder="Nazwa zawodów..."
            placeholderTextColor="#4b5563"
            value={newMatchName}
            onChangeText={setNewMatchName}
            autoFocus
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleCreateMatch}>
              <Text style={styles.confirmBtnText}>STWÓRZ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsCreatingMatch(false)}>
              <Text style={styles.cancelBtnText}>ANULUJ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.list}>
        {matches.map(match => (
          <TouchableOpacity 
            key={match.id} 
            style={styles.matchItem}
            onPress={() => setSelectedMatch(match)}
          >
            <View style={{flex: 1}}>
              <Text style={styles.matchName}>{match.name}</Text>
              <Text style={styles.matchMeta}>{match.type} • {match.date} • {match.shooters.length} STRZELCÓW</Text>
            </View>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  title: { fontSize: 20, fontWeight: '900', color: 'white', textTransform: 'uppercase', flex: 1, marginLeft: 10 },
  backBtn: { color: '#ef4444', fontWeight: '900', fontSize: 12 },
  addBtn: { backgroundColor: '#ef4444', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  addBtnSmall: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: 'white', fontWeight: '900', fontSize: 12 },
  
  statsRow: { flexDirection: 'row', gap: 10 },
  miniStat: { flex: 1, backgroundColor: '#111827', padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  miniStatLabel: { color: '#6b7280', fontSize: 8, fontWeight: '900' },
  miniStatValue: { color: 'white', fontSize: 18, fontWeight: '900', marginTop: 2 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  sectionTitle: { color: '#6b7280', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  listScroll: { flex: 1, marginTop: 10 },
  emptyText: { color: '#4b5563', textAlign: 'center', marginTop: 40, fontStyle: 'italic' },
  shooterCard: { backgroundColor: '#111827', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#1f2937' },
  shooterNameText: { color: 'white', fontSize: 16, fontWeight: '800' },
  shooterMetaText: { color: '#6b7280', fontSize: 11, fontWeight: '700', marginTop: 2 },
  shooterLicense: { color: '#ef4444', fontSize: 12, fontWeight: '900' },

  form: { backgroundColor: '#111827', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#ef4444' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  formCard: { backgroundColor: '#111827', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#1f2937' },
  formTitle: { color: 'white', fontSize: 22, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#1f2937', padding: 16, borderRadius: 16, color: 'white', fontWeight: '700', marginBottom: 12 },
  inputLabel: { color: '#6b7280', fontSize: 10, fontWeight: '900', marginBottom: 10, marginTop: 5 },
  
  pickerRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  pickerBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#1f2937', borderRadius: 10, alignItems: 'center' },
  pickerBtnActive: { backgroundColor: '#ef4444' },
  pickerBtnText: { color: '#6b7280', fontSize: 10, fontWeight: '900' },
  pickerBtnTextActive: { color: 'white' },

  formActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  confirmBtn: { flex: 2, backgroundColor: '#ef4444', padding: 16, borderRadius: 16, alignItems: 'center' },
  confirmBtnText: { color: 'white', fontWeight: '900', fontSize: 14 },
  cancelBtn: { flex: 1, backgroundColor: '#374151', padding: 16, borderRadius: 16, alignItems: 'center' },
  cancelBtnText: { color: 'white', fontWeight: '900', fontSize: 14 },
  
  list: { gap: 10, marginTop: 10 },
  matchItem: { backgroundColor: '#111827', padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  matchName: { color: 'white', fontWeight: '800', fontSize: 16 },
  matchMeta: { color: '#6b7280', fontSize: 10, fontWeight: '800', marginTop: 4 },
  chevron: { color: '#ef4444', fontSize: 20, fontWeight: '900' }
});

export default MatchManagementView;
