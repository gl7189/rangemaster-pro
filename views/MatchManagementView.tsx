
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Match, MatchType, Division, Category } from '../types';

interface MatchManagementViewProps {
  matches: Match[];
  onCreateMatch: (match: Match) => void;
}

const MatchManagementView: React.FC<MatchManagementViewProps> = ({ matches, onCreateMatch }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name) return;
    const newMatch: Match = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      date: new Date().toISOString().split('T')[0],
      type: MatchType.IPSC,
      stages: [],
      shooters: []
    };
    onCreateMatch(newMatch);
    setIsCreating(false);
    setName('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Konfiguracja</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsCreating(true)}>
          <Text style={styles.addBtnText}>+ NOWY</Text>
        </TouchableOpacity>
      </View>

      {isCreating && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Nowe Zawody</Text>
          <TextInput 
            style={styles.input}
            placeholder="Nazwa zawodów..."
            placeholderTextColor="#4b5563"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleCreate}>
              <Text style={styles.confirmBtnText}>STWÓRZ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsCreating(false)}>
              <Text style={styles.cancelBtnText}>ANULUJ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.list}>
        {matches.map(match => (
          <View key={match.id} style={styles.matchItem}>
            <View>
              <Text style={styles.matchName}>{match.name}</Text>
              <Text style={styles.matchMeta}>{match.type} • {match.date}</Text>
            </View>
            <Text>⚙️</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: 'white', textTransform: 'uppercase' },
  addBtn: { backgroundColor: '#ef4444', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: 'white', fontWeight: '900' },
  form: { backgroundColor: '#111827', padding: 20, borderRadius: 24, borderWidth: 2, borderColor: '#ef4444' },
  formTitle: { color: 'white', fontSize: 18, fontWeight: '900', marginBottom: 15 },
  input: { backgroundColor: '#1f2937', padding: 15, borderRadius: 12, color: 'white', fontWeight: '700' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 15 },
  confirmBtn: { flex: 1, backgroundColor: '#ef4444', padding: 12, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: 'white', fontWeight: '900' },
  cancelBtn: { flex: 1, backgroundColor: '#374151', padding: 12, borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { color: 'white', fontWeight: '900' },
  list: { gap: 10 },
  matchItem: { backgroundColor: '#111827', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  matchName: { color: 'white', fontWeight: '700', fontSize: 16 },
  matchMeta: { color: '#6b7280', fontSize: 10, fontWeight: '800' }
});

export default MatchManagementView;
