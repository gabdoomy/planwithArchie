import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import type { Guest, TableItem } from '../types';
import { getSeatAssignments } from '../seatUtils';
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
  const [draggingSeatIndex, setDraggingSeatIndex] = useState<number | null>(null);
  const [hoverSeatIndex, setHoverSeatIndex] = useState<number | null>(null);
  const [targetSeatIndex, setTargetSeatIndex] = useState<number | null>(null);
  const rowLayoutsRef = useRef<Record<number, { y: number; height: number }>>({});
  const hoverSeatIndexRef = useRef<number | null>(null);
  const nameInputRef = useRef<TextInput | null>(null);

  const seats = table ? getSeatAssignments(table) : [];
  const seatCountRef = useRef(seats.length);
  seatCountRef.current = seats.length;

  useEffect(() => {
    setDraggingSeatIndex(null);
    setHoverSeatIndex(null);
    hoverSeatIndexRef.current = null;
    setTargetSeatIndex(null);
  }, [table?.id]);

  useEffect(() => {
    if (targetSeatIndex !== null && (targetSeatIndex >= seats.length || seats[targetSeatIndex] !== null)) {
      setTargetSeatIndex(null);
    }
  }, [seats.length, targetSeatIndex, table?.guests]);

  const handleDragStart = (index: number) => {
    setTargetSeatIndex(null);
    setDraggingSeatIndex(index);
    setHoverSeatIndex(index);
    hoverSeatIndexRef.current = index;
  };

  const handleDragMove = (sourceIndex: number, dy: number) => {
    const origin = rowLayoutsRef.current[sourceIndex];
    if (!origin) return;
    const centerY = origin.y + origin.height / 2 + dy;
    const count = seatCountRef.current;

    let nextHover = sourceIndex;
    const firstLayout = rowLayoutsRef.current[0];
    const lastLayout = rowLayoutsRef.current[count - 1];
    if (firstLayout && centerY < firstLayout.y) {
      nextHover = 0;
    } else if (lastLayout && centerY > lastLayout.y + lastLayout.height) {
      nextHover = count - 1;
    } else {
      let closestDistance = Number.POSITIVE_INFINITY;
      for (let i = 0; i < count; i++) {
        const layout = rowLayoutsRef.current[i];
        if (!layout) continue;
        if (centerY >= layout.y && centerY <= layout.y + layout.height) {
          nextHover = i;
          break;
        }
        const rowCenter = layout.y + layout.height / 2;
        const distance = Math.abs(centerY - rowCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          nextHover = i;
        }
      }
    }

    if (hoverSeatIndexRef.current !== nextHover) {
      hoverSeatIndexRef.current = nextHover;
      setHoverSeatIndex(nextHover);
    }
  };

  const handleDragEnd = (sourceIndex: number) => {
    const destination = hoverSeatIndexRef.current;
    setDraggingSeatIndex(null);
    setHoverSeatIndex(null);
    hoverSeatIndexRef.current = null;
    if (destination !== null && destination !== sourceIndex) {
      onMoveGuestSeat(sourceIndex, destination);
    }
  };

  const handleSelectEmptySeat = (index: number) => {
    if (editingGuestId) onCancelEdit();
    setTargetSeatIndex(prev => (prev === index ? null : index));
    nameInputRef.current?.focus();
  };

  const getStepHeight = (seatIndex: number): number => {
    const current = rowLayoutsRef.current[seatIndex];
    if (!current) return 0;
    const next = rowLayoutsRef.current[seatIndex + 1];
    if (next) return next.y - current.y;
    return current.height;
  };

  const getShiftOffset = (index: number): number => {
    if (draggingSeatIndex === null || hoverSeatIndex === null || draggingSeatIndex === index) {
      return 0;
    }
    const draggedStep = getStepHeight(draggingSeatIndex);
    if (draggingSeatIndex < hoverSeatIndex) {
      if (index > draggingSeatIndex && index <= hoverSeatIndex) {
        return -draggedStep;
      }
    } else if (draggingSeatIndex > hoverSeatIndex) {
      if (index >= hoverSeatIndex && index < draggingSeatIndex) {
        return draggedStep;
      }
    }
    return 0;
  };

  const getPreviewSeatNumber = (index: number): number => {
    if (draggingSeatIndex === null || hoverSeatIndex === null) {
      return index + 1;
    }
    if (index === draggingSeatIndex) {
      return hoverSeatIndex + 1;
    }
    if (draggingSeatIndex < hoverSeatIndex && index > draggingSeatIndex && index <= hoverSeatIndex) {
      return index;
    }
    if (draggingSeatIndex > hoverSeatIndex && index >= hoverSeatIndex && index < draggingSeatIndex) {
      return index + 2;
    }
    return index + 1;
  };

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
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            scrollEnabled={draggingSeatIndex === null}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={true}
          >
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
            <View style={styles.guestListContainer}>
              {seats.map((guest, index) => (
                <SeatRow
                  key={`seat_${index}`}
                  index={index}
                  previewSeatNumber={getPreviewSeatNumber(index)}
                  guest={guest}
                  isDragActive={draggingSeatIndex !== null}
                  isDragging={draggingSeatIndex === index}
                  shiftOffset={getShiftOffset(index)}
                  isSelectedEmptyTarget={guest === null && targetSeatIndex === index}
                  onLayout={(y, height) => {
                    rowLayoutsRef.current[index] = { y, height };
                  }}
                  onDragStart={() => handleDragStart(index)}
                  onDragMove={dy => handleDragMove(index, dy)}
                  onDragEnd={() => handleDragEnd(index)}
                  onEditGuest={onEditGuest}
                  onRemoveGuest={onRemoveGuest}
                  onSelectEmptySeat={() => handleSelectEmptySeat(index)}
                />
              ))}
            </View>

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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SeatRow({
  index,
  previewSeatNumber,
  guest,
  isDragActive,
  isDragging,
  shiftOffset,
  isSelectedEmptyTarget,
  onLayout,
  onDragStart,
  onDragMove,
  onDragEnd,
  onEditGuest,
  onRemoveGuest,
  onSelectEmptySeat
}: {
  index: number;
  previewSeatNumber: number;
  guest: Guest | null;
  isDragActive: boolean;
  isDragging: boolean;
  shiftOffset: number;
  isSelectedEmptyTarget: boolean;
  onLayout: (y: number, height: number) => void;
  onDragStart: () => void;
  onDragMove: (dy: number) => void;
  onDragEnd: () => void;
  onEditGuest: (guest: Guest) => void;
  onRemoveGuest: (guestId: string) => void;
  onSelectEmptySeat: () => void;
}) {
  const dragY = useRef(new Animated.Value(0)).current;
  const shiftY = useRef(new Animated.Value(0)).current;
  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;
  const onDragMoveRef = useRef(onDragMove);
  onDragMoveRef.current = onDragMove;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  useEffect(() => {
    if (!isDragActive || isDragging) {
      shiftY.setValue(0);
      return;
    }
    Animated.spring(shiftY, {
      toValue: shiftOffset,
      useNativeDriver: true,
      tension: 260,
      friction: 24
    }).start();
  }, [isDragActive, isDragging, shiftOffset, shiftY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        dragY.setValue(0);
        onDragStartRef.current();
      },
      onPanResponderMove: (_, gesture) => {
        dragY.setValue(gesture.dy);
        onDragMoveRef.current(gesture.dy);
      },
      onPanResponderRelease: () => {
        dragY.setValue(0);
        onDragEndRef.current();
      },
      onPanResponderTerminate: () => {
        dragY.setValue(0);
        onDragEndRef.current();
      }
    })
  ).current;

  const isEmpty = guest === null;

  return (
    <Animated.View
      onLayout={event => {
        const { y, height } = event.nativeEvent.layout;
        onLayout(y, height);
      }}
      style={[
        styles.guestRow,
        isEmpty && styles.guestRowEmpty,
        isSelectedEmptyTarget && styles.guestRowTargetSelected,
        isDragging && styles.guestRowDragging,
        { transform: [{ translateY: isDragging ? dragY : shiftY }] }
      ]}
    >
      <View style={[styles.seatNumBadge, isEmpty && styles.seatNumBadgeEmpty]}>
        <Text style={[styles.seatNumText, isEmpty && styles.seatNumTextEmpty]}>{previewSeatNumber}</Text>
      </View>

      {guest ? (
        <>
          <View
            {...panResponder.panHandlers}
            style={styles.dragHandle}
            accessibilityRole="adjustable"
            accessibilityLabel={`Drag to move ${guest.name} to another seat`}
          >
            <DragHandleIcon />
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
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={onSelectEmptySeat}
            accessibilityRole="button"
            accessibilityLabel={`Seat ${index + 1} is empty. Tap to assign a guest.`}
            style={styles.guestDetails}
            activeOpacity={0.7}
          >
            <Text style={styles.emptySeatText}>
              {isSelectedEmptyTarget
                ? `Adding guest to Seat ${index + 1}`
                : 'Empty seat'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSelectEmptySeat} activeOpacity={0.7}>
            <Text style={styles.emptySeatActionText}>
              {isSelectedEmptyTarget ? 'Selected' : '+ Seat'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
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
