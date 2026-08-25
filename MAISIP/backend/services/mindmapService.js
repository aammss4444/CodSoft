const db = require('../db/db');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Builds the full nested achievement tree for an athlete, exactly per Section 6 of the specification.
 * @param {string|number} athleteId - The UUID, MAI_ID, or user ID of the athlete
 * @returns {Promise<Object>} The mind map data structure
 */
async function buildMindmapForAthlete(athleteId) {
  if (!athleteId) {
    throw new Error('Athlete not found');
  }

  let athleteRes;
  const idStr = String(athleteId).trim();

  if (UUID_REGEX.test(idStr)) {
    athleteRes = await db.query(`
      SELECT a.id, a.full_name, a.mai_id, a.date_of_birth, a.primary_sport, a.current_institute_id,
             inst.name AS institute_name, inst.registration_id AS institute_code
      FROM athletes a
      LEFT JOIN institutes inst ON a.current_institute_id = inst.id
      WHERE a.id = $1 AND a.deleted_at IS NULL
    `, [idStr]);
  } else {
    athleteRes = await db.query(`
      SELECT a.id, a.full_name, a.mai_id, a.date_of_birth, a.primary_sport, a.current_institute_id,
             inst.name AS institute_name, inst.registration_id AS institute_code
      FROM athletes a
      LEFT JOIN institutes inst ON a.current_institute_id = inst.id
      WHERE (a.mai_id = $1 OR a.id::text = $1) AND a.deleted_at IS NULL
    `, [idStr]);
    if (athleteRes.rows.length === 0) {
      athleteRes = await db.query(`
        SELECT a.id, a.full_name, a.mai_id, a.date_of_birth, a.primary_sport, a.current_institute_id,
               inst.name AS institute_name, inst.registration_id AS institute_code
        FROM athletes a
        LEFT JOIN institutes inst ON a.current_institute_id = inst.id
        WHERE a.user_id::text = $1 AND a.deleted_at IS NULL
      `, [idStr]).catch(() => ({ rows: [] }));
    }
  }
  
  if (!athleteRes || athleteRes.rows.length === 0) {
    throw new Error('Athlete not found');
  }
  const athlete = athleteRes.rows[0];

  const achRes = await db.query(`
    SELECT a.*,
           r.submitted_by_role, r.submitter_name, r.submitted_under, r.entry_date,
           i.issued_by, i.reference_number AS issuance_reference_number, i.issued_date, i.status AS issuance_status,
           c.name AS comp_name, c.organized_by, c.venue_name, c.level AS comp_level, c.start_date, c.end_date,
           p.result_type AS perf_result_type, p.final_position AS perf_final_position,
           p.performance_value AS perf_performance_value, p.measurement_unit AS perf_measurement_unit,
           p.is_personal_best AS perf_is_personal_best, p.previous_best AS perf_previous_best
    FROM achievements a
    LEFT JOIN achievement_registrations r ON a.id = r.achievement_id
    LEFT JOIN achievement_issuances i ON r.id = i.registration_id
    LEFT JOIN competition_events c ON a.id = c.achievement_id
    LEFT JOIN result_performances p ON a.id = p.achievement_id
    WHERE a.athlete_id = $1 AND a.deleted_at IS NULL
    ORDER BY COALESCE(a.achievement_date, a.created_at) ASC
  `, [athlete.id]);

  // Fetch documents from both documents table and achievement_documents table
  let docsByAchId = {};
  try {
    const docRes = await db.query(
      'SELECT achievement_id, document_type, original_filename, storage_key, mime_type, verification_status FROM documents WHERE achievement_id IN (SELECT id FROM achievements WHERE athlete_id = $1)', 
      [athlete.id]
    );
    docRes.rows.forEach(doc => {
      if (!docsByAchId[doc.achievement_id]) docsByAchId[doc.achievement_id] = [];
      docsByAchId[doc.achievement_id].push({ 
        type: doc.document_type || 'Document', 
        filename: doc.original_filename || 'Certificate File',
        name: doc.original_filename || 'Certificate File',
        original_filename: doc.original_filename,
        storage_key: doc.storage_key,
        url: doc.storage_key,
        mime_type: doc.mime_type,
        verificationStatus: doc.verification_status 
      });
    });
  } catch (e) {
    console.warn('Note: Could not query documents table:', e.message);
  }

  try {
    const achDocsRes = await db.query(
      'SELECT achievement_id, document_type, original_file_name, verification_status FROM achievement_documents WHERE achievement_id IN (SELECT id FROM achievements WHERE athlete_id = $1)', 
      [athlete.id]
    );
    achDocsRes.rows.forEach(doc => {
      if (!docsByAchId[doc.achievement_id]) docsByAchId[doc.achievement_id] = [];
      docsByAchId[doc.achievement_id].push({ 
        type: doc.document_type || 'Document', 
        filename: doc.original_file_name || 'Certificate File', 
        verificationStatus: doc.verification_status 
      });
    });
  } catch (e) {
    // optional table
  }

  const achievements = achRes.rows.map(row => ({
    id: row.id,
    category: row.category,
    achievement_category: row.category,
    subtype: row.subtype,
    achievement_subtype: row.subtype,
    title: row.title,
    level: row.level || row.comp_level,
    achievement_level: row.level || row.comp_level,
    competition_name: row.comp_name || row.title,
    event_name: row.comp_name,
    competition_level: row.comp_level || row.level,
    date: row.achievement_date,
    achievement_date: row.achievement_date,
    created_at: row.created_at,
    ageAtAchievement: row.age_at_achievement,
    age_at_achievement: row.age_at_achievement,
    verificationStatus: row.verification_status,
    verification_status: row.verification_status,
    individual_or_team: row.is_team_achievement ? 'Team' : 'Individual',
    
    // Submitter / Registration
    submitter_name: row.submitter_name,
    submitter_role: row.submitted_by_role,
    submitted_by_role: row.submitted_by_role,
    organization_name: row.submitted_under || athlete.institute_name,
    submitted_under: row.submitted_under || athlete.institute_name,
    entry_date: row.entry_date || row.created_at,
    
    // Issuance / Verification
    issued_by: row.issued_by || row.issuing_authority,
    issuing_authority: row.issuing_authority || row.issued_by,
    achievement_reference_number: row.reference_number || row.issuance_reference_number || row.official_result_number,
    reference_number: row.reference_number || row.issuance_reference_number,
    issued_date: row.issued_date || row.certificate_issue_date || row.achievement_date,
    certificate_issue_date: row.certificate_issue_date || row.issued_date,
    issuance_status: row.issuance_status || row.verification_status,
    
    // Competition & Event
    organized_by: row.organized_by,
    venue_name: row.venue_name,
    start_date: row.start_date,
    end_date: row.end_date,
    dates: row.start_date ? `${row.start_date}${row.end_date ? ' to ' + row.end_date : ''}` : null,
    
    // Result & Performance
    result_type: row.result_type || row.perf_result_type,
    final_position_rank: row.final_position_rank || row.perf_final_position,
    performance_value: row.performance_value || row.perf_performance_value,
    measurement_unit: row.measurement_unit || row.perf_measurement_unit,
    timing: row.timing,
    distance: row.distance,
    
    // Documents
    certificate_number: row.certificate_number || row.reference_number || row.issuance_reference_number,
    certificate_type: row.certificate_type || row.issuance_status || 'Merit Certificate',
    documents: docsByAchId[row.id] || [],
    
    // Selection Details
    selected_for: row.selected_for,
    selection_level: row.selection_level,
    selection_authority: row.selection_authority,
    selection_date: row.selection_date,
    camp_team_start_date: row.camp_team_start_date,
    camp_team_end_date: row.camp_team_end_date,
    camp_dates: row.camp_team_start_date ? `${row.camp_team_start_date}${row.camp_team_end_date ? ' – ' + row.camp_team_end_date : ''}` : null,
    selection_letter_number: row.selection_letter_number,
    
    // Personal Best Details
    personal_best_achieved: row.personal_best_achieved,
    prev_personal_best: row.prev_personal_best || (row.perf_previous_best ? `${row.perf_previous_best}` : null),
    new_personal_best: row.new_personal_best || (row.perf_performance_value ? `${row.perf_performance_value}` : null),
    pb_improvement: row.pb_improvement,
    pb_date: row.pb_date || row.achievement_date,
    pb_unit: row.pb_unit,
    
    // Scholarship Details
    scholarship_name: row.scholarship_name,
    scholarship_provider: row.scholarship_provider,
    scholarship_amount: row.scholarship_amount,
    scholarship_currency: row.scholarship_currency,
    scholarship_frequency: row.scholarship_frequency,
    scholarship_duration: row.scholarship_duration,
    scholarship_criteria: row.scholarship_criteria,
    scholarship_status: row.scholarship_status
  }));

  return {
    athlete: { 
      id: athlete.id, 
      name: athlete.full_name, 
      full_name: athlete.full_name,
      maiId: athlete.mai_id, 
      mai_id: athlete.mai_id,
      dateOfBirth: athlete.date_of_birth,
      date_of_birth: athlete.date_of_birth,
      sport: athlete.primary_sport, 
      primary_sport: athlete.primary_sport,
      instituteId: athlete.current_institute_id,
      instituteName: athlete.institute_name,
      institute_name: athlete.institute_name,
      instituteCode: athlete.institute_code
    },
    achievements
  };
}

module.exports = { buildMindmapForAthlete };
