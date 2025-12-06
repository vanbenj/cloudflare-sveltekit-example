import type { Actions, PageServerLoad } from './$types';

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

export const actions: Actions = {
    countdown: async ({ platform }) => {
        if (!platform?.env) {
            return { success: false, error: 'Platform not available' };
        }

        const id = platform.env.COUNTDOWN_TIMER.idFromName('global');
        const stub = platform.env.COUNTDOWN_TIMER.get(id);

        const response = await stub.fetch('http://do/start', {
            method: 'POST'
        });

        const result = await response.json() as { success: boolean; message?: string };
        return { success: result.success };
    }
};
