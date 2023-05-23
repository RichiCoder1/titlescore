import { Router } from '@tanstack/router';

import { rootRoute } from './pages/root';
import { indexRoute } from './pages';

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = new Router({
    routeTree,
});

declare module '@tanstack/router' {
    interface Register {
        router: typeof router;
    }
}
