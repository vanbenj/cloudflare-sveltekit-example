// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

export interface Env {
    TEST_DO: DurableObjectNamespace;
    MESSAGE_COORDINATOR: DurableObjectNamespace;
}
declare global {
	namespace App {
        interface Platform {
            env: Env;
            cf: CfProperties;
            ctx: ExecutionContext;
        }
    }
}

export {};