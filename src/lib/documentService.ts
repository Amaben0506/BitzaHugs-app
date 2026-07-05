import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  plum:   '#3D2B6B',
  purple: '#7B3DC8',
  muted:  '#7B5EA7',
  light:  '#F4F0FA',
  rose:   '#C03060',
  border: '#E5DAF5',
};

// ─── Data interfaces (matching AsyncStorage shapes) ───────────────────────────

interface ChildProfile {
  childName?: string;
  age?: string;
  dob?: string;
  diagnosis?: string;
  triggers?: string;
  calmingStrategies?: string;
  communicationStyle?: string;
  supportNeeds?: string[];
  notes?: string;
}

interface Win {
  id: string;
  emoji: string;
  label: string;
  date: string;
  createdAt: string;
}

interface ChildMood {
  mood: string;
  note: string;
  time: string;
}

interface DailyNote {
  date: string;
  overallRating: number;
  routinesCompleted: 'yes' | 'mostly' | 'no' | null;
  transitionsDifficult: 'yes' | 'some' | 'no' | null;
  sensoryChallenges: boolean | null;
  sensoryNote: string;
  calmToolsUsed: string[];
  whatHelpedMost: string;
  difficultMoments: boolean | null;
  difficultNote: string;
  winsToday: string;
  careTeamNote: string;
  savedAt: string;
}

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  type: 'routine' | 'appointment';
  status: 'pending' | 'completed' | 'skipped';
  emoji: string;
  notes?: string;
  date: string;
}

interface SupportPlan {
  calmingSteps: string[];
  trustedContacts: string;
  childCalmingStrategies: string;
  importantMedicalInfo: string;
  safePlaces: string;
  reminders: string;
  whatNotToDo: string;
  customInstructions: string;
  lastUpdated: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const esc = (s: unknown): string => {
  if (s == null) return '';
  return String(s).replace(/[<>&"]/g, (c) => (
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' } as Record<string, string>)[c]
  ));
};

const getJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const today = () => new Date().toISOString().split('T')[0];

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return iso;
  }
};

const ratingEmoji = (r: number): string =>
  ['', '😰', '😔', '😐', '🌿', '☀️'][Math.min(Math.max(r, 1), 5)] ?? '–';

// ─── HTML shell ───────────────────────────────────────────────────────────────

const wrapHtml = (title: string, bodyHtml: string): string => `
<!DOCTYPE html><html><head><meta charset="utf-8" />
<style>
  * { font-family: -apple-system, 'Helvetica Neue', sans-serif; box-sizing: border-box; }
  body { margin: 0; padding: 40px; color: ${BRAND.plum}; }
  .header { border-bottom: 3px solid ${BRAND.purple}; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
  .brand { font-size: 13px; color: ${BRAND.purple}; font-weight: 700; letter-spacing: 1px; }
  .doctitle { font-size: 26px; font-weight: 800; margin: 4px 0 0; }
  .date { font-size: 12px; color: ${BRAND.muted}; }
  .section { margin-bottom: 20px; }
  .section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; color: ${BRAND.purple}; border-bottom: 1px solid ${BRAND.border}; padding-bottom: 6px; margin-bottom: 10px; }
  .row { display: flex; margin-bottom: 8px; }
  .label { font-size: 12px; color: ${BRAND.muted}; width: 160px; font-weight: 600; flex-shrink: 0; }
  .value { font-size: 13px; color: ${BRAND.plum}; flex: 1; }
  .pill { display: inline-block; background: ${BRAND.light}; border-radius: 999px; padding: 4px 12px; font-size: 12px; margin: 0 6px 6px 0; }
  .box { background: ${BRAND.light}; border-radius: 10px; padding: 14px; font-size: 13px; line-height: 1.6; }
  .empty { font-size: 13px; color: ${BRAND.muted}; font-style: italic; }
  .footer { position: fixed; bottom: 24px; left: 40px; right: 40px; border-top: 1px solid ${BRAND.border}; padding-top: 10px; font-size: 10px; color: ${BRAND.muted}; text-align: center; }
  table { width: 100%; border-collapse: collapse; }
  td, th { text-align: left; padding: 8px 6px; font-size: 12px; border-bottom: 1px solid ${BRAND.border}; }
  th { color: ${BRAND.muted}; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; font-weight: 700; }
  ol, ul { margin: 0; padding-left: 18px; }
  li { font-size: 13px; line-height: 1.7; }
</style></head><body>
  <div class="header">
    <div>
      <div class="brand">BITZAHUGS 💜</div>
      <div class="doctitle">${esc(title)}</div>
    </div>
    <div class="date">${formatDate(new Date().toISOString())}</div>
  </div>
  ${bodyHtml}
  <div class="footer">Generated by BitzaHugs · This document contains private caregiver information · bitzahugs.com</div>
</body></html>`;

