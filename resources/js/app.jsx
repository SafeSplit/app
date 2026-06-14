import { createInertiaApp } from "@inertiajs/react";

createInertiaApp({
    pages: {
        path: "./pages",
        extension: ".jsx",
        lazy: true,
    },
});
