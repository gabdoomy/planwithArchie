import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from '../styles';

interface AppHeaderProps {
  title: string;
  onSave: () => void;
  onExport: () => void;
  onSettings: () => void;
}

export default function AppHeader({ title, onSave, onExport, onSettings }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
        <Text style={styles.headerSubtitle}>Wedding Seating Chart · by ArchieLabs</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={onSave} style={styles.btnSecondary} activeOpacity={0.7}>
          <Feather name="save" size={15} color="#766354" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettings} style={styles.btnSecondary} activeOpacity={0.7}>
          <Feather name="settings" size={15} color="#766354" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onExport} style={styles.btnPrimary} activeOpacity={0.7}>
          <Feather name="share" size={15} color="#fffaf2" />
          <Text style={styles.btnPrimaryText}>PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
