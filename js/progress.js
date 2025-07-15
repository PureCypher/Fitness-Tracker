class ProgressTracker {
    constructor() {
        this.achievementsKey = 'fitness_achievements';
        this.initializeAchievements();
        this.setupEventListeners();
        this.updateProgressDisplay();
    }

    setupEventListeners() {
        document.addEventListener('weightliftingUpdated', () => {
            this.updateProgressDisplay();
            this.checkAchievements();
        });

        document.addEventListener('cardioUpdated', () => {
            this.updateProgressDisplay();
            this.checkAchievements();
        });
    }

    initializeAchievements() {
        if (!localStorage.getItem(this.achievementsKey)) {
            const defaultAchievements = {
                'first-workout': { unlocked: false, date: null },
                'week-streak': { unlocked: false, date: null },
                'month-streak': { unlocked: false, date: null },
                'training-types-5': { unlocked: false, date: null },
                'training-types-10': { unlocked: false, date: null },
                'heavy-lifter': { unlocked: false, date: null },
                'endurance-warrior': { unlocked: false, date: null },
                'technique-master': { unlocked: false, date: null },
                'consistency-king': { unlocked: false, date: null },
                'progress-tracker': { unlocked: false, date: null }
            };
            localStorage.setItem(this.achievementsKey, JSON.stringify(defaultAchievements));
        }
    }

    calculateProgressionLevel() {
        const entries = storage.getWeightlifting();
        const trainingTypes = new Set();
        let totalLoad = 0;
        let advancedTechniques = 0;
        
        entries.forEach(entry => {
            if (entry.trainingType) {
                trainingTypes.add(entry.trainingType);
            }
            
            // Calculate training load
            entry.sets.forEach(set => {
                totalLoad += set.weight * set.actualReps;
            });
            
            // Count advanced techniques
            const advancedTypes = ['drop-set', 'double-drop', 'triple-drop', 'superset', 'triset', 
                                 'giant-set', 'cluster', 'rest-pause', 'mechanical-drop', 'contrast', 
                                 'accommodating', 'wave-loading'];
            if (advancedTypes.includes(entry.trainingType)) {
                advancedTechniques++;
            }
        });
        
        // Calculate level based on multiple factors
        let level = 'Beginner';
        let progress = 0;
        
        if (entries.length >= 5 && trainingTypes.size >= 2) {
            level = 'Novice';
            progress = 20;
        }
        if (entries.length >= 15 && trainingTypes.size >= 4) {
            level = 'Intermediate';
            progress = 40;
        }
        if (entries.length >= 30 && trainingTypes.size >= 7 && advancedTechniques >= 5) {
            level = 'Advanced';
            progress = 60;
        }
        if (entries.length >= 50 && trainingTypes.size >= 12 && advancedTechniques >= 15) {
            level = 'Expert';
            progress = 80;
        }
        if (entries.length >= 100 && trainingTypes.size >= 18 && advancedTechniques >= 35) {
            level = 'Master';
            progress = 100;
        }
        
        return { level, progress, totalWorkouts: entries.length, typesUsed: trainingTypes.size };
    }

    calculateTrainingLoad() {
        const entries = storage.getWeightlifting();
        const now = new Date();
        const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        let weeklyLoad = 0;
        let dailyLoads = {};
        
        entries.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate >= weekAgo) {
                const dayKey = entryDate.toDateString();
                if (!dailyLoads[dayKey]) dailyLoads[dayKey] = 0;
                
                entry.sets.forEach(set => {
                    const load = set.weight * set.actualReps;
                    weeklyLoad += load;
                    dailyLoads[dayKey] += load;
                });
            }
        });
        
        return {
            weekly: Math.round(weeklyLoad),
            daily: dailyLoads,
            average: Math.round(weeklyLoad / 7)
        };
    }

    generateRecommendations() {
        const entries = storage.getWeightlifting();
        const progression = this.calculateProgressionLevel();
        const trainingLoad = this.calculateTrainingLoad();
        const recommendations = [];
        
        // Analyze training patterns
        const trainingTypes = {};
        const recentEntries = entries.slice(-10); // Last 10 workouts
        
        recentEntries.forEach(entry => {
            const type = entry.trainingType || 'straight';
            trainingTypes[type] = (trainingTypes[type] || 0) + 1;
        });
        
        // Generate recommendations based on analysis
        
        // 1. Progression recommendations
        if (progression.level === 'Beginner' && progression.totalWorkouts >= 10) {
            recommendations.push({
                type: 'progression',
                title: '🎯 Ready for Intermediate Techniques',
                description: 'Try incorporating supersets or drop sets to increase training intensity.',
                action: 'Explore pyramid or superset training',
                priority: 'high'
            });
        }
        
        // 2. Variety recommendations
        if (progression.typesUsed < 5) {
            recommendations.push({
                type: 'variety',
                title: '🔄 Increase Training Variety',
                description: 'Using different training methods can prevent plateaus and keep workouts interesting.',
                action: 'Try tempo training or cluster sets',
                priority: 'medium'
            });
        }
        
        // 3. Training load recommendations
        if (trainingLoad.weekly < 5000 && entries.length > 5) {
            recommendations.push({
                type: 'intensity',
                title: '💪 Increase Training Intensity',
                description: 'Your training load is relatively low. Consider increasing weight or volume.',
                action: 'Add more sets or increase weight by 5-10%',
                priority: 'medium'
            });
        }
        
        // 4. Recovery recommendations
        if (Object.keys(trainingLoad.daily).length >= 6) {
            recommendations.push({
                type: 'recovery',
                title: '😴 Consider Rest Days',
                description: 'You\'ve been training frequently. Rest days are crucial for muscle growth.',
                action: 'Take 1-2 rest days this week',
                priority: 'high'
            });
        }
        
        // 5. Technique recommendations
        const straightSetsRatio = (trainingTypes.straight || 0) / recentEntries.length;
        if (straightSetsRatio > 0.8 && progression.level !== 'Beginner') {
            recommendations.push({
                type: 'technique',
                title: '🎨 Diversify Training Techniques',
                description: 'You\'re mostly using straight sets. Try advanced techniques for better results.',
                action: 'Incorporate drop sets, supersets, or tempo training',
                priority: 'medium'
            });
        }
        
        // 6. Goal-specific recommendations
        const lastWeekEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            const weekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
            return entryDate >= weekAgo;
        });
        
        if (lastWeekEntries.length === 0) {
            recommendations.push({
                type: 'motivation',
                title: '🎯 Time to Get Back On Track',
                description: 'It\'s been a while since your last workout. Consistency is key to progress.',
                action: 'Start with a light workout to rebuild momentum',
                priority: 'high'
            });
        }
        
        return recommendations.slice(0, 5); // Return top 5 recommendations
    }

    updateProgressDisplay() {
        const progression = this.calculateProgressionLevel();
        const trainingLoad = this.calculateTrainingLoad();
        const recommendations = this.generateRecommendations();
        
        // Update progression level
        this.updateProgressionLevel(progression);
        
        // Update training load
        this.updateTrainingLoad(trainingLoad);
        
        // Update training type chart
        this.updateTrainingTypeChart();
        
        // Update recommendations
        this.updateRecommendations(recommendations);
        
        // Update achievements
        this.updateAchievementsDisplay();
    }

    updateProgressionLevel(progression) {
        const levelText = document.querySelector('.level-text');
        const levelProgress = document.querySelector('.level-progress');
        
        if (levelText) {
            levelText.textContent = `${progression.level} (${progression.totalWorkouts} workouts)`;
        }
        
        if (levelProgress) {
            levelProgress.style.width = `${progression.progress}%`;
        }
    }

    updateTrainingLoad(trainingLoad) {
        const loadValue = document.querySelector('.load-value');
        if (loadValue) {
            loadValue.textContent = trainingLoad.weekly.toLocaleString();
        }
    }

    updateTrainingTypeChart() {
        const canvas = document.getElementById('training-type-chart');
        if (!canvas) return;
        
        const entries = storage.getWeightlifting();
        const trainingTypes = {};
        
        entries.forEach(entry => {
            const type = entry.trainingType || 'straight';
            trainingTypes[type] = (trainingTypes[type] || 0) + 1;
        });
        
        // Clear existing chart
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (Object.keys(trainingTypes).length === 0) {
            ctx.fillStyle = '#64748b';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data yet', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Create simple pie chart
        const total = Object.values(trainingTypes).reduce((sum, count) => sum + count, 0);
        const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4', '#84cc16'];
        
        let currentAngle = 0;
        let colorIndex = 0;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        Object.entries(trainingTypes).forEach(([type, count]) => {
            const sliceAngle = (count / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[colorIndex % colors.length];
            ctx.fill();
            
            // Add label if slice is large enough
            if (count / total > 0.1) {
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
                const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
                
                ctx.fillStyle = 'white';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(count.toString(), labelX, labelY);
            }
            
            currentAngle += sliceAngle;
            colorIndex++;
        });
        
        // Add legend
        let legendY = 10;
        colorIndex = 0;
        ctx.textAlign = 'left';
        ctx.font = '10px sans-serif';
        
        Object.entries(trainingTypes).forEach(([type, count]) => {
            ctx.fillStyle = colors[colorIndex % colors.length];
            ctx.fillRect(10, legendY, 10, 10);
            
            ctx.fillStyle = '#333';
            ctx.fillText(`${type}: ${count}`, 25, legendY + 8);
            
            legendY += 15;
            colorIndex++;
        });
    }

    updateRecommendations(recommendations) {
        const container = document.getElementById('exercise-recommendations');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (recommendations.length === 0) {
            const noRecs = InputValidator.createSafeElement('p', {}, 
                'Great job! Keep up your current training routine.');
            container.appendChild(noRecs);
            return;
        }
        
        recommendations.forEach(rec => {
            const recItem = InputValidator.createSafeElement('div', { class: 'recommendation-item' });
            
            const priorityColors = {
                'high': '#ef4444',
                'medium': '#f59e0b',
                'low': '#10b981'
            };
            
            recItem.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600; font-size: 1rem;">${rec.title}</span>
                    <span style="
                        background: ${priorityColors[rec.priority]};
                        color: white;
                        padding: 0.2rem 0.5rem;
                        border-radius: 10px;
                        font-size: 0.7rem;
                        text-transform: uppercase;
                    ">${rec.priority}</span>
                </div>
                <p style="margin: 0 0 0.5rem 0; color: var(--text-secondary); font-size: 0.9rem;">
                    ${rec.description}
                </p>
                <div style="font-weight: 500; color: var(--primary-color);">
                    💡 ${rec.action}
                </div>
            `;
            
            container.appendChild(recItem);
        });
    }

    checkAchievements() {
        const achievements = JSON.parse(localStorage.getItem(this.achievementsKey));
        const entries = storage.getWeightlifting();
        let hasNewAchievement = false;
        
        // First workout
        if (!achievements['first-workout'].unlocked && entries.length >= 1) {
            achievements['first-workout'].unlocked = true;
            achievements['first-workout'].date = new Date().toISOString();
            hasNewAchievement = true;
            this.showAchievementNotification('🎉 First Workout Complete!', 'You\'ve logged your first exercise!');
        }
        
        // Training types variety
        const trainingTypes = new Set(entries.map(e => e.trainingType || 'straight'));
        
        if (!achievements['training-types-5'].unlocked && trainingTypes.size >= 5) {
            achievements['training-types-5'].unlocked = true;
            achievements['training-types-5'].date = new Date().toISOString();
            hasNewAchievement = true;
            this.showAchievementNotification('🎨 Technique Explorer!', 'You\'ve used 5 different training types!');
        }
        
        if (!achievements['training-types-10'].unlocked && trainingTypes.size >= 10) {
            achievements['training-types-10'].unlocked = true;
            achievements['training-types-10'].date = new Date().toISOString();
            hasNewAchievement = true;
            this.showAchievementNotification('🏆 Training Master!', 'You\'ve mastered 10 different training techniques!');
        }
        
        // Consistency achievements
        const now = new Date();
        const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const monthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const weekWorkouts = entries.filter(e => new Date(e.date) >= weekAgo).length;
        const monthWorkouts = entries.filter(e => new Date(e.date) >= monthAgo).length;
        
        if (!achievements['week-streak'].unlocked && weekWorkouts >= 3) {
            achievements['week-streak'].unlocked = true;
            achievements['week-streak'].date = new Date().toISOString();
            hasNewAchievement = true;
            this.showAchievementNotification('🔥 Week Warrior!', '3 workouts this week - you\'re on fire!');
        }
        
        if (!achievements['month-streak'].unlocked && monthWorkouts >= 12) {
            achievements['month-streak'].unlocked = true;
            achievements['month-streak'].date = new Date().toISOString();
            hasNewAchievement = true;
            this.showAchievementNotification('💪 Monthly Champion!', '12 workouts this month - incredible consistency!');
        }
        
        // Save achievements
        if (hasNewAchievement) {
            localStorage.setItem(this.achievementsKey, JSON.stringify(achievements));
            this.updateAchievementsDisplay();
        }
    }

    updateAchievementsDisplay() {
        const container = document.getElementById('achievements-list');
        if (!container) return;
        
        const achievements = JSON.parse(localStorage.getItem(this.achievementsKey));
        
        const achievementDefinitions = {
            'first-workout': { icon: '🎯', title: 'First Steps', description: 'Complete your first workout' },
            'week-streak': { icon: '🔥', title: 'Week Warrior', description: '3 workouts in one week' },
            'month-streak': { icon: '💪', title: 'Monthly Champion', description: '12 workouts in one month' },
            'training-types-5': { icon: '🎨', title: 'Technique Explorer', description: 'Use 5 different training types' },
            'training-types-10': { icon: '🏆', title: 'Training Master', description: 'Master 10 training techniques' },
            'heavy-lifter': { icon: '🏋️', title: 'Heavy Lifter', description: 'Log 50 total workouts' },
            'endurance-warrior': { icon: '⚡', title: 'Endurance Warrior', description: 'Complete 20 cardio sessions' },
            'technique-master': { icon: '🎯', title: 'Technique Master', description: 'Use advanced techniques 25 times' },
            'consistency-king': { icon: '👑', title: 'Consistency King', description: 'Workout for 30 consecutive days' },
            'progress-tracker': { icon: '📈', title: 'Progress Tracker', description: 'Log workouts for 3 months' }
        };
        
        container.innerHTML = '';
        
        Object.entries(achievementDefinitions).forEach(([key, def]) => {
            const achievement = achievements[key];
            const achievementEl = InputValidator.createSafeElement('div', { 
                class: `achievement-item ${achievement.unlocked ? 'unlocked' : ''}` 
            });
            
            achievementEl.innerHTML = `
                <span class="achievement-icon">${def.icon}</span>
                <div class="achievement-title">${def.title}</div>
                <div class="achievement-description">${def.description}</div>
                ${achievement.unlocked ? `<div style="font-size: 0.7rem; color: var(--success-color); margin-top: 0.25rem;">
                    Unlocked: ${new Date(achievement.date).toLocaleDateString()}
                </div>` : ''}
            `;
            
            container.appendChild(achievementEl);
        });
    }

    showAchievementNotification(title, description) {
        const notification = InputValidator.createSafeElement('div', {
            class: 'achievement-notification',
            style: `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 1.5rem;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
                z-index: 10000;
                max-width: 350px;
                animation: slideInRight 0.5s ease-out;
            `
        });
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 2rem;">🏆</span>
                <div>
                    <h3 style="margin: 0; font-size: 1.1rem;">${title}</h3>
                    <p style="margin: 0.25rem 0 0 0; opacity: 0.9; font-size: 0.9rem;">${description}</p>
                </div>
                <button style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    margin-left: auto;
                ">×</button>
            </div>
        `;
        
        // Add animation styles
        if (!document.getElementById('achievement-animations')) {
            const style = InputValidator.createSafeElement('style', { id: 'achievement-animations' });
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Add close functionality
        notification.querySelector('button').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Initialize progress tracker
window.progressTracker = new ProgressTracker();