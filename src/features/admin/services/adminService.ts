import { supabase } from '../../../supabase/config';

export const fetchAdminSettings = async (): Promise<any> => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('parameter, value');

  if (error) {
    throw error;
  }
  
  if (!data) return null;

  // Transform array of {parameter, value} to object {parameter: value}
  const config = data.reduce((acc: any, item: any) => {
    acc[item.parameter] = item.value;
    return acc;
  }, {});

  return config;
};

export const updateAdminSettings = async (config: any): Promise<void> => {
  // Transform object {parameter: value} to array of {parameter, value}
  const updates = Object.entries(config).map(([parameter, value]) => ({
    parameter,
    value: String(value) // Ensure value is string
  }));

  const { error } = await supabase
    .from('admin_settings')
    .upsert(updates as any);

  if (error) throw error;
};

