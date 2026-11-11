import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import type { TableItem } from '../types';
import styles from '../styles';

interface VenueItemEditorProps {
  item: TableItem | null;
  onClose: () => void;
  onUpdate: (updates: Partial<TableItem>) => void;
  onDelete: () => void;
}

export default function VenueItemEditor({ item, onClose, onUpdate, onDelete }: VenueItemEditorProps) {
  return (
    <Modal
      visible={item !== null}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.venueEditor}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{item?.name}</Text>
              <Text style={styles.modalSubtitle}>Resize or remove this venue area</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.venueSizeControls}>
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Length</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={() => onUpdate({
                    lengthScale: Math.max(0.5, Math.round(((item?.lengthScale ?? 1) - 0.1) * 10) / 10)
                  })}
                  disabled={(item?.lengthScale ?? 1) <= 0.5}
                  style={styles.stepperButton}
                >
                  <Text style={styles.stepperButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.controlValue}>{Math.round((item?.lengthScale ?? 1) * 100)}%</Text>
                <TouchableOpacity
                  onPress={() => onUpdate({
                    lengthScale: Math.min(3, Math.round(((item?.lengthScale ?? 1) + 0.1) * 10) / 10)
                  })}
                  disabled={(item?.lengthScale ?? 1) >= 3}
                  style={styles.stepperButton}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Width</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={() => onUpdate({
                    widthScale: Math.max(0.5, Math.round(((item?.widthScale ?? 1) - 0.1) * 10) / 10)
                  })}
                  disabled={(item?.widthScale ?? 1) <= 0.5}
                  style={styles.stepperButton}
                >
                  <Text style={styles.stepperButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.controlValue}>{Math.round((item?.widthScale ?? 1) * 100)}%</Text>
                <TouchableOpacity
                  onPress={() => onUpdate({
                    widthScale: Math.min(3, Math.round(((item?.widthScale ?? 1) + 0.1) * 10) / 10)
                  })}
                  disabled={(item?.widthScale ?? 1) >= 3}
                  style={styles.stepperButton}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={onDelete} style={styles.deleteVenueButton}>
            <Text style={styles.deleteTableBtnText}>Delete {item?.name}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
