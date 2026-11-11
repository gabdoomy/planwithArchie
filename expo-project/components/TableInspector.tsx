import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import type { Guest, TableItem } from '../types';
import styles from '../styles';

interface TableInspectorProps {
  table: TableItem | null;
  guestName: string;
  guestDiet: string;
  guestIsVip: boolean;
  editingGuestId: string | null;
  onClose: () => void;
  onDeleteTable: () => void;
  onRemoveGuest: (guestId: string) => void;
  onEditGuest: (guest: Guest) => void;
  onGuestNameChange: (value: string) => void;
  onGuestDietChange: (value: string) => void;
  onToggleVip: () => void;
  onSubmitGuest: () => void;
  onCancelEdit: () => void;
  onUpdateTable: (updates: Partial<TableItem>) => void;
}

export default function TableInspector({
  table,
  guestName,
  guestDiet,
  guestIsVip,
  editingGuestId,
  onClose,
  onDeleteTable,
  onRemoveGuest,
  onEditGuest,
  onGuestNameChange,
  onGuestDietChange,
  onToggleVip,
  onSubmitGuest,
  onCancelEdit,
  onUpdateTable
}: TableInspectorProps) {
  return (
    <Modal
      visible={table !== null}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{table?.name}</Text>
              <Text style={styles.modalSubtitle}>
                {table?.shape.toUpperCase()} · {table?.guests.length}/{table?.capacity} Seats
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.guestListContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <Text style={styles.sectionHeading}>Seated Guests</Text>
            {table?.guests.length === 0 ? (
              <Text style={styles.emptyText}>No people seated at this table yet.</Text>
            ) : (
              table?.guests.map((guest, index) => (
                <View key={guest.id} style={styles.guestRow}>
                  <View style={styles.seatNumBadge}>
                    <Text style={styles.seatNumText}>{index + 1}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onEditGuest(guest)}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${guest.name}`}
                    style={styles.guestDetails}
                  >
                    <Text style={styles.guestNameText}>{guest.name}</Text>
                    {guest.dietary ? <Text style={styles.guestDietText}>{guest.dietary}</Text> : null}
                    {guest.isVip ? <Text style={styles.vipGuestText}>VIP</Text> : null}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onRemoveGuest(guest.id)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            <View style={styles.addGuestBox}>
              <Text style={styles.sectionHeading}>
                {editingGuestId ? 'Edit Person' : 'Add Person to Table'}
              </Text>
              <TextInput
                placeholder="Guest Full Name..."
                placeholderTextColor="#94a3b8"
                value={guestName}
                onChangeText={onGuestNameChange}
                style={styles.input}
              />
              <TextInput
                placeholder="Dietary Note (e.g. Vegetarian, Gluten-Free)"
                placeholderTextColor="#94a3b8"
                value={guestDiet}
                onChangeText={onGuestDietChange}
                style={styles.input}
              />
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: guestIsVip }}
                onPress={onToggleVip}
                style={[styles.vipToggle, guestIsVip && styles.vipToggleActive]}
              >
                <Text style={[styles.vipToggleText, guestIsVip && styles.vipToggleTextActive]}>
                  {guestIsVip ? '★ VIP guest' : '☆ Mark as VIP'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSubmitGuest} style={styles.addBtn} activeOpacity={0.8}>
                <Text style={styles.addBtnText}>
                  {editingGuestId ? 'Save Changes' : '+ Seat Guest'}
                </Text>
              </TouchableOpacity>
              {editingGuestId ? (
                <TouchableOpacity onPress={onCancelEdit} style={styles.cancelEditBtn}>
                  <Text style={styles.cancelEditText}>Cancel editing</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity onPress={onDeleteTable} style={styles.deleteTableBtn}>
              <Text style={styles.deleteTableBtnText}>Delete This Table</Text>
            </TouchableOpacity>
          </ScrollView>

          {table ? (
            <View style={styles.tableControls}>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Seats</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    onPress={() => onUpdateTable({ capacity: table.capacity - 1 })}
                    disabled={table.capacity <= Math.max(1, table.guests.length)}
                    style={styles.stepperButton}
                  >
                    <Text style={styles.stepperButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.controlValue}>{table.capacity}</Text>
                  <TouchableOpacity
                    onPress={() => onUpdateTable({ capacity: table.capacity + 1 })}
                    style={styles.stepperButton}
                  >
                    <Text style={styles.stepperButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Overall size</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    onPress={() => onUpdateTable({ scale: Math.max(0.6, Number(((table.scale ?? 1) - 0.1).toFixed(1))) })}
                    disabled={(table.scale ?? 1) <= 0.6}
                    style={styles.stepperButton}
                  >
                    <Text style={styles.stepperButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.controlValue}>{Math.round((table.scale ?? 1) * 100)}%</Text>
                  <TouchableOpacity
                    onPress={() => onUpdateTable({ scale: Math.min(1.8, Number(((table.scale ?? 1) + 0.1).toFixed(1))) })}
                    disabled={(table.scale ?? 1) >= 1.8}
                    style={styles.stepperButton}
                  >
                    <Text style={styles.stepperButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {table.shape === 'rectangle' ? (
                <>
                  <View style={styles.controlRow}>
                    <Text style={styles.controlLabel}>Length</Text>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        onPress={() => onUpdateTable({
                          lengthScale: Math.max(0.6, Math.round(((table.lengthScale ?? 1) - 0.1) * 10) / 10)
                        })}
                        disabled={(table.lengthScale ?? 1) <= 0.6}
                        style={styles.stepperButton}
                      >
                        <Text style={styles.stepperButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.controlValue}>{Math.round((table.lengthScale ?? 1) * 100)}%</Text>
                      <TouchableOpacity
                        onPress={() => onUpdateTable({
                          lengthScale: Math.min(2.5, Math.round(((table.lengthScale ?? 1) + 0.1) * 10) / 10)
                        })}
                        disabled={(table.lengthScale ?? 1) >= 2.5}
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
                        onPress={() => onUpdateTable({
                          widthScale: Math.max(0.6, Math.round(((table.widthScale ?? 1) - 0.1) * 10) / 10)
                        })}
                        disabled={(table.widthScale ?? 1) <= 0.6}
                        style={styles.stepperButton}
                      >
                        <Text style={styles.stepperButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.controlValue}>{Math.round((table.widthScale ?? 1) * 100)}%</Text>
                      <TouchableOpacity
                        onPress={() => onUpdateTable({
                          widthScale: Math.min(2.5, Math.round(((table.widthScale ?? 1) + 0.1) * 10) / 10)
                        })}
                        disabled={(table.widthScale ?? 1) >= 2.5}
                        style={styles.stepperButton}
                      >
                        <Text style={styles.stepperButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : null}
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Rotation</Text>
                <TouchableOpacity
                  onPress={() => onUpdateTable({ rotation: ((table.rotation ?? 0) + 90) % 360 })}
                  style={styles.rotateButton}
                >
                  <Text style={styles.rotateButtonText}>↻ Rotate</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
