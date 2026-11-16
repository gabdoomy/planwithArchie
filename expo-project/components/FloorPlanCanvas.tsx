import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import type { Guest, TableItem } from '../types';
import { getSeatAssignments } from '../seatUtils';
import { venueItemColors, venueItemDimensions, venueItemIcons } from '../venueItems';
import styles from '../styles';

interface FloorPlanCanvasProps {
  tables: TableItem[];
  selectedTableId: string | null;
  onDragEnd: (id: string, x: number, y: number) => void;
  onSelect: (table: TableItem) => void;
  onDismissSelection: () => void;
  onManageTable: (table: TableItem) => void;
  onUpdateTable: (id: string, updates: Partial<TableItem>) => void;
  onDeleteItem: (id: string) => void;
}

export default function FloorPlanCanvas({
  tables,
  selectedTableId,
  onDragEnd,
  onSelect,
  onDismissSelection,
  onManageTable,
  onUpdateTable,
  onDeleteItem
}: FloorPlanCanvasProps) {
  const canvasPan = useRef(new Animated.ValueXY()).current;
  const canvasZoom = useRef(new Animated.Value(1)).current;
  const zoomRef = useRef(1);
  const panOffset = useRef({ x: 0, y: 0 });
  const gestureStart = useRef({ zoom: 1, panX: 0, panY: 0, distance: 0 });

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [tooltipSize, setTooltipSize] = useState({ width: 296, height: 112 });
  const [viewport, setViewport] = useState({ panX: 0, panY: 0, zoom: 1 });
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const tooltipAnchorRef = useRef<{
    tableId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    venueType?: TableItem['venueType'];
    tooltipWidth: number;
    tooltipHeight: number;
  } | null>(null);
  const measuredTooltipForIdRef = useRef<string | null>(null);

  const handleNodeDragStateChange = (dragging: boolean) => {
    if (dragging) {
      tooltipAnchorRef.current = null;
      measuredTooltipForIdRef.current = null;
    }
    setIsDraggingNode(dragging);
  };

  const canvasResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: event => event.nativeEvent.touches.length > 1,
      onMoveShouldSetPanResponderCapture: event => event.nativeEvent.touches.length > 1,
      onPanResponderGrant: event => {
        const touches = event.nativeEvent.touches;
        const distance = getTouchDistance(touches);
        gestureStart.current = {
          zoom: zoomRef.current,
          panX: panOffset.current.x,
          panY: panOffset.current.y,
          distance
        };
      },
      onPanResponderMove: (event, gesture) => {
        const { zoom, panX, panY, distance } = gestureStart.current;
        const currentDistance = getTouchDistance(event.nativeEvent.touches);
        let nextZoom = zoomRef.current;
        if (distance > 0 && currentDistance > 0) {
          nextZoom = Math.max(0.5, Math.min(3, zoom * currentDistance / distance));
          zoomRef.current = nextZoom;
          canvasZoom.setValue(nextZoom);
        }
        const nextPan = { x: panX + gesture.dx, y: panY + gesture.dy };
        panOffset.current = nextPan;
        canvasPan.setValue(nextPan);
        setViewport({ panX: nextPan.x, panY: nextPan.y, zoom: nextZoom });
      }
    })
  ).current;

  const activeTable = selectedTableId
    ? tables.find(table => table.id === selectedTableId) ?? null
    : null;

  if (!activeTable) {
    tooltipAnchorRef.current = null;
    measuredTooltipForIdRef.current = null;
  } else if (!isDraggingNode && (!tooltipAnchorRef.current || tooltipAnchorRef.current.tableId !== activeTable.id)) {
    const dims = getTableDimensions(activeTable);
    tooltipAnchorRef.current = {
      tableId: activeTable.id,
      x: activeTable.x,
      y: activeTable.y,
      width: dims.width,
      height: dims.height,
      rotation: activeTable.rotation ?? 0,
      venueType: activeTable.venueType,
      tooltipWidth: tooltipSize.width,
      tooltipHeight: tooltipSize.height
    };
    measuredTooltipForIdRef.current = null;
  }

  let tooltipPosition: { left: number; top: number } | null = null;
  const anchor = tooltipAnchorRef.current;
  if (activeTable && anchor && !isDraggingNode && canvasSize.width > 0 && canvasSize.height > 0) {
    const rad = (anchor.rotation * Math.PI) / 180;
    const nodeMargin = anchor.venueType ? 6 : 28;
    const visualHalfH =
      Math.abs(Math.sin(rad)) * (anchor.width / 2 + nodeMargin) +
      Math.abs(Math.cos(rad)) * (anchor.height / 2 + nodeMargin);
    const cx = anchor.x + anchor.width / 2;
    const cy = anchor.y + anchor.height / 2;
    const screenCx =
      canvasSize.width / 2 + viewport.panX + (cx - canvasSize.width / 2) * viewport.zoom;
    const screenCy =
      canvasSize.height / 2 + viewport.panY + (cy - canvasSize.height / 2) * viewport.zoom;
    const scaledHalfH = visualHalfH * viewport.zoom;

    const preferredTop = screenCy - scaledHalfH - anchor.tooltipHeight - 10;
    const fallbackBottom = screenCy + scaledHalfH + 10;
    const rawTop = preferredTop >= 12 ? preferredTop : fallbackBottom;

    tooltipPosition = {
      left: clamp(screenCx - anchor.tooltipWidth / 2, 12, Math.max(12, canvasSize.width - anchor.tooltipWidth - 12)),
      top: clamp(rawTop, 12, Math.max(12, canvasSize.height - anchor.tooltipHeight - 12))
    };
  }

  return (
    <View
      style={styles.canvasContainer}
      onLayout={event => {
        const { width, height } = event.nativeEvent.layout;
        setCanvasSize({ width, height });
      }}
      {...canvasResponder.panHandlers}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismissSelection} />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.canvasScene,
          { transform: [...canvasPan.getTranslateTransform(), { scale: canvasZoom }] }
        ]}
      >
        {tables.map(table => (
          <DraggableTableNode
            key={table.id}
            table={table}
            isSelected={table.id === selectedTableId}
            zoomRef={zoomRef}
            onDragStateChange={handleNodeDragStateChange}
            onDragEnd={(x, y) => onDragEnd(table.id, x, y)}
            onPress={() => onSelect(table)}
          />
        ))}
      </Animated.View>

      {activeTable && tooltipPosition ? (
        <View
          onLayout={event => {
            const { width, height } = event.nativeEvent.layout;
            if (
              tooltipAnchorRef.current &&
              tooltipAnchorRef.current.tableId === activeTable.id &&
              measuredTooltipForIdRef.current !== activeTable.id
            ) {
              measuredTooltipForIdRef.current = activeTable.id;
              if (
                Math.abs(width - tooltipAnchorRef.current.tooltipWidth) > 1 ||
                Math.abs(height - tooltipAnchorRef.current.tooltipHeight) > 1
              ) {
                tooltipAnchorRef.current = {
                  ...tooltipAnchorRef.current,
                  tooltipWidth: width,
                  tooltipHeight: height
                };
                setTooltipSize({ width, height });
              }
            }
          }}
          style={[
            styles.tableTooltip,
            { left: tooltipPosition.left, top: tooltipPosition.top }
          ]}
        >
          <View style={styles.tooltipHeader}>
            <View style={styles.tooltipTitleWrap}>
              <Text style={styles.tooltipTitle} numberOfLines={1}>{activeTable.name}</Text>
              <Text style={styles.tooltipSubtitle}>
                {activeTable.venueType
                  ? 'Floor element'
                  : `${activeTable.guests.length}/${activeTable.capacity} guests`}
              </Text>
            </View>
            <View style={styles.tooltipHeaderActions}>
              {activeTable.venueType ? (
                <TouchableOpacity
                  onPress={() => onDeleteItem(activeTable.id)}
                  style={styles.tooltipDeleteBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tooltipDeleteBtnText}>Delete</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => onManageTable(activeTable)}
                  style={styles.tooltipManageBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tooltipManageBtnText}>Manage Table</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onDismissSelection}
                style={styles.tooltipCloseBtn}
                accessibilityLabel={activeTable.venueType ? 'Close floor element actions' : 'Close table actions'}
                activeOpacity={0.7}
              >
                <Text style={styles.tooltipCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.tooltipControlsRow}>
            {activeTable.venueType ? (
              <>
                <View style={styles.tooltipControlGroup}>
                  <Text style={styles.tooltipControlLabel}>Width</Text>
                  <View style={styles.tooltipStepper}>
                    <TouchableOpacity
                      onPress={() => onUpdateTable(activeTable.id, {
                        lengthScale: Math.max(0.5, Math.round(((activeTable.lengthScale ?? 1) - 0.1) * 10) / 10)
                      })}
                      disabled={(activeTable.lengthScale ?? 1) <= 0.5}
                      style={[
                        styles.tooltipStepperBtn,
                        (activeTable.lengthScale ?? 1) <= 0.5 && styles.tooltipStepperBtnDisabled
                      ]}
                    >
                      <Text style={styles.tooltipStepperBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.tooltipValue}>
                      {Math.round((activeTable.lengthScale ?? 1) * 100)}%
                    </Text>
                    <TouchableOpacity
                      onPress={() => onUpdateTable(activeTable.id, {
                        lengthScale: Math.min(3, Math.round(((activeTable.lengthScale ?? 1) + 0.1) * 10) / 10)
                      })}
                      disabled={(activeTable.lengthScale ?? 1) >= 3}
                      style={[
                        styles.tooltipStepperBtn,
                        (activeTable.lengthScale ?? 1) >= 3 && styles.tooltipStepperBtnDisabled
                      ]}
                    >
                      <Text style={styles.tooltipStepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.tooltipControlGroup}>
                  <Text style={styles.tooltipControlLabel}>Height</Text>
                  <View style={styles.tooltipStepper}>
                    <TouchableOpacity
                      onPress={() => onUpdateTable(activeTable.id, {
                        widthScale: Math.max(0.5, Math.round(((activeTable.widthScale ?? 1) - 0.1) * 10) / 10)
                      })}
                      disabled={(activeTable.widthScale ?? 1) <= 0.5}
                      style={[
                        styles.tooltipStepperBtn,
                        (activeTable.widthScale ?? 1) <= 0.5 && styles.tooltipStepperBtnDisabled
                      ]}
                    >
                      <Text style={styles.tooltipStepperBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.tooltipValue}>
                      {Math.round((activeTable.widthScale ?? 1) * 100)}%
                    </Text>
                    <TouchableOpacity
                      onPress={() => onUpdateTable(activeTable.id, {
                        widthScale: Math.min(3, Math.round(((activeTable.widthScale ?? 1) + 0.1) * 10) / 10)
                      })}
                      disabled={(activeTable.widthScale ?? 1) >= 3}
                      style={[
                        styles.tooltipStepperBtn,
                        (activeTable.widthScale ?? 1) >= 3 && styles.tooltipStepperBtnDisabled
                      ]}
                    >
                      <Text style={styles.tooltipStepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : activeTable.shape === 'rectangle' ? (
              <>
                <View style={styles.tooltipControlGroup}>
                  <Text style={styles.tooltipControlLabel}>Width</Text>
                  <View style={styles.tooltipStepper}>
                    <TouchableOpacity
                      onPress={() => onUpdateTable(activeTable.id, {
                        lengthScale: Math.max(0.6, Math.round(((activeTable.lengthScale ?? 1) - 0.1) * 10) / 10)
                      })}
                      disabled={(activeTable.lengthScale ?? 1) <= 0.6}
                      style={[
                        styles.tooltipStepperBtn,
                        (activeTable.lengthScale ?? 1) <= 0.6 && styles.tooltipStepperBtnDisabled
                      ]}
                    >
                      <Text style={styles.tooltipStepperBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.tooltipValue}>
                      {Math.round((activeTable.lengthScale ?? 1) * 100)}%
                    </Text>
                    <TouchableOpacity
                      onPress={() => onUpdateTable(activeTable.id, {
                        lengthScale: Math.min(2.5, Math.round(((activeTable.lengthScale ?? 1) + 0.1) * 10) / 10)
                      })}
                      disabled={(activeTable.lengthScale ?? 1) >= 2.5}
                      style={[
                        styles.tooltipStepperBtn,
                        (activeTable.lengthScale ?? 1) >= 2.5 && styles.tooltipStepperBtnDisabled
                      ]}
                    >
                      <Text style={styles.tooltipStepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.tooltipControlGroup}>
                  <Text style={styles.tooltipControlLabel}>Height</Text>
                  <View style={styles.tooltipStepper}>
                    <TouchableOpacity
                      onPress={() => onUpdateTable(activeTable.id, {
                        widthScale: Math.max(0.6, Math.round(((activeTable.widthScale ?? 1) - 0.1) * 10) / 10)
                      })}
                      disabled={(activeTable.widthScale ?? 1) <= 0.6}
                      style={[
                        styles.tooltipStepperBtn,
                        (activeTable.widthScale ?? 1) <= 0.6 && styles.tooltipStepperBtnDisabled
                      ]}
                    >
                      <Text style={styles.tooltipStepperBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.tooltipValue}>
                      {Math.round((activeTable.widthScale ?? 1) * 100)}%
                    </Text>
                    <TouchableOpacity
                      onPress={() => onUpdateTable(activeTable.id, {
                        widthScale: Math.min(2.5, Math.round(((activeTable.widthScale ?? 1) + 0.1) * 10) / 10)
                      })}
                      disabled={(activeTable.widthScale ?? 1) >= 2.5}
                      style={[
                        styles.tooltipStepperBtn,
                        (activeTable.widthScale ?? 1) >= 2.5 && styles.tooltipStepperBtnDisabled
                      ]}
                    >
                      <Text style={styles.tooltipStepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.tooltipControlGroup}>
                  <Text style={styles.tooltipControlLabel}>Rotate</Text>
                  <TouchableOpacity
                    onPress={() => onUpdateTable(activeTable.id, {
                      rotation: ((activeTable.rotation ?? 0) + 45) % 360
                    })}
                    style={styles.tooltipRotateBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tooltipRotateBtnText}>
                      ↻ {activeTable.rotation ?? 0}°
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.tooltipControlGroupRow}>
                <Text style={styles.tooltipControlLabel}>Table Size</Text>
                <View style={styles.tooltipStepper}>
                  <TouchableOpacity
                    onPress={() => onUpdateTable(activeTable.id, {
                      scale: Math.max(0.6, Number(((activeTable.scale ?? 1) - 0.1).toFixed(1)))
                    })}
                    disabled={(activeTable.scale ?? 1) <= 0.6}
                    style={[
                      styles.tooltipStepperBtn,
                      (activeTable.scale ?? 1) <= 0.6 && styles.tooltipStepperBtnDisabled
                    ]}
                  >
                    <Text style={styles.tooltipStepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.tooltipValue}>
                    {Math.round((activeTable.scale ?? 1) * 100)}%
                  </Text>
                  <TouchableOpacity
                    onPress={() => onUpdateTable(activeTable.id, {
                      scale: Math.min(1.8, Number(((activeTable.scale ?? 1) + 0.1).toFixed(1)))
                    })}
                    disabled={(activeTable.scale ?? 1) >= 1.8}
                    style={[
                      styles.tooltipStepperBtn,
                      (activeTable.scale ?? 1) >= 1.8 && styles.tooltipStepperBtnDisabled
                    ]}
                  >
                    <Text style={styles.tooltipStepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function DraggableTableNode({
  table,
  isSelected,
  zoomRef,
  onDragStateChange,
  onDragEnd,
  onPress
}: {
  table: TableItem;
  isSelected: boolean;
  zoomRef: React.MutableRefObject<number>;
  onDragStateChange: (dragging: boolean) => void;
  onDragEnd: (x: number, y: number) => void;
  onPress: () => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: table.x, y: table.y })).current;
  const currentPos = useRef({ x: table.x, y: table.y });
  const isDraggingRef = useRef(false);
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;
  const onDragStateChangeRef = useRef(onDragStateChange);
  onDragStateChangeRef.current = onDragStateChange;

  useEffect(() => {
    pan.setValue({ x: table.x, y: table.y });
    currentPos.current = { x: table.x, y: table.y };
  }, [table.x, table.y]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
      onPanResponderGrant: () => {
        isDraggingRef.current = false;
        pan.setOffset({
          x: currentPos.current.x,
          y: currentPos.current.y
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        if (!isDraggingRef.current && (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4)) {
          isDraggingRef.current = true;
          onDragStateChangeRef.current(true);
        }
        pan.setValue({
          x: gesture.dx / zoomRef.current,
          y: gesture.dy / zoomRef.current
        });
      },
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        const finalX = currentPos.current.x + gesture.dx / zoomRef.current;
        const finalY = currentPos.current.y + gesture.dy / zoomRef.current;
        currentPos.current = { x: finalX, y: finalY };
        onDragEndRef.current(finalX, finalY);
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          onDragStateChangeRef.current(false);
        }

        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          onPressRef.current();
        }
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          onDragStateChangeRef.current(false);
        }
      }
    })
  ).current;

  const { width: tableWidth, height: tableHeight, borderRadius } = getTableDimensions(table);

  if (table.venueType) {
    const color = venueItemColors[table.venueType];
    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.tableWrapper,
          {
            width: tableWidth,
            height: tableHeight,
            transform: [...pan.getTranslateTransform(), { rotate: `${table.rotation ?? 0}deg` }]
          }
        ]}
      >
        <View
          style={[
            styles.venueNode,
            isSelected && styles.venueNodeSelected,
            {
              width: tableWidth,
              height: tableHeight,
              backgroundColor: `${color}20`,
              borderColor: color,
              borderStyle: table.venueType === 'dancefloor' ? 'dashed' : 'solid'
            }
          ]}
        >
          <Text style={styles.venueNodeIcon}>{venueItemIcons[table.venueType]}</Text>
          <Text style={styles.venueNodeName} numberOfLines={2}>{table.name}</Text>
        </View>
      </Animated.View>
    );
  }

  const seatAssignments = getSeatAssignments(table);
  const chairs: { x: number; y: number; seatNum: number; guest?: Guest }[] = [];
  const chairSize = 24;
  if (table.shape === 'round') {
    const radius = tableWidth / 2;
    const chairDistance = radius + 15;
    for (let i = 0; i < table.capacity; i++) {
      const angle = (i * 2 * Math.PI) / table.capacity - Math.PI / 2;
      chairs.push({
        x: radius + Math.cos(angle) * chairDistance - chairSize / 2,
        y: radius + Math.sin(angle) * chairDistance - chairSize / 2,
        seatNum: i + 1,
        guest: seatAssignments[i] ?? undefined
      });
    }
  } else if (table.shape === 'rectangle') {
    const topSeats = Math.ceil(table.capacity / 2);
    const bottomSeats = Math.floor(table.capacity / 2);
    for (let i = 0; i < topSeats; i++) {
      chairs.push({
        x: 20 + ((tableWidth - 40) * (i + 0.5)) / topSeats - chairSize / 2,
        y: -chairSize / 2 - 3,
        seatNum: i + 1,
        guest: seatAssignments[i] ?? undefined
      });
    }
    for (let i = 0; i < bottomSeats; i++) {
      chairs.push({
        x: 20 + ((tableWidth - 40) * (i + 0.5)) / bottomSeats - chairSize / 2,
        y: tableHeight - chairSize / 2 + 3,
        seatNum: topSeats + i + 1,
        guest: seatAssignments[topSeats + i] ?? undefined
      });
    }
  } else {
    const perimeter = 2 * (tableWidth + tableHeight);
    for (let i = 0; i < table.capacity; i++) {
      const position = ((i + 0.5) * perimeter) / table.capacity;
      let x: number;
      let y: number;
      if (position < tableWidth) {
        x = position;
        y = -chairSize / 2 - 3;
      } else if (position < tableWidth + tableHeight) {
        x = tableWidth + chairSize / 2 + 3;
        y = position - tableWidth;
      } else if (position < 2 * tableWidth + tableHeight) {
        x = tableWidth - (position - tableWidth - tableHeight);
        y = tableHeight + chairSize / 2 + 3;
      } else {
        x = -chairSize / 2 - 3;
        y = tableHeight - (position - 2 * tableWidth - tableHeight);
      }
      chairs.push({
        x: x - chairSize / 2,
        y: y - chairSize / 2,
        seatNum: i + 1,
        guest: seatAssignments[i] ?? undefined
      });
    }
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.tableWrapper,
        {
          width: tableWidth,
          height: tableHeight,
          transform: [...pan.getTranslateTransform(), { rotate: `${table.rotation ?? 0}deg` }]
        }
      ]}
    >
      {chairs.map(seat => {
        const hasGuest = !!seat.guest;
        return (
          <View
            key={seat.seatNum}
            style={[
              styles.chairNode,
              { left: seat.x, top: seat.y },
              hasGuest
                ? seat.guest?.isVip
                  ? styles.chairVip
                  : styles.chairOccupied
                : styles.chairEmpty
            ]}
          >
            <Text
              style={[
                styles.chairText,
                hasGuest
                  ? seat.guest?.isVip
                    ? styles.chairTextVip
                    : styles.chairTextOccupied
                  : styles.chairTextEmpty
              ]}
              numberOfLines={1}
            >
              {hasGuest ? getInitials(seat.guest?.name) : seat.seatNum}
            </Text>
          </View>
        );
      })}
      <View
        style={[
          styles.tableNode,
          isSelected && styles.tableNodeSelected,
          { width: tableWidth, height: tableHeight, borderRadius }
        ]}
      >
        <Text style={styles.tableNodeName} numberOfLines={1}>{table.name}</Text>
        <Text style={styles.tableNodeCapacity}>
          {table.guests.length} / {table.capacity}
        </Text>
      </View>
    </Animated.View>
  );
}

export function getTableDimensions(table: TableItem) {
  const scale = table.scale ?? 1;
  if (table.venueType) {
    return {
      width: venueItemDimensions[table.venueType].width * scale * (table.lengthScale ?? 1),
      height: venueItemDimensions[table.venueType].height * scale * (table.widthScale ?? 1),
      borderRadius: 12
    };
  }
  if (table.shape === 'round') {
    return {
      width: 100 * scale,
      height: 100 * scale,
      borderRadius: 50 * scale
    };
  }
  if (table.shape === 'rectangle') {
    return {
      width: 136 * scale * (table.lengthScale ?? 1),
      height: 80 * scale * (table.widthScale ?? 1),
      borderRadius: 14
    };
  }
  return {
    width: 92 * scale,
    height: 92 * scale,
    borderRadius: 14
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getTouchDistance(touches: readonly { pageX: number; pageY: number }[]) {
  if (touches.length < 2) return 0;
  const [first, second] = touches;
  return Math.hypot(second.pageX - first.pageX, second.pageY - first.pageY);
}

function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
