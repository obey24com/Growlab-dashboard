import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Forecasting Agent stub started")

serve(async (req) => {
  try {
    // This is a stub for the Phase 1 Demo. In Phase 2, this would
    // invoke an LLM to generate more complex insights.
    
    // Create Supabase client from env
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const org_id = '00000000-0000-0000-0000-000000000001'

    // Mock math for the demo
    const forecast_data = {
      horizon: "90_day",
      weeks: [
        { week_starting: new Date().toISOString().split('T')[0], ready_seedlings: 320, confidence: 0.65 },
        { week_starting: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0], ready_seedlings: 412, confidence: 0.65 }
      ],
      alerts: [
        { type: "supply_gap", week: new Date(Date.now() + 140*24*60*60*1000).toISOString().split('T')[0], shortfall: 1400, recommendation: "Initiate 4 G1 batches by next week" }
      ]
    }

    // Insert into forecasts table
    const { data, error } = await supabase
      .from('demo.forecasts')
      .insert({
        org_id,
        horizon: '90_day',
        forecast_data,
        confidence_score: 0.65,
        generated_by: 'forecasting_agent_v1'
      })
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, forecast: data }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
})
