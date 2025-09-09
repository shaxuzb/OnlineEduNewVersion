import { CourseSection } from '../types';

export const algebraData: CourseSection[] = [
  {
    id: '1-bob',
    title: '1-bob. Natural sonlar',
    lessons: [
      {
        id: 1,
        title: 'Natural sonlar va ular ustida amallar',
        isLocked: false,
        isCompleted: false,
        duration: '15 min'
      },
      {
        id: 2,
        title: "Bo'linish belgilari, tub va murakkab sonlar",
        isLocked: true,
        isCompleted: false,
        duration: '20 min'
      },
      {
        id: 3,
        title: 'Sonlarning kanoniy yoyilmasi, EKUB, EKUK',
        isLocked: true,
        isCompleted: false,
        duration: '18 min'
      },
      {
        id: 4,
        title: "Sonning natural bo'luvchilari soni",
        isLocked: true,
        isCompleted: false,
        duration: '12 min'
      },
      {
        id: 5,
        title: "Qoldiqli bo'lish, Oxirgi Raqam",
        isLocked: true,
        isCompleted: false,
        duration: '25 min'
      }
    ]
  },
  {
    id: '2-bob',
    title: '2-bob. Kasrlar',
    lessons: [
      {
        id: 7,
        title: "O'nli va cheksiz davriy o'nli kasrlar",
        isLocked: true,
        isCompleted: false,
        duration: '22 min'
      },
      {
        id: 8,
        title: 'Ratsional sonlar va ular ustida amallar',
        isLocked: true,
        isCompleted: false,
        duration: '30 min'
      },
      {
        id: 9,
        title: 'Ratsional sonlar va ular ustida amallar',
        isLocked: true,
        isCompleted: false,
        duration: '28 min'
      }
    ]
  }
];

export const geometriyaData: CourseSection[] = [
  {
    id: '1-bob',
    title: '1-bob. Nuqta va to\'g\'ri chiziq',
    lessons: [
      {
        id: 1,
        title: 'Geometriya asoslari',
        isLocked: false,
        isCompleted: false,
        duration: '20 min'
      },
      {
        id: 2,
        title: 'Nuqta va to\'g\'ri chiziq xossalari',
        isLocked: true,
        isCompleted: false,
        duration: '18 min'
      },
      {
        id: 3,
        title: 'Chiziq va nur tushunchalari',
        isLocked: true,
        isCompleted: false,
        duration: '15 min'
      }
    ]
  },
  {
    id: '2-bob',
    title: '2-bob. Burchaklar',
    lessons: [
      {
        id: 4,
        title: 'Burchak tushunchasi va turlari',
        isLocked: true,
        isCompleted: false,
        duration: '25 min'
      },
      {
        id: 5,
        title: 'Burchaklarni o\'lchash',
        isLocked: true,
        isCompleted: false,
        duration: '22 min'
      }
    ]
  }
];

export class CourseService {
  static getAlgebraData(): CourseSection[] {
    return algebraData;
  }

  static getGeometriyaData(): CourseSection[] {
    return geometriyaData;
  }

  static unlockLesson(courseType: 'algebra' | 'geometriya', lessonId: number): void {
    const data = courseType === 'algebra' ? algebraData : geometriyaData;
    
    for (const section of data) {
      const lesson = section.lessons.find(l => l.id === lessonId);
      if (lesson) {
        lesson.isLocked = false;
        break;
      }
    }
  }

  static completeLesson(courseType: 'algebra' | 'geometriya', lessonId: number): void {
    const data = courseType === 'algebra' ? algebraData : geometriyaData;
    
    for (const section of data) {
      const lesson = section.lessons.find(l => l.id === lessonId);
      if (lesson) {
        lesson.isCompleted = true;
        break;
      }
    }
  }
}
