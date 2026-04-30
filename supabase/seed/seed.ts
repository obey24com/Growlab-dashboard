import type { SupabaseClient } from '@supabase/supabase-js';

// The seed runs against a service-role client configured with
// `db: { schema: 'demo' }`. We type the parameter loosely so the
// caller can pass any schema-typed client.
type DemoClient = SupabaseClient<any, any, any>;

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

export async function runSeed(supabase: DemoClient) {
  const startTime = Date.now();
  const org_id = '00000000-0000-0000-0000-000000000001'; // Default org

  console.log('Seeding demo data...');

  // 1. Create Demo Users
  const usersToCreate = [
    {
      email: 'admin@growlab.demo',
      password: 'growlab',
      role: 'admin',
      name: 'Prof. Dr. Nguyen Phuong Thao',
      displayName: 'Prof. Thao',
    },
    {
      email: 'scientist@growlab.demo',
      password: 'growlab',
      role: 'scientist',
      name: 'Thu Hien',
      displayName: 'Thu Hien',
    },
  ];

  const userIds: Record<string, string> = {};

  for (const u of usersToCreate) {
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });

    const alreadyExists =
      authErr &&
      ((authErr as { code?: string }).code === 'email_exists' ||
        /already (exists|been registered)/i.test(authErr.message));
    if (authErr && !alreadyExists) {
      console.error(`Error creating ${u.email}:`, authErr);
    }

    // Resolve the user — newly created or existing.
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const user = existingUsers?.users.find(user => user.email === u.email) || authData?.user;

    if (user) {
      userIds[u.role] = user.id;
      // Always sync the demo password — covers users created with an older password.
      if (alreadyExists) {
        const { error: updErr } = await supabase.auth.admin.updateUserById(user.id, {
          password: u.password,
        });
        if (updErr) console.error(`Could not update password for ${u.email}:`, updErr);
      }
      // Upsert always overwrites the name/display_name so a Reset Demo refreshes them.
      await supabase.from('user_profiles').upsert({
        id: user.id,
        org_id,
        email: u.email,
        full_name: u.name,
        display_name: u.displayName,
        role: u.role,
        is_active: true,
        is_demo: true,
      });
    }
  }

  // 2. Create Variety
  const { data: variety, error: varietyErr } = await supabase
    .from('varieties')
    .upsert(
      {
        org_id,
        code: 'MP-01',
        name: 'Multipuno Makapuno',
        scientific_name: 'Cocos nucifera L.',
      },
      { onConflict: 'code' }
    )
    .select()
    .single();
  if (varietyErr) throw new Error(`varieties upsert failed: ${varietyErr.message} (${varietyErr.code})`);

  // 3. Create Stages
  const stageRecords = STAGES.map(s => ({ org_id, ...s }));
  const { data: insertedStages, error: stagesErr } = await supabase
    .from('stages')
    .upsert(stageRecords, { onConflict: 'org_id, code' })
    .select();
  if (stagesErr || !insertedStages) {
    throw new Error(`stages upsert failed: ${stagesErr?.message ?? 'no data returned'}`);
  }
  const stageMap = insertedStages.reduce((acc, s) => ({ ...acc, [s.code]: s.id }), {} as Record<string, string>);

  // 4. Create Observation Types
  const obsRecords = OBSERVATION_TYPES.map(o => ({ org_id, ...o }));
  const { data: insertedObsTypes, error: obsTypeErr } = await supabase
    .from('observation_types')
    .upsert(obsRecords, { onConflict: 'org_id, code' })
    .select();
  if (obsTypeErr || !insertedObsTypes) {
    throw new Error(`observation_types upsert failed: ${obsTypeErr?.message ?? 'no data returned'}`);
  }
  const obsTypeMap = insertedObsTypes.reduce((acc, o) => ({ ...acc, [o.code]: o.id }), {} as Record<string, string>);

  // 5. Create Batches and Stage Entries
  let totalRowsSeeded = 0;

  for (const b of BATCHES) {
    const startedAt = new Date();
    startedAt.setMonth(startedAt.getMonth() - b.months_ago);

    const { data: batch } = await supabase.from('batches').upsert({
      org_id,
      batch_code: b.code,
      variety_id: variety!.id,
      current_stage_id: stageMap[b.current_stage],
      status: 'active',
      initial_jar_count: b.initial_jars,
      current_jar_count: b.initial_jars, // updated below to reflect decay
      started_at: startedAt.toISOString(),
      created_by: userIds['admin']
    }, { onConflict: 'org_id, batch_code' }).select().single();

    totalRowsSeeded++;

    // Generate stage entries up to current stage with realistic yield decay.
    const currentStageIndex = STAGES.findIndex(s => s.code === b.current_stage);
    let entryDate = new Date(startedAt);
    let jarCount = b.initial_jars;

    for (let i = 0; i <= currentStageIndex; i++) {
      const stage = STAGES[i];
      const isCurrent = i === currentStageIndex;
      const lo = stage.expected_yield_low;
      const hi = stage.expected_yield_high;
      const yieldRatio = lo + Math.random() * (hi - lo);
      const survival = isCurrent ? null : Math.max(1, Math.round(jarCount * yieldRatio));

      const { data: stageEntry } = await supabase.from('stage_entries').insert({
        org_id,
        batch_id: batch!.id,
        stage_id: stageMap[stage.code],
        entry_mode: 'aggregate',
        status: isCurrent ? 'in_progress' : 'completed',
        jar_count: jarCount,
        survival_count: survival,
        started_at: entryDate.toISOString(),
        completed_at: isCurrent
          ? null
          : new Date(entryDate.getTime() + stage.expected_duration_days * 86400000).toISOString(),
        operator_id: userIds['scientist'],
      }).select().single();

      totalRowsSeeded++;

      if (!isCurrent && survival !== null) {
        const isAnomaly = Math.random() < 0.08; // ~8% of completed stages flag an anomaly
        const observationsToInsert: Record<string, unknown>[] = [
          {
            org_id,
            stage_entry_id: stageEntry!.id,
            observation_type_id: obsTypeMap['survival_count'],
            category: 'count',
            data: { count: survival, total: jarCount },
            created_by: userIds['scientist'],
          },
          {
            org_id,
            stage_entry_id: stageEntry!.id,
            observation_type_id: obsTypeMap['growth_quality'],
            category: 'qc_check',
            data: { rating: yieldRatio >= (lo + (hi - lo) * 0.6) ? 'good' : 'fair' },
            created_by: userIds['scientist'],
          },
        ];
        if (isAnomaly) {
          observationsToInsert.push({
            org_id,
            stage_entry_id: stageEntry!.id,
            observation_type_id: obsTypeMap['anomaly'],
            category: 'anomaly',
            severity: 'warning',
            data: {
              type: 'contamination_suspected',
              description: 'Cloudy media noted on subset of jars during inspection.',
            },
            resolved: false,
            created_by: userIds['scientist'],
          });
        }
        await supabase.from('observations').insert(observationsToInsert);
        totalRowsSeeded += observationsToInsert.length;
      }

      entryDate = new Date(entryDate.getTime() + stage.expected_duration_days * 86400000);
      if (survival !== null) jarCount = survival;
    }

    // Sync the batch's current_jar_count to the in-progress stage's input.
    await supabase
      .from('batches')
      .update({ current_jar_count: jarCount })
      .eq('id', batch!.id);
  }

  // 6. Forecast Stub
  await supabase.from('forecasts').insert({
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
