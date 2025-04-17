import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TestConnection: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [tablesStatus, setTablesStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('cursorhrms_profiles').select('*').limit(1);
        
        if (error) {
          setConnectionStatus('Failed');
          setError(error.message);
        } else {
          setConnectionStatus('Connected');
          
          // Check if required tables exist
          const requiredTables = [
            'cursorhrms_profiles',
            'cursorhrms_employees',
            'cursorhrms_departments',
            'cursorhrms_leave_requests',
            'cursorhrms_documents'
          ];
          const missingTables: string[] = [];
          
          for (const table of requiredTables) {
            const { error: tableError } = await supabase.from(table).select('*').limit(1);
            if (tableError) {
              missingTables.push(table);
            }
          }
          
          if (missingTables.length > 0) {
            setTablesStatus(`Missing tables: ${missingTables.join(', ')}`);
          } else {
            setTablesStatus('All required tables exist');
          }
        }
      } catch (err) {
        setConnectionStatus('Failed');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Database Connection Test
          </h2>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Connection Status:</h3>
              <p className={`mt-1 text-sm ${connectionStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                {connectionStatus}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Tables Status:</h3>
              <p className="mt-1 text-sm text-gray-600">{tablesStatus}</p>
            </div>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnection; 