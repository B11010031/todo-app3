import { Client } from '@notionhq/client';
import { Task, TodoList } from '@/types';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const TASKS_DB = process.env.NOTION_TASKS_DB_ID!;
const LISTS_DB = process.env.NOTION_LISTS_DB_ID!;

function getProp(page: any, key: string) { return page.properties?.[key]; }
function getText(prop: any): string { return prop?.title?.[0]?.plain_text || prop?.rich_text?.[0]?.plain_text || ''; }
function getSelect(prop: any): string { return prop?.select?.name || ''; }
function getDate(prop: any): string | null { return prop?.date?.start || null; }
function getCheck(prop: any): boolean { return prop?.checkbox || false; }
function getRelationId(prop: any): string | null { return prop?.relation?.[0]?.id || null; }

const COLOR_MAP: Record<string, string> = {
  coral: '#F0A8A0', amber: '#F5D080', teal: '#80D5B8', purple: '#B8AEFF',
  indigo: '#7B6BE0', blue: '#7BB8E8', red: '#E8706A', gray: '#C8CCD8',
  '#F0A8A0': '#F0A8A0', '#F5D080': '#F5D080', '#80D5B8': '#80D5B8',
  '#B8AEFF': '#B8AEFF', '#7B6BE0': '#7B6BE0', '#7BB8E8': '#7BB8E8',
  '#E8706A': '#E8706A', '#C8CCD8': '#C8CCD8',
};
const ICON_MAP: Record<string, string> = {
  briefcase: 'briefcase', home: 'home', folder: 'folder', heart: 'heart',
  star: 'star', book: 'book', dumbbell: 'dumbbell', cart: 'shopping-cart',
  'shopping-cart': 'shopping-cart', plane: 'plane', cash: 'banknote', banknote: 'banknote',
};

function resolveColor(val: string): string { return COLOR_MAP[val] || val || '#B8AEFF'; }
function resolveIcon(val: string): string { return ICON_MAP[val] || val || 'folder'; }

export async function getLists(): Promise<TodoList[]> {
  const res = await notion.databases.query({ database_id: LISTS_DB });
  return res.results.map((p: any) => ({
    id: p.id,
    name: getText(getProp(p, 'Name')),
    icon: resolveIcon(getSelect(getProp(p, 'Icon'))),
    color: resolveColor(getSelect(getProp(p, 'Color'))),
  }));
}

export async function createList(data: { name: string; icon: string; color: string }): Promise<TodoList> {
  const page = await notion.pages.create({
    parent: { database_id: LISTS_DB },
    properties: {
      Name: { title: [{ text: { content: data.name } }] },
      Icon: { select: { name: data.icon } },
      Color: { select: { name: data.color } },
    },
  }) as any;
  return { id: page.id, name: data.name, icon: resolveIcon(data.icon), color: resolveColor(data.color) };
}

export async function updateList(id: string, data: Partial<{ name: string; icon: string; color: string }>) {
  const props: any = {};
  if (data.name !== undefined) props.Name = { title: [{ text: { content: data.name } }] };
  if (data.icon !== undefined) props.Icon = { select: { name: data.icon } };
  if (data.color !== undefined) props.Color = { select: { name: data.color } };
  await notion.pages.update({ page_id: id, properties: props });
}

export async function deleteList(id: string) {
  await notion.pages.update({ page_id: id, archived: true });
}

function mapTask(p: any, listsMap: Map<string, TodoList>): Task {
  const listId = getRelationId(getProp(p, 'List')) || '';
  const list = listsMap.get(listId);
  const priority = getSelect(getProp(p, 'Priority')) as Task['priority'];
  return {
    id: p.id,
    name: getText(getProp(p, 'Name')),
    status: (getSelect(getProp(p, 'Status')) as 'todo' | 'done') || 'todo',
    priority: (['high','medium','low','none'].includes(priority) ? priority : 'none') as Task['priority'],
    listId,
    listName: list?.name || '',
    listColor: list?.color || '#B8AEFF',
    listIcon: list?.icon || 'folder',
    dueDate: getDate(getProp(p, 'DueDate')),
    pinned: getCheck(getProp(p, 'Pinned')),
    notes: getText(getProp(p, 'Notes')),
    subTasks: [],
    parentTaskId: getRelationId(getProp(p, 'ParentTask')),
  };
}

