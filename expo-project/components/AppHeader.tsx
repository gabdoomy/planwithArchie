import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from '../styles';

interface AppHeaderProps {
  onSave: () => void;
  onExport: () => void;
}

export default function AppHeader({ onSave, onExport }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Plan With Archie</Text>
        <Text style={styles.headerSubtitle}>Wedding Seating Chart · by ArchieLabs</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={onSave} style={styles.btnSecondary} activeOpacity={0.7}>
          <Feather name="save" size={15} color="#0f172a" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onExport} style={styles.btnPrimary} activeOpacity={0.7}>
          <Feather name="share" size={15} color="#ffffff" />
          <Text style={styles.btnPrimaryText}>PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
