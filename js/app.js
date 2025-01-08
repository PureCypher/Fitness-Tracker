// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 4px;
        background: var(--success-color);
        color: white;
        z-index: 1000;
        animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
    }

    .notification.error {
        background: var(--danger-color);
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Update dashboard, goals, and meals on load
    ui.updateDashboard();
    ui.setupGoalForm();
    ui.updateActiveGoals();
    ui.updateTrophyDisplay();

    // Custom event for meal logging
    document.addEventListener('mealLogged', () => {
        ui.updateDashboard();
    });

    // Set up goal progress update interval
    setInterval(() => {
        storage.updateAllGoalsProgress();
        ui.updateActiveGoals();
    }, 60000); // Check progress every minute

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + 1-5 for navigation
        if (e.altKey && e.key >= '1' && e.key <= '5') {
            const index = parseInt(e.key) - 1;
            const views = ['dashboard', 'weightlifting', 'cardio', 'goals', 'settings'];
            if (views[index]) {
                ui.switchView(views[index]);
                e.preventDefault();
            }
        }
    });

    // Update goals when workouts are logged
    document.addEventListener('workoutLogged', () => {
        storage.updateAllGoalsProgress();
        ui.updateActiveGoals();
    });
});

// Handle service worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
