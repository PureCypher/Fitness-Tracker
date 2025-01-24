// Storage Manager for handling all data persistence
class StorageManager {
    constructor() {
        // Initialize storage keys
        this.KEYS = {
            WEIGHTLIFTING: 'fitness_weightlifting',
            CARDIO: 'fitness_cardio',
            SETTINGS: 'fitness_settings',
            GOALS: 'fitness_goals',
            TROPHIES: 'fitness_trophies',
            MEALS: 'fitness_meals',
            WATER_INTAKE: 'fitness_water_intake',
            WATER_SETTINGS: 'fitness_water_settings',
            WATER_HISTORY: 'fitness_water_history',
            WEIGHT_LOGS: 'fitness_weight_logs'
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
        if (!localStorage.getItem(this.KEYS.WATER_INTAKE)) {
            this.saveWaterIntake(0);
        }
        if (!localStorage.getItem(this.KEYS.WATER_SETTINGS)) {
            this.saveWaterSettings({
                weight: 0,
                weightUnit: 'kg',
                age: 0,
                activityLevel: 'low',
                climate: 'normal'
            });
        }
        if (!localStorage.getItem(this.KEYS.WATER_HISTORY)) {
            this.saveWaterHistory({});
        }
        if (!localStorage.getItem(this.KEYS.WEIGHT_LOGS)) {
            this.saveWeightLogs([]);
        }
    }

    // [Previous methods remain unchanged...]
    getWeightlifting() {
        return JSON.parse(localStorage.getItem(this.KEYS.WEIGHTLIFTING));
    }

    saveWeightlifting(data) {
        localStorage.setItem(this.KEYS.WEIGHTLIFTING, JSON.stringify(data));
    }

    addWeightliftingEntry(entry) {
        const data = this.getWeightlifting();
        entry.id = Date.now();
        entry.date = entry.date ? new Date(entry.date).toISOString() : new Date().toISOString();
        entry.notes = entry.notes || '';
        entry.sets = entry.sets.map((set, index) => {
            // Ensure we preserve the unit from the input
            const unit = set.unit || storage.getSettings().units;
            return {
                id: `${entry.id}-${index}`,
                setNumber: index + 1,
                plannedReps: set.plannedReps || 0,
                actualReps: set.actualReps || 0,
                weight: set.weight || 0,
                unit: unit,
                exerciseName: entry.exercise
            };
        });
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
            totalWeight: filteredData.reduce((sum, entry) => {
                const settings = this.getSettings();
                const setWeight = entry.sets.reduce((setSum, set) => {
                    // First convert the weight to the display unit
                    const weightInDisplayUnit = settings.units === set.unit ? 
                        set.weight : 
                        (settings.units === 'kg' ? WeightConverter.lbsToKg(set.weight) : WeightConverter.kgToLbs(set.weight));
                    // Then multiply by reps to get total weight lifted
                    return setSum + (weightInDisplayUnit * set.actualReps);
                }, 0);
                return sum + setWeight;
            }, 0),
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
            groups[entry.exercise].totalWeight += entry.sets.reduce((sum, set) => {
                const settings = this.getSettings();
                // First convert the weight to the display unit
                const weightInDisplayUnit = settings.units === set.unit ? 
                    set.weight : 
                    (settings.units === 'kg' ? WeightConverter.lbsToKg(set.weight) : WeightConverter.kgToLbs(set.weight));
                // Then multiply by reps to get total weight lifted
                return sum + (weightInDisplayUnit * set.actualReps);
            }, 0);
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
        return JSON.parse(localStorage.getItem(this.KEYS.CARDIO)) || [];
    }

    saveCardio(data) {
        localStorage.setItem(this.KEYS.CARDIO, JSON.stringify(data));
    }

    addCardioEntry(entry) {
        const data = this.getCardio();
        entry.id = Date.now();
        entry.date = entry.date ? new Date(entry.date).toISOString() : new Date().toISOString();
        entry.notes = entry.notes || '';
        data.push(entry);
        this.saveCardio(data);
        return entry;
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
        return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || {
            darkMode: false,
            units: 'lbs'
        };
    }

    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    }

    // Goals Methods
    getGoals() {
        return JSON.parse(localStorage.getItem(this.KEYS.GOALS)) || {
            weekly: [],
            monthly: [],
            yearly: []
        };
    }

