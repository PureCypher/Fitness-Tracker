class CalendarView {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'calendar-container';
    }

    createCalendarGrid(year, month, selectedDate, workouts) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayIndex = firstDay.getDay();
        const lastDayIndex = lastDay.getDay();
        const daysInMonth = lastDay.getDate();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];

        const container = InputValidator.createSafeElement('div');

        // Create header
        const header = InputValidator.createSafeElement('div', { class: 'calendar-header' });
        const prevBtn = InputValidator.createSafeElement('button', { class: 'calendar-nav prev-month' }, '‹');
        const monthTitle = InputValidator.createSafeElement('h3', {}, `${monthNames[month]} ${year}`);
        const nextBtn = InputValidator.createSafeElement('button', { class: 'calendar-nav next-month' }, '›');
        
        header.appendChild(prevBtn);
        header.appendChild(monthTitle);
        header.appendChild(nextBtn);
        container.appendChild(header);

        // Create grid
        const grid = InputValidator.createSafeElement('div', { class: 'calendar-grid' });
        
        // Add day headers
        this.createDayHeaders().forEach(header => grid.appendChild(header));
        
        // Add empty cells before first day
        this.createEmptyCells(firstDayIndex).forEach(cell => grid.appendChild(cell));
        
        // Add month days
        this.createMonthDays(year, month, daysInMonth, selectedDate, workouts)
            .forEach(day => grid.appendChild(day));
        
        // Add empty cells after last day
        this.createEmptyCells(6 - lastDayIndex).forEach(cell => grid.appendChild(cell));
        
        container.appendChild(grid);

        // Add workout details container
        container.appendChild(InputValidator.createSafeElement('div', { class: 'workout-details' }));

        return container;
    }

    createDayHeaders() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.map(day => 
            InputValidator.createSafeElement('div', { class: 'calendar-day-header' }, day)
        );
    }

    createEmptyCells(count) {
        return Array(count).fill(null).map(() => 
            InputValidator.createSafeElement('div', { class: 'calendar-day empty' })
        );
    }

    createMonthDays(year, month, daysInMonth, selectedDate, workouts) {
        const days = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayWorkouts = workouts[dateStr] || { weightlifting: [], cardio: [], trophies: [], meals: null, water: 0 };
            
            const classes = ['calendar-day'];
            if (this.isToday(date)) classes.push('today');
            if (selectedDate === dateStr) classes.push('selected');
            
            const dayCell = InputValidator.createSafeElement('div', {
                class: classes.join(' '),
                'data-date': dateStr
            });
            
            dayCell.appendChild(InputValidator.createSafeElement('span', 
                { class: 'day-number' }, 
                day.toString()
            ));
            
            const indicators = this.createWorkoutIndicators(dayWorkouts);
            if (indicators) {
                dayCell.appendChild(indicators);
            }
            
            days.push(dayCell);
        }
        return days;
    }

    createWorkoutIndicators(workouts) {
        const container = InputValidator.createSafeElement('div');
        
        // Activity indicators
        if (workouts.weightlifting.length || workouts.cardio.length || workouts.meals?.meals.length || workouts.water?.intake > 0) {
            const indicatorsDiv = InputValidator.createSafeElement('div', { class: 'workout-indicators' });
            
            if (workouts.weightlifting.length) {
                indicatorsDiv.appendChild(InputValidator.createSafeElement('span', 
                    { class: 'indicator weightlifting' }
                ));
            }
            if (workouts.cardio.length) {
                indicatorsDiv.appendChild(InputValidator.createSafeElement('span', 
                    { class: 'indicator cardio' }
                ));
            }
            if (workouts.meals?.meals.length) {
                indicatorsDiv.appendChild(InputValidator.createSafeElement('span', 
                    { class: 'indicator meals' }
                ));
            }
            if (workouts.water?.intake > 0) {
                indicatorsDiv.appendChild(InputValidator.createSafeElement('span', 
                    { class: 'indicator water' }
                ));
            }
            container.appendChild(indicatorsDiv);
        }

        // Trophy indicator
        if (workouts.trophies?.length) {
            const trophy = workouts.trophies[0];
            container.appendChild(InputValidator.createSafeElement('div', 
                { class: `trophy-indicator ${trophy.duration}` }, 
                '🏆'
            ));
        }

        return container.children.length > 0 ? container : null;
    }

    createWorkoutDetails(date, workouts) {
        if (!workouts) return InputValidator.createSafeElement('div');

        const container = InputValidator.createSafeElement('div');
        let hasContent = false;
        
        if (workouts.trophies?.length) {
            container.appendChild(this.createTrophySection(workouts.trophies));
            hasContent = true;
        }
        
        if (workouts.weightlifting.length) {
            container.appendChild(this.createWeightliftingSection(workouts.weightlifting));
            hasContent = true;
        }
        
        if (workouts.cardio.length) {
            container.appendChild(this.createCardioSection(workouts.cardio));
            hasContent = true;
        }
        
        if (workouts.meals?.meals.length) {
            container.appendChild(this.createMealsSection(workouts.meals));
            hasContent = true;
        }

        if (workouts.water?.intake > 0) {
            const waterSection = InputValidator.createSafeElement('div', { class: 'workout-section' });
            waterSection.appendChild(InputValidator.createSafeElement('h5', {}, 'Water Intake'));
            
            const waterEntry = InputValidator.createSafeElement('div', { class: 'workout-entry' });
            
            // Add intake and goal
            const intakeDiv = InputValidator.createSafeElement('div', { class: 'water-stats' });
            intakeDiv.appendChild(InputValidator.createSafeElement('div', {}, 
                `Total Intake: ${workouts.water.intake} ml`
            ));
            intakeDiv.appendChild(InputValidator.createSafeElement('div', {}, 
                `Daily Goal: ${workouts.water.goal} ml`
            ));
            waterEntry.appendChild(intakeDiv);
            
            // Add progress bar
            const progress = (workouts.water.intake / workouts.water.goal) * 100;
            const progressBar = InputValidator.createSafeElement('div', { class: 'progress-bar' });
            const progressFill = InputValidator.createSafeElement('div', { 
                class: 'progress',
                style: `width: ${Math.min(100, progress)}%`
            });
            progressBar.appendChild(progressFill);
            waterEntry.appendChild(progressBar);
            
            // Add percentage
            waterEntry.appendChild(InputValidator.createSafeElement('div', { class: 'progress-text' }, 
                `${Math.round(progress)}% of daily goal`
            ));
            
            waterSection.appendChild(waterEntry);
            container.appendChild(waterSection);
            hasContent = true;
        }

        if (!hasContent) {
            container.appendChild(InputValidator.createSafeElement('p', 
                { class: 'no-workouts' }, 
                'No activities logged for this date'
            ));
        }

        return container;
    }

    createTrophySection(trophies) {
        const section = InputValidator.createSafeElement('div', { class: 'trophy-section' });
        section.appendChild(InputValidator.createSafeElement('h5', {}, '🏆 Achievements'));
        
        trophies.forEach(trophy => {
            const entry = InputValidator.createSafeElement('div', { class: 'trophy-entry' });
            
            const icon = InputValidator.createSafeElement('span', 
                { class: `trophy-icon ${trophy.duration}` }, 
                '🏆'
            );
            
            const details = InputValidator.createSafeElement('div', { class: 'trophy-details' });
            details.appendChild(InputValidator.createSafeElement('div', {}, trophy.description));
            
            entry.appendChild(icon);
            entry.appendChild(details);
            section.appendChild(entry);
        });
        
        return section;
    }

    createWeightliftingSection(entries) {
        const section = InputValidator.createSafeElement('div', { class: 'workout-section' });
        section.appendChild(InputValidator.createSafeElement('h5', {}, 'Weightlifting'));
        
        entries.forEach(entry => {
            section.appendChild(this.createWeightliftingEntry(entry));
        });
        
        return section;
    }

    createWeightliftingEntry(entry) {
        const totalPlannedReps = entry.sets.reduce((sum, set) => sum + set.plannedReps, 0);
        const totalActualReps = entry.sets.reduce((sum, set) => sum + set.actualReps, 0);
        const completion = ((totalActualReps / totalPlannedReps) * 100).toFixed(1);

        const container = InputValidator.createSafeElement('div', { 
            class: 'workout-entry',
            'data-id': entry.id.toString(),
            'data-type': 'weightlifting'
        });

        // Header
        const header = InputValidator.createSafeElement('div', { class: 'workout-entry-header' });
        header.appendChild(InputValidator.createSafeElement('span', 
            { class: 'exercise-name' }, 
            entry.exercise
        ));
        
        const deleteBtn = InputValidator.createSafeElement('button', { class: 'delete-btn' }, '×');
        header.appendChild(deleteBtn);
        container.appendChild(header);
        
        const storedUnit = entry.sets.length > 0 ? entry.sets[0].unit : 'kg';
        const settings = storage.getSettings();
        
        // Calculate total weight in the display unit
        const totalWeight = entry.sets.reduce((sum, set) => {
            // First convert the weight to the display unit
            const weightInDisplayUnit = settings.units === set.unit ? 
                set.weight : 
                (settings.units === 'kg' ? WeightConverter.lbsToKg(set.weight) : WeightConverter.kgToLbs(set.weight));
            // Then multiply by reps to get total weight lifted
            return sum + (weightInDisplayUnit * set.actualReps);
        }, 0);

        // Format and display weight with unit
        const weightDisplay = WeightConverter.formatWeight(totalWeight, settings.units, storedUnit);
        const [value, unit] = weightDisplay.split(' ');

        // Sets
        const setsContainer = InputValidator.createSafeElement('div', { class: 'workout-entry-sets' });
        entry.sets.forEach((set, index) => {
            const setCompletion = ((set.actualReps / set.plannedReps) * 100).toFixed(1);
            const setDiv = InputValidator.createSafeElement('div', { class: 'set-summary' });
            
            setDiv.appendChild(InputValidator.createSafeElement('span', 
                { class: 'set-number' }, 
                `Set ${index + 1}:`
            ));
            setDiv.appendChild(InputValidator.createSafeElement('span', 
                { class: 'planned' }, 
                `Planned: ${set.plannedReps} reps @ ${set.weight} ${unit}`
            ));
            setDiv.appendChild(InputValidator.createSafeElement('span', 
                { class: 'actual' }, 
                `Completed: ${set.actualReps} reps (${setCompletion}%)`
            ));
            
            setsContainer.appendChild(setDiv);
        });
        container.appendChild(setsContainer);

        // Summary
        const summary = InputValidator.createSafeElement('div', { class: 'workout-entry-summary' });
        const stats = InputValidator.createSafeElement('div', { class: 'total-stats' });
        
        stats.appendChild(InputValidator.createSafeElement('span', {}, 
            `Total Planned: ${totalPlannedReps} reps`
        ));
        stats.appendChild(InputValidator.createSafeElement('span', {}, 
            `Total Completed: ${totalActualReps} reps (${completion}%)`
        ));
        stats.appendChild(InputValidator.createSafeElement('span', {}, 
            `Total Weight: ${value} ${unit}`
        ));
        
        summary.appendChild(stats);
        container.appendChild(summary);

        // Notes
        if (entry.notes) {
            container.appendChild(InputValidator.createSafeElement('div', 
                { class: 'workout-entry-notes' }, 
                entry.notes
            ));
        }

        return container;
    }

    createCardioSection(entries) {
        const section = InputValidator.createSafeElement('div', { class: 'workout-section' });
        section.appendChild(InputValidator.createSafeElement('h5', {}, 'Cardio'));
        
        entries.forEach(entry => {
            section.appendChild(this.createCardioEntry(entry));
        });
        
        return section;
    }

    createCardioEntry(entry) {
        const container = InputValidator.createSafeElement('div', { 
            class: 'workout-entry',
            'data-id': entry.id.toString(),
            'data-type': 'cardio'
        });

        // Header
        const header = InputValidator.createSafeElement('div', { class: 'workout-entry-header' });
        header.appendChild(InputValidator.createSafeElement('span', 
            { class: 'exercise-name' }, 
            entry.type
        ));
        
        const deleteBtn = InputValidator.createSafeElement('button', { class: 'delete-btn' }, '×');
        header.appendChild(deleteBtn);
        container.appendChild(header);

        // Details
        const details = InputValidator.createSafeElement('div', { class: 'workout-entry-details' });
        details.appendChild(InputValidator.createSafeElement('span', {}, 
            `${entry.duration} minutes${entry.heartRate ? ` | Heart Rate: ${entry.heartRate} bpm` : ''}`
        ));
        container.appendChild(details);

        // Notes
        if (entry.notes) {
            container.appendChild(InputValidator.createSafeElement('div', 
                { class: 'workout-entry-notes' }, 
                entry.notes
            ));
        }

        return container;
    }

    createMealsSection(mealsData) {
        const section = InputValidator.createSafeElement('div', { class: 'workout-section' });
        section.appendChild(InputValidator.createSafeElement('h5', {}, 'Meals'));
        
        section.appendChild(InputValidator.createSafeElement('div', 
            { class: 'total-calories' }, 
            `Total Calories: ${mealsData.totalCalories} kcal`
        ));
        
        mealsData.meals.forEach(meal => {
            section.appendChild(this.createMealEntry(meal));
        });
        
        return section;
    }

    createMealEntry(meal) {
        const container = InputValidator.createSafeElement('div', { 
            class: 'workout-entry',
            'data-id': meal.id.toString(),
            'data-type': 'meal'
        });

        // Header
        const header = InputValidator.createSafeElement('div', { class: 'workout-entry-header' });
        header.appendChild(InputValidator.createSafeElement('span', 
            { class: 'exercise-name' }, 
            meal.mealName
        ));
        
        const deleteBtn = InputValidator.createSafeElement('button', { class: 'delete-btn' }, '×');
        header.appendChild(deleteBtn);
        container.appendChild(header);

        // Details
        const details = InputValidator.createSafeElement('div', { class: 'workout-entry-details' });
        
        details.appendChild(InputValidator.createSafeElement('div', {}, 
            `Calories: ${meal.calories} kcal`
        ));
        details.appendChild(InputValidator.createSafeElement('div', {}, 
            `Protein: ${meal.protein}g | Carbs: ${meal.carbs}g | Fats: ${meal.fats}g`
        ));

        if (meal.recipeLink) {
            const recipeDiv = InputValidator.createSafeElement('div', { class: 'meal-recipe' });
            const link = InputValidator.createSafeElement('a', {
                href: InputValidator.validateUrl(meal.recipeLink) || '#',
                target: '_blank',
                class: 'recipe-link'
            }, 'View Recipe');
            recipeDiv.appendChild(link);
            details.appendChild(recipeDiv);
        }

        if (meal.notes) {
            details.appendChild(InputValidator.createSafeElement('div', 
                { class: 'meal-notes' }, 
                meal.notes
            ));
        }

        container.appendChild(details);
        return container;
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
}

