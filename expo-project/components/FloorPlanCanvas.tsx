import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Text,
  View
} from 'react-native';
import type { Guest, TableItem } from '../types';
import { venueItemColors, venueItemDimensions, venueItemIcons } from '../venueItems';
import styles from '../styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloorPlanCanvasProps {
  tables: TableItem[];
  onDragEnd: (id: string, x: number, y: number) => void;
  onSelect: (table: TableItem) => void;
}

export default function FloorPlanCanvas({ tables, onDragEnd, onSelect }: FloorPlanCanvasProps) {
  return (
    <View style={styles.canvasContainer}>
      {tables.map(table => (
        <DraggableTableNode
          key={table.id}
          table={table}
          onDragEnd={(x, y) => onDragEnd(table.id, x, y)}
          onPress={() => onSelect(table)}
        />
      ))}
    </View>
  );
}

function DraggableTableNode({
  table,
  onDragEnd,
  onPress
}: {
  table: TableItem;
  onDragEnd: (x: number, y: number) => void;
  onPress: () => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: table.x, y: table.y })).current;
  const currentPos = useRef({ x: table.x, y: table.y });
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;

  useEffect(() => {
    pan.setValue({ x: table.x, y: table.y });
    currentPos.current = { x: table.x, y: table.y };
  }, [table.x, table.y]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: currentPos.current.x,
          y: currentPos.current.y
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        const finalX = Math.max(10, Math.min(SCREEN_WIDTH - 130, currentPos.current.x + gesture.dx));
        const finalY = Math.max(10, Math.min(SCREEN_HEIGHT - 240, currentPos.current.y + gesture.dy));
        currentPos.current = { x: finalX, y: finalY };
        onDragEnd(finalX, finalY);

        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          onPressRef.current();
        }
      }
    })
  ).current;

  const scale = table.scale ?? 1;
  let tableWidth = 100 * scale;
  let tableHeight = 100 * scale;
  let borderRadius = 50 * scale;

  if (table.shape === 'round') {
    tableWidth = 100 * scale;
    tableHeight = 100 * scale;
    borderRadius = 50 * scale;
  } else if (table.shape === 'rectangle') {
    tableWidth = 136 * scale * (table.lengthScale ?? 1);
    tableHeight = 80 * scale * (table.widthScale ?? 1);
    borderRadius = 14;
  } else {
    tableWidth = 92 * scale;
    tableHeight = 92 * scale;
    borderRadius = 14;
  }

  if (table.venueType) {
    tableWidth = venueItemDimensions[table.venueType].width * scale * (table.lengthScale ?? 1);
    tableHeight = venueItemDimensions[table.venueType].height * scale * (table.widthScale ?? 1);
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
        guest: table.guests[i]
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
        guest: table.guests[i]
      });
    }
    for (let i = 0; i < bottomSeats; i++) {
      chairs.push({
        x: 20 + ((tableWidth - 40) * (i + 0.5)) / bottomSeats - chairSize / 2,
        y: tableHeight - chairSize / 2 + 3,
        seatNum: topSeats + i + 1,
        guest: table.guests[topSeats + i]
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
        guest: table.guests[i]
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

function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
