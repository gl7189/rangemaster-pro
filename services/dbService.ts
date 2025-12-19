
import { createClient } from '@supabase/supabase-js';
import { ScoreEntry, Match, MatchType, Division, Category } from '../types';

const supabaseUrl = 'https://twoj-projekt.supabase.co';
const supabaseKey = 'twoj-anon-key';

export const supabase = (supabaseUrl.includes('twoj-projekt')) 
  ? null 
  : createClient(supabaseUrl, supabaseKey);

// Dane testowe, aby użytkownik widział cokolwiek po uruchomieniu bez bazy danych
const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    name: 'Mistrzostwa Polski IPSC',
    date: '2024-05-20',
    type: MatchType.IPSC,
    stages: [
      { id: 's1', name: 'Tor 1: Szybka 10', minRounds: 10, targets: 5, scoringType: 'Comstock' },
      { id: 's2', name: 'Tor 2: Przeszkody', minRounds: 18, targets: 9, scoringType: 'Comstock' }
    ],
    shooters: [
      { id: 'u1', name: 'Jan Kowalski', licenseNumber: 'L-123', club: 'ZKS', division: Division.PRODUCTION, category: Category.OVERALL, powerFactor: 'Minor' },
      { id: 'u2', name: 'Anna Nowak', licenseNumber: 'L-456', club: 'LEGIA', division: Division.OPEN, category: Category.LADY, powerFactor: 'Major' }
    ]
  },
  {
    id: 'm2',
    name: 'Trening Dynamiczny',
    date: '2024-06-15',
    type: MatchType.STEEL_CHALLENGE,
    stages: [{ id: 's3', name: 'Smoke & Hope', minRounds: 25, targets: 5, scoringType: 'TimePlus' }],
    shooters: []
  }
];

let memoryStorage: string = '[]';

export const dbService = {
  async fetchMatches(): Promise<Match[]> {
    if (!supabase) {
      return MOCK_MATCHES;
    }
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*, stages(*), shooters(*)');
      
      if (error) throw error;
      return (data && data.length > 0) ? (data as Match[]) : MOCK_MATCHES;
    } catch (e) {
      console.error("Błąd bazy danych (używam mock data):", e);
      return MOCK_MATCHES;
    }
  },

  async saveScore(score: ScoreEntry): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('scores')
          .insert([{
            shooter_id: score.shooterId,
            stage_id: score.stageId,
            time: score.time,
            a_hits: score.aHits,
            c_hits: score.cHits,
            d_hits: score.dHits,
            misses: score.misses,
            no_shoots: score.noShoots,
            procedurals: score.procedurals,
            hit_factor: score.hitFactor
          }]);
        if (!error) return true;
      } catch (error) {}
    }

    const local = JSON.parse(memoryStorage);
    local.push(score);
    memoryStorage = JSON.stringify(local);
    return true; 
  },

  async getSyncStatus() {
    const local = JSON.parse(memoryStorage);
    if (!supabase) return { pending: local.length, total: local.length };
    try {
      const { count } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true });
        
      return { 
        pending: local.length, 
        total: (count || 0) + local.length 
      };
    } catch (e) {
      return { pending: local.length, total: local.length };
    }
  }
};
