import { SeatingPlan, Table, Guest, VenueFixture } from '../types/seating';

export const LOCAL_STORAGE_KEY = 'aisleplan_saved_layout_v1';

export const INITIAL_SEATING_PLAN: SeatingPlan = {
  id: 'plan_default_1',
  version: '1.0.0',
  weddingName: "Sophia & Alexander's Wedding",
  coupleNames: "Sophia Laurent & Alexander Vance",
  date: "2026-09-19",
  venueName: "The Glasshouse Pavilion & Orangery",
  canvasWidth: 1600,
  canvasHeight: 1100,
  lastSavedAt: new Date().toISOString(),
  fixtures: [
    {
      id: 'fix_dance',
      type: 'dance_floor',
      label: 'Dance Floor',
      x: 650,
      y: 420,
      width: 300,
      height: 240,
      rotation: 0
    },
    {
      id: 'fix_dj',
      type: 'stage_dj',
      label: 'Live Band & DJ',
      x: 680,
      y: 120,
      width: 240,
      height: 100,
      rotation: 0
    },
    {
      id: 'fix_bar',
      type: 'bar',
      label: 'Cocktail Bar',
      x: 1250,
      y: 450,
      width: 140,
      height: 240,
      rotation: 0
    },
    {
      id: 'fix_entrance',
      type: 'entrance',
      label: 'Grand Entrance',
      x: 120,
      y: 500,
      width: 120,
      height: 70,
      rotation: 0
    },
    {
      id: 'fix_cake',
      type: 'cake_table',
      label: 'Wedding Cake',
      x: 1270,
      y: 220,
      width: 90,
      height: 90,
      rotation: 0
    }
  ],
  tables: [
    {
      id: 't_head',
      name: 'Head Table',
      shape: 'rectangle',
      capacity: 8,
      x: 700,
      y: 260,
      rotation: 0,
      color: '#0f172a',
      notes: 'Bridal Party & Newlyweds'
    },
    {
      id: 't_1',
      name: 'Table 1 - Laurent Family',
      shape: 'round',
      capacity: 8,
      x: 400,
      y: 320,
      rotation: 0,
      notes: 'Bride Family'
    },
    {
      id: 't_2',
      name: 'Table 2 - Vance Family',
      shape: 'round',
      capacity: 8,
      x: 1060,
      y: 320,
      rotation: 0,
      notes: 'Groom Family'
    },
    {
      id: 't_3',
      name: 'Table 3 - College Friends',
      shape: 'round',
      capacity: 8,
      x: 360,
      y: 580,
      rotation: 0,
      notes: 'Oxford Alumni'
    },
    {
      id: 't_4',
      name: 'Table 4 - Architecture Studio',
      shape: 'round',
      capacity: 8,
      x: 1100,
      y: 580,
      rotation: 0,
      notes: 'Studio Colleagues'
    },
    {
      id: 't_5',
      name: 'Table 5 - Childhood Friends',
      shape: 'square',
      capacity: 4,
      x: 430,
      y: 840,
      rotation: 0,
      notes: 'High School group'
    },
    {
      id: 't_6',
      name: 'Table 6 - Extended Family',
      shape: 'rectangle',
      capacity: 10,
      x: 720,
      y: 780,
      rotation: 0,
      notes: 'Aunts & Uncles'
    },
    {
      id: 't_7',
      name: 'Table 7 - International Guests',
      shape: 'round',
      capacity: 8,
      x: 1080,
      y: 840,
      rotation: 0,
      notes: 'Paris & Tokyo Friends'
    }
  ],
  guests: [
    // Head Table (Newlyweds + Maid of honor + Best man)
    { id: 'g_1', name: 'Sophia Laurent', rsvp: 'confirmed', dietary: 'none', tableId: 't_head', seatNumber: 1, group: 'Bridal Party', isVip: true },
    { id: 'g_2', name: 'Alexander Vance', rsvp: 'confirmed', dietary: 'none', tableId: 't_head', seatNumber: 2, group: 'Bridal Party', isVip: true },
    { id: 'g_3', name: 'Clara Delacroix', rsvp: 'confirmed', dietary: 'vegetarian', tableId: 't_head', seatNumber: 3, group: 'Bridal Party', isVip: true, notes: 'Maid of Honor' },
    { id: 'g_4', name: 'Julien Mercier', rsvp: 'confirmed', dietary: 'none', tableId: 't_head', seatNumber: 4, group: 'Bridal Party', isVip: true, notes: 'Best Man' },
    { id: 'g_5', name: 'Camille Moreau', rsvp: 'confirmed', dietary: 'gluten_free', tableId: 't_head', seatNumber: 5, group: 'Bridal Party' },
    { id: 'g_6', name: 'David Kim', rsvp: 'confirmed', dietary: 'none', tableId: 't_head', seatNumber: 6, group: 'Bridal Party' },
    { id: 'g_7', name: 'Elena Rostova', rsvp: 'confirmed', dietary: 'vegan', tableId: 't_head', seatNumber: 7, group: 'Bridal Party' },
    { id: 'g_8', name: 'Marcus Sterling', rsvp: 'confirmed', dietary: 'nut_allergy', tableId: 't_head', seatNumber: 8, group: 'Bridal Party' },

    // Table 1 - Laurent Family
    { id: 'g_9', name: 'Henri Laurent', rsvp: 'confirmed', dietary: 'none', tableId: 't_1', seatNumber: 1, group: "Bride's Family", isVip: true, notes: "Father of Bride" },
    { id: 'g_10', name: 'Margot Laurent', rsvp: 'confirmed', dietary: 'none', tableId: 't_1', seatNumber: 2, group: "Bride's Family", isVip: true, notes: "Mother of Bride" },
    { id: 'g_11', name: 'Etienne Laurent', rsvp: 'confirmed', dietary: 'none', tableId: 't_1', seatNumber: 3, group: "Bride's Family" },
    { id: 'g_12', name: 'Chloe Fontaine', rsvp: 'confirmed', dietary: 'vegetarian', tableId: 't_1', seatNumber: 4, group: "Bride's Family" },
    { id: 'g_13', name: 'Dr. Rene Dupont', rsvp: 'confirmed', dietary: 'kosher', tableId: 't_1', seatNumber: 5, group: "Bride's Family" },
    { id: 'g_14', name: 'Jacqueline Dupont', rsvp: 'confirmed', dietary: 'none', tableId: 't_1', seatNumber: 6, group: "Bride's Family" },
    { id: 'g_15', name: 'Lucas Laurent', rsvp: 'confirmed', dietary: 'kid', tableId: 't_1', seatNumber: 7, group: "Bride's Family" },
    { id: 'g_16', name: 'Mia Laurent', rsvp: 'confirmed', dietary: 'kid', tableId: 't_1', seatNumber: 8, group: "Bride's Family" },

    // Table 2 - Vance Family
    { id: 'g_17', name: 'Arthur Vance', rsvp: 'confirmed', dietary: 'none', tableId: 't_2', seatNumber: 1, group: "Groom's Family", isVip: true, notes: "Father of Groom" },
    { id: 'g_18', name: 'Eleanor Vance', rsvp: 'confirmed', dietary: 'gluten_free', tableId: 't_2', seatNumber: 2, group: "Groom's Family", isVip: true, notes: "Mother of Groom" },
    { id: 'g_19', name: 'Oliver Vance', rsvp: 'confirmed', dietary: 'none', tableId: 't_2', seatNumber: 3, group: "Groom's Family" },
    { id: 'g_20', name: 'Charlotte Vance', rsvp: 'confirmed', dietary: 'vegetarian', tableId: 't_2', seatNumber: 4, group: "Groom's Family" },
    { id: 'g_21', name: 'William Thorne', rsvp: 'confirmed', dietary: 'none', tableId: 't_2', seatNumber: 5, group: "Groom's Family" },
    { id: 'g_22', name: 'Victoria Thorne', rsvp: 'confirmed', dietary: 'none', tableId: 't_2', seatNumber: 6, group: "Groom's Family" },
    { id: 'g_23', name: 'Henry Thorne', rsvp: 'confirmed', dietary: 'none', tableId: 't_2', seatNumber: 7, group: "Groom's Family" },
    { id: 'g_24', name: 'Grace Vance', rsvp: 'pending', dietary: 'none', tableId: 't_2', seatNumber: 8, group: "Groom's Family" },

    // Table 3 - College Friends
    { id: 'g_25', name: 'Liam Gallagher', rsvp: 'confirmed', dietary: 'none', tableId: 't_3', seatNumber: 1, group: 'Friends' },
    { id: 'g_26', name: 'Fiona Gallagher', rsvp: 'confirmed', dietary: 'vegan', tableId: 't_3', seatNumber: 2, group: 'Friends' },
    { id: 'g_27', name: 'Sebastian Cruz', rsvp: 'confirmed', dietary: 'none', tableId: 't_3', seatNumber: 3, group: 'Friends' },
    { id: 'g_28', name: 'Isabella Martinez', rsvp: 'confirmed', dietary: 'halal', tableId: 't_3', seatNumber: 4, group: 'Friends' },
    { id: 'g_29', name: 'Noah Jenkins', rsvp: 'confirmed', dietary: 'none', tableId: 't_3', seatNumber: 5, group: 'Friends' },
    { id: 'g_30', name: 'Zoe Washington', rsvp: 'confirmed', dietary: 'vegetarian', tableId: 't_3', seatNumber: 6, group: 'Friends' },
    { id: 'g_31', name: 'Thomas Wright', rsvp: 'pending', dietary: 'none', tableId: 't_3', seatNumber: 7, group: 'Friends' },
    { id: 'g_32', name: 'Harper Lee', rsvp: 'confirmed', dietary: 'nut_allergy', tableId: 't_3', seatNumber: 8, group: 'Friends' },

    // Table 5 - Childhood Friends (Square table for 4)
    { id: 'g_33', name: 'Benjamin Hayes', rsvp: 'confirmed', dietary: 'none', tableId: 't_5', seatNumber: 1, group: 'Childhood' },
    { id: 'g_34', name: 'Maya Lin', rsvp: 'confirmed', dietary: 'vegetarian', tableId: 't_5', seatNumber: 2, group: 'Childhood' },
    { id: 'g_35', name: 'Daniel Park', rsvp: 'confirmed', dietary: 'none', tableId: 't_5', seatNumber: 3, group: 'Childhood' },
    { id: 'g_36', name: 'Sarah Becker', rsvp: 'confirmed', dietary: 'gluten_free', tableId: 't_5', seatNumber: 4, group: 'Childhood' },

    // Unassigned guests ready for drag-and-drop
    { id: 'g_37', name: 'Mateo Rossi', rsvp: 'confirmed', dietary: 'none', tableId: null, seatNumber: null, group: 'International' },
    { id: 'g_38', name: 'Chiara Bianchi', rsvp: 'confirmed', dietary: 'vegetarian', tableId: null, seatNumber: null, group: 'International' },
    { id: 'g_39', name: 'Kenji Sato', rsvp: 'confirmed', dietary: 'none', tableId: null, seatNumber: null, group: 'International' },
    { id: 'g_40', name: 'Aoi Takahashi', rsvp: 'confirmed', dietary: 'none', tableId: null, seatNumber: null, group: 'International' },
    { id: 'g_41', name: 'Gabriel Santos', rsvp: 'pending', dietary: 'halal', tableId: null, seatNumber: null, group: 'Colleagues' },
    { id: 'g_42', name: 'Leticia Silva', rsvp: 'confirmed', dietary: 'none', tableId: null, seatNumber: null, group: 'Colleagues' },
    { id: 'g_43', name: 'Oscar Wilde-Smith', rsvp: 'confirmed', dietary: 'none', tableId: null, seatNumber: null, group: 'Colleagues' },
    { id: 'g_44', name: 'Genevieve Aubert', rsvp: 'confirmed', dietary: 'vegan', tableId: null, seatNumber: null, group: "Bride's Family" }
  ]
};

export function loadSeatingPlan(): SeatingPlan {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tables) && Array.isArray(parsed.guests)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading seating plan from localStorage:', err);
  }
  return INITIAL_SEATING_PLAN;
}

export function saveSeatingPlan(plan: SeatingPlan): boolean {
  try {
    const updated = {
      ...plan,
      lastSavedAt: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Error saving seating plan to localStorage:', err);
    return false;
  }
}

export function exportPlanAsJson(plan: SeatingPlan) {
  const jsonString = JSON.stringify(plan, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeName = (plan.weddingName || 'Wedding_Seating_Plan').replace(/[^a-z0-9_-]/gi, '_');
  anchor.href = url;
  anchor.download = `${safeName}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function importPlanFromJson(file: File): Promise<SeatingPlan> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.tables || !Array.isArray(parsed.tables)) {
          throw new Error('Invalid format: Missing tables array');
        }
        if (!parsed.guests || !Array.isArray(parsed.guests)) {
          throw new Error('Invalid format: Missing guests array');
        }
        resolve(parsed as SeatingPlan);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