// ─── PDF generator ────────────────────────────────────────────────────────────

const generatePdf = async (title: string, bodyHtml: string): Promise<string> => {
  const html = wrapHtml(title, bodyHtml);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: title,
      UTI: 'com.adobe.pdf',
    });
  }
  return uri;
};

// ─── A) Child Snapshot ────────────────────────────────────────────────────────

export const generateChildSnapshot = async (): Promise<string> => {
  const p = await getJson<ChildProfile>('bitzaChildProfile', {});

  const field = (label: string, value: unknown) => `
    <div class="row">
      <span class="label">${esc(label)}</span>
      <span class="value">${value ? esc(value) : '<span class="empty">Not specified</span>'}</span>
    </div>`;

  const pills = (raw: unknown): string => {
    if (!raw) return '<span class="empty">Not specified</span>';
    return String(raw)
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => `<span class="pill">${esc(s)}</span>`)
      .join('') || '<span class="empty">Not specified</span>';
  };

  const bodyHtml = `
    <div class="section">
      <h2>Child Information</h2>
      ${field('Name', p.childName)}
      ${field('Age', p.age)}
      ${field('Diagnosis / Needs', p.diagnosis)}
    </div>
    <div class="section">
      <h2>Communication Style</h2>
      <div class="box">${p.communicationStyle ? esc(p.communicationStyle) : '<span class="empty">Not specified</span>'}</div>
    </div>
    <div class="section">
      <h2>Triggers</h2>
      <div>${pills(p.triggers)}</div>
    </div>
    <div class="section">
      <h2>Calming Strategies</h2>
      <div>${pills(p.calmingStrategies)}</div>
    </div>
    <div class="section">
      <h2>Today's Focus</h2>
      <div class="box">${p.notes ? esc(p.notes) : '<span class="empty">Not specified</span>'}</div>
    </div>
    <div class="section">
      <h2>Notes</h2>
      <div class="box" style="min-height:80px;">&nbsp;</div>
    </div>`;

  return generatePdf('Child Snapshot', bodyHtml);
};

// ─── B) Daily Schedule ────────────────────────────────────────────────────────

export const generateSchedule = async (): Promise<string> => {
  const items = await getJson<ScheduleItem[]>(`bitzaSchedule_${today()}`, []);

  const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));

  const statusLabel = (s: string): string =>
    ({ pending: '–', completed: '✓ Done', skipped: '↷ Skipped' })[s] ?? s;

  const bodyHtml = sorted.length === 0
    ? `<div class="box empty">No schedule items for today.</div>`
    : `
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Activity</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((item) => `
            <tr>
              <td>${esc(item.time)}</td>
              <td>${esc(item.emoji)} ${esc(item.title)}${item.subtitle ? `<br/><span style="color:${BRAND.muted};font-size:11px">${esc(item.subtitle)}</span>` : ''}</td>
              <td style="text-transform:capitalize">${esc(item.type)}</td>
              <td>${esc(statusLabel(item.status))}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;

  return generatePdf('Daily Schedule', bodyHtml);
};

// ─── C) Progress Report ───────────────────────────────────────────────────────

