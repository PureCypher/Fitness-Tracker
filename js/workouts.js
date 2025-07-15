// Standardized workout categories and exercises
const WORKOUTS = {
    "Upper Body": {
        "Chest": {
            "Bench Press (Barbell)": "💪 The king of chest exercises! Lie flat on bench, grip barbell with hands shoulder-width apart. Lower bar to your chest, then press up to arm's length. Builds chest, shoulders, and triceps together.",
            "Bench Press (Dumbbell)": "🔄 Like barbell bench press but with dumbbells in each hand. Allows deeper stretch and works each arm independently. Great for fixing strength imbalances and building stability.",
            "Incline Bench Press (Barbell)": "📈 Targets your upper chest for a fuller look. Set bench to 15-30 degree angle, lie back and press barbell from upper chest. Perfect for building that 'shelf' look.",
            "Incline Bench Press (Dumbbell)": "🏔️ Dumbbell version of incline press. Sit on inclined bench, press dumbbells up from chest level. Gives better range of motion than barbell version.",
            "Decline Bench Press (Barbell)": "📉 Focuses on lower chest muscles. Lie on decline bench (head lower than feet), press barbell from lower chest. Helps build that defined lower chest line.",
            "Decline Bench Press (Dumbbell)": "⬇️ Dumbbell variation of decline press. Lie on decline bench, press dumbbells up from lower chest. Better control and range of motion than barbell.",
            "Dumbbell Flyes": "🦅 Pure chest isolation exercise. Lie on bench, hold dumbbells with slight elbow bend. Open arms wide like hugging a barrel, then bring together over chest. Excellent for chest shaping.",
            "Cable Crossovers": "✂️ Cable machine chest exercise. Stand between cable stations, grab handles, bring them together in front of your chest in an arc motion. Great for chest definition and pump.",
            "Chest Press (Machine)": "🎯 Beginner-friendly chest exercise. Sit at machine, grip handles, press forward until arms extend. Machine guides the movement, perfect for learning proper form.",
            "Dumbbell Pullover": "🌉 Unique exercise that hits chest and lats. Lie on bench, hold one dumbbell overhead with both hands. Lower behind head, then pull back over chest. Great for expanding ribcage."
        },
        "Back": {
            "Deadlift (Barbell)": "👑 The ultimate full-body strength builder! Stand with feet hip-width apart, grip barbell, keep chest up and back straight. Lift by driving through heels and hips. Works your entire backside from head to toe.",
            "Deadlift (Dumbbell)": "🔧 Beginner-friendly deadlift variation. Hold dumbbells at your sides, hinge at hips while keeping back straight. Great for learning proper hip hinge movement with lighter weight.",
            "Bent-Over Row (Barbell)": "🎣 Classic back builder. Bend at hips, keep back straight, pull barbell to lower chest/upper abs. Squeeze shoulder blades together at top. Builds thick, strong back muscles.",
            "Bent-Over Row (Dumbbell)": "🚣 Single-arm rowing motion. Place one knee and hand on bench, row dumbbell with other arm. Allows fuller range of motion and helps fix imbalances between sides.",
            "T-Bar Row": "⚓ Barbell secured at one end, other end loaded with weight. Straddle bar, pull to chest. Great for building back thickness and allows heavy weight with good control.",
            "Seated Cable Row": "🪑 Seated back exercise using cable machine. Sit at row station, pull handle to your torso while squeezing shoulder blades. Excellent for building back width and posture.",
            "Single-Arm Dumbbell Row": "1️⃣ Unilateral back exercise. One knee and hand on bench for support, row dumbbell with free arm. Perfect for correcting strength imbalances and building unilateral strength.",
            "Lat Pulldown": "⬇️ Cable machine exercise for back width. Sit at machine, pull bar down to upper chest while leaning slightly back. Great alternative to pull-ups and builds that V-taper shape.",
            "Pull-Up with Weight": "🏋️ Advanced bodyweight exercise with added weight via vest or belt. Hang from bar, pull yourself up until chin clears bar. The ultimate test of relative strength.",
            "Face Pulls": "😤 Rear delt and upper back exercise using rope attachment. Pull rope to face level, separating rope at the end. Essential for shoulder health and posture correction.",
            "Shrugs (Barbell)": "🤷 Trap-building exercise. Hold barbell, elevate shoulders straight up (not forward/back). Hold peak contraction briefly. Builds those mountain-like trap muscles.",
            "Shrugs (Dumbbell)": "💎 Dumbbell variation of shrugs. Hold dumbbells at sides, shrug shoulders up. Allows better range of motion and prevents the bar from hitting your body."
        },
        "Shoulders": {
            "Overhead Press (Barbell)": "🏗️ The foundation of shoulder strength! Stand tall, press barbell straight up from shoulder level. Keep core tight and avoid leaning back. Builds powerful, rounded shoulders.",
            "Overhead Press (Dumbbell)": "🤲 Dumbbell version of overhead press. Each arm works independently, great for fixing imbalances. Allows more natural movement pattern than barbell version.",
            "Arnold Press": "🎬 Named after Arnold Schwarzenegger! Start with dumbbells at chest (palms facing you), rotate and press up. Hits all three shoulder heads in one smooth motion.",
            "Lateral Raise": "🔄 Pure side delt isolation. Hold dumbbells at sides, raise out to shoulder height like making a 'T' shape. Essential for building that wide shoulder look.",
            "Front Raise": "⬆️ Targets front deltoids. Hold weight in front, raise straight up to shoulder height. Great for building anterior delt strength and shoulder stability.",
            "Rear Delt Flyes": "🔙 Isolation for rear delts. Bend forward, raise dumbbells out to sides with slight bend in elbows. Critical for shoulder health and posture.",
            "Upright Row": "📏 Compound exercise for traps and side delts. Pull weight up along your body to chest level, elbows leading. Great for building shoulder and trap size.",
            "Dumbbell Shrugs": "🤷‍♂️ Trap isolation exercise. Hold dumbbells, elevate shoulders straight up. Simple but effective for building those mountainous trap muscles.",
            "Dumbbell Clean and Press": "⚡ Complex power movement. Clean dumbbell from floor to shoulder, then press overhead. Builds explosive power and full-body coordination."
        },
        "Biceps": {
            "Barbell Curl": "💪 The classic bicep builder! Stand with feet shoulder-width apart, curl barbell up with palms facing up. Keep elbows at your sides and control the weight down. Pure bicep mass builder.",
            "Dumbbell Curl": "🔄 Independent arm curls with dumbbells. Each arm works separately, great for fixing imbalances. Can be done standing or seated. Allows full range of motion.",
            "Hammer Curl": "🔨 Neutral grip curl (palms facing each other). Targets brachialis and biceps differently than regular curls. Great for building arm thickness and grip strength.",
            "Preacher Curl": "🙏 Supported curl using preacher bench. Chest against pad, curl weight up from stretched position. Eliminates cheating and provides intense bicep isolation.",
            "Concentration Curl": "🧘 Seated single-arm curl with elbow braced on inner thigh. Pure isolation exercise - no momentum possible. Perfect for building that bicep peak.",
            "Cable Bicep Curl": "🔗 Cable machine curl for constant tension throughout the movement. Tension never lets up, great for building density and definition in biceps.",
            "EZ Bar Curl": "〰️ Curl using curved EZ bar for more comfortable wrist position. Easier on wrists than straight bar while still building bicep mass effectively.",
            "Spider Curl": "🕷️ Curl performed lying chest-down on incline bench. Arms hang straight down, curl weight up. Incredible bicep isolation with no body involvement."
        },
        "Triceps": {
            "Close-Grip Bench Press": "🤝 Compound movement targeting triceps. Use narrow grip on bench press (hands closer than shoulder-width). Builds tricep mass and pressing power simultaneously.",
            "Tricep Dips (Weighted)": "⬇️ Advanced bodyweight exercise with added weight via belt or vest. Lower body between parallel bars, press back up. Incredible tricep and chest developer.",
            "Overhead Tricep Extension": "☝️ Isolation exercise. Hold weight overhead with both hands, lower behind head by bending elbows, extend back up. Great for building tricep size and overhead strength.",
            "Skull Crushers": "💀 Lying tricep extension. Lie on bench, lower weight toward forehead by bending elbows, extend back up. Intense tricep isolation - handle with care!",
            "Tricep Kickbacks": "🦵 Bent-over single-arm extension. Bend forward, keep upper arm parallel to floor, extend forearm back. Great for tricep definition and rear head development.",
            "Rope Pushdowns": "🪢 Cable exercise using rope attachment. Pull rope down, separate at bottom for extra tricep contraction. Excellent for building tricep definition and strength.",
            "Dumbbell Floor Press": "🏠 Press performed lying on floor for tricep emphasis. Limited range of motion focuses work on triceps. Great for building lockout strength."
        }
    },
    "Lower Body": {
        "Quads": {
            "Squats (Barbell)": "👑 The king of all exercises! Bar on upper back, feet shoulder-width apart, squat down like sitting in a chair. Keep chest up, knees track over toes. Builds full-body strength and power.",
            "Squats (Dumbbell)": "🔩 Hold dumbbells at sides or at shoulders, perform squat motion. Great for beginners or those without a squat rack. Allows more freedom of movement.",
            "Front Squats": "🏛️ Barbell held at front of shoulders, more upright position. Targets quads more than back squats. Builds core strength and improves posture.",
            "Bulgarian Split Squats": "🇧🇬 Single-leg squat with rear foot elevated on bench. Unilateral strength builder that improves balance and fixes imbalances between legs.",
            "Lunges (Barbell)": "🚶 Walking or stationary lunges with barbell on back. Step forward into lunge, return to start. Great for functional strength and quad development.",
            "Lunges (Dumbbell)": "🏃 Lunges holding dumbbells at sides. More natural movement pattern than barbell version. Excellent for building single-leg strength and stability.",
            "Step-Ups": "📈 Step up onto platform while holding dumbbells. Focus on pushing through the heel of the elevated leg. Great for building unilateral leg strength.",
            "Leg Press": "🔧 Machine exercise. Sit in leg press machine, push weight away with feet. Allows heavy loading without balance concerns. Great for high-rep quad training.",
            "Goblet Squat": "🏆 Hold dumbbell or kettlebell at chest, perform squat. Great for learning proper squat form and building quad strength. Perfect for beginners.",
            "Hack Squat": "🔄 Machine squat variation with back supported. Allows focus on leg drive without worrying about balance. Great for isolating quads and building strength."
        },
        "Hamstrings": {
            "Romanian Deadlift (Barbell)": "🏛️ Hip hinge movement targeting hamstrings. Hold barbell, push hips back while keeping slight knee bend. Feel the stretch in your hamstrings. King of hamstring exercises!",
            "Romanian Deadlift (Dumbbell)": "🔩 Dumbbell variation of RDL. Hold dumbbells at sides, hinge at hips. Great for beginners to learn hip hinge pattern with lighter weight.",
            "Stiff-Legged Deadlift": "📏 Similar to RDL but with straighter legs throughout. Emphasizes hamstring stretch and flexibility. Great for building hamstring length and strength.",
            "Hamstring Curl": "🌙 Machine exercise. Lie face down, curl weight up with heels toward glutes. Pure hamstring isolation - great for building thickness and definition.",
            "Glute Bridge": "🌉 Lie on back, drive hips up with weight on hips. Squeeze glutes at the top. Great for building glute and hamstring strength while improving hip mobility.",
            "Hip Thrust": "⬆️ Similar to bridge but shoulders elevated on bench. Allows greater range of motion and heavier loading. The ultimate glute builder with hamstring involvement.",
            "Good Mornings": "🌅 Barbell on back, hinge forward with slight knee bend. Like bowing forward. Great for building hamstring and lower back strength together."
        },
        "Glutes": {
            "Barbell Hip Thrust": "🚀 The ultimate glute builder! Back on bench, roll barbell over hips, drive hips up high. Squeeze glutes hard at the top. Nothing builds glutes like this!",
            "Kettlebell Swings": "🏈 Dynamic hip hinge movement with kettlebell. Swing kettlebell between legs, drive hips forward explosively. Great for power and cardiovascular fitness.",
            "Dumbbell Step-Ups": "🏔️ Step onto platform focusing on glute engagement. Drive through heel of elevated leg, squeeze glute at top. Great for unilateral glute strength.",
            "Sumo Deadlift": "🤼 Wide-stance deadlift variation targeting glutes. Feet wide, toes pointed out, pull weight up. More glute and inner thigh involvement than regular deadlift.",
            "Glute Kickbacks": "🦵 Cable or machine exercise extending leg backward. Focus on squeezing glute at the end of the movement. Great for glute isolation and activation.",
            "Dumbbell Frog Pumps": "🐸 Lie on back, feet together in diamond shape, drive hips up. Unique angle targets glutes differently. Great for glute activation and pump."
        },
        "Calves": {
            "Standing Calf Raises": "🦵 Rise onto toes while standing with weight. Hold peak contraction, control the negative. Targets the larger gastrocnemius muscle for calf size.",
            "Seated Calf Raises": "🪑 Seated variation using machine or weight on knees. Knees bent targets the deeper soleus muscle. Great for building calf thickness and endurance.",
            "Donkey Calf Raises": "🐴 Bent over with weight on back, rise onto toes. Classic old-school calf builder. Allows heavy loading and great stretch at the bottom.",
            "Single-Leg Calf Raise": "1️⃣ Unilateral calf exercise for balance and strength. Work one leg at a time to fix imbalances. Can be done bodyweight or with added weight."
        }
    },
    "Core": {
        "Weighted Core": {
            "Weighted Sit-Ups": "📚 Basic sit-up holding weight plate at chest. Sit up from lying position, keeping weight close to body. Classic core builder with progressive overload.",
            "Russian Twists": "🔄 Seated twist holding weight, feet elevated. Rotate torso side to side while holding weight. Great for obliques and rotational core strength.",
            "Cable Woodchoppers": "🪓 Rotational movement using cable machine. Pull cable across body in chopping motion. Excellent for functional core strength and sports performance.",
            "Medicine Ball Slams": "💥 Explosive movement slamming ball to ground. Lift ball overhead, slam down with full force. Great for core power and stress relief!",
            "Dumbbell Side Bends": "🌛 Standing side bend holding dumbbell. Hold weight at side, bend laterally. Targets obliques but use light weight to avoid thickening waist.",
            "Hanging Leg Raises": "🦵 Hang from bar, raise legs with weight between feet. Advanced core exercise requiring grip strength too. Ultimate core challenge!",
            "Plank with Weight": "🏋️ Hold plank position with weight plate on back. Maintain straight line from head to heels. Builds incredible core stability and endurance.",
            "Weighted Decline Crunches": "📐 Crunches on decline bench holding weight. Decline angle increases difficulty, weight adds resistance. Great for upper ab development.",
            "Barbell Rollouts": "🎳 Roll barbell forward and back from knees. Keep core tight throughout movement. One of the most challenging core exercises ever!"
        }
    },
    "Full Body": {
        "Olympic Lifts": {
            "Clean and Jerk": "🏅 Olympic lift combining clean and overhead jerk. Pull bar from floor to shoulders, then explosively press overhead. The ultimate power and coordination test!",
            "Snatch": "⚡ Olympic lift, ground to overhead in one movement. Most technical lift in weightlifting. Requires incredible mobility, power, and coordination.",
            "Thrusters": "🚀 Front squat to overhead press combination. Squat down with weight at shoulders, stand up and press overhead. Great for full-body conditioning.",
            "Kettlebell Swings": "🏈 Dynamic hip hinge with kettlebell. Swing kettlebell between legs, drive hips forward explosively. Builds power, cardio, and posterior chain strength.",
            "Dumbbell Burpees": "💪 Burpee holding dumbbells throughout. Drop down, jump back, push-up, jump forward, stand with weights. Ultimate full-body challenge!",
            "Overhead Squat": "🤸 Squat while holding weight overhead. Requires incredible mobility and stability. Great for building full-body strength and flexibility.",
            "Deadlift to Press": "🔄 Combine deadlift with overhead press. Deadlift weight from floor, then press overhead. Efficient full-body strength builder.",
            "Man Makers": "🏗️ Complex combining row, pushup, and clean and press. Multiple movements in one exercise. Great for conditioning and full-body strength.",
            "Turkish Get-Up": "🇹🇷 Complex movement from floor to standing while holding weight overhead. Ancient strength exercise that builds stability, mobility, and coordination."
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

// Helper function to get full exercise info
function getExerciseInfo(exerciseName) {
    for (const category in WORKOUTS) {
        for (const subcategory in WORKOUTS[category]) {
            if (exerciseName in WORKOUTS[category][subcategory]) {
                return {
                    name: exerciseName,
                    category: category,
                    subcategory: subcategory,
                    description: WORKOUTS[category][subcategory][exerciseName]
                };
            }
        }
    }
    return null;
}

// Helper function to generate exercise tips based on category and type
function generateExerciseTips(category, subcategory, exerciseName) {
    const generalTips = [
        "Focus on proper form over heavy weight",
        "Control the negative (lowering) portion",
        "Breathe out during the exertion phase"
    ];
    
    const specificTips = {
        "Chest": [
            "Keep your shoulders retracted and down",
            "Maintain a slight arch in your lower back",
            "Don't bounce the weight off your chest"
        ],
        "Back": [
            "Keep your core engaged throughout",
            "Pull with your lats, not just your arms",
            "Squeeze your shoulder blades together"
        ],
        "Shoulders": [
            "Avoid pressing behind your neck",
            "Keep your core tight for stability",
            "Don't let your elbows flare too wide"
        ],
        "Biceps": [
            "Keep your elbows stationary at your sides",
            "Don't swing the weight up",
            "Squeeze at the top of the movement"
        ],
        "Triceps": [
            "Keep your upper arms still",
            "Don't let your elbows flare out",
            "Focus on the tricep contraction"
        ],
        "Quads": [
            "Keep your knees aligned with your toes",
            "Don't let your knees cave inward",
            "Go as deep as your mobility allows"
        ],
        "Hamstrings": [
            "Keep a slight bend in your knees",
            "Push your hips back, not down",
            "Feel the stretch in your hamstrings"
        ],
        "Glutes": [
            "Squeeze your glutes at the top",
            "Don't hyperextend your lower back",
            "Focus on hip drive, not knee drive"
        ],
        "Calves": [
            "Hold the peak contraction briefly",
            "Get a full stretch at the bottom",
            "Don't bounce at the bottom"
        ],
        "Weighted Core": [
            "Keep your lower back neutral",
            "Don't hold your breath",
            "Focus on controlled movements"
        ],
        "Olympic Lifts": [
            "Start with lighter weights to learn technique",
            "Keep the bar close to your body",
            "Focus on explosive hip extension"
        ]
    };
    
    return specificTips[subcategory] || generalTips;
}
