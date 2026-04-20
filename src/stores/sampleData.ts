import { TASK_PRIORITY, TASK_STATUS, TASK_TYPE } from '@/constants/task';
import type { Task } from '@/types/task';
import { addDaysIsoDate, nowIso } from '@/utils/dates';
import { uid } from '@/utils/id';

/**
 * Five varied tasks relative to today.
 * Built through the same factory shape the store uses so metadata is consistent.
 */
export function buildSampleTasks(): Task[] {
  const now = nowIso();

  const make = (
    seed: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'statusHistory'>
  ): Task => ({
    ...seed,
    id: uid(),
    createdAt: now,
    updatedAt: now,
    completedAt: seed.status === TASK_STATUS.DONE ? now : null,
    statusHistory: [{ status: seed.status, changedAt: now }],
  });

  return [
    make({
      title: 'תרגיל SQL — שאילתות JOIN',
      course: 'מסדי נתונים',
      type: TASK_TYPE.ASSIGNMENT,
      deadline: addDaysIsoDate(3),
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.IN_PROGRESS,
      notes: 'להתמקד ב־LEFT/RIGHT JOIN ובדוגמאות מהתרגול האחרון.',
      link: '',
      tags: ['sql', 'תרגול'],
      estimatedMinutes: 120,
    }),
    make({
      title: 'מבחן אמצע — חדו״א 2',
      course: 'חדו״א 2',
      type: TASK_TYPE.EXAM,
      deadline: addDaysIsoDate(12),
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.OPEN,
      notes: 'חזרה על אינטגרלים לא אמיתיים וטורי טיילור.',
      link: '',
      tags: ['מבחן'],
      estimatedMinutes: 480,
    }),
    make({
      title: 'לצפות בהקלטת הרצאה 7',
      course: 'אלגוריתמים',
      type: TASK_TYPE.RECORDING,
      deadline: addDaysIsoDate(1),
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.OPEN,
      notes: 'עץ מינ-מקס וחיפוש בעומק.',
      link: 'https://example.com/lecture-7',
      tags: ['הרצאה'],
      estimatedMinutes: 90,
    }),
    make({
      title: 'פרויקט סוכן AI — אבן דרך 2',
      course: 'מבוא לבינה מלאכותית',
      type: TASK_TYPE.PROJECT,
      deadline: addDaysIsoDate(21),
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.IN_PROGRESS,
      notes: 'לחבר כלי חיפוש לסוכן ולכתוב הערכה.',
      link: 'https://github.com/example/agent',
      tags: ['פרויקט', 'ai'],
      estimatedMinutes: 600,
    }),
    make({
      title: 'לקרוא מאמר — Attention is All You Need',
      course: 'מבוא לבינה מלאכותית',
      type: TASK_TYPE.READING,
      deadline: addDaysIsoDate(-2),
      priority: TASK_PRIORITY.LOW,
      status: TASK_STATUS.DONE,
      notes: 'סיכום קצר לקבוצת הלמידה.',
      link: 'https://arxiv.org/abs/1706.03762',
      tags: ['קריאה'],
      estimatedMinutes: 75,
    }),
  ];
}
