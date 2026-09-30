import type {FamilyMember} from '../contracts/save-contract.js';
import type {RoleId} from '../content/types.js';

export const ROLE_ORDER: readonly RoleId[] = ['spotter', 'detective', 'navigator'];

export interface RoleAssignment {
  role: RoleId;
  member: FamilyMember | null;
}

export function getRoleAssignments(
  members: readonly FamilyMember[],
  storedOffset: 0 | 1 | 2,
  sessionShift = 0,
): RoleAssignment[] {
  if (!members.length) return ROLE_ORDER.map((role) => ({role, member: null}));
  return ROLE_ORDER.map((role, roleIndex) => ({
    role,
    member: members[(storedOffset + sessionShift + roleIndex) % members.length] ?? null,
  }));
}

export function nextRoleRotation(offset: 0 | 1 | 2, memberCount: number): 0 | 1 | 2 {
  if (memberCount <= 1) return offset;
  return ((offset + 1) % Math.min(memberCount, 3)) as 0 | 1 | 2;
}
