import { SupabaseClient } from '@supabase/supabase-js';

const STAGES = [
  { code: 'G1', name: 'Germination 1', stage_group: 'Germination', sequence_order: 1, expected_duration_days: 56, expected_yield_low: 0.40, expected_yield_high: 0.45, jar_type: 'Bi', jar_ratio: 1 },
  { code: 'G2', name: 'Germination 2', stage_group: 'Germination', sequence_order: 2, expected_duration_days: 56, expected_yield_low: 0.42, expected_yield_high: 0.48, jar_type: 'Med', jar_ratio: 1 },
  { code: 'C',  name: 'Callus Induction', stage_group: 'Callus', sequence_order: 3, expected_duration_days: 56, expected_yield_low: 0.18, expected_yield_high: 0.22, jar_type: 'Callus', jar_ratio: 1 },
  { code: 'M1', name: 'Multiplication 1', stage_group: 'Multiplication', sequence_order: 4, expected_duration_days: 42, expected_yield_low: 1.8, expected_yield_high: 2.2, jar_type: 'Callus', jar_ratio: 3 },
  { code: 'M2', name: 'Multiplication 2', stage_group: 'Multiplication', sequence_order: 5, expected_duration_days: 42, expected_yield_low: 1.8, expected_yield_high: 2.2, jar_type: 'Callus', jar_ratio: 3 },
  { code: 'M3', name: 'Multiplication 3', stage_group: 'Multiplication', sequence_order: 6, expected_duration_days: 42, expected_yield_low: 1.8, expected_yield_high: 2.2, jar_type: 'Callus', jar_ratio: 3 },
  { code: 'M4', name: 'Multiplication 4', stage_group: 'Multiplication', sequence_order: 7, expected_duration_days: 42, expected_yield_low: 1.8, expected_yield_high: 2.2, jar_type: 'Callus', jar_ratio: 3 },
  { code: 'M5', name: 'Multiplication 5', stage_group: 'Multiplication', sequence_order: 8, expected_duration_days: 42, expected_yield_low: 1.8, expected_yield_high: 2.2, jar_type: 'Callus', jar_ratio: 3 },
  { code: 'M6', name: 'Multiplication 6', stage_group: 'Multiplication', sequence_order: 9, expected_duration_days: 42, expected_yield_low: 1.8, expected_yield_high: 2.2, jar_type: 'Callus', jar_ratio: 3 },
  { code: 'S1', name: 'Shoot 1', stage_group: 'Shoot', sequence_order: 10, expected_duration_days: 42, expected_yield_low: 1.8, expected_yield_high: 2.2, jar_type: 'Med', jar_ratio: 3 },
  { code: 'S2', name: 'Shoot 2', stage_group: 'Shoot', sequence_order: 11, expected_duration_days: 42, expected_yield_low: 1.8, expected_yield_high: 2.2, jar_type: 'Med', jar_ratio: 3 },
  { code: 'S3', name: 'Shoot 3', stage_group: 'Shoot', sequence_order: 12, expected_duration_days: 42, expected_yield_low: 1.8, expected_yield_high: 2.2, jar_type: 'Med', jar_ratio: 3 },
  { code: 'S4', name: 'Shoot 4', stage_group: 'Shoot', sequence_order: 13, expected_duration_days: 42, expected_yield_low: 0.9, expected_yield_high: 1.1, jar_type: 'Med', jar_ratio: 3 },
  { code: 'S5', name: 'Shoot 5', stage_group: 'Shoot', sequence_order: 14, expected_duration_days: 42, expected_yield_low: 0.9, expected_yield_high: 1.1, jar_type: 'Med', jar_ratio: 3 },
  { code: 'S6', name: 'Shoot 6', stage_group: 'Shoot', sequence_order: 15, expected_duration_days: 42, expected_yield_low: 0.9, expected_yield_high: 1.1, jar_type: 'Med', jar_ratio: 3 },
  { code: 'R1', name: 'Rooting 1', stage_group: 'Rooting', sequence_order: 16, expected_duration_days: 42, expected_yield_low: 0.65, expected_yield_high: 0.75, jar_type: 'Tube', jar_ratio: 1 },
  { code: 'R2', name: 'Rooting 2', stage_group: 'Rooting', sequence_order: 17, expected_duration_days: 42, expected_yield_low: 0.65, expected_yield_high: 0.75, jar_type: 'High', jar_ratio: 1 },
  { code: 'R3', name: 'Rooting 3', stage_group: 'Rooting', sequence_order: 18, expected_duration_days: 42, expected_yield_low: 0.65, expected_yield_high: 0.75, jar_type: 'High', jar_ratio: 1 },
  { code: 'R4', name: 'Rooting 4', stage_group: 'Rooting', sequence_order: 19, expected_duration_days: 42, expected_yield_low: 0.9, expected_yield_high: 1.1, jar_type: 'High', jar_ratio: 1 },
  { code: 'T',  name: 'Transfer', stage_group: 'Transfer', sequence_order: 20, expected_duration_days: 56, expected_yield_low: 0.75, expected_yield_high: 0.85, jar_type: 'Cup', jar_ratio: 1 },
  { code: 'GR', name: 'Growing', stage_group: 'Growing', sequence_order: 21, expected_duration_days: 56, expected_yield_low: 0.75, expected_yield_high: 0.85, jar_type: 'Bag', jar_ratio: 1 }
];

