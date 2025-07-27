import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';

export const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // 测试基本连接
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        if (error) {
          setError(`Connection failed: ${error.message}`);
          setStatus('❌ Connection failed');
        } else {
          setStatus('✅ Supabase connected successfully!');
        }
      } catch (err) {
        setError(`Unexpected error: ${err}`);
        setStatus('❌ Connection failed');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Supabase Connection Test</h3>
      <p className="text-sm text-gray-600 mb-2">{status}</p>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
}; 