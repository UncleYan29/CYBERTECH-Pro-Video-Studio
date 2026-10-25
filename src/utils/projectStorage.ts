import { ProjectData } from '../types/editor';

const STORAGE_KEY = 'cybertech_editor_project_v2';

export function saveProjectToLocalStorage(project: ProjectData): boolean {
  try {
    const serialized = JSON.stringify(project);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save project to localStorage', err);
    return false;
  }
}

export function loadProjectFromLocalStorage(): ProjectData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (validateProjectData(parsed)) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('Could not parse saved project from localStorage', err);
    return null;
  }
}

export function exportProjectFile(project: ProjectData) {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = project.settings.name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  a.download = `${safeName}.cyberproj`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateProjectData(obj: unknown): obj is ProjectData {
  if (!obj || typeof obj !== 'object') return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.version === 'string' &&
    Array.isArray(p.tracks) &&
    Array.isArray(p.clips) &&
    typeof p.settings === 'object' &&
    p.settings !== null
  );
}
