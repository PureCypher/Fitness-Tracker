class StorageManager {
    constructor() {
        console.log('Initializing StorageManager');
        this.KEYS = {
            WEIGHTLIFTING: 'fitness_weightlifting',
            CARDIO: 'fitness_cardio',
            SETTINGS: 'fitness_settings',
            GOALS: 'fitness_goals',
            TROPHIES: 'fitness_trophies',
            MEALS: 'fitness_meals'
        };
        
        // Initialize storage with empty data if not exists
        if (!localStorage.getItem(this.KEYS.WEIGHTLIFTING)) {
            this.saveWeightlifting([]);
        }
        if (!localStorage.getItem(this.KEYS.CARDIO)) {
            this.saveCardio([]);
        }
        if (!localStorage.getItem(this.KEYS.SETTINGS)) {
            this.saveSettings({
                darkMode: false,
                units: 'lbs'
            });
        }
        if (!localStorage.getItem(this.KEYS.GOALS)) {
            console.log('Initializing empty goals');
            this.saveGoals({
                weekly: [],
                monthly: [],
                yearly: []
            });
        }
        if (!localStorage.getItem(this.KEYS.TROPHIES)) {
            this.saveTrophies([]);
        }
        if (!localStorage.getItem(this.KEYS.MEALS)) {
            this.saveMeals({});
        }
    }

    // Weightlifting Methods
    getWeightlifting() {
        return JSON.parse(localStorage.getItem(this.KEYS.WEIGHTLIFTING));
    }

    saveWeightlifting(data) {
        localStorage.setItem(this.KEYS.WEIGHTLIFTING, JSON.stringify(data));
    }

    addWeightliftingEntry(entry) {
        const data = this.getWeightlifting();
        entry.id = Date.now();
        // Use provided date/time or current time
        entry.date = entry.date ? new Date(entry.date).toISOString() : new Date().toISOString();
        // Ensure notes field exists
        entry.notes = entry.notes || '';
        // Initialize sets array with planned vs actual
        entry.sets = entry.sets.map((set, index) => ({
            setNumber: index + 1,
            plannedReps: set.plannedReps || 0,
            actualReps: set.actualReps || 0,
            weight: set.weight || 0
        }));
        data.push(entry);
        this.saveWeightlifting(data);
        return entry;
    }

    getWeightliftingStats(startDate, endDate) {
        const data = this.getWeightlifting();
        const filteredData = data.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
        });

        return {
            totalSets: filteredData.reduce((sum, entry) => sum + entry.sets.length, 0),
            plannedReps: filteredData.reduce((sum, entry) => 
                sum + entry.sets.reduce((setSum, set) => setSum + set.plannedReps, 0), 0),
            actualReps: filteredData.reduce((sum, entry) => 
                sum + entry.sets.reduce((setSum, set) => setSum + set.actualReps, 0), 0),
            totalWeight: filteredData.reduce((sum, entry) => 
                sum + entry.sets.reduce((setSum, set) => setSum + (set.actualReps * set.weight), 0), 0),
            exerciseCount: filteredData.length,
            exercises: this.groupByExercise(filteredData)
        };
    }

    groupByExercise(entries) {
        return entries.reduce((groups, entry) => {
            if (!groups[entry.exercise]) {
                groups[entry.exercise] = {
                    totalSets: 0,
                    plannedReps: 0,
                    actualReps: 0,
                    totalWeight: 0,
                    count: 0
                };
            }
            groups[entry.exercise].totalSets += entry.sets.length;
            groups[entry.exercise].plannedReps += entry.sets.reduce((sum, set) => sum + set.plannedReps, 0);
            groups[entry.exercise].actualReps += entry.sets.reduce((sum, set) => sum + set.actualReps, 0);
            groups[entry.exercise].totalWeight += entry.sets.reduce((sum, set) => sum + (set.actualReps * set.weight), 0);
            groups[entry.exercise].count += 1;
            return groups;
        }, {});
    }

    deleteWeightliftingEntry(id) {
        const data = this.getWeightlifting();
        const index = data.findIndex(entry => entry.id === id);
        if (index !== -1) {
            data.splice(index, 1);
            this.saveWeightlifting(data);
            return true;
        }
        return false;
    }

    // Cardio Methods
    getCardio() {
        return JSON.parse(localStorage.getItem(this.KEYS.CARDIO));
    }

    saveCardio(data) {
        localStorage.setItem(this.KEYS.CARDIO, JSON.stringify(data));
    }

    addCardioEntry(entry) {
        const data = this.getCardio();
        entry.id = Date.now();
        // Use provided date/time or current time
        entry.date = entry.date ? new Date(entry.date).toISOString() : new Date().toISOString();
        // Ensure notes field exists
        entry.notes = entry.notes || '';
        data.push(entry);
        this.saveCardio(data);
        return entry;
    }

    getCardioStats(startDate, endDate) {
        const data = this.getCardio();
        const filteredData = data.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
        });

        return {
            totalDuration: filteredData.reduce((sum, entry) => sum + entry.duration, 0),
            totalSessions: filteredData.length,
            byType: this.groupByCardioType(filteredData),
            averageHeartRate: this.calculateAverageHeartRate(filteredData)
        };
    }

    groupByCardioType(entries) {
        return entries.reduce((groups, entry) => {
            if (!groups[entry.type]) {
                groups[entry.type] = {
                    totalDuration: 0,
                    count: 0,
                    averageHeartRate: 0
                };
            }
            groups[entry.type].totalDuration += entry.duration;
            groups[entry.type].count += 1;
            if (entry.heartRate) {
                groups[entry.type].averageHeartRate = 
                    (groups[entry.type].averageHeartRate * (groups[entry.type].count - 1) + entry.heartRate) / 
                    groups[entry.type].count;
            }
            return groups;
        }, {});
    }

    calculateAverageHeartRate(entries) {
        const validEntries = entries.filter(entry => entry.heartRate);
        if (validEntries.length === 0) return 0;
        const sum = validEntries.reduce((sum, entry) => sum + entry.heartRate, 0);
        return Math.round(sum / validEntries.length);
    }

    deleteCardioEntry(id) {
        const data = this.getCardio();
        const index = data.findIndex(entry => entry.id === id);
        if (index !== -1) {
            data.splice(index, 1);
            this.saveCardio(data);
            return true;
        }
        return false;
    }

    // Settings Methods
    getSettings() {
        return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS));
    }

    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    }

    // Data Export/Import
    exportData() {
        const data = {
            weightlifting: this.getWeightlifting(),
            cardio: this.getCardio(),
            settings: this.getSettings(),
            meals: this.getMeals(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.weightlifting && data.cardio && data.settings) {
                this.saveWeightlifting(data.weightlifting);
                this.saveCardio(data.cardio);
                this.saveSettings(data.settings);
                if (data.meals) {
                    this.saveMeals(data.meals);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }

    // Goals Methods
    getGoals() {
        console.log('Getting goals from storage');
        const goals = JSON.parse(localStorage.getItem(this.KEYS.GOALS));
        console.log('Retrieved goals:', goals);
        return goals;
    }

    saveGoals(goals) {
        console.log('Saving goals to storage:', goals);
        localStorage.setItem(this.KEYS.GOALS, JSON.stringify(goals));
    }

    addGoal(duration, goal) {
        console.log('Adding new goal:', { duration, goal });
        if (!['weekly', 'monthly', 'yearly'].includes(duration)) {
            throw new Error('Invalid goal duration');
        }
        
        const goals = this.getGoals();
        console.log('Current goals:', goals);
        
        const newGoal = {
            id: Date.now(),
            type: goal.type,
            target: goal.target,
            progress: 0,
            unit: goal.unit,
            createdAt: new Date().toISOString(),
            completed: false
        };
        console.log('Created new goal object:', newGoal);
        
        goals[duration].push(newGoal);
        this.saveGoals(goals);
        console.log('Updated goals in storage:', this.getGoals());
        return newGoal;
    }

    updateGoalProgress(duration, goalId, newProgress) {
        const goals = this.getGoals();
        const goal = goals[duration].find(g => g.id === goalId);
        
        if (goal) {
            goal.progress = newProgress;
            // Only award trophy if actual progress meets or exceeds target
            if (goal.progress >= goal.target && !goal.completed) {
                goal.completed = true;
                goal.completedAt = new Date().toISOString();
                this.awardTrophy({
                    ...goal,
                    duration: duration
                });
            } else if (goal.progress < goal.target && goal.completed) {
                // Remove completed status if progress falls below target
                goal.completed = false;
                goal.completedAt = null;
            }
            this.saveGoals(goals);
            return true;
        }
        return false;
    }

    deleteGoal(duration, goalId) {
        const goals = this.getGoals();
        const index = goals[duration].findIndex(g => g.id === goalId);
        
        if (index !== -1) {
            goals[duration].splice(index, 1);
            this.saveGoals(goals);
            return true;
        }
        return false;
    }

    resetGoals(duration) {
        const goals = this.getGoals();
        if (duration) {
            goals[duration] = [];
        } else {
            goals.weekly = [];
            goals.monthly = [];
            goals.yearly = [];
        }
        this.saveGoals(goals);
    }

    // Trophy Methods
    getTrophies() {
        return JSON.parse(localStorage.getItem(this.KEYS.TROPHIES));
    }

    saveTrophies(trophies) {
        localStorage.setItem(this.KEYS.TROPHIES, JSON.stringify(trophies));
    }

    awardTrophy(goal) {
        const trophies = this.getTrophies();
        const trophy = {
            id: Date.now(),
            goalId: goal.id,
            type: goal.type,
            duration: goal.duration,
            target: goal.target,
            awardedAt: new Date().toISOString(),
            description: `${goal.type === 'weightlifting' ? 'Lifted' : 'Completed'} ${goal.target} ${goal.unit} in ${goal.duration}`
        };
        trophies.push(trophy);
        this.saveTrophies(trophies);
        return trophy;
    }

    // Goal Progress Calculation
    calculateGoalProgress(duration, goal) {
        const now = new Date();
        let stats;
        
        // Determine date range based on goal duration
        let endDate = new Date(now);
        let startDate = new Date(now);
        switch (duration) {
            case 'weekly':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'monthly':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'yearly':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }

        if (goal.type === 'weightlifting') {
            stats = this.getWeightliftingStats(startDate, endDate);
            const progress = stats.totalWeight;
            // Update actual progress value instead of percentage
            goal.progress = progress;
            return progress;
        } else if (goal.type === 'cardio') {
            stats = this.getCardioStats(startDate, endDate);
            const progress = stats.totalDuration;
            // Update actual progress value instead of percentage
            goal.progress = progress;
            return progress;
        }
        return 0;
    }

    updateAllGoalsProgress() {
        console.log('Updating all goals progress');
        const goals = this.getGoals();
        ['weekly', 'monthly', 'yearly'].forEach(duration => {
            goals[duration].forEach(goal => {
                const progress = this.calculateGoalProgress(duration, goal);
                this.updateGoalProgress(duration, goal.id, progress);
            });
        });
    }

    // Clear All Data
    clearAllData() {
        localStorage.removeItem(this.KEYS.WEIGHTLIFTING);
        localStorage.removeItem(this.KEYS.CARDIO);
        localStorage.removeItem(this.KEYS.SETTINGS);
        localStorage.removeItem(this.KEYS.GOALS);
        localStorage.removeItem(this.KEYS.TROPHIES);
        localStorage.removeItem(this.KEYS.MEALS);
        // Reinitialize with empty data
        this.constructor();
    }

    // Get Today's Summary
    getTodaySummary() {
        const today = new Date().toISOString().split('T')[0];
        
        const weightlifting = this.getWeightlifting().filter(entry => 
            entry.date.startsWith(today)
        );
        
        const cardio = this.getCardio().filter(entry =>
            entry.date.startsWith(today)
        );

        const todaysMeals = this.getMealsByDate(today);

        return {
            weightlifting: {
                totalSets: weightlifting.reduce((sum, entry) => sum + entry.sets.length, 0),
                plannedReps: weightlifting.reduce((sum, entry) => 
                    sum + entry.sets.reduce((setSum, set) => setSum + set.plannedReps, 0), 0),
                actualReps: weightlifting.reduce((sum, entry) => 
                    sum + entry.sets.reduce((setSum, set) => setSum + set.actualReps, 0), 0),
                totalWeight: weightlifting.reduce((sum, entry) => 
                    sum + entry.sets.reduce((setSum, set) => setSum + (set.actualReps * set.weight), 0), 0)
            },
            cardio: {
                totalDuration: cardio.reduce((sum, entry) => sum + entry.duration, 0),
                totalSessions: cardio.length
            },
            meals: {
                totalCalories: todaysMeals.totalCalories,
                totalMeals: todaysMeals.meals.length
            }
        };
    }

    // Meal Tracking Methods
    getMeals() {
        return JSON.parse(localStorage.getItem(this.KEYS.MEALS));
    }

    saveMeals(data) {
        localStorage.setItem(this.KEYS.MEALS, JSON.stringify(data));
    }

    addMeal(meal) {
        const meals = this.getMeals();
        const date = new Date().toISOString().split('T')[0];
        
        if (!meals[date]) {
            meals[date] = {
                meals: [],
                totalCalories: 0
            };
        }

        const newMeal = {
            id: Date.now(),
            ...meal,
            timestamp: new Date().toISOString()
        };

        meals[date].meals.push(newMeal);
        meals[date].totalCalories = meals[date].meals.reduce((sum, m) => sum + m.calories, 0);
        
        this.saveMeals(meals);
        return newMeal;
    }

    getMealsByDate(date) {
        const meals = this.getMeals();
        return meals[date] || { meals: [], totalCalories: 0 };
    }

    deleteMeal(date, mealId) {
        const meals = this.getMeals();
        if (!meals[date]) return false;

        const index = meals[date].meals.findIndex(m => m.id === mealId);
        if (index === -1) return false;

        meals[date].meals.splice(index, 1);
        meals[date].totalCalories = meals[date].meals.reduce((sum, m) => sum + m.calories, 0);
        
        this.saveMeals(meals);
        return true;
    }

    updateMeal(date, mealId, updatedMeal) {
        const meals = this.getMeals();
        if (!meals[date]) return false;

        const index = meals[date].meals.findIndex(m => m.id === mealId);
        if (index === -1) return false;

        meals[date].meals[index] = {
            ...meals[date].meals[index],
            ...updatedMeal,
            id: mealId
        };
        
        meals[date].totalCalories = meals[date].meals.reduce((sum, m) => sum + m.calories, 0);
        
        this.saveMeals(meals);
        return true;
    }
}

// Create a global instance
const storage = new StorageManager();
