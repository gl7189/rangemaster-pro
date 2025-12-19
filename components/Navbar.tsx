
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'matches', label: 'Tory', icon: '📋' },
    { id: 'scoring', label: 'Start', icon: '🔫' },
    { id: 'analytics', label: 'Staty', icon: '📊' },
    { id: 'profile', label: 'Profil', icon: '👤' },
  ];

  return (
    <View style={styles.navContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => setActiveTab(tab.id)}
          activeOpacity={0.7}
          style={[styles.navItem, activeTab === tab.id && styles.activeNavItem]}
        >
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text style={[styles.label, activeTab === tab.id && styles.activeLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingBottom: 25, // Większy padding dla iPhone/nowych Androidów
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navItem: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16 
  },
  activeNavItem: { 
    backgroundColor: '#1f2937' 
  },
  icon: { 
    fontSize: 20,
    marginBottom: 4
  },
  label: { 
    color: '#6b7280', 
    fontSize: 10, 
    fontWeight: '800', 
    textTransform: 'uppercase' 
  },
  activeLabel: { 
    color: '#ef4444' 
  }
});

export default Navbar;
