import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, 
  TextInput, FlatList, KeyboardAvoidingView, Platform, Image 
} from 'react-native';
import { ChevronLeft, Search, Plus, Check } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useBlockedAppsStore, KNOWN_ICONS } from '../../store/useBlockedAppsStore';

interface AddAppModalProps {
  visible: boolean;
  onClose: () => void;
}

// Convert KNOWN_ICONS to an array of objects for the catalog
const CATALOG_APPS = Object.keys(KNOWN_ICONS).map((key) => ({
  id: key,
  name: key.charAt(0).toUpperCase() + key.slice(1),
  icon: KNOWN_ICONS[key],
}));

export function AddAppModal({ visible, onClose }: AddAppModalProps) {
  const { palette } = useThemeStore();
  const { apps, addApp } = useBlockedAppsStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter catalog based on search
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return CATALOG_APPS;
    
    const query = searchQuery.trim().toLowerCase();
    const matches = CATALOG_APPS.filter((app) => 
      app.name.toLowerCase().includes(query)
    );

    // If query is not in the catalog at all, add a "Custom" option at the end
    const exactMatch = matches.find(m => m.name.toLowerCase() === query);
    
    if (!exactMatch) {
      matches.push({
        id: 'custom-' + query,
        name: searchQuery.trim(),
        icon: null,
      });
    }

    return matches;
  }, [searchQuery]);

  const handleAdd = (appName: string) => {
    addApp(appName);
    setSearchQuery(''); // Clear search on add
  };

  const isAlreadyAdded = (appName: string) => {
    return apps.some(a => a.name.toLowerCase() === appName.toLowerCase());
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: '#111' }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronLeft size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add App</Text>
          <View style={{ width: 44 }} />
          {/* Balance for back button */}
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.inputWrapper}>
            <Search size={18} color="#777" style={{ marginLeft: 14 }} />
            <TextInput
              style={styles.textInput}
              placeholder="Search or add custom app..."
              placeholderTextColor="#777"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Catalog List */}
        <FlatList
          data={filteredCatalog}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const added = isAlreadyAdded(item.name);
            const isCustom = item.id.startsWith('custom-');

            return (
              <View style={styles.appRow}>
                <View style={styles.appRowLeft}>
                  <View style={styles.iconWrapper}>
                    {item.icon ? (
                      <Image source={item.icon} style={styles.iconImg} />
                    ) : (
                      <View style={[styles.iconPlaceholder, { backgroundColor: palette.focusColor + '20' }]}>
                        <Text style={[styles.iconLetter, { color: palette.focusColor }]}>
                          {item.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View>
                    <Text style={styles.appName}>{item.name}</Text>
                    {isCustom && <Text style={styles.customLabel}>Custom App</Text>}
                  </View>
                </View>
                
                {added ? (
                  <View style={styles.addedBadge}>
                    <Check size={16} color="#4ADE80" strokeWidth={3} />
                    <Text style={styles.addedText}>Added</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => handleAdd(item.name)} 
                    style={[styles.addBtn, { backgroundColor: palette.focusColor + '20' }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Plus size={18} color={palette.focusColor} strokeWidth={2.5} />
                    <Text style={[styles.addBtnText, { color: palette.focusColor }]}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    height: 50,
  },
  textInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    color: '#FFF',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  appRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  iconImg: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconLetter: {
    fontSize: 20,
    fontWeight: '800',
  },
  appName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#EEE',
  },
  customLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addedText: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '700',
  },
});
