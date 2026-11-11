import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { TableShape, VenueItemType } from '../types';
import { venueItemIcons, venueItemLabels } from '../venueItems';
import styles from '../styles';

interface AddItemsDockProps {
  onAddTable: (shape: TableShape) => void;
  onAddVenueItem: (type: VenueItemType) => void;
}

export default function AddItemsDock({ onAddTable, onAddVenueItem }: AddItemsDockProps) {
  return (
    <ScrollView
      horizontal
      style={styles.dockScroll}
      contentContainerStyle={styles.dock}
      showsHorizontalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => onAddTable('round')} style={styles.dockButton} activeOpacity={0.7}>
        <View style={styles.roundIcon} />
        <Text style={styles.dockButtonText}>Round</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onAddTable('rectangle')} style={styles.dockButton} activeOpacity={0.7}>
        <View style={styles.rectIcon} />
        <Text style={styles.dockButtonText}>Rectangle</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onAddTable('square')} style={styles.dockButton} activeOpacity={0.7}>
        <View style={styles.squareIcon} />
        <Text style={styles.dockButtonText}>Square</Text>
      </TouchableOpacity>
      {(['dj', 'bar', 'dancefloor', 'cakebar', 'other'] as VenueItemType[]).map(type => (
        <TouchableOpacity
          key={type}
          onPress={() => onAddVenueItem(type)}
          style={styles.dockButton}
          activeOpacity={0.7}
        >
          <Text style={styles.venueDockIcon}>{venueItemIcons[type]}</Text>
          <Text style={styles.dockButtonText}>{venueItemLabels[type]}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
