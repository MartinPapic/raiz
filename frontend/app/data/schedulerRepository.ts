import { api } from './api';

export interface SchedulerStatus {
    running: boolean;
    next_run_time: string | null;
}

export const schedulerRepository = {
    getStatus: async (token: string): Promise<SchedulerStatus> => {
        return api.get('/scheduler/status', token);
    },

    start: async (token: string): Promise<void> => {
        return api.post('/scheduler/start', {}, token);
    },

    stop: async (token: string): Promise<void> => {
        return api.post('/scheduler/stop', {}, token);
    },

    runNow: async (token: string): Promise<void> => {
        return api.post('/scheduler/run-now', {}, token);
    }
};
