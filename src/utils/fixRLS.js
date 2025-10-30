import { supabase } from '../services/supabaseClient'

/**
 * Attempt to fix RLS issues by creating proper policies
 */
export async function fixRLSPolicies() {
  try {
    console.log('🔧 Attempting to fix RLS policies...')

    // Try to create a simple policy for authenticated users
    const { data, error } = await supabase.rpc('create_ticket_policy', {})

    if (error) {
      console.error('❌ Could not create RLS policy via RPC:', error)
      return {
        success: false,
        error: error.message,
        suggestion: 'Need to configure RLS policies in Supabase dashboard'
      }
    }

    return {
      success: true,
      message: 'RLS policies configured'
    }

  } catch (error) {
    console.error('❌ RLS fix error:', error)
    return {
      success: false,
      error: error.message,
      suggestion: 'Manual RLS configuration required'
    }
  }
}

/**
 * Check current RLS status
 */
export async function checkRLSStatus() {
  try {
    console.log('🔍 Checking RLS status...')

    // Try a simple query to see what error we get
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        titulo: 'RLS Test',
        descripcion: 'Testing RLS',
        estado: 'abierto'
      })
      .select('id')

    if (error) {
      console.log('📊 RLS Error Details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })

      return {
        rlsEnabled: true,
        blocked: true,
        error: error.message,
        code: error.code,
        hint: error.hint
      }
    }

    // If we get here, RLS is not blocking
    // Clean up test record
    if (data?.[0]?.id) {
      await supabase
        .from('tickets')
        .delete()
        .eq('id', data[0].id)
    }

    return {
      rlsEnabled: false,
      blocked: false,
      message: 'RLS is not blocking inserts'
    }

  } catch (error) {
    console.error('❌ RLS status check error:', error)
    return {
      error: error.message,
      unknown: true
    }
  }
}