class CalendarManager {
    constructor() {
        this.view = new CalendarView();
        this.currentDate = new Date();
        this.selectedDate = null;
        this.workoutCache = new Map();
        
        // Insert calendar after summary cards
        const summaryCards = document.querySelector('.summary-cards');
        summaryCards.parentNode.insertBefore(this.view.container, summaryCards.nextSibling);
        
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Use event delegation for better performance
        this.view.container.addEventListener('click', (e) => {
            const target = e.target;

            if (target.classList.contains('prev-month')) {
                this.previousMonth();
            } else if (target.classList.contains('next-month')) {
                this.nextMonth();
            } else if (target.classList.contains('delete-btn')) {
                this.handleDeleteClick(target);
            } else {
                const dayCell = target.closest('.calendar-day');
                if (dayCell && !dayCell.classList.contains('empty')) {
                    this.handleDateSelection(dayCell.dataset.date);
                }
            }
        });
    }

    handleDateSelection(date) {
        this.selectedDate = date;
        this.render();
    }

    async handleDeleteClick(target) {
        const entry = target.closest('.workout-entry');
        if (!entry || !confirm('Are you sure you want to delete this entry?')) return;

        const { id, type } = entry.dataset;
        const success = type === 'meal' ?
            storage.deleteMeal(this.selectedDate, parseInt(id)) :
            type === 'weightlifting' ?
                storage.deleteWeightliftingEntry(parseInt(id)) :
                storage.deleteCardioEntry(parseInt(id));

        if (success) {
            this.workoutCache.clear(); // Clear cache on data change
            this.render();
            ui.updateDashboard();
            ui.showNotification('Workout entry deleted');
        }
    }