    saveGoals(goals) {
        localStorage.setItem(this.KEYS.GOALS, JSON.stringify(goals));
    }

    addGoal(duration, goal) {
        const goals = this.getGoals();
        if (!goals[duration]) {
            throw new Error(`Invalid duration: ${duration}`);
        }
        
        // Initialize the goal with required properties
        goal.id = Date.now();
        goal.progress = 0;
        goal.completed = false;
        
        goals[duration].push(goal);
        this.saveGoals(goals);
        return goal;
    }

    deleteGoal(duration, goalId) {
        const goals = this.getGoals();
        if (!goals[duration]) {
            throw new Error(`Invalid duration: ${duration}`);
        }
        
        const index = goals[duration].findIndex(g => g.id === goalId);
        if (index !== -1) {
            goals[duration].splice(index, 1);
            this.saveGoals(goals);
            return true;
        }
        return false;
    }

    updateAllGoalsProgress() {
        const goals = this.getGoals();
        const now = new Date();

        ['weekly', 'monthly', 'yearly'].forEach(duration => {
            goals[duration].forEach(goal => {
                let startDate;
                // Set start date based on duration
                switch (duration) {
                    case 'weekly':
                        startDate = new Date(now);
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case 'monthly':
                        startDate = new Date(now);
                        startDate.setMonth(now.getMonth() - 1);
                        break;
                    case 'yearly':
                        startDate = new Date(now);
                        startDate.setFullYear(now.getFullYear() - 1);
                        break;
                }

                // Calculate progress based on goal type
                if (goal.type === 'weightlifting') {
                    const stats = this.getWeightliftingStats(startDate, now);
                    const settings = this.getSettings();
                    // Convert totalWeight to kg if needed
                    goal.progress = settings.units === 'kg' ? stats.totalWeight / 2.20462 : stats.totalWeight;
                } else if (goal.type === 'cardio') {
                    const cardioData = this.getCardio().filter(entry => {
                        const entryDate = new Date(entry.date);
                        return entryDate >= startDate && entryDate <= now;
                    });
                    goal.progress = cardioData.reduce((sum, entry) => sum + entry.duration, 0);
                }

                // Check if goal is completed
                if (goal.progress >= goal.target && !goal.completed) {
                    goal.completed = true;
                    // Add trophy when goal is completed
                    const trophy = {
                        id: Date.now(),
                        duration: duration,
                        description: `Completed ${goal.type} goal of ${goal.target} ${goal.unit}`,
                        awardedAt: new Date().toISOString()
                    };
                    const trophies = this.getTrophies();
                    trophies.push(trophy);
                    this.saveTrophies(trophies);
                }
            });
        });

        this.saveGoals(goals);
    }

    // Trophies Methods
    getTrophies() {
        return JSON.parse(localStorage.getItem(this.KEYS.TROPHIES)) || [];
    }

    saveTrophies(trophies) {
        localStorage.setItem(this.KEYS.TROPHIES, JSON.stringify(trophies));
    }

    // Meals Methods
    getMeals() {
        return JSON.parse(localStorage.getItem(this.KEYS.MEALS)) || {};
    }

    saveMeals(meals) {
        localStorage.setItem(this.KEYS.MEALS, JSON.stringify(meals));
    }

    getMealsByDate(date) {
        const meals = this.getMeals();
        const dayMeals = meals[date] || [];
        return {
            meals: dayMeals,
            totalCalories: dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
        };
    }

    getTodaySummary() {
        const today = new Date().toISOString().split('T')[0];
        
        // Get weightlifting summary
        const allData = this.getWeightlifting();
        
        const weightliftingData = allData.filter(entry => {
            const entryDate = new Date(entry.date).toISOString().split('T')[0];
            return entryDate === today;
        });
        const weightlifting = {
            totalSets: weightliftingData.reduce((sum, entry) => sum + entry.sets.length, 0),
            plannedReps: weightliftingData.reduce((sum, entry) => 
                sum + entry.sets.reduce((setSum, set) => setSum + set.plannedReps, 0), 0),
            actualReps: weightliftingData.reduce((sum, entry) => 
                sum + entry.sets.reduce((setSum, set) => setSum + set.actualReps, 0), 0),
            totalWeight: weightliftingData.reduce((sum, entry) => {
                const settings = this.getSettings();
                const setWeight = entry.sets.reduce((setSum, set) => {
                    // First convert the weight to the display unit
                    const weightInDisplayUnit = settings.units === set.unit ? 
                        set.weight : 
                        (settings.units === 'kg' ? WeightConverter.lbsToKg(set.weight) : WeightConverter.kgToLbs(set.weight));
                    // Then multiply by reps to get total weight lifted
                    return setSum + (weightInDisplayUnit * set.actualReps);
                }, 0);
                return sum + setWeight;
            }, 0)
        };

        // Get cardio summary
        const cardioData = this.getCardio().filter(entry => {
            const entryDate = new Date(entry.date).toISOString().split('T')[0];
            return entryDate === today;
        });
        const cardio = {
            totalDuration: cardioData.reduce((sum, entry) => sum + entry.duration, 0),
            totalSessions: cardioData.length
        };

        // Get meals summary
        const mealsData = this.getMealsByDate(today);
        const meals = {
            totalCalories: mealsData.totalCalories,
            totalMeals: mealsData.meals.length
        };

        return {
            weightlifting,
            cardio,
            meals
        };
    }


