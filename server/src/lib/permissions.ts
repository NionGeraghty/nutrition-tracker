import { pool } from '../db';

export async function resolveAllowedTargets(
  requesterId: string,
  requestedTargets: string[] | undefined
): Promise<string[] | null> {
  const targets = requestedTargets && requestedTargets.length > 0 ? requestedTargets : [requesterId];

  const others = targets.filter((id) => id !== requesterId);

  if (others.length === 0) {
    return targets;
  }

  const result = await pool.query(
    `SELECT owner_id FROM editor_permissions WHERE editor_id = $1 AND owner_id = ANY($2)`,
    [requesterId, others]
  );

  const permitted = new Set(result.rows.map((r) => r.owner_id));
  const allValid = others.every((id) => permitted.has(id));

  return allValid ? targets : null;
}

export async function resolveTargetUser(
  requesterId: string,
  requestedUserId: unknown
): Promise<string | null> {
  if (typeof requestedUserId !== 'string' || requestedUserId === requesterId) {
    return requesterId;
  }

  const result = await pool.query(
    'SELECT id FROM editor_permissions WHERE owner_id = $1 AND editor_id = $2',
    [requestedUserId, requesterId]
  );

  return result.rows.length > 0 ? requestedUserId : null;
}