    getWorkoutsForDate(dateStr) {
        if (!this.workoutCache.has(dateStr)) {
            // Get all data types for the date
            const weightliftingEntries = storage.getWeightlifting().filter(entry => 
                entry.date.startsWith(dateStr)
            );
            const cardioEntries = storage.getCardio().filter(entry =>
                entry.date.startsWith(dateStr)
            );
            const trophyEntries = storage.getTrophies().filter(trophy => 
                trophy.awardedAt.startsWith(dateStr)
            );
            const mealData = storage.getMealsByDate(dateStr);

            // Get water history for the date
            const waterData = storage.getWaterHistoryForDate(dateStr);

            // Combine all data into workouts object
            const workouts = {
                weightlifting: weightliftingEntries,
                cardio: cardioEntries,
                trophies: trophyEntries,
                meals: mealData,
                water: waterData
            };

            // Cache the combined data
            this.workoutCache.set(dateStr, workouts);
        }
        return this.workoutCache.get(dateStr);
    }

    getAllWorkoutsForMonth() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        
        const workouts = {};
        for (let day = 1; day <= lastDay; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            workouts[dateStr] = this.getWorkoutsForDate(dateStr);
        }
        return workouts;
    }

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const workouts = this.getAllWorkoutsForMonth();
        
        // Clear container
        this.view.container.innerHTML = '';
        
        // Create and append new calendar grid
        const grid = this.view.createCalendarGrid(year, month, this.selectedDate, workouts);
        this.view.container.appendChild(grid);

        // Add selected date details if needed
        if (this.selectedDate) {
            const detailsContainer = this.view.container.querySelector('.workout-details');
            detailsContainer.innerHTML = '';
            
            const dateHeader = InputValidator.createSafeElement('h4', {}, 
                new Date(this.selectedDate).toLocaleDateString()
            );
            detailsContainer.appendChild(dateHeader);
            
            const selectedWorkouts = this.getWorkoutsForDate(this.selectedDate);
            const details = this.view.createWorkoutDetails(this.selectedDate, selectedWorkouts);
            detailsContainer.appendChild(details);
        }
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.workoutCache.clear(); // Clear cache when changing months
        this.render();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.workoutCache.clear(); // Clear cache when changing months
        this.render();
    }

    refresh() {
        this.workoutCache.clear();
        this.render();
    }
}

// Create a global instance
const calendar = new CalendarManager();
