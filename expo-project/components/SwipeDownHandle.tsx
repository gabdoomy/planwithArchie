import React, { useRef } from 'react';
import { PanResponder, View } from 'react-native';
import styles from '../styles';

interface SwipeDownHandleProps {
  onDismiss: () => void;
}

export default function SwipeDownHandle({ onDismiss }: SwipeDownHandleProps) {
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 60) onDismiss();
      }
    })
  ).current;

  return (
    <View
      {...responder.panHandlers}
      style={styles.sheetHandleArea}
      accessible
      accessibilityRole="button"
      accessibilityLabel="Swipe down to close"
    >
      <View style={styles.sheetHandle} />
    </View>
  );
}