export const generateProgressReport = async (): Promise<string> => {
  const p = await getJson<ChildProfile>('bitzaChildProfile', {});
  const wins = await getJson<Win[]>('bitzaWins', []);
  const mood = await getJson<ChildMood | null>('bitzaChildMood', null);

  // Collect all daily notes
  const allKeys = await AsyncStorage.getAllKeys();
  const noteKeys = allKeys.filter((k) => k.startsWith('bitzaProgressNote_'));
  const notePairs = await AsyncStorage.multiGet(noteKeys);
  const notes: DailyNote[] = notePairs
    .map(([, v]) => { try { return v ? JSON.parse(v) as DailyNote : null; } catch { return null; } })
    .filter((n): n is DailyNote => n !== null)
    .sort((a, b) => b.date.localeCompare(a.date));

  const recentWins = wins.slice(0, 10);
  const winsHtml = recentWins.length === 0
    ? '<li class="empty">No wins recorded yet.</li>'
    : recentWins.map((w) => `<li>${esc(w.emoji)} ${esc(w.label)} <span style="color:${BRAND.muted};font-size:11px">(${esc(w.date)})</span></li>`).join('');

  const moodHtml = mood
    ? `<div class="box">${esc(mood.mood)}${mood.note ? ` — ${esc(mood.note)}` : ''}<br/><span style="color:${BRAND.muted};font-size:11px">${mood.time ? formatDate(mood.time) : ''}</span></div>`
    : '<div class="empty">No mood recorded yet.</div>';

  const notesHtml = notes.length === 0
    ? '<div class="empty">No daily notes recorded yet.</div>'
    : `<p style="font-size:12px;color:${BRAND.muted}">${notes.length} note${notes.length > 1 ? 's' : ''} recorded.</p>
       <table>
         <thead><tr><th>Date</th><th>Rating</th><th>Routines</th><th>Calm tools</th></tr></thead>
         <tbody>
           ${notes.map((n) => `
             <tr>
               <td>${esc(n.date)}</td>
               <td>${ratingEmoji(n.overallRating)} ${esc(String(n.overallRating ?? '–'))}/5</td>
               <td style="text-transform:capitalize">${esc(n.routinesCompleted ?? '–')}</td>
               <td>${n.calmToolsUsed?.length ? esc(n.calmToolsUsed.join(', ')) : '–'}</td>
             </tr>`).join('')}
         </tbody>
       </table>`;

  const bodyHtml = `
    <div class="section">
      <h2>Child</h2>
      <div class="row"><span class="label">Name</span><span class="value">${esc(p.childName) || '<span class="empty">Not specified</span>'}</span></div>
      <div class="row"><span class="label">Age</span><span class="value">${esc(p.age) || '<span class="empty">Not specified</span>'}</span></div>
      <div class="row"><span class="label">Diagnosis / Needs</span><span class="value">${esc(p.diagnosis) || '<span class="empty">Not specified</span>'}</span></div>
    </div>
    <div class="section">
      <h2>Recent Wins</h2>
      <ul>${winsHtml}</ul>
    </div>
    <div class="section">
      <h2>Most Recent Mood</h2>
      ${moodHtml}
    </div>
    <div class="section">
      <h2>Daily Notes Summary</h2>
      ${notesHtml}
    </div>`;

  return generatePdf('Progress Report', bodyHtml);
};

// ─── D) Support Plan ──────────────────────────────────────────────────────────

export const generateSupportPlan = async (): Promise<string> => {
  const plan = await getJson<SupportPlan | null>('bitzaSupportPlan', null);

  const box = (label: string, content: unknown) => `
    <div class="section">
      <h2>${esc(label)}</h2>
      ${content
        ? `<div class="box">${esc(content)}</div>`
        : '<div class="empty">Not filled in yet.</div>'}
    </div>`;

  const stepsHtml = plan?.calmingSteps?.length
    ? `<ol>${plan.calmingSteps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`
    : '<div class="empty">No steps added yet.</div>';

  const bodyHtml = `
    <div class="section">
      <h2>Calming Steps</h2>
      ${stepsHtml}
    </div>
    ${box('Trusted Contacts', plan?.trustedContacts)}
    ${box('Child Calming Strategies', plan?.childCalmingStrategies)}
    ${box('Medical & Safety Information', plan?.importantMedicalInfo)}
    ${box('Safe Places', plan?.safePlaces)}
    ${box('What Not to Do', plan?.whatNotToDo)}
    ${box('Reminders', plan?.reminders)}
    ${plan?.customInstructions ? box('Additional Instructions', plan.customInstructions) : ''}
    ${plan?.lastUpdated ? `<p style="font-size:11px;color:${BRAND.muted};margin-top:20px">Plan last updated: ${esc(formatDate(plan.lastUpdated))}</p>` : ''}`;

  return generatePdf('Support Plan', bodyHtml);
};

// ─── Shared export type ───────────────────────────────────────────────────────

export type DocumentGenerator = () => Promise<string>;