const OBSERVATION_TYPES = [
  { code: 'survival_count', name: 'Survival Count', category: 'count', schema: { count: 'number', total: 'number' }, is_required: true, applies_to_stages: ['all'] },
  { code: 'contamination_check', name: 'Contamination Check', category: 'qc_check', schema: { contaminated: 'boolean', type: 'string', notes: 'string' }, is_required: true, applies_to_stages: ['all'] },
  { code: 'growth_quality', name: 'Growth Quality', category: 'qc_check', schema: { rating: 'enum:poor,fair,good,excellent', notes: 'string' }, is_required: false, applies_to_stages: ['all'] },
  { code: 'media_quality', name: 'Media Quality', category: 'qc_check', schema: { ph: 'number', clarity: 'enum:clear,cloudy,opaque', notes: 'string' }, is_required: false, applies_to_stages: ['G1','G2','C','M1','M2','M3','M4','M5','M6'] },
  { code: 'root_development', name: 'Root Development', category: 'measurement', schema: { length_mm: 'number', count: 'number', notes: 'string' }, is_required: false, applies_to_stages: ['R1','R2','R3','R4'] },
  { code: 'shoot_height', name: 'Shoot Height', category: 'measurement', schema: { height_mm: 'number', notes: 'string' }, is_required: false, applies_to_stages: ['S1','S2','S3','S4','S5','S6'] },
  { code: 'anomaly', name: 'Anomaly', category: 'anomaly', schema: { type: 'string', severity: 'enum:info,warning,critical', description: 'string' }, is_required: false, applies_to_stages: ['all'] },
  { code: 'note', name: 'Free Note', category: 'note', schema: { text: 'string' }, is_required: false, applies_to_stages: ['all'] }
];

const BATCHES = [
  { code: 'B-2024-001', months_ago: 24, current_stage: 'T', initial_jars: 100 },
  { code: 'B-2024-007', months_ago: 22, current_stage: 'R3', initial_jars: 100 },
  { code: 'B-2024-015', months_ago: 19, current_stage: 'R1', initial_jars: 120 },
  { code: 'B-2025-002', months_ago: 16, current_stage: 'S5', initial_jars: 100 },
  { code: 'B-2025-009', months_ago: 13, current_stage: 'S2', initial_jars: 100 },
  { code: 'B-2025-018', months_ago: 10, current_stage: 'M6', initial_jars: 80 },
  { code: 'B-2025-024', months_ago: 8,  current_stage: 'M3', initial_jars: 100 },
  { code: 'B-2026-003', months_ago: 5,  current_stage: 'M1', initial_jars: 100 },
  { code: 'B-2026-008', months_ago: 3,  current_stage: 'C',  initial_jars: 100 },
  { code: 'B-2026-014', months_ago: 1,  current_stage: 'G1', initial_jars: 150 },
];

