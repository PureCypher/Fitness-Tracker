// Standardized workout categories and exercises
const WORKOUTS = {
    "Upper Body": {
        "Chest": {
            "Bench Press (Barbell)": "Classic compound exercise targeting chest, shoulders, and triceps. Lie on bench, grip barbell, lower to chest and press up.",
            "Bench Press (Dumbbell)": "Similar to barbell bench press but with dumbbells for better range of motion and stability work.",
            "Incline Bench Press (Barbell)": "Targets upper chest. Perform on an incline bench set to 15-30 degrees.",
            "Incline Bench Press (Dumbbell)": "Dumbbell variation of incline press for improved range of motion.",
            "Decline Bench Press (Barbell)": "Emphasizes lower chest. Perform on a decline bench.",
            "Decline Bench Press (Dumbbell)": "Dumbbell variation of decline press.",
            "Dumbbell Flyes": "Isolation exercise for chest. Lie on bench, hold dumbbells with slight bend in elbows, open arms wide.",
            "Cable Crossovers": "Cable machine exercise for chest. Stand between cable stations, bring handles together in front.",
            "Chest Press (Machine)": "Machine-based chest press. Good for beginners or controlled movements.",
            "Dumbbell Pullover": "Targets chest and lats. Lie on bench, hold dumbbell overhead, lower behind head and return."
        },
        "Back": {
            "Deadlift (Barbell)": "Compound exercise targeting entire posterior chain. Lift barbell from floor with neutral spine.",
            "Deadlift (Dumbbell)": "Dumbbell variation of deadlift, good for beginners or limited equipment.",
            "Bent-Over Row (Barbell)": "Compound back exercise. Bend at hips, pull barbell to lower chest.",
            "Bent-Over Row (Dumbbell)": "Single-arm variation allowing greater range of motion.",
            "T-Bar Row": "Compound back exercise using barbell secured at one end.",
            "Seated Cable Row": "Cable machine back exercise. Sit at row station, pull handle to torso.",
            "Single-Arm Dumbbell Row": "Unilateral back exercise. One knee and hand on bench, row dumbbell.",
            "Lat Pulldown": "Cable machine exercise targeting lats. Pull bar down to upper chest.",
            "Pull-Up with Weight": "Advanced bodyweight exercise with added weight via vest or belt.",
            "Face Pulls": "Rear delt and upper back exercise using rope attachment on cable machine.",
            "Shrugs (Barbell)": "Trap exercise. Hold barbell, elevate shoulders straight up.",
            "Shrugs (Dumbbell)": "Dumbbell variation of shrugs."
        },
        "Shoulders": {
            "Overhead Press (Barbell)": "Compound shoulder exercise. Press barbell overhead from shoulders.",
            "Overhead Press (Dumbbell)": "Dumbbell variation allowing independent arm movement.",
            "Arnold Press": "Complex shoulder press rotating from neutral to external rotation.",
            "Lateral Raise": "Isolation exercise for lateral deltoids. Raise dumbbells to sides.",
            "Front Raise": "Targets anterior deltoids. Raise weight straight in front to shoulder height.",
            "Rear Delt Flyes": "Isolation for posterior deltoids. Bend forward, raise weights to sides.",
            "Upright Row": "Compound exercise for traps and deltoids. Pull weight up along body.",
            "Dumbbell Shrugs": "Trap isolation. Hold dumbbells, elevate shoulders.",
            "Dumbbell Clean and Press": "Complex movement combining clean and overhead press."
        },
        "Biceps": {
            "Barbell Curl": "Standard bicep exercise. Curl barbell with palms up.",
            "Dumbbell Curl": "Independent arm curls with dumbbells.",
            "Hammer Curl": "Neutral grip curl targeting brachialis and biceps.",
            "Preacher Curl": "Supported curl using preacher bench for strict form.",
            "Concentration Curl": "Seated single-arm curl with elbow braced on inner thigh.",
            "Cable Bicep Curl": "Cable machine curl for constant tension.",
            "EZ Bar Curl": "Curl using curved bar for more comfortable grip.",
            "Spider Curl": "Curl performed lying chest-down on incline bench."
        },
        "Triceps": {
            "Close-Grip Bench Press": "Compound movement targeting triceps. Narrow grip on bench press.",
            "Tricep Dips (Weighted)": "Advanced bodyweight exercise with added weight.",
            "Overhead Tricep Extension": "Isolation exercise. Hold weight overhead, extend arms.",
            "Skull Crushers": "Lying tricep extension. Lower weight to forehead, extend arms.",
            "Tricep Kickbacks": "Bent-over single-arm extension.",
            "Rope Pushdowns": "Cable exercise using rope attachment.",
            "Dumbbell Floor Press": "Press performed lying on floor for tricep emphasis."
        }
    },
    "Lower Body": {
        "Quads": {
            "Squats (Barbell)": "Fundamental compound exercise. Bar on upper back, squat down.",
            "Squats (Dumbbell)": "Hold dumbbells at sides or at shoulders, perform squat.",
            "Front Squats": "Barbell held at front of shoulders, more quad focus.",
            "Bulgarian Split Squats": "Single-leg squat with rear foot elevated.",
            "Lunges (Barbell)": "Walking or stationary lunges with barbell on back.",
            "Lunges (Dumbbell)": "Lunges holding dumbbells at sides.",
            "Step-Ups": "Step up onto platform while holding dumbbells.",
            "Leg Press": "Machine exercise. Push weight away using leg press sled.",
            "Goblet Squat": "Hold dumbbell or kettlebell at chest, perform squat.",
            "Hack Squat": "Machine squat variation with back supported."
        },
        "Hamstrings": {
            "Romanian Deadlift (Barbell)": "Hinge movement targeting hamstrings. Slight knee bend.",
            "Romanian Deadlift (Dumbbell)": "Dumbbell variation of RDL.",
            "Stiff-Legged Deadlift": "Similar to RDL but with straighter legs.",
            "Hamstring Curl": "Machine exercise. Curl weight using hamstrings.",
            "Glute Bridge": "Lie on back, drive hips up with weight on hips.",
            "Hip Thrust": "Similar to bridge but shoulders elevated on bench.",
            "Good Mornings": "Barbell on back, hinge forward with slight knee bend."
        },
        "Glutes": {
            "Barbell Hip Thrust": "Primary glute exercise. Back on bench, drive hips up.",
            "Kettlebell Swings": "Dynamic hip hinge movement with kettlebell.",
            "Dumbbell Step-Ups": "Step onto platform focusing on glute engagement.",
            "Sumo Deadlift": "Wide-stance deadlift variation targeting glutes.",
            "Glute Kickbacks": "Cable or machine exercise extending leg backward.",
            "Dumbbell Frog Pumps": "Lie on back, feet together, drive hips up."
        },
        "Calves": {
            "Standing Calf Raises": "Rise onto toes while standing with weight.",
            "Seated Calf Raises": "Seated variation using machine or weight on knees.",
            "Donkey Calf Raises": "Bent over with weight on back, rise onto toes.",
            "Single-Leg Calf Raise": "Unilateral calf exercise for balance and strength."
        }
    },
    "Core": {
        "Weighted Core": {
            "Weighted Sit-Ups": "Basic sit-up holding weight at chest.",
            "Russian Twists": "Seated twist holding weight, feet elevated.",
            "Cable Woodchoppers": "Rotational movement using cable machine.",
            "Medicine Ball Slams": "Explosive movement slamming ball to ground.",
            "Dumbbell Side Bends": "Standing side bend holding dumbbell.",
            "Hanging Leg Raises": "Hang from bar, raise legs with weight.",
            "Plank with Weight": "Hold plank position with weight on back.",
            "Weighted Decline Crunches": "Crunches on decline bench holding weight.",
            "Barbell Rollouts": "Roll barbell forward and back from knees."
        }
    },
    "Full Body": {
        "Olympic Lifts": {
            "Clean and Jerk": "Olympic lift combining clean and overhead jerk.",
            "Snatch": "Olympic lift, ground to overhead in one movement.",
            "Thrusters": "Front squat to overhead press combination.",
            "Kettlebell Swings": "Dynamic hip hinge with kettlebell.",
            "Dumbbell Burpees": "Burpee holding dumbbells.",
            "Overhead Squat": "Squat while holding weight overhead.",
            "Deadlift to Press": "Combine deadlift with overhead press.",
            "Man Makers": "Complex combining row, pushup, and clean and press.",
            "Turkish Get-Up": "Complex movement from floor to standing."
        }
    }
};

// Helper function to get all exercises as a flat array
function getAllExercises() {
    const exercises = [];
    for (const category in WORKOUTS) {
        for (const subcategory in WORKOUTS[category]) {
            for (const exercise in WORKOUTS[category][subcategory]) {
                exercises.push({
                    name: exercise,
                    category,
                    subcategory,
                    description: WORKOUTS[category][subcategory][exercise]
                });
            }
        }
    }
    return exercises;
}

// Helper function to get exercise description
function getExerciseDescription(exerciseName) {
    for (const category in WORKOUTS) {
        for (const subcategory in WORKOUTS[category]) {
            if (exerciseName in WORKOUTS[category][subcategory]) {
                return WORKOUTS[category][subcategory][exerciseName];
            }
        }
    }
    return null;
}
