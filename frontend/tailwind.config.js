/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--primary)',
                    hover: 'var(--primary-hover)',
                    light: 'var(--primary-light)',
                },
                surface: {
                    DEFAULT: 'var(--surface)',
                    2: 'var(--surface-2)',
                },
                text: {
                    main: 'var(--text-main)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                },
                background: 'var(--background)',
            },
            borderRadius: {
                'xl': 'var(--radius-xl)',
                '2xl': 'var(--radius-2xl)',
            },
            boxShadow: {
                'glow': 'var(--shadow-glow)',
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}