export async function runSeed(supabase: SupabaseClient) {
  const startTime = Date.now();
  const org_id = '00000000-0000-0000-0000-000000000001'; // Default org

  console.log('Seeding demo data...');

  // 1. Create Demo Users
  const usersToCreate = [
    { email: 'admin@growlab.demo', password: 'grow', role: 'admin', name: 'Admin User' },
    { email: 'scientist@growlab.demo', password: 'grow', role: 'scientist', name: 'Scientist User' }
  ];

  const userIds: Record<string, string> = {};

  for (const u of usersToCreate) {
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });
    
    if (authErr && !authErr.message.includes('already exists')) {
      console.error(`Error creating ${u.email}:`, authErr);
    }

    // Try to get user if it already existed
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const user = existingUsers?.users.find(user => user.email === u.email) || authData?.user;

    if (user) {
      userIds[u.role] = user.id;
      await supabase.from('demo.user_profiles').upsert({
        id: user.id,
        org_id,
        email: u.email,
        full_name: u.name,
        display_name: u.name.split(' ')[0],
        role: u.role,
        is_active: true,
        is_demo: true,
      });
    }
  }

  // 2. Create Variety
  const { data: variety } = await supabase.from('demo.varieties').upsert({
    org_id,
    code: 'MP-01',
    name: 'Multipuno Makapuno',
    scientific_name: 'Cocos nucifera L.',
  }).select().single();

  // 3. Create Stages
  const stageRecords = STAGES.map(s => ({ org_id, ...s }));
  const { data: insertedStages } = await supabase.from('demo.stages').upsert(stageRecords, { onConflict: 'org_id, code' }).select();
  const stageMap = insertedStages!.reduce((acc, s) => ({ ...acc, [s.code]: s.id }), {} as Record<string, string>);

  // 4. Create Observation Types
  const obsRecords = OBSERVATION_TYPES.map(o => ({ org_id, ...o }));
  const { data: insertedObsTypes } = await supabase.from('demo.observation_types').upsert(obsRecords, { onConflict: 'org_id, code' }).select();
  const obsTypeMap = insertedObsTypes!.reduce((acc, o) => ({ ...acc, [o.code]: o.id }), {} as Record<string, string>);

  // 5. Create Batches and Stage Entries
  let totalRowsSeeded = 0;

  for (const b of BATCHES) {
    const startedAt = new Date();
    startedAt.setMonth(startedAt.getMonth() - b.months_ago);

    const { data: batch } = await supabase.from('demo.batches').upsert({
      org_id,
      batch_code: b.code,
      variety_id: variety!.id,
      current_stage_id: stageMap[b.current_stage],
      status: 'active',
      initial_jar_count: b.initial_jars,
      current_jar_count: b.initial_jars, // Simplified for seed
      started_at: startedAt.toISOString(),
      created_by: userIds['admin']
    }, { onConflict: 'org_id, batch_code' }).select().single();

    totalRowsSeeded++;

    // Generate stage entries up to current stage
    const currentStageIndex = STAGES.findIndex(s => s.code === b.current_stage);
    let entryDate = new Date(startedAt);

    for (let i = 0; i <= currentStageIndex; i++) {
      const stage = STAGES[i];
      const isCurrent = i === currentStageIndex;
      
      const { data: stageEntry } = await supabase.from('demo.stage_entries').insert({
        org_id,
        batch_id: batch!.id,
        stage_id: stageMap[stage.code],
        entry_mode: 'aggregate',
        status: isCurrent ? 'in_progress' : 'completed',
        jar_count: b.initial_jars,
        survival_count: isCurrent ? null : Math.floor(b.initial_jars * 0.95), // Fake 95% survival
        started_at: entryDate.toISOString(),
        completed_at: isCurrent ? null : new Date(entryDate.getTime() + stage.expected_duration_days * 24 * 60 * 60 * 1000).toISOString(),
        operator_id: userIds['scientist'],
      }).select().single();

      totalRowsSeeded++;

      // Create a few observations per stage entry
      if (!isCurrent) {
        await supabase.from('demo.observations').insert([
          {
            org_id,
            stage_entry_id: stageEntry!.id,
            observation_type_id: obsTypeMap['survival_count'],
            category: 'count',
            data: { count: Math.floor(b.initial_jars * 0.95), total: b.initial_jars },
            created_by: userIds['scientist'],
          },
          {
            org_id,
            stage_entry_id: stageEntry!.id,
            observation_type_id: obsTypeMap['growth_quality'],
            category: 'qc_check',
            data: { rating: 'good' },
            created_by: userIds['scientist'],
          }
        ]);
        totalRowsSeeded += 2;
      }

      entryDate = new Date(entryDate.getTime() + stage.expected_duration_days * 24 * 60 * 60 * 1000);
    }
  }

  // 6. Forecast Stub
  await supabase.from('demo.forecasts').insert({
    org_id,
    horizon: '90_day',
    variety_id: variety!.id,
    forecast_data: {
      weeks: [
        { week_starting: new Date().toISOString().split('T')[0], ready_seedlings: 320, confidence: 0.65 },
        { week_starting: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0], ready_seedlings: 412, confidence: 0.65 }
      ],
      alerts: []
    },
    confidence_score: 0.65
  });
  totalRowsSeeded++;

  const timeTakenMs = Date.now() - startTime;
  console.log(`Seeded ${totalRowsSeeded} rows in ${timeTakenMs}ms`);

  return { rowsSeeded: totalRowsSeeded, timeTakenMs };
}
