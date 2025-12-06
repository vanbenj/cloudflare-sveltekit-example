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

        const id = platform.env.MESSAGE_COORDINATOR.idFromName('global');
        const stub = platform.env.MESSAGE_COORDINATOR.get(id);

        // Send countdown messages from 10 to 0, spaced 1 second apart
        for (let i = 10; i >= 0; i--) {
            await stub.fetch('http://do/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: i, timestamp: Date.now() })
            });

            // Wait 1 second between messages (except after the last one)
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return { success: true };
    }
};
