// LifeVault browser-local data model. No secure cloud storage or authentication yet.
export const STORAGE_KEY = 'lifevault-v2';
export const CATEGORIES = ['Experience', 'Project', 'Achievement', 'Education', 'Memory'];
export const CATEGORY_PATH = {
  Experience: '/experience', Project: '/projects', Achievement: '/achievements',
  Education: '/education', Memory: '/memories'
};

// A new account begins empty. People choose which parts of their lives to add.
const blank = {
  profile: {
    name: 'Your LifeVault',
    subtitle: 'A home for your memories, places, and experiences.',
    about: 'A little space for all the things that make life yours.',
    location: ''
  },
  experiences: [],
  projects: [],
  achievements: [],
  education: [],
  memories: []
};

export const emptyForm = (type = 'Memory') => ({
  type, title: '', organization: '', organizationId: '', role: '', timeframe: '', location: '',
  year: new Date().getFullYear().toString(), issuer: '', description: '', visibility: 'Public', date: '', kind: 'Moment'
});

const arrays = { Experience: 'experiences', Project: 'projects', Achievement: 'achievements', Education: 'education', Memory: 'memories' };
export const collectionFor = type => arrays[type] || 'projects';
export const titleFor = item => item.organization || item.title || 'Untitled';
export const linkFor = (type, id) => type === 'Experience' ? '/experience/' + encodeURIComponent(id)
  : type === 'Project' ? '/projects/' + encodeURIComponent(id)
  : type === 'Memory' ? '/memories/' + encodeURIComponent(id) : CATEGORY_PATH[type];

function loadJson(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === 'object' ? value : null;
  } catch { return null; }
}

// The first demos auto-created an employer and a device-health project.
// Remove ONLY the untouched auto-generated records, never custom edits.
function wasSeedEmployer(x) {
  return x?.id === 'walmart' &&
    x.organization === 'Walmart Global Tech' &&
    x.role === 'Software Engineer' &&
    x.timeframe === '2024 – 2026' &&
    x.location === 'Bentonville, Arkansas' &&
    x.description === 'Building and improving technology that supports retail operations.' &&
    x.visibility === 'Public' && !x.updatedAt;
}
function wasSeedProject(x) {
  return x?.id === 'pos-health' &&
    x.title === 'POS Device Health Platform' &&
    x.year === '2025' &&
    x.description === 'A retail device monitoring project focused on making operational signals easier to understand and act on.' &&
    x.organizationId === 'walmart' &&
    x.visibility === 'Public' && !x.updatedAt;
}
function wasSeedProfile(p) {
  return p?.name === 'Pawan Ghimire' &&
    p.subtitle === 'A collection of experiences, ideas and milestones' &&
    p.about === 'A home for the work, learning and moments that shape my story.' &&
    (p.location === '' || p.location == null);
}

export function initialData() {
  const current = loadJson(STORAGE_KEY);
  if (current && Array.isArray(current.experiences) && Array.isArray(current.projects)) {
    const profile = wasSeedProfile(current.profile) ? blank.profile : { ...blank.profile, ...(current.profile || {}) };
    const experiences = current.experiences.filter(x => !wasSeedEmployer(x));
    const projects = current.projects.filter(x => !wasSeedProject(x));
    return {
      profile: { ...profile },
      experiences,
      projects,
      achievements: Array.isArray(current.achievements) ? current.achievements : [],
      education: Array.isArray(current.education) ? current.education : [],
      memories: Array.isArray(current.memories) ? current.memories : []
    };
  }

  // Carry forward only genuinely user-created entries from the old prototype.
  const legacy = loadJson('lifevault-items');
  const legacyProfile = loadJson('lifevault-profile');
  const migrated = JSON.parse(JSON.stringify(blank));
  if (legacyProfile && !wasSeedProfile(legacyProfile)) {
    migrated.profile = { ...migrated.profile, ...legacyProfile };
  }
  if (Array.isArray(legacy)) {
    const oldDemoTitles = new Set([
      'POS Device Health Platform',
      'A new chapter in cybersecurity',
      'Trust-Aware AI Research',
      'Building software that matters'
    ]);
    for (const item of legacy) {
      if (!item || !item.title || oldDemoTitles.has(item.title)) continue;
      const common = {
        id: String(item.id || (Date.now() + Math.random())),
        description: item.description || '',
        visibility: item.visibility === 'Private' ? 'Private' : 'Public'
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
    ...(data.memories || []).map(item => ({ ...item, type: 'Memory' }))
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
