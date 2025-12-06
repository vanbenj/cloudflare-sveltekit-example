// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

export interface Env {
    TEST_DO: DurableObjectNamespace;
    MESSAGE_COORDINATOR: DurableObjectNamespace;
    COUNTDOWN_TIMER: DurableObjectNamespace;
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

/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_WS_HOST?: string;
	readonly VITE_WS_PATH?: string;
}

export {};