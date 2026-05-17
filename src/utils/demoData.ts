import type { Category, PlannerState, Subtask, Task } from '../types/planner';
import { UNCATEGORIZED_ID } from '../types/planner';
import { toDateInputValue } from './date';
import { DEFAULT_CATEGORY, normalizeTasks } from './task';

interface DemoTaskConfig {
  title: string;
  description: string;
  dueOffset?: number;
  dueTime?: string;
  priority: Task['priority'];
  categoryId: string;
  subtasks?: Array<Pick<Subtask, 'title' | 'completed'>>;
  status?: Task['status'];
  createdOffset?: number;
  completedOffset?: number;
}

export function createDemoState(settings: PlannerState['settings']): PlannerState {
  const now = new Date();
  const categories = createDemoCategories(now);

  return {
    version: 1,
    categories,
    settings,
    tasks: normalizeTasks(createDemoTasks(now)),
  };
}

function createDemoCategories(now: Date): Category[] {
  return [
    DEFAULT_CATEGORY,
    buildCategory('demo-study', 'Учёба', '#7b5ea7', now),
    buildCategory('demo-work', 'Работа', '#1f6f78', now),
    buildCategory('demo-personal', 'Личное', '#d26a5c', now),
    buildCategory('demo-health', 'Здоровье', '#57825d', now),
    buildCategory('demo-finance', 'Финансы', '#d39a35', now),
    buildCategory('demo-project', 'Проект', '#4d6fa9', now),
    buildCategory('demo-home', 'Дом', '#a66f4d', now),
  ];
}

function createDemoTasks(now: Date): Task[] {
  const tasks: DemoTaskConfig[] = [
    {
      title: 'Отправить закрывающие документы',
      description: 'Проверить комплект актов и отправить клиенту финальную версию.',
      dueOffset: -4,
      dueTime: '16:00',
      priority: 'high',
      categoryId: 'demo-work',
      createdOffset: -10,
      subtasks: [
        { title: 'Сверить суммы в актах', completed: true },
        { title: 'Добавить подписи', completed: false },
        { title: 'Отправить письмо клиенту', completed: false },
      ],
    },
    {
      title: 'Оплатить счёт за интернет',
      description: 'Проверить начисление и оплатить до блокировки услуги.',
      dueOffset: -2,
      dueTime: '12:00',
      priority: 'medium',
      categoryId: 'demo-finance',
      createdOffset: -6,
    },
    {
      title: 'Перенести запись к стоматологу',
      description: 'Выбрать новый слот и сохранить подтверждение в календаре.',
      dueOffset: -1,
      dueTime: '18:30',
      priority: 'high',
      categoryId: 'demo-health',
      createdOffset: -5,
    },
    {
      title: 'Согласовать макет лендинга',
      description: 'Собрать правки команды и дать дизайнеру финальный ответ.',
      dueOffset: -1,
      dueTime: '15:00',
      priority: 'medium',
      categoryId: 'demo-project',
      createdOffset: -7,
      subtasks: [
        { title: 'Проверить тексты CTA', completed: true },
        { title: 'Сверить мобильную версию', completed: false },
      ],
    },
    {
      title: 'Подготовить обзор недели',
      description: 'Собрать основные результаты и следующий шаг для команды.',
      dueOffset: 0,
      priority: 'high',
      categoryId: 'demo-work',
      createdOffset: -4,
      subtasks: [
        { title: 'Собрать цифры', completed: true },
        { title: 'Проверить выводы', completed: false },
        { title: 'Отправить ссылку на документ', completed: false },
      ],
    },
    {
      title: 'Сверить расходы за неделю',
      description: 'Разнести траты по категориям и отметить повторяющиеся списания.',
      dueOffset: 0,
      priority: 'medium',
      categoryId: 'demo-finance',
      createdOffset: -3,
      subtasks: [
        { title: 'Скачать выписку', completed: true },
        { title: 'Разнести покупки по категориям', completed: false },
      ],
    },
    {
      title: 'Сделать тренировку на спину',
      description: 'Короткая домашняя тренировка и растяжка после неё.',
      dueOffset: 0,
      priority: 'low',
      categoryId: 'demo-health',
      createdOffset: -1,
    },
    {
      title: 'Разобрать входящие заметки',
      description: 'Свести идеи в один список и выделить быстрые победы.',
      dueOffset: 0,
      priority: 'medium',
      categoryId: UNCATEGORIZED_ID,
      createdOffset: -8,
    },
    {
      title: 'Записать вопросы к созвону',
      description: 'Подготовить блокеры и уточнения перед встречей с заказчиком.',
      dueOffset: 1,
      dueTime: '10:00',
      priority: 'high',
      categoryId: 'demo-work',
      createdOffset: -2,
    },
    {
      title: 'Купить продукты на неделю',
      description: 'Собрать список и закрыть основные покупки для дома.',
      dueOffset: 1,
      dueTime: '19:00',
      priority: 'medium',
      categoryId: 'demo-home',
      createdOffset: -1,
      subtasks: [
        { title: 'Проверить холодильник', completed: true },
        { title: 'Собрать список', completed: false },
        { title: 'Заказать доставку', completed: false },
      ],
    },
    {
      title: 'Пройти урок по TypeScript',
      description: 'Закрепить generics и utility types на короткой практике.',
      dueOffset: 1,
      dueTime: '20:30',
      priority: 'medium',
      categoryId: 'demo-study',
      createdOffset: -2,
      subtasks: [
        { title: 'Посмотреть лекцию', completed: false },
        { title: 'Сделать 3 упражнения', completed: false },
      ],
    },
    {
      title: 'Обновить список подписок',
      description: 'Проверить ненужные сервисы и отменить лишние автоплатежи.',
      dueOffset: 2,
      dueTime: '13:00',
      priority: 'low',
      categoryId: 'demo-finance',
      createdOffset: -4,
    },
    {
      title: 'Собрать референсы для портфолио',
      description: 'Найти примеры интерфейсов и сохранить удачные решения.',
      dueOffset: 2,
      dueTime: '18:00',
      priority: 'medium',
      categoryId: 'demo-project',
      createdOffset: -3,
    },
    {
      title: 'Проверить страховку',
      description: 'Уточнить срок действия полиса и условия продления.',
      dueOffset: 3,
      dueTime: '11:00',
      priority: 'high',
      categoryId: 'demo-personal',
      createdOffset: -6,
    },
    {
      title: 'Подготовить презентацию для клиента',
      description: 'Собрать структуру, цифры и финальные слайды к защите.',
      dueOffset: 3,
      dueTime: '16:30',
      priority: 'high',
      categoryId: 'demo-work',
      createdOffset: -5,
      subtasks: [
        { title: 'Собрать аналитику', completed: true },
        { title: 'Обновить графики', completed: false },
        { title: 'Проверить финальный PDF', completed: false },
      ],
    },
    {
      title: 'Сдать домашнее задание по курсу',
      description: 'Оформить решение и отправить ссылку преподавателю.',
      dueOffset: 3,
      dueTime: '21:00',
      priority: 'high',
      categoryId: 'demo-study',
      createdOffset: -4,
      subtasks: [
        { title: 'Закончить решение', completed: true },
        { title: 'Проверить README', completed: false },
      ],
    },
    {
      title: 'Записаться на анализы',
      description: 'Выбрать лабораторию рядом с домом и удобное время.',
      dueOffset: 5,
      dueTime: '12:00',
      priority: 'medium',
      categoryId: 'demo-health',
      createdOffset: -2,
    },
    {
      title: 'Составить план релиза',
      description: 'Зафиксировать этапы, владельцев и критерии готовности.',
      dueOffset: 7,
      dueTime: '14:00',
      priority: 'high',
      categoryId: 'demo-project',
      createdOffset: -3,
      subtasks: [
        { title: 'Собрать риски', completed: false },
        { title: 'Назначить владельцев', completed: false },
        { title: 'Проверить дедлайны', completed: false },
      ],
    },
    {
      title: 'Забронировать билеты на выходные',
      description: 'Сравнить варианты и выбрать удобное время отправления.',
      dueOffset: 14,
      dueTime: '18:00',
      priority: 'medium',
      categoryId: 'demo-personal',
      createdOffset: -1,
    },
    {
      title: 'Подготовить черновик статьи',
      description: 'Собрать структуру материала и первые два раздела.',
      dueOffset: 14,
      dueTime: '20:00',
      priority: 'medium',
      categoryId: 'demo-project',
      createdOffset: -2,
    },
    {
      title: 'Обновить резюме',
      description: 'Добавить последние проекты и уточнить стек технологий.',
      dueOffset: 30,
      dueTime: '17:00',
      priority: 'high',
      categoryId: 'demo-personal',
      createdOffset: -9,
    },
    {
      title: 'Запланировать профилактический осмотр',
      description: 'Выбрать врача и забронировать время на следующий месяц.',
      dueOffset: 31,
      dueTime: '10:30',
      priority: 'low',
      categoryId: 'demo-health',
      createdOffset: -2,
    },
    {
      title: 'Разобрать папку Downloads',
      description: 'Удалить дубликаты и перенести важные файлы по папкам.',
      priority: 'low',
      categoryId: 'demo-home',
      createdOffset: -12,
    },
    {
      title: 'Собрать идеи для личного бюджета',
      description: 'Сохранить заметки по резерву, целям и крупным тратам.',
      priority: 'medium',
      categoryId: 'demo-finance',
      createdOffset: -11,
    },
    {
      title: 'Сформулировать цели на квартал',
      description: 'Выбрать 3 направления и описать измеримый результат.',
      priority: 'high',
      categoryId: 'demo-project',
      createdOffset: -14,
    },
    {
      title: 'Отправить ежемесячный отчёт',
      description: 'Собрать итоговые цифры и отправить руководителю.',
      dueOffset: -5,
      dueTime: '17:00',
      priority: 'high',
      categoryId: 'demo-work',
      status: 'completed',
      createdOffset: -8,
      completedOffset: -5,
      subtasks: [
        { title: 'Сверить KPI', completed: true },
        { title: 'Добавить комментарии', completed: true },
      ],
    },
    {
      title: 'Подать показания счётчиков',
      description: 'Передать значения воды и электричества через личный кабинет.',
      dueOffset: -2,
      dueTime: '09:00',
      priority: 'medium',
      categoryId: 'demo-home',
      status: 'completed',
      createdOffset: -4,
      completedOffset: -2,
    },
    {
      title: 'Купить корм для кота',
      description: 'Заказать привычный корм и наполнитель.',
      dueOffset: 0,
      priority: 'low',
      categoryId: 'demo-personal',
      status: 'completed',
      createdOffset: -2,
      completedOffset: 0,
    },
    {
      title: 'Сохранить чеки за апрель',
      description: 'Сложить электронные чеки в папку расходов.',
      dueOffset: 1,
      dueTime: '12:00',
      priority: 'low',
      categoryId: 'demo-finance',
      status: 'completed',
      createdOffset: -3,
      completedOffset: 0,
    },
    {
      title: 'Прочитать главу по архитектуре',
      description: 'Законспектировать ключевые идеи для следующего занятия.',
      priority: 'medium',
      categoryId: 'demo-study',
      status: 'completed',
      createdOffset: -6,
      completedOffset: -1,
    },
  ];

  return tasks.map((task) => buildTask(now, task));
}

function buildCategory(id: string, name: string, color: string, now: Date): Category {
  return {
    id,
    name,
    color,
    createdAt: now.toISOString(),
  };
}

function buildTask(now: Date, config: DemoTaskConfig): Task {
  const createdAt = shiftDate(now, config.createdOffset ?? -1).toISOString();
  const status = config.status ?? 'active';
  const completedAt =
    status === 'completed' ? shiftDate(now, config.completedOffset ?? 0).toISOString() : undefined;

  return {
    id: crypto.randomUUID(),
    title: config.title,
    description: config.description,
    dueDate:
      config.dueOffset === undefined ? '' : toDateInputValue(shiftDate(now, config.dueOffset)),
    dueTime: config.dueTime ?? '',
    priority: config.priority,
    status,
    categoryId: config.categoryId,
    subtasks: (config.subtasks ?? []).map((subtask) => ({
      id: crypto.randomUUID(),
      ...subtask,
    })),
    createdAt,
    updatedAt: completedAt ?? createdAt,
    ...(completedAt ? { completedAt } : {}),
  };
}

function shiftDate(date: Date, offsetDays: number): Date {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + offsetDays);
  return shifted;
}
