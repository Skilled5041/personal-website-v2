/** @type {import("tailwindcss").Config} */
export default {
    content: [
        "./src/**/*.{astro,html,js,ts,svelte}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Instrument Sans", "ui-sans-serif", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};
