
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
    if (!platform?.env) {
        throw new Error('Platform env not available');
    }
    
    console.log('Loading data from backend durable object');
    const id = platform.env.TEST_DO.idFromName('global');
    const stub = platform.env.TEST_DO.get(id);
  
    const res = await stub.fetch('https://do/internal');
    const data = await res.json() as { message: string };
    console.log('Data from backend durable object:', data);
    return {
        message: data.message
    };
};
