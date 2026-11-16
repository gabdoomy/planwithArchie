import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DragList, { type DragListRenderItemInfo } from 'react-native-draglist';
import type { Guest, TableItem } from '../types';
import { getSeatAssignments } from '../seatUtils';
import styles from '../styles';

interface SeatSlot {
  key: string;
  seatIndex: number;
  guest: Guest | null;
}

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
  onMoveGuestSeat: (fromSeatIndex: number, toSeatIndex: number) => void;
  onGuestNameChange: (value: string) => void;
  onGuestDietChange: (value: string) => void;
  onToggleVip: () => void;
  onSubmitGuest: (preferredSeatIndex?: number | null) => void;
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
  onMoveGuestSeat,
  onGuestNameChange,
  onGuestDietChange,
  onToggleVip,
  onSubmitGuest,
  onCancelEdit,
  onUpdateTable
}: TableInspectorProps) {
  const [targetSeatIndex, setTargetSeatIndex] = useState<number | null>(null);
  const nameInputRef = useRef<TextInput | null>(null);

  const seats = table ? getSeatAssignments(table) : [];
  const seatSlots: SeatSlot[] = seats.map((guest, seatIndex) => ({
    key: guest ? guest.id : `empty_${seatIndex}`,
    seatIndex,
    guest
  }));

  useEffect(() => {
    setTargetSeatIndex(null);
  }, [table?.id]);

  useEffect(() => {
    if (targetSeatIndex !== null && (targetSeatIndex >= seats.length || seats[targetSeatIndex] !== null)) {
      setTargetSeatIndex(null);
    }
  }, [seats.length, targetSeatIndex, table?.guests]);

  const handleSelectEmptySeat = (index: number) => {
    if (editingGuestId) onCancelEdit();
    setTargetSeatIndex(prev => (prev === index ? null : index));
    nameInputRef.current?.focus();
  };

  const handleReordered = async (fromIndex: number, toIndex: number) => {
    setTargetSeatIndex(null);
    onMoveGuestSeat(fromIndex, toIndex);
  };

  const renderSeatItem = ({
    item,
    onDragStart,
    onDragEnd,
    isActive
  }: DragListRenderItemInfo<SeatSlot>) => {
    const { guest, seatIndex } = item;
    const isEmpty = guest === null;
    const isSelectedEmptyTarget = isEmpty && targetSeatIndex === seatIndex;

    return (
      <View
        style={[
          styles.guestRow,
          isEmpty && styles.guestRowEmpty,
          isSelectedEmptyTarget && styles.guestRowTargetSelected,
          isActive && styles.guestRowDragging
        ]}
      >
        <View style={[styles.seatNumBadge, isEmpty && styles.seatNumBadgeEmpty]}>
          <Text style={[styles.seatNumText, isEmpty && styles.seatNumTextEmpty]}>
            {seatIndex + 1}
          </Text>
        </View>

        {guest ? (
          <>
            <TouchableOpacity
              onPressIn={onDragStart}
              onPressOut={onDragEnd}
              delayPressIn={0}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.dragHandle}
              accessibilityRole="adjustable"
              accessibilityLabel={`Drag to move ${guest.name} to another seat`}
            >
              <DragHandleIcon />
            </TouchableOpacity>
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
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => handleSelectEmptySeat(seatIndex)}
              accessibilityRole="button"
              accessibilityLabel={`Seat ${seatIndex + 1} is empty. Tap to assign a guest.`}
              style={styles.guestDetails}
              activeOpacity={0.7}
            >
              <Text style={styles.emptySeatText}>
                {isSelectedEmptyTarget
                  ? `Adding guest to Seat ${seatIndex + 1}`
                  : 'Empty seat'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSelectEmptySeat(seatIndex)} activeOpacity={0.7}>
              <Text style={styles.emptySeatActionText}>
                {isSelectedEmptyTarget ? 'Selected' : '+ Seat'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  const listHeader = (
    <View>
      <View style={styles.modalHeader}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.tableNameLabel}>TABLE NAME · TAP TO EDIT</Text>
          <View style={styles.tableNameField}>
            <TextInput
              value={table?.name ?? ''}
              onChangeText={name => onUpdateTable({ name })}
              placeholder="Enter table name"
              placeholderTextColor="#9a8d7c"
              style={styles.tableNameInput}
              accessibilityLabel="Edit table name"
              returnKeyType="done"
            />
            <Text style={styles.tableNameEditIcon}>✎</Text>
          </View>
          <Text style={styles.modalSubtitle}>
            {table?.shape.toUpperCase()} · {table?.guests.length}/{table?.capacity} Seats
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      {table ? (
        <View style={styles.seatsBar}>
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
      ) : null}

      <Text style={styles.sectionHeading}>Seats & Guests</Text>
    </View>
  );

  const listFooter = (
    <View>
      <View style={styles.addGuestBox}>
        <Text style={styles.sectionHeading}>
          {editingGuestId
            ? 'Edit Person'
            : targetSeatIndex !== null
              ? `Add Person to Seat ${targetSeatIndex + 1}`
              : 'Add Person to Table'}
        </Text>
        <TextInput
          ref={nameInputRef}
          placeholder="Guest Full Name..."
          placeholderTextColor="#9a8d7c"
          value={guestName}
          onChangeText={onGuestNameChange}
          style={styles.input}
        />
        <TextInput
          placeholder="Dietary Note (e.g. Vegetarian, Gluten-Free)"
          placeholderTextColor="#9a8d7c"
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
        <TouchableOpacity
          onPress={() => {
            onSubmitGuest(targetSeatIndex);
            setTargetSeatIndex(null);
          }}
          style={styles.addBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>
            {editingGuestId
              ? 'Save Changes'
              : targetSeatIndex !== null
                ? `+ Seat Guest at Seat ${targetSeatIndex + 1}`
                : '+ Seat Guest'}
          </Text>
        </TouchableOpacity>
        {editingGuestId ? (
          <TouchableOpacity onPress={onCancelEdit} style={styles.cancelEditBtn}>
            <Text style={styles.cancelEditText}>Cancel editing</Text>
          </TouchableOpacity>
        ) : targetSeatIndex !== null ? (
          <TouchableOpacity onPress={() => setTargetSeatIndex(null)} style={styles.cancelEditBtn}>
            <Text style={styles.cancelEditText}>Clear seat selection</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity onPress={onDeleteTable} style={styles.deleteTableBtn}>
        <Text style={styles.deleteTableBtnText}>Delete This Table</Text>
      </TouchableOpacity>
    </View>
  );

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
        <View style={styles.modalSheet}>
          <DragList
            data={seatSlots}
            keyExtractor={item => item.key}
            renderItem={renderSeatItem}
            onReordered={handleReordered}
            onDragBegin={() => setTargetSeatIndex(null)}
            containerStyle={styles.modalScroll}
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            ListHeaderComponent={listHeader}
            ListFooterComponent={listFooter}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={true}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function DragHandleIcon() {
  return (
    <View style={styles.dragHandleGrid}>
      <View style={styles.dragHandleColumn}>
        <View style={styles.dragHandleDot} />
        <View style={styles.dragHandleDot} />
        <View style={styles.dragHandleDot} />
      </View>
      <View style={styles.dragHandleColumn}>
        <View style={styles.dragHandleDot} />
        <View style={styles.dragHandleDot} />
        <View style={styles.dragHandleDot} />
      </View>
    </View>
  );
}
