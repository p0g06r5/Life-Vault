// LifeVault's local-only demonstration data layer.
// No server, authentication, or secure document storage is provided yet.
export const STORAGE_KEY = 'lifevault-v2';
export const CATEGORIES = ['Experience', 'Project', 'Achievement', 'Education', 'Memory'];
export const CATEGORY_PATH = {
  Experience: '/experience', Project: '/projects', Achievement: '/achievements', Education: '/education', Memory: '/memories'
};

const sample = {
  profile: {
    name: 'Pawan Ghimire',
    subtitle: 'A collection of experiences, ideas and milestones',
    about: 'A home for the work, learning and moments that shape my story.',
    location: '',
  },
  experiences: [{
    id: 'walmart',
    organization: 'Walmart Global Tech',
    role: 'Software Engineer',
    timeframe: '2024 – 2026',
    location: 'Bentonville, Arkansas',
    description: 'Building and improving technology that supports retail operations.',
    visibility: 'Public',
  }],
  projects: [{
    id: 'pos-health',
    title: 'POS Device Health Platform',
    year: '2025',
    description: 'A retail device monitoring project focused on making operational signals easier to understand and act on.',
    organizationId: 'walmart',
    visibility: 'Public',
  }],
  achievements: [],
  education: [],
  memories: [],
};

export const emptyForm = (type = 'Project') => ({
  type, title: '', organization: '', organizationId: '', role: '', timeframe: '', location: '',
  year: new Date().getFullYear().toString(), issuer: '', description: '', visibility: 'Public', date: '', kind: 'Moment',
});

const arrays = { Experience: 'experiences', Project: 'projects', Achievement: 'achievements', Education: 'education', Memory: 'memories' };
export const collectionFor = type => arrays[type] || 'projects';
export const titleFor = item => item.organization || item.title || 'Untitled';
export const linkFor = (type, id) => type === 'Experience' ? '/experience/' + encodeURIComponent(id)
  : type === 'Project' ? '/projects/' + encodeURIComponent(id) : type === 'Memory' ? '/memories/' + encodeURIComponent(id) : CATEGORY_PATH[type];

function loadJson(key) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value && typeof value === 'object' ? value : null; }
  catch { return null; }
}

export function initialData() {
  const current = loadJson(STORAGE_KEY);
  if (current && Array.isArray(current.experiences) && Array.isArray(current.projects)) {
    return {
      profile: { ...sample.profile, ...current.profile },
      experiences: current.experiences,
      projects: current.projects,
      achievements: Array.isArray(current.achievements) ? current.achievements : [],
      education: Array.isArray(current.education) ? current.education : [],
      memories: Array.isArray(current.memories) ? current.memories : [],
    };
  }

  // Preserve custom entries from the earlier one-page prototype.
  const legacy = loadJson('lifevault-items');
  const legacyProfile = loadJson('lifevault-profile');
  const migrated = JSON.parse(JSON.stringify(sample));
  if (legacyProfile) migrated.profile = { ...migrated.profile, ...legacyProfile };
  if (Array.isArray(legacy)) {
    const oldDefaults = new Set([
      'POS Device Health Platform',
      'A new chapter in cybersecurity',
      'Trust-Aware AI Research',
      'Building software that matters',
    ]);
    for (const item of legacy) {
      if (!item || !item.title || oldDefaults.has(item.title)) continue;
      const common = {
        id: String(item.id || (Date.now() + Math.random())),
        description: item.description || '',
        visibility: item.visibility === 'Private' ? 'Private' : 'Public',
      };
      if (item.type === 'Experience') {
        migrated.experiences.push({ ...common, organization: item.title, role: '', timeframe: item.year || '', location: '' });
      } else if (item.type === 'Project') {
        migrated.projects.push({ ...common, title: item.title, year: item.year || '', organizationId: '' });
      } else if (item.type === 'Education') {
        migrated.education.push({ ...common, title: item.title, year: item.year || '', issuer: '' });
      } else if (item.type === 'Achievement') {
        migrated.achievements.push({ ...common, title: item.title, year: item.year || '', issuer: '' });
      }
    }
  }
  return migrated;
}

export function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch (error) { console.warn('Could not save LifeVault data in this browser.', error); }
}

export function allEntries(data) {
  return [
    ...data.experiences.map(item => ({ ...item, type: 'Experience', title: item.organization })),
    ...data.projects.map(item => ({ ...item, type: 'Project' })),
    ...data.achievements.map(item => ({ ...item, type: 'Achievement' })),
    ...data.education.map(item => ({ ...item, type: 'Education' })),
    ...(data.memories || []).map(item => ({ ...item, type: 'Memory' })),
  ];
}

export function displayYear(item) {
  if (item.date) return item.date;
  if (item.year) return item.year;
  return item.timeframe || '';
}

export function safeId() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
}
