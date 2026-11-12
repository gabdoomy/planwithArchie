import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import styles from '../styles';

export interface EventSummary {
  id: string;
  name: string;
}

interface EventSettingsProps {
  events: EventSummary[];
  currentEventId: string;
  onClose: () => void;
  onRename: (name: string) => void;
  onCreate: (name: string) => void;
  onSwitch: (id: string) => void;
  onExport: () => void;
  onImport: () => void;
}

export default function EventSettings({
  events,
  currentEventId,
  onClose,
  onRename,
  onCreate,
  onSwitch,
  onExport,
  onImport
}: EventSettingsProps) {
  const currentEvent = events.find(event => event.id === currentEventId);
  const [eventName, setEventName] = useState(currentEvent?.name ?? '');
  const [newEventName, setNewEventName] = useState('');
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setEventName(currentEvent?.name ?? '');
  }, [currentEvent?.id, currentEvent?.name]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onCloseRef.current();
      return true;
    });
    return () => subscription.remove();
  }, []);

  const saveEventName = () => {
    const name = eventName.trim();
    if (!name || name === currentEvent?.name) return;
    onRename(name);
  };

  const createEvent = () => {
    const name = newEventName.trim();
    if (!name) return;
    onCreate(name);
    setNewEventName('');
  };

  return (
    <View style={styles.settingsPage}>
      <View style={styles.settingsPageHeader}>
        <Text style={styles.modalTitle}>Event Settings</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionHeading}>Current event name</Text>
        <TextInput
          value={eventName}
          onChangeText={setEventName}
          onSubmitEditing={saveEventName}
          returnKeyType="done"
          placeholder="Event name"
          style={styles.input}
          accessibilityLabel="Current event name"
        />
        <TouchableOpacity onPress={saveEventName} style={styles.settingsPrimaryButton}>
          <Text style={styles.settingsPrimaryButtonText}>Save event name</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionHeading, styles.settingsSectionHeading]}>Your events</Text>
        {events.map(event => (
          <TouchableOpacity
            key={event.id}
            onPress={() => event.id !== currentEventId && onSwitch(event.id)}
            style={[
              styles.settingsEventRow,
              event.id === currentEventId && styles.settingsEventRowActive
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: event.id === currentEventId }}
          >
            <Text style={styles.settingsEventName}>{event.name}</Text>
            <Text style={styles.settingsEventState}>
              {event.id === currentEventId ? 'Current' : 'Switch'}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionHeading, styles.settingsSectionHeading]}>Create an event</Text>
        <TextInput
          value={newEventName}
          onChangeText={setNewEventName}
          onSubmitEditing={createEvent}
          returnKeyType="done"
          placeholder="New event name"
          style={styles.input}
          accessibilityLabel="New event name"
        />
        <TouchableOpacity onPress={createEvent} style={styles.settingsPrimaryButton}>
          <Text style={styles.settingsPrimaryButtonText}>Create event</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionHeading, styles.settingsSectionHeading]}>Seating plan configuration</Text>
        <View style={styles.settingsActions}>
          <TouchableOpacity onPress={onExport} style={styles.settingsActionButton}>
            <Text style={styles.settingsActionText}>Export Seating Chart</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onImport} style={styles.settingsActionButton}>
            <Text style={styles.settingsActionText}>Import Seating Chart</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.settingsHelpText}>
          Importing replaces the seating plan for the current event.
        </Text>
      </ScrollView>
    </View>
  );
}
