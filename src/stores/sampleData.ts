import { TASK_PRIORITY, TASK_STATUS, TASK_TYPE } from '@/constants/task';
import type { StatusChange, Task, TaskStatus } from '@/types/task';
import { addDaysIsoDate } from '@/utils/dates';
import { uid } from '@/utils/id';

type SampleSeed = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'statusHistory'> & {
  /** Hours in the past when this task was created. */
  createdHoursAgo: number;
  /** Hours in the past when each historic status change happened. */
  history: { status: TaskStatus; hoursAgo: number }[];
};

function isoAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function buildFromSeed(seed: SampleSeed): Task {
  const createdAt = isoAgo(seed.createdHoursAgo);
  const statusHistory: StatusChange[] = seed.history.map((h) => ({
    status: h.status,
    changedAt: isoAgo(h.hoursAgo),
  }));
  const last = statusHistory[statusHistory.length - 1];
  const finalStatus = last ? last.status : seed.status;
  const updatedAt = last ? last.changedAt : createdAt;
  const completedAt =
    finalStatus === TASK_STATUS.DONE
      ? [...statusHistory].reverse().find((e) => e.status === TASK_STATUS.DONE)?.changedAt ?? null
      : null;

  return {
    ...seed,
    status: finalStatus,
    id: uid(),
    createdAt,
    updatedAt,
    completedAt,
    statusHistory,
  };
}

export function buildSampleTasks(): Task[] {
  const seeds: SampleSeed[] = [
    {
      title: 'תרגיל SQL — שאילתות JOIN',
      course: 'BI',
      type: TASK_TYPE.ASSIGNMENT,
      deadline: addDaysIsoDate(3),
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.IN_PROGRESS,
      notes: 'LEFT/RIGHT JOIN + דוגמאות מהתרגול האחרון.',
      link: '',
      tags: ['sql', 'תרגול'],
      estimatedMinutes: 120,
      createdHoursAgo: 72,
      history: [
        { status: TASK_STATUS.OPEN, hoursAgo: 72 },
        { status: TASK_STATUS.IN_PROGRESS, hoursAgo: 18 },
      ],
    },
    {
      title: 'מבחן אמצע — סטטיסטיקה',
      course: 'סטטיסטיקה',
      type: TASK_TYPE.EXAM,
      deadline: addDaysIsoDate(12),
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.OPEN,
      notes: 'חזרה על התפלגויות ובדיקות היפותזות.',
      link: '',
      tags: ['מבחן'],
      estimatedMinutes: 480,
      createdHoursAgo: 120,
      history: [{ status: TASK_STATUS.OPEN, hoursAgo: 120 }],
    },
    {
      title: 'לצפות בהקלטת הרצאה 7',
      course: 'ניהול',
      type: TASK_TYPE.RECORDING,
      deadline: addDaysIsoDate(1),
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.OPEN,
      notes: 'תיאוריות מוטיבציה.',
      link: 'https://example.com/lecture-7',
      tags: ['הרצאה'],
      estimatedMinutes: 90,
      createdHoursAgo: 48,
      history: [{ status: TASK_STATUS.OPEN, hoursAgo: 48 }],
    },
    {
      title: 'פרויקט BI — דשבורד Power BI',
      course: 'BI',
      type: TASK_TYPE.PROJECT,
      deadline: addDaysIsoDate(21),
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.IN_PROGRESS,
      notes: 'חיבור מקור נתונים ובניית measures.',
      link: 'https://github.com/example/bi-dash',
      tags: ['פרויקט', 'powerbi'],
      estimatedMinutes: 600,
      createdHoursAgo: 240,
      history: [
        { status: TASK_STATUS.OPEN, hoursAgo: 240 },
        { status: TASK_STATUS.IN_PROGRESS, hoursAgo: 90 },
      ],
    },
    {
      title: 'קריאת מאמר — שוקי הון',
      course: 'כלכלה',
      type: TASK_TYPE.READING,
      deadline: addDaysIsoDate(-2),
      priority: TASK_PRIORITY.LOW,
      status: TASK_STATUS.DONE,
      notes: 'סיכום קצר לקבוצת הלמידה.',
      link: '',
      tags: ['קריאה'],
      estimatedMinutes: 75,
      createdHoursAgo: 300,
      history: [
        { status: TASK_STATUS.OPEN, hoursAgo: 300 },
        { status: TASK_STATUS.IN_PROGRESS, hoursAgo: 200 },
        { status: TASK_STATUS.DONE, hoursAgo: 72 },
      ],
    },
    {
      title: 'תרגיל כלכלה — סעיף 3',
      course: 'כלכלה',
      type: TASK_TYPE.ASSIGNMENT,
      deadline: addDaysIsoDate(-1),
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.DONE,
      notes: '',
      link: '',
      tags: [],
      estimatedMinutes: 90,
      createdHoursAgo: 336,
      history: [
        { status: TASK_STATUS.OPEN, hoursAgo: 336 },
        { status: TASK_STATUS.DONE, hoursAgo: 144 },
      ],
    },
    {
      title: 'הגשת עבודת סמינר — ניהול',
      course: 'ניהול',
      type: TASK_TYPE.PROJECT,
      deadline: addDaysIsoDate(45),
      priority: TASK_PRIORITY.LOW,
      status: TASK_STATUS.OPEN,
      notes: 'לחפש מקורות על תרבות ארגונית.',
      link: '',
      tags: ['סמינר'],
      estimatedMinutes: 900,
      createdHoursAgo: 24,
      history: [{ status: TASK_STATUS.OPEN, hoursAgo: 24 }],
    },
    {
      title: 'תרגול R — גרפים',
      course: 'BI',
      type: TASK_TYPE.ASSIGNMENT,
      deadline: addDaysIsoDate(7),
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.DONE,
      notes: 'ggplot2 + facets.',
      link: '',
      tags: ['r'],
      estimatedMinutes: 120,
      createdHoursAgo: 192,
      history: [
        { status: TASK_STATUS.OPEN, hoursAgo: 192 },
        { status: TASK_STATUS.IN_PROGRESS, hoursAgo: 100 },
        { status: TASK_STATUS.DONE, hoursAgo: 12 },
      ],
    },
  ];

  return seeds.map(buildFromSeed);
}
