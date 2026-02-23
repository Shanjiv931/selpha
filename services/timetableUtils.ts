
import { ClassSession, Course } from '../types';

export const THEORY_SLOT_TIMES = [
  { start: "08:00", end: "08:50" },
  { start: "09:00", end: "09:50" },
  { start: "10:00", end: "10:50" },
  { start: "11:00", end: "11:50" },
  { start: "12:00", end: "12:50" },
  // Theory Lunch Break: 12:50 PM to 02:00 PM
  { start: "14:00", end: "14:50" },
  { start: "15:00", end: "15:50" },
  { start: "16:00", end: "16:50" },
  { start: "17:00", end: "17:50" },
  { start: "18:00", end: "18:50" },
];

export const LAB_SLOT_TIMES = [
  // Morning Blocks
  { start: "08:00", end: "08:50" }, // L1
  { start: "08:50", end: "09:40" }, // L2
  { start: "09:50", end: "10:40" }, // L3
  { start: "10:40", end: "11:30" }, // L4
  { start: "11:40", end: "12:30" }, // L5
  { start: "12:30", end: "13:20" }, // L6
  // Lab Lunch Break: 01:20 PM to 02:00 PM
  { start: "14:00", end: "14:50" }, // L31
  { start: "14:50", end: "15:40" }, // L32
  { start: "15:50", end: "16:40" }, // L33
  { start: "16:40", end: "17:30" }, // L34
  { start: "17:40", end: "18:30" }, // L35
  { start: "18:30", end: "19:20" }, // L36
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const ATOMIC_SLOTS: Record<string, { day: string; start: string; end: string }[]> = {
  // Theory Slots (A1, B1, etc.)
  "A1": [{ day: "Mon", start: "08:00", end: "08:50" }, { day: "Wed", start: "09:00", end: "09:50" }],
  "B1": [{ day: "Tue", start: "08:00", end: "08:50" }, { day: "Thu", start: "09:00", end: "09:50" }],
  "C1": [{ day: "Wed", start: "08:00", end: "08:50" }, { day: "Fri", start: "09:00", end: "09:50" }],
  "D1": [{ day: "Mon", start: "10:00", end: "10:50" }, { day: "Thu", start: "08:00", end: "08:50" }],
  "E1": [{ day: "Tue", start: "10:00", end: "10:50" }, { day: "Fri", start: "08:00", end: "08:50" }],
  "F1": [{ day: "Mon", start: "09:00", end: "09:50" }, { day: "Wed", start: "10:00", end: "10:50" }],
  "G1": [{ day: "Tue", start: "09:00", end: "09:50" }, { day: "Thu", start: "10:00", end: "10:50" }],
  "TA1": [{ day: "Fri", start: "10:00", end: "10:50" }],
  "TB1": [{ day: "Mon", start: "11:00", end: "11:50" }],
  "TC1": [{ day: "Tue", start: "11:00", end: "11:50" }],
  "TD1": [{ day: "Fri", start: "12:00", end: "12:50" }],
  "TE1": [{ day: "Thu", start: "11:00", end: "11:50" }],
  "TF1": [{ day: "Fri", start: "11:00", end: "11:50" }],
  "TG1": [{ day: "Mon", start: "12:00", end: "12:50" }],
  "TAA1": [{ day: "Tue", start: "12:00", end: "12:50" }],
  "TCC1": [{ day: "Thu", start: "12:00", end: "12:50" }],

  "A2": [{ day: "Mon", start: "14:00", end: "14:50" }, { day: "Wed", start: "15:00", end: "15:50" }],
  "B2": [{ day: "Tue", start: "14:00", end: "14:50" }, { day: "Thu", start: "15:00", end: "15:50" }],
  "C2": [{ day: "Wed", start: "14:00", end: "14:50" }, { day: "Fri", start: "15:00", end: "15:50" }],
  "D2": [{ day: "Mon", start: "16:00", end: "16:50" }, { day: "Thu", start: "14:00", end: "14:50" }],
  "E2": [{ day: "Tue", start: "16:00", end: "16:50" }, { day: "Fri", start: "14:00", end: "14:50" }],
  "F2": [{ day: "Mon", start: "15:00", end: "15:50" }, { day: "Wed", start: "16:00", end: "16:50" }],
  "G2": [{ day: "Tue", start: "15:00", end: "15:50" }, { day: "Thu", start: "16:00", end: "16:50" }],
  "TA2": [{ day: "Fri", start: "16:00", end: "16:50" }],
  "TB2": [{ day: "Mon", start: "17:00", end: "17:50" }],
  "TC2": [{ day: "Tue", start: "17:00", end: "17:50" }],
  "TD2": [{ day: "Wed", start: "17:00", end: "17:50" }],
  "TE2": [{ day: "Thu", start: "17:00", end: "17:50" }],
  "TF2": [{ day: "Fri", start: "17:00", end: "17:50" }],
  "TG2": [{ day: "Mon", start: "18:00", end: "18:50" }],
  "TAA2": [{ day: "Tue", start: "18:00", end: "18:50" }],
  "TBB2": [{ day: "Wed", start: "18:00", end: "18:50" }],
  "TCC2": [{ day: "Thu", start: "18:00", end: "18:50" }],
  "TDD2": [{ day: "Fri", start: "18:00", end: "18:50" }],
};

// Populate Atomic Lab Slots (L1 - L60)
for (let i = 1; i <= 60; i++) {
  const isMorning = i <= 30;
  const dayIdx = isMorning ? Math.floor((i - 1) / 6) : Math.floor((i - 31) / 6);
  const timeIdx = isMorning ? (i - 1) % 6 : ((i - 31) % 6) + 6;
  if (dayIdx < 5) {
    ATOMIC_SLOTS[`L${i}`] = [{
      day: DAYS[dayIdx],
      start: LAB_SLOT_TIMES[timeIdx].start,
      end: LAB_SLOT_TIMES[timeIdx].end
    }];
  }
}

export const getSessionsForCompositeSlot = (composite: string, code: string, name: string, faculty: string, type: 'Theory' | 'Lab', venue: string = "TBD"): ClassSession[] => {
  const parts = composite.split('+');
  let sessions: ClassSession[] = [];
  parts.forEach(slotKey => {
    const mappings = ATOMIC_SLOTS[slotKey];
    if (mappings) {
      mappings.forEach(m => {
        sessions.push({
          id: `${code}-${slotKey}-${m.day}-${m.start}`,
          courseCode: code,
          courseName: name,
          type: type as any,
          startTime: m.start,
          endTime: m.end,
          venue: venue,
          faculty,
          slot: slotKey
        });
      });
    }
  });
  return sessions;
};

export const getFilteredSlots = (type: 'Theory' | 'Lab', credits: number): string[] => {
  if (type === 'Lab') {
    let labs: string[] = [];
    for (let day = 0; day < 5; day++) {
      const baseMorn = day * 6;
      labs.push(`L${baseMorn + 1}+L${baseMorn + 2}`);
      labs.push(`L${baseMorn + 3}+L${baseMorn + 4}`);
      labs.push(`L${baseMorn + 5}+L${baseMorn + 6}`);
      const baseAft = 30 + (day * 6);
      labs.push(`L${baseAft + 1}+L${baseAft + 2}`);
      labs.push(`L${baseAft + 3}+L${baseAft + 4}`);
      labs.push(`L${baseAft + 5}+L${baseAft + 6}`);
    }
    return labs;
  }
  const base = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  if (credits === 2) return [...base.map(s => `${s}1`), ...base.map(s => `${s}2`)];
  if (credits === 3) return [...base.map(s => `${s}1+T${s}1`), ...base.map(s => `${s}2+T${s}2`)];
  if (credits === 4) return [...base.map(s => `${s}1+T${s}1+T${s}${s}1`), ...base.map(s => `${s}2+T${s}2+T${s}${s}2`)].filter(s => s.split('+').every(p => !!ATOMIC_SLOTS[p]));
  return [];
};

/**
 * Check for overlaps between a proposed slot and existing timetable.
 */
export const checkTimetableClash = (newSlot: string, existingCourses: Course[]): string | null => {
  if (!newSlot) return null;

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const getSlotIntervals = (slotStr: string) => {
    const intervals: { day: string; start: number; end: number }[] = [];
    slotStr.split('+').forEach(atomic => {
      const mappings = ATOMIC_SLOTS[atomic];
      if (mappings) {
        mappings.forEach(m => {
          intervals.push({
            day: m.day,
            start: timeToMinutes(m.start),
            end: timeToMinutes(m.end)
          });
        });
      }
    });
    return intervals;
  };

  const newIntervals = getSlotIntervals(newSlot);

  for (const course of existingCourses) {
    if (!course.slot) continue;
    const courseIntervals = getSlotIntervals(course.slot);
    for (const ni of newIntervals) {
      for (const ci of courseIntervals) {
        if (ni.day === ci.day) {
          // Standard overlap check: (StartA < EndB) && (EndA > StartB)
          if (ni.start < ci.end && ni.end > ci.start) {
            return course.name;
          }
        }
      }
    }
  }
  return null;
};