    // Water Tracking Methods
    getWaterIntake() {
        return parseFloat(localStorage.getItem(this.KEYS.WATER_INTAKE)) || 0;
    }

    saveWaterIntake(amount) {
        localStorage.setItem(this.KEYS.WATER_INTAKE, amount.toString());
    }

    getWaterSettings() {
        const settings = localStorage.getItem(this.KEYS.WATER_SETTINGS);
        return settings ? JSON.parse(settings) : {
            weight: 0,
            weightUnit: 'kg',
            age: 0,
            activityLevel: 'low',
            climate: 'normal',
            recommendedGoal: 2000
        };
    }

    saveWaterSettings(settings) {
        localStorage.setItem(this.KEYS.WATER_SETTINGS, JSON.stringify(settings));
    }

    // New Water History Methods
    getWaterHistory() {
        return JSON.parse(localStorage.getItem(this.KEYS.WATER_HISTORY)) || {};
    }

    saveWaterHistory(history) {
        localStorage.setItem(this.KEYS.WATER_HISTORY, JSON.stringify(history));
    }

    getWaterHistoryForDate(date) {
        const history = this.getWaterHistory();
        return history[date] || { intake: 0, goal: this.getWaterSettings().recommendedGoal || 2000 };
    }

    addWaterIntake(amount, unit) {
        const amountInMl = unit === 'oz' ? amount * 29.5735 : amount;
        const currentIntake = this.getWaterIntake();
        const newIntake = currentIntake + amountInMl;
        this.saveWaterIntake(newIntake);

        // Update water history
        const today = new Date().toISOString().split('T')[0];
        const history = this.getWaterHistory();
        if (!history[today]) {
            history[today] = {
                intake: 0,
                goal: this.getWaterSettings().recommendedGoal || 2000
            };
        }
        history[today].intake = newIntake;
        this.saveWaterHistory(history);

        return newIntake;
    }

    resetDailyWaterIntake() {
        this.saveWaterIntake(0);
        const today = new Date().toISOString().split('T')[0];
        const history = this.getWaterHistory();
        if (history[today]) {
            history[today].intake = 0;
            this.saveWaterHistory(history);
        }
    }

    updateWaterSettings(settings) {
        const currentSettings = this.getWaterSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        
        // Calculate and save recommended goal
        const recommendedGoal = this.calculateRecommendedWaterIntake(
            updatedSettings.weight,
            updatedSettings.weightUnit,
            updatedSettings.age,
            updatedSettings.activityLevel,
            updatedSettings.climate
        );
        updatedSettings.recommendedGoal = recommendedGoal;
        
        // Save the updated settings
        this.saveWaterSettings(updatedSettings);

        // Update today's goal in history
        const today = new Date().toISOString().split('T')[0];
        const history = this.getWaterHistory();
        if (history[today]) {
            history[today].goal = recommendedGoal;
            this.saveWaterHistory(history);
        }
        
        return updatedSettings;
    }

    calculateRecommendedWaterIntake(weight, weightUnit, age, activityLevel, climate) {
        // Convert weight to kg if needed
        const weightInKg = weightUnit === 'lbs' ? weight / 2.20462 : weight;
    
        // Base water intake: 35 ml per kg of body weight
        let recommendedIntake = weightInKg * 35;
    
        // Add activity level factor
        if (activityLevel === 'moderate') {
            recommendedIntake += 500;
        } else if (activityLevel === 'high') {
            recommendedIntake += 1000;
        }
    
        // Add climate factor
        if (climate === 'hot') {
            recommendedIntake += 500;
        }
    
        // Age adjustment (slight reduction for older adults)
        if (age > 65) {
            recommendedIntake *= 0.9;
        }
    
        return Math.round(recommendedIntake);
    }

