import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PersonalDataCompletion {
    isComplete: boolean;
    hasData: boolean;
    loading: boolean;
}

export const usePersonalDataCompletion = (userId?: string) => {
    const [completion, setCompletion] = useState<PersonalDataCompletion>({
        isComplete: false,
        hasData: false,
        loading: true,
    });

    useEffect(() => {
        if (!userId) {
            setCompletion({ isComplete: false, hasData: false, loading: false });
            return;
        }

        const checkCompletion = async () => {
            try {
                const { data, error } = await supabase
                    .from('employee_personal_data')
                    .select('is_complete')
                    .eq('user_id', userId)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error checking personal data completion:', error);
                    setCompletion({ isComplete: false, hasData: false, loading: false });
                    return;
                }

                setCompletion({
                    isComplete: data?.is_complete || false,
                    hasData: !!data,
                    loading: false,
                });
            } catch (error) {
                console.error('Error checking personal data completion:', error);
                setCompletion({ isComplete: false, hasData: false, loading: false });
            }
        };

        checkCompletion();
    }, [userId]);

    return completion;
};