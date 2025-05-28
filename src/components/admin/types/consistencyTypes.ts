
export interface DataInconsistency {
  type: 'ORPHANED_AUTH' | 'ORPHANED_PROFILE' | 'UUID_COLLISION' | 'EMAIL_MISMATCH';
  email: string;
  authUserId?: string;
  profileId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