    // Weight Tracking Methods
    getWeightLogs() {
        return JSON.parse(localStorage.getItem(this.KEYS.WEIGHT_LOGS)) || [];
    }

    saveWeightLogs(logs) {
        localStorage.setItem(this.KEYS.WEIGHT_LOGS, JSON.stringify(logs));
    }

    addWeightLog(weight, unit) {
        const logs = this.getWeightLogs();
        const date = new Date().toISOString().split('T')[0];
        
        // Check if there's already an entry for today
        const todayEntryIndex = logs.findIndex(log => log.date === date);
        const entry = { date, weight, unit };
        
        if (todayEntryIndex !== -1) {
            logs[todayEntryIndex] = entry;
        } else {
            logs.push(entry);
        }
        
        this.saveWeightLogs(logs);
        return entry;
    }

    getLatestWeight() {
        const logs = this.getWeightLogs();
        return logs.length > 0 ? logs[logs.length - 1] : null;
    }

    getWeightHistory(timeRange = '30d') {
        const logs = this.getWeightLogs();
        const settings = this.getSettings();
        const targetUnit = settings.units;
        
        // Convert all weights to the target unit
        const convertedLogs = logs.map(log => ({
            date: log.date,
            weight: log.unit !== targetUnit ? 
                (log.unit === 'lbs' ? log.weight / 2.20462 : log.weight * 2.20462) : 
                log.weight
        }));

        // Filter based on time range
        const now = new Date();
        const daysToShow = parseInt(timeRange);
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - daysToShow);

        return convertedLogs.filter(log => new Date(log.date) >= startDate);
    }

    addMeal(mealData) {
        const meals = this.getMeals();
        const today = new Date().toISOString().split('T')[0];
        
        // Initialize today's meals array if it doesn't exist
        if (!meals[today]) {
            meals[today] = [];
        }

        // Create new meal entry with ID
        const newMeal = {
            ...mealData,
            id: Date.now()
        };

        // Add meal to today's array
        meals[today].push(newMeal);
        
        // Save updated meals object
        this.saveMeals(meals);
        
        return newMeal;
    }

    updateMeal(date, mealId, mealData) {
        const meals = this.getMeals();
        
        // Check if we have meals for this date
        if (!meals[date]) {
            return false;
        }

        // Find the meal to update
        const mealIndex = meals[date].findIndex(meal => meal.id === mealId);
        if (mealIndex === -1) {
            return false;
        }

        // Update the meal while preserving its ID
        meals[date][mealIndex] = {
            ...mealData,
            id: mealId
        };

        // Save updated meals
        this.saveMeals(meals);
        return true;
    }

    deleteMeal(date, mealId) {
        const meals = this.getMeals();
        
        // Check if we have meals for this date
        if (!meals[date]) {
            return false;
        }

        // Find and remove the meal
        const mealIndex = meals[date].findIndex(meal => meal.id === mealId);
        if (mealIndex === -1) {
            return false;
        }

        meals[date].splice(mealIndex, 1);
        
        // Remove the date entry if no meals left
        if (meals[date].length === 0) {
            delete meals[date];
        }

        // Save updated meals
        this.saveMeals(meals);
        return true;
    }

    clearAllData() {
        localStorage.removeItem(this.KEYS.WEIGHTLIFTING);
        localStorage.removeItem(this.KEYS.CARDIO);
        localStorage.removeItem(this.KEYS.SETTINGS);
        localStorage.removeItem(this.KEYS.GOALS);
        localStorage.removeItem(this.KEYS.TROPHIES);
        localStorage.removeItem(this.KEYS.MEALS);
        localStorage.removeItem(this.KEYS.WATER_INTAKE);
        localStorage.removeItem(this.KEYS.WATER_SETTINGS);
        localStorage.removeItem(this.KEYS.WATER_HISTORY);
        localStorage.removeItem(this.KEYS.WEIGHT_LOGS);
        // Reinitialize with empty data
        window.storage = new StorageManager();
    }
}

// Create and export a global instance
window.storage = new StorageManager();
