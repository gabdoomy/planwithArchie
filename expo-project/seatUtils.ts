import type { Guest, TableItem } from './types';

export function getSeatAssignments(table: TableItem): (Guest | null)[] {
  const capacity = Math.max(table.capacity, table.guests.length);
  const seats: (Guest | null)[] = Array.from({ length: capacity }, () => null);
  const unplaced: Guest[] = [];

  for (const guest of table.guests) {
    if (
      typeof guest.seatIndex === 'number' &&
      Number.isInteger(guest.seatIndex) &&
      guest.seatIndex >= 0 &&
      guest.seatIndex < capacity &&
      seats[guest.seatIndex] === null
    ) {
      seats[guest.seatIndex] = guest;
    } else {
      unplaced.push(guest);
    }
  }

  let cursor = 0;
  for (const guest of unplaced) {
    while (cursor < seats.length && seats[cursor] !== null) {
      cursor++;
    }
    if (cursor < seats.length) {
      seats[cursor] = guest;
    }
  }

  return seats.slice(0, table.capacity);
}

export function moveGuestBetweenSeats(
  table: TableItem,
  fromIndex: number,
  toIndex: number
): Guest[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= table.capacity ||
    toIndex > table.capacity
  ) {
    return table.guests;
  }

  const seats = getSeatAssignments(table);
  const movingGuest = seats[fromIndex];
  if (!movingGuest) return table.guests;

  seats.splice(fromIndex, 1);
  seats.splice(toIndex, 0, movingGuest);

  return serializeSeatAssignments(seats);
}

export function removeGuestPreservingSeats(table: TableItem, guestId: string): Guest[] {
  const seats = getSeatAssignments(table);
  return serializeSeatAssignments(
    seats.map(guest => (guest && guest.id !== guestId ? guest : null))
  );
}

export function normalizeGuestsForCapacity(table: TableItem, newCapacity: number): Guest[] {
  const tempTable: TableItem = {
    ...table,
    capacity: Math.max(newCapacity, table.guests.length)
  };
  const fullSeats = getSeatAssignments(tempTable);
  const result: (Guest | null)[] = Array.from(
    { length: newCapacity },
    (_, index) => fullSeats[index] ?? null
  );

  const overflow: Guest[] = [];
  for (let i = newCapacity; i < fullSeats.length; i++) {
    const guest = fullSeats[i];
    if (guest) overflow.push(guest);
  }

  let cursor = 0;
  for (const guest of overflow) {
    while (cursor < result.length && result[cursor] !== null) {
      cursor++;
    }
    if (cursor < result.length) {
      result[cursor] = guest;
    }
  }

  return serializeSeatAssignments(result);
}

export function seatGuestAtTable(
  table: TableItem,
  newGuest: Guest,
  preferredSeatIndex?: number | null
): { guests: Guest[]; capacity: number } {
  const seats = getSeatAssignments(table);
  let targetIndex =
    typeof preferredSeatIndex === 'number' &&
    preferredSeatIndex >= 0 &&
    preferredSeatIndex < seats.length &&
    seats[preferredSeatIndex] === null
      ? preferredSeatIndex
      : seats.findIndex(seat => seat === null);

  let nextCapacity = table.capacity;
  if (targetIndex === -1) {
    targetIndex = seats.length;
    nextCapacity = Math.max(table.capacity, seats.length + 1);
    seats.push(null);
  }

  seats[targetIndex] = { ...newGuest, seatIndex: targetIndex };
  return {
    guests: serializeSeatAssignments(seats),
    capacity: nextCapacity
  };
}

function serializeSeatAssignments(seats: (Guest | null)[]): Guest[] {
  const updated: Guest[] = [];
  seats.forEach((guest, seatIndex) => {
    if (guest) {
      updated.push({ ...guest, seatIndex });
    }
  });
  return updated;
}
