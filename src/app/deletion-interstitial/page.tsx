import { createClient } from '@/lib/supabase/server';
import DeletionInterstitialClient from './DeletionInterstitialClient';
import { redirect } from 'next/navigation';

interface DeletionRecord {
  deletion_date: string;
  data_deleted: string[];
  compliance_verified: boolean;
  verification_date: string;
}

export default async function DeletionInterstitialPage() {
  try {
    const supabase = await createClient();

    // Get current user server-side
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      console.error('[Deletion Interstitial] Auth error:', userError);
      redirect('/');
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', user.id)
      .single();

    if (studentError && studentError.code !== 'PGRST116') {
      console.error('[Deletion Interstitial] Student lookup error:', studentError);
      redirect('/');
    }

    if (student) {
      redirect('/dashboard');
    }

    // Query deletion records server-side
    const { data: deletionRecords, error: deletionError } = await supabase.rpc(
      'get_deletion_proof',
      { p_user_email: user.email }
    );

    if (deletionError) {
      console.error('[Deletion Interstitial] RPC error:', deletionError);
      redirect('/');
    }

    if (!deletionRecords || deletionRecords.length === 0) {
      // No deletion history - redirect to onboarding
      redirect('/onboarding');
    }

    // Pass records to client component
    return <DeletionInterstitialClient deletionRecords={deletionRecords} />;
  } catch (err: any) {
    console.error('[Deletion Interstitial] Error:', err);
    redirect('/');
  }
}
