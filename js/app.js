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
function initializeApp() {
    // Ensure all required globals are available
    const missingManagers = [];
    if (typeof window.ui === 'undefined') missingManagers.push('ui');
    if (typeof window.storage === 'undefined') missingManagers.push('storage');
    if (typeof window.calendar === 'undefined') missingManagers.push('calendar');
    
    if (missingManagers.length > 0) {
        console.error(`Required managers not available yet: ${missingManagers.join(', ')}. Retrying...`);
        setTimeout(initializeApp, 100); // Retry after 100ms
        return;
    }
    
    console.log('All managers loaded successfully. Initializing app...');
    
    // Update dashboard, goals, and meals on load
    window.ui.updateDashboard();
    window.ui.setupGoalForm();
    window.ui.updateActiveGoals();
    window.ui.updateTrophyDisplay();

    // Custom event for meal logging
    document.addEventListener('mealLogged', () => {
        window.ui.updateDashboard();
    });

    // Set up goal progress update interval
    setInterval(() => {
        window.storage.updateAllGoalsProgress();
        window.ui.updateActiveGoals();
    }, 60000); // Check progress every minute

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + 1-5 for navigation
        if (e.altKey && e.key >= '1' && e.key <= '5') {
            const index = parseInt(e.key) - 1;
            const views = ['dashboard', 'weightlifting', 'cardio', 'goals', 'settings'];
            if (views[index]) {
                window.ui.switchView(views[index]);
                e.preventDefault();
            }
        }
    });

    // Update UI when workouts are logged or updated
    document.addEventListener('workoutLogged', () => {
        window.storage.updateAllGoalsProgress();
        window.ui.updateActiveGoals();
        window.calendar.refresh();
    });

    document.addEventListener('weightliftingUpdated', () => {
        window.ui.updateDashboard();
        window.storage.updateAllGoalsProgress();
        window.ui.updateActiveGoals();
        window.calendar.refresh();
    });

    document.addEventListener('cardioUpdated', () => {
        window.ui.updateDashboard();
        window.storage.updateAllGoalsProgress();
        window.ui.updateActiveGoals();
        window.calendar.refresh();
    });

    document.addEventListener('mealsUpdated', () => {
        window.ui.updateDashboard();
        window.storage.updateAllGoalsProgress();
        window.ui.updateActiveGoals();
        window.calendar.refresh();
    });
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle service worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/Fitness-Tracker/service-worker.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
