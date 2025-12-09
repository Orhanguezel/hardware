// /var/www/hardware/backend/ecosystem.backend.cjs

module.exports = {
    apps: [
        {
            name: "hardware-backend",
            cwd: "/var/www/hardware/backend",
            script: "venv/bin/gunicorn",
            args: "hardware_review_api.wsgi:application --bind 127.0.0.1:8000 --workers 3",
            interpreter: "/bin/bash",
            env: {
                DJANGO_SETTINGS_MODULE: "hardware_review_api.settings",
                // Prod için DEBUG kapatmak istersen:
                // DEBUG: "False",
            },
        },
    ],
};
