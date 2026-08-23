import { pool } from '../db';

export async function resolveAllowedTargets(
  requesterId: string,
  requestedTargets: string[] | undefined
): Promise<string[] | null> {
  const targets = requestedTargets && requestedTargets.length > 0 ? requestedTargets : [requesterId];

  const others = targets.filter((id) => id !== requesterId);
  
  console.log('Permission check:', { requesterId, requestedTargets, others });

  if (others.length === 0) {
    return targets;
  }

  const result = await pool.query(
    `SELECT owner_id FROM editor_permissions WHERE editor_id = $1 AND owner_id = ANY($2)`,
    [requesterId, others]
  );

  console.log('Query result rows:', result.rows);

  const permitted = new Set(result.rows.map((r) => r.owner_id));
  const allValid = others.every((id) => permitted.has(id));

  console.log('Permitted set:', permitted, 'allValid:', allValid);

  return allValid ? targets : null;
}