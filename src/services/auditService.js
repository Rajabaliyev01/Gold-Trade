/**
 * auditService.js
 * Immutable Audit Trail Logging for Gold Trade ERP 2.0
 * Stores every critical transaction and action into factories/{factoryId}/audit_logs
 */

import { db } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

/**
 * Record an immutable audit log entry in Firestore.
 */
export async function logAuditEvent(factoryId, {
  actionType,
  stage = 'production',
  targetId,
  actor,
  purity = null,
  weightGrams = null,
  beforeState = null,
  afterState = null,
  details = '',
  metadata = {},
}) {
  if (!factoryId || !db) return null;

  try {
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = timestamp.replace(/[-:T]/g, '').slice(0, 8);
    const logId = `AUD-${datePrefix}-${randomSuffix}`;

    const auditEntry = {
      log_id: logId,
      factory_id: factoryId,
      action_type: actionType,
      stage: stage, // 'raw_material' | 'metal_processing' | 'production' | 'finishing_qc' | 'finished_goods' | 'pos'
      target_id: targetId || null,
      actor: {
        uid: actor?.uid || 'system',
        name: actor?.name || 'Foydalanuvchi',
        role: actor?.role || 'admin',
        username: actor?.username || '',
      },
      purity: purity !== null ? parseInt(purity, 10) : null,
      weight_grams: weightGrams !== null ? parseFloat(weightGrams) : null,
      before_state: beforeState,
      after_state: afterState,
      details: details || '',
      metadata: metadata || {},
      created_at: timestamp,
    };

    // Save immutably to Firestore: factories/{factoryId}/audit_logs/{logId}
    const logRef = doc(db, 'factories', factoryId, 'audit_logs', logId);
    await setDoc(logRef, auditEntry);

    return auditEntry;
  } catch (err) {
    console.warn("Failed to write immutable audit log:", err);
    return null;
  }
}
