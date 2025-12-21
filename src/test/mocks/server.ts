import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configura o servidor MSW com os handlers
export const server = setupServer(...handlers);
