import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRegistrationStatus = () => {
    const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRegistrationStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('app_settings')
                    .select('setting_value')
                    .eq('setting_key', 'user_registration_enabled')
                    .single();

                if (!error && data) {
                    setIsRegistrationEnabled(data.setting_value === true);
                }
            } catch (error) {
                console.error('Error checking registration status:', error);
                // Default to disabled on error for security
                setIsRegistrationEnabled(false);
            } finally {
                setLoading(false);
            }
        };

        checkRegistrationStatus();
    }, []);

    return { isRegistrationEnabled, loading };
};