export async function getTasks(): Promise<Task[]> {
  const [listsRes, tasksRes] = await Promise.all([
    notion.databases.query({ database_id: LISTS_DB }),
    notion.databases.query({
      database_id: TASKS_DB,
      sorts: [
        { property: 'Pinned', direction: 'descending' },
        { property: 'DueDate', direction: 'ascending' },
      ],
    }),
  ]);
  const listsMap = new Map<string, TodoList>(
    listsRes.results.map((p: any) => [
      p.id,
      { id: p.id, name: getText(getProp(p, 'Name')), icon: resolveIcon(getSelect(getProp(p, 'Icon'))), color: resolveColor(getSelect(getProp(p, 'Color'))) },
    ])
  );
  const all = tasksRes.results.map((p: any) => mapTask(p, listsMap));
  const parents = all.filter((t: Task) => !t.parentTaskId);
  const children = all.filter((t: Task) => t.parentTaskId);
  parents.forEach((p: Task) => {
    p.subTasks = children
      .filter((c: Task) => c.parentTaskId === p.id)
      .map((c: Task) => ({ id: c.id, name: c.name, done: c.status === 'done' }));
  });
  return parents;
}

export async function getTask(id: string): Promise<Task | null> {
  try {
    const [page, listsRes, subsRes] = await Promise.all([
      notion.pages.retrieve({ page_id: id }),
      notion.databases.query({ database_id: LISTS_DB }),
      notion.databases.query({
        database_id: TASKS_DB,
        filter: { property: 'ParentTask', relation: { contains: id } },
      }),
    ]) as [any, any, any];
    const listsMap = new Map<string, TodoList>(
      listsRes.results.map((p: any) => [
        p.id,
        { id: p.id, name: getText(getProp(p, 'Name')), icon: resolveIcon(getSelect(getProp(p, 'Icon'))), color: resolveColor(getSelect(getProp(p, 'Color'))) },
      ])
    );
    const task = mapTask(page, listsMap);
    task.subTasks = subsRes.results.map((p: any) => ({
      id: p.id, name: getText(getProp(p, 'Name')), done: getSelect(getProp(p, 'Status')) === 'done',
    }));
    return task;
  } catch { return null; }
}

export async function createTask(data: {
  name: string; listId?: string; priority?: string;
  dueDate?: string; pinned?: boolean; notes?: string; parentTaskId?: string;
}): Promise<Task> {
  const props: any = {
    Name: { title: [{ text: { content: data.name } }] },
    Status: { select: { name: 'todo' } },
    Priority: { select: { name: data.priority || 'none' } },
    Pinned: { checkbox: data.pinned || false },
  };
  if (data.listId) props.List = { relation: [{ id: data.listId }] };
  if (data.dueDate) props.DueDate = { date: { start: data.dueDate } };
  if (data.notes) props.Notes = { rich_text: [{ text: { content: data.notes } }] };
  if (data.parentTaskId) props.ParentTask = { relation: [{ id: data.parentTaskId }] };
  const page = await notion.pages.create({ parent: { database_id: TASKS_DB }, properties: props }) as any;
  return {
    id: page.id, name: data.name, status: 'todo',
    priority: (data.priority as Task['priority']) || 'none',
    listId: data.listId || '', dueDate: data.dueDate || null,
    pinned: data.pinned || false, notes: data.notes || '',
    subTasks: [], parentTaskId: data.parentTaskId || null,
  };
}

export async function updateTask(id: string, data: {
  name?: string; status?: string; priority?: string; listId?: string;
  dueDate?: string | null; pinned?: boolean; notes?: string;
}): Promise<void> {
  const props: any = {};
  if (data.name !== undefined) props.Name = { title: [{ text: { content: data.name } }] };
  if (data.status !== undefined) props.Status = { select: { name: data.status } };
  if (data.priority !== undefined) props.Priority = { select: { name: data.priority } };
  if (data.listId !== undefined) props.List = { relation: data.listId ? [{ id: data.listId }] : [] };
  if (data.dueDate !== undefined) props.DueDate = data.dueDate ? { date: { start: data.dueDate } } : { date: null };
  if (data.pinned !== undefined) props.Pinned = { checkbox: data.pinned };
  if (data.notes !== undefined) props.Notes = { rich_text: [{ text: { content: data.notes } }] };
  await notion.pages.update({ page_id: id, properties: props });
}

export async function deleteTask(id: string): Promise<void> {
  await notion.pages.update({ page_id: id, archived: true });
}

export async function completeSubTasks(subTaskIds: string[]): Promise<void> {
  await Promise.all(
    subTaskIds.map((id: string) =>
      notion.pages.update({ page_id: id, properties: { Status: { select: { name: 'done' } } } })
    )
  );
}
