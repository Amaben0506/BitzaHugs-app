import { getAuth } from 'firebase/auth';
import '../lib/firebase';

// Paste the Firebase Auth UID of the owner/moderator account here.
// This must be a real signed-in account (email/Apple), NOT an anonymous UID.
// How to find it: sign in with your owner account → Firebase console →
// Authentication → Users → copy the UID column for your email.
export const MODERATOR_UIDS: string[] = [
  'ZQJ88OSFWyX9VZJnfmNwjuyHWU72',
];

export const isModerator = (): boolean => {
  const uid = getAuth().currentUser?.uid;
  return !!uid && MODERATOR_UIDS.includes(uid);
};
