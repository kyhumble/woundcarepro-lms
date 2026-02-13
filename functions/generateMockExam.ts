import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Generate 100 comprehensive wound care questions
    const questions = [
      // Wound Assessment (15 questions)
      { question: "What is the primary goal of wound assessment?", options: ["To document wound size", "To establish a baseline and monitor healing progress", "To determine dressing type", "To identify infection"], correct: 1, category: "Wound Assessment", difficulty: "easy" },
      { question: "Which measurement technique is most accurate for irregular wounds?", options: ["Length x Width", "Wound tracing", "Digital planimetry", "Visual estimation"], correct: 2, category: "Wound Assessment", difficulty: "medium" },
      { question: "What does undermining indicate?", options: ["Superficial damage", "Tissue destruction beneath intact skin", "Epithelialization", "Granulation"], correct: 1, category: "Wound Assessment", difficulty: "medium" },
      { question: "The Braden Scale assesses risk for which condition?", options: ["Infection", "Pressure injuries", "Venous ulcers", "Dehiscence"], correct: 1, category: "Wound Assessment", difficulty: "easy" },
      { question: "What color indicates healthy granulation tissue?", options: ["Yellow", "Black", "Red/pink", "Gray"], correct: 2, category: "Wound Assessment", difficulty: "easy" },
      { question: "Slough tissue appears as what color?", options: ["Black", "Red", "Yellow/tan", "Pink"], correct: 2, category: "Wound Assessment", difficulty: "easy" },
      { question: "What does eschar indicate?", options: ["Healthy healing", "Necrotic tissue requiring debridement", "Infection", "Epithelialization"], correct: 1, category: "Wound Assessment", difficulty: "medium" },
      { question: "Tunneling is best measured using:", options: ["Ruler", "Wound probe", "Visual estimation", "Photography"], correct: 1, category: "Wound Assessment", difficulty: "medium" },
      { question: "What does purulent drainage indicate?", options: ["Normal healing", "Infection", "Adequate moisture", "Epithelialization"], correct: 1, category: "Wound Assessment", difficulty: "easy" },
      { question: "The Wagner Classification system is used for:", options: ["Pressure injuries", "Diabetic foot ulcers", "Venous ulcers", "Surgical wounds"], correct: 1, category: "Wound Assessment", difficulty: "medium" },
      { question: "Periwound erythema extending >2cm may indicate:", options: ["Normal inflammation", "Infection or cellulitis", "Maceration", "Moisture balance"], correct: 1, category: "Wound Assessment", difficulty: "medium" },
      { question: "Which tool measures pressure injury risk in pediatric patients?", options: ["Braden Scale", "Norton Scale", "Braden Q Scale", "Wagner Scale"], correct: 2, category: "Wound Assessment", difficulty: "hard" },
      { question: "What does bioburden mean?", options: ["Wound size", "Number of bacteria in wound", "Depth of wound", "Amount of exudate"], correct: 1, category: "Wound Assessment", difficulty: "medium" },
      { question: "Hypergranulation tissue appears as:", options: ["Flat, pink tissue", "Friable, raised tissue above skin level", "Black necrotic tissue", "Yellow slough"], correct: 1, category: "Wound Assessment", difficulty: "medium" },
      { question: "The acronym MEASURE helps assess:", options: ["Pain", "Wound characteristics", "Risk factors", "Dressing frequency"], correct: 1, category: "Wound Assessment", difficulty: "hard" },

      // Pressure Injuries (20 questions)
      { question: "Stage 1 pressure injury is characterized by:", options: ["Partial thickness skin loss", "Non-blanchable erythema", "Full thickness tissue loss", "Exposed bone"], correct: 1, category: "Pressure Injuries", difficulty: "easy" },
      { question: "Stage 2 pressure injury involves:", options: ["Intact skin", "Partial thickness skin loss", "Full thickness skin loss", "Muscle involvement"], correct: 1, category: "Pressure Injuries", difficulty: "easy" },
      { question: "Stage 3 pressure injury includes:", options: ["Superficial damage", "Partial thickness loss", "Full thickness skin loss with visible fat", "Exposed bone/tendon"], correct: 2, category: "Pressure Injuries", difficulty: "medium" },
      { question: "Stage 4 pressure injury exposes:", options: ["Dermis only", "Fat tissue", "Muscle, bone, or tendon", "Epidermis"], correct: 2, category: "Pressure Injuries", difficulty: "medium" },
      { question: "An unstageable pressure injury has:", options: ["Visible bone", "Non-blanchable erythema", "Slough or eschar obscuring depth", "Partial thickness loss"], correct: 2, category: "Pressure Injuries", difficulty: "medium" },
      { question: "Deep tissue injury appears as:", options: ["Open wound", "Purple/maroon discolored intact skin", "Yellow slough", "Pink granulation"], correct: 1, category: "Pressure Injuries", difficulty: "medium" },
      { question: "Most common location for pressure injuries in supine patients:", options: ["Heels", "Sacrum", "Elbows", "Occiput"], correct: 1, category: "Pressure Injuries", difficulty: "easy" },
      { question: "Medical device-related pressure injury is caused by:", options: ["Shear forces", "Devices used for therapeutic purposes", "Moisture", "Nutrition deficits"], correct: 1, category: "Pressure Injuries", difficulty: "easy" },
      { question: "Primary prevention strategy for pressure injuries:", options: ["Antibiotics", "Frequent repositioning and pressure redistribution", "Negative pressure therapy", "Surgical repair"], correct: 1, category: "Pressure Injuries", difficulty: "easy" },
      { question: "Shear forces occur when:", options: ["Tissue layers slide over each other", "Direct pressure is applied", "Moisture accumulates", "Infection develops"], correct: 0, category: "Pressure Injuries", difficulty: "medium" },
      { question: "Recommended repositioning frequency for high-risk patients:", options: ["Every 30 minutes", "Every 2 hours", "Every 4 hours", "Once per shift"], correct: 1, category: "Pressure Injuries", difficulty: "easy" },
      { question: "Which support surface reduces pressure injury risk?", options: ["Standard mattress", "Pressure redistribution mattress", "Folded blankets", "Donut cushions"], correct: 1, category: "Pressure Injuries", difficulty: "easy" },
      { question: "What contributes most to pressure injury development?", options: ["Age alone", "Duration and intensity of pressure", "Skin color", "Hair loss"], correct: 1, category: "Pressure Injuries", difficulty: "medium" },
      { question: "Moisture-associated skin damage differs from pressure injury by:", options: ["Being painful", "Affecting skin folds without pressure points", "Requiring surgery", "Being unstageable"], correct: 1, category: "Pressure Injuries", difficulty: "medium" },
      { question: "Kennedy Terminal Ulcer typically appears:", options: ["On heels", "As a pear-shaped sacral/coccyx wound in dying patients", "On elbows", "During surgery"], correct: 1, category: "Pressure Injuries", difficulty: "hard" },
      { question: "Once a pressure injury heals, the tissue regains what percentage of original strength?", options: ["100%", "80%", "50%", "30%"], correct: 1, category: "Pressure Injuries", difficulty: "hard" },
      { question: "Reverse staging of pressure injuries is:", options: ["Appropriate", "Not appropriate - healed wounds remain at highest stage achieved", "Required by Medicare", "Done quarterly"], correct: 1, category: "Pressure Injuries", difficulty: "medium" },
      { question: "Float heels means:", options: ["Applying lotion", "Elevating heels off bed surface completely", "Using donut cushions", "Massaging feet"], correct: 1, category: "Pressure Injuries", difficulty: "medium" },
      { question: "Capillary closing pressure is approximately:", options: ["12-32 mmHg", "50-70 mmHg", "100 mmHg", "150 mmHg"], correct: 0, category: "Pressure Injuries", difficulty: "hard" },
      { question: "Which patient position reduces sacral pressure?", options: ["Supine", "30-degree lateral tilt", "Prone", "High Fowler's"], correct: 1, category: "Pressure Injuries", difficulty: "medium" },

      // Diabetic Foot Ulcers (10 questions)
      { question: "Leading cause of diabetic foot ulcers:", options: ["Infection", "Neuropathy", "Poor hygiene", "Genetics"], correct: 1, category: "Diabetic Foot", difficulty: "easy" },
      { question: "Diabetic neuropathy affects which nerve types?", options: ["Motor only", "Sensory only", "Sensory, motor, and autonomic", "Autonomic only"], correct: 2, category: "Diabetic Foot", difficulty: "medium" },
      { question: "Wagner Grade 0 diabetic foot is:", options: ["Superficial ulcer", "No open lesion, pre-ulcerative state", "Ulcer with abscess", "Gangrene"], correct: 1, category: "Diabetic Foot", difficulty: "medium" },
      { question: "Wagner Grade 5 indicates:", options: ["Healed wound", "Superficial ulcer", "Extensive gangrene", "Callus formation"], correct: 2, category: "Diabetic Foot", difficulty: "medium" },
      { question: "Charcot foot is characterized by:", options: ["Infection", "Bone and joint destruction/deformity", "Callus only", "Arterial disease"], correct: 1, category: "Diabetic Foot", difficulty: "medium" },
      { question: "Total contact casting is used for:", options: ["Infected wounds", "Offloading neuropathic diabetic foot ulcers", "Venous ulcers", "Pressure injuries"], correct: 1, category: "Diabetic Foot", difficulty: "medium" },
      { question: "Monofilament testing assesses:", options: ["Circulation", "Protective sensation", "Infection", "Blood glucose"], correct: 1, category: "Diabetic Foot", difficulty: "easy" },
      { question: "ABI (Ankle-Brachial Index) <0.9 indicates:", options: ["Normal circulation", "Peripheral arterial disease", "Venous insufficiency", "Infection"], correct: 1, category: "Diabetic Foot", difficulty: "medium" },
      { question: "Optimal HbA1c for wound healing:", options: ["<7%", "8-10%", ">12%", "Any level"], correct: 0, category: "Diabetic Foot", difficulty: "easy" },
      { question: "Diabetic foot infections often require:", options: ["Topical antibiotics only", "Systemic antibiotics and possible surgical debridement", "No treatment", "Compression only"], correct: 1, category: "Diabetic Foot", difficulty: "medium" },

      // Venous & Arterial Ulcers (10 questions)
      { question: "Venous ulcers typically occur:", options: ["On toes", "Medial malleolus/gaiter area", "Heels", "Plantar foot"], correct: 1, category: "Vascular Ulcers", difficulty: "easy" },
      { question: "Arterial ulcers are characterized by:", options: ["Irregular borders, moderate drainage", "Punched-out appearance, minimal drainage, painful", "Flat, pink tissue", "Heavy exudate"], correct: 1, category: "Vascular Ulcers", difficulty: "medium" },
      { question: "Compression therapy is contraindicated when:", options: ["Venous disease present", "ABI <0.8 (arterial disease)", "Edema present", "Ulcer is shallow"], correct: 1, category: "Vascular Ulcers", difficulty: "medium" },
      { question: "Venous insufficiency causes ulcers due to:", options: ["Decreased arterial flow", "Venous hypertension and valve incompetence", "Infection", "Diabetes"], correct: 1, category: "Vascular Ulcers", difficulty: "medium" },
      { question: "Stasis dermatitis is associated with:", options: ["Arterial disease", "Venous disease", "Lymphedema", "Diabetes"], correct: 1, category: "Vascular Ulcers", difficulty: "easy" },
      { question: "Hemosiderin staining appears as:", options: ["White patches", "Brown discoloration", "Red inflammation", "Yellow slough"], correct: 1, category: "Vascular Ulcers", difficulty: "easy" },
      { question: "Compression therapy pressure for venous ulcers:", options: ["5-10 mmHg", "20-30 mmHg", "60-80 mmHg", "100 mmHg"], correct: 1, category: "Vascular Ulcers", difficulty: "medium" },
      { question: "Arterial revascularization may be needed when:", options: ["ABI >1.2", "ABI <0.5 with non-healing wounds", "Venous disease present", "Edema occurs"], correct: 1, category: "Vascular Ulcers", difficulty: "medium" },
      { question: "Lymphedema management includes:", options: ["Compression therapy only", "Complete decongestive therapy (CDT)", "Bed rest", "High sodium diet"], correct: 1, category: "Vascular Ulcers", difficulty: "medium" },
      { question: "Lipodermatosclerosis indicates:", options: ["Acute injury", "Chronic venous insufficiency", "Arterial disease", "Infection"], correct: 1, category: "Vascular Ulcers", difficulty: "hard" },

      // Wound Healing (10 questions)
      { question: "The inflammatory phase of wound healing lasts:", options: ["1-3 days", "3-5 days", "1-2 weeks", "4 weeks"], correct: 1, category: "Wound Healing", difficulty: "medium" },
      { question: "Proliferative phase includes:", options: ["Clot formation", "Granulation, epithelialization, contraction", "Collagen remodeling", "Inflammation"], correct: 1, category: "Wound Healing", difficulty: "medium" },
      { question: "Maturation/remodeling phase can last:", options: ["3-5 days", "1-2 weeks", "6 months to 2 years", "5 years"], correct: 2, category: "Wound Healing", difficulty: "medium" },
      { question: "Primary intention healing occurs in:", options: ["Surgical incisions approximated with sutures", "Open wounds", "Infected wounds", "Chronic wounds"], correct: 0, category: "Wound Healing", difficulty: "easy" },
      { question: "Secondary intention healing occurs when:", options: ["Edges are approximated", "Wound heals by granulation, contraction, epithelialization", "Immediate closure done", "Skin graft applied"], correct: 1, category: "Wound Healing", difficulty: "easy" },
      { question: "Tertiary intention (delayed primary closure) is used when:", options: ["Clean surgical wound", "Contaminated wound requiring initial cleansing/observation", "Chronic wound", "Minor abrasion"], correct: 1, category: "Wound Healing", difficulty: "medium" },
      { question: "Epithelialization is the process of:", options: ["Clot formation", "New skin cell migration across wound bed", "Blood vessel formation", "Collagen synthesis"], correct: 1, category: "Wound Healing", difficulty: "easy" },
      { question: "Angiogenesis means:", options: ["Infection control", "New blood vessel formation", "Scar formation", "Nerve regeneration"], correct: 1, category: "Wound Healing", difficulty: "easy" },
      { question: "Fibroblasts are responsible for:", options: ["Infection fighting", "Collagen production", "Blood clotting", "Pain sensation"], correct: 1, category: "Wound Healing", difficulty: "medium" },
      { question: "Chronic wounds are stuck in which phase?", options: ["Hemostasis", "Inflammatory", "Proliferative", "Maturation"], correct: 1, category: "Wound Healing", difficulty: "medium" },

      // Infection & Biofilm (8 questions)
      { question: "Signs of wound infection include:", options: ["Pink tissue", "Increased pain, purulent drainage, erythema, warmth", "Dry wound bed", "White epithelium"], correct: 1, category: "Infection", difficulty: "easy" },
      { question: "Biofilm is:", options: ["Slough tissue", "Community of bacteria in protective matrix", "Granulation tissue", "Eschar"], correct: 1, category: "Infection", difficulty: "medium" },
      { question: "Critical colonization means:", options: ["No bacteria", "Bacteria present without inflammation", "High bacterial burden delaying healing", "Active infection"], correct: 2, category: "Infection", difficulty: "hard" },
      { question: "Systemic antibiotics are indicated when:", options: ["All wounds", "Superficial contamination", "Deep tissue infection, cellulitis, sepsis", "Granulation present"], correct: 2, category: "Infection", difficulty: "medium" },
      { question: "Topical antimicrobials are used for:", options: ["Systemic infection", "Surface bacterial burden control", "Pain management", "Epithelialization"], correct: 1, category: "Infection", difficulty: "easy" },
      { question: "Methicillin-resistant Staphylococcus aureus (MRSA) requires:", options: ["No special precautions", "Contact precautions and appropriate antibiotics", "Airborne precautions", "Wound left open"], correct: 1, category: "Infection", difficulty: "medium" },
      { question: "Osteomyelitis is diagnosed by:", options: ["Visual inspection", "Bone biopsy/culture or MRI", "X-ray only", "Blood test only"], correct: 1, category: "Infection", difficulty: "medium" },
      { question: "Biofilm management includes:", options: ["Leaving wound alone", "Debridement, antimicrobials, moisture balance", "Dry wound care", "Antibiotics alone"], correct: 1, category: "Infection", difficulty: "medium" },

      // Debridement (7 questions)
      { question: "Sharp debridement involves:", options: ["Autolytic process", "Use of scalpel/scissors to remove tissue", "Wet-to-dry dressings", "Maggot therapy"], correct: 1, category: "Debridement", difficulty: "easy" },
      { question: "Autolytic debridement uses:", options: ["Scalpel", "Body's own enzymes and moisture", "Ultrasound", "Maggots"], correct: 1, category: "Debridement", difficulty: "easy" },
      { question: "Enzymatic debridement employs:", options: ["Surgery", "Topical enzymes like collagenase", "Water", "Pressure"], correct: 1, category: "Debridement", difficulty: "easy" },
      { question: "Mechanical debridement includes:", options: ["Sharp instruments", "Wet-to-dry, pulsed lavage, hydrotherapy", "Enzymes", "Body's processes"], correct: 1, category: "Debridement", difficulty: "medium" },
      { question: "Biological debridement uses:", options: ["Scalpel", "Maggots (larvae)", "Enzymes", "Ultrasound"], correct: 1, category: "Debridement", difficulty: "medium" },
      { question: "Contraindication to sharp debridement:", options: ["Necrotic tissue present", "Stable eschar on ischemic limb", "Slough tissue", "Hypergranulation"], correct: 1, category: "Debridement", difficulty: "medium" },
      { question: "Surgical debridement is performed by:", options: ["Nurse", "Physician or surgeon", "Patient", "Family member"], correct: 1, category: "Debridement", difficulty: "easy" },

      // Dressings & Products (10 questions)
      { question: "Hydrocolloid dressings are best for:", options: ["Heavily draining wounds", "Light to moderate exudate wounds", "Dry wounds", "Infected wounds"], correct: 1, category: "Dressings", difficulty: "medium" },
      { question: "Foam dressings manage:", options: ["No exudate", "Moderate to heavy exudate", "Dry wounds", "First-degree burns"], correct: 1, category: "Dressings", difficulty: "easy" },
      { question: "Hydrogel dressings are used for:", options: ["Heavy drainage", "Dry wounds needing moisture donation", "Infected wounds", "Granulating wounds"], correct: 1, category: "Dressings", difficulty: "easy" },
      { question: "Alginate dressings are derived from:", options: ["Petroleum", "Seaweed", "Cotton", "Synthetic polymers"], correct: 1, category: "Dressings", difficulty: "medium" },
      { question: "Silver dressings provide:", options: ["Moisture only", "Antimicrobial action", "Debridement", "Pain relief"], correct: 1, category: "Dressings", difficulty: "easy" },
      { question: "Negative pressure wound therapy (NPWT) promotes healing by:", options: ["Drying wound", "Removing exudate, promoting granulation, increasing blood flow", "Adding moisture", "Debriding only"], correct: 1, category: "Dressings", difficulty: "medium" },
      { question: "Transparent film dressings are appropriate for:", options: ["Heavy exudate", "Minimal exudate, stage 1 pressure injuries", "Deep wounds", "Infected wounds"], correct: 1, category: "Dressings", difficulty: "medium" },
      { question: "Collagen dressings support:", options: ["Infection control", "Granulation and healing in chronic wounds", "Moisture retention only", "Debridement"], correct: 1, category: "Dressings", difficulty: "medium" },
      { question: "When should dressings be changed?", options: ["Daily regardless", "Based on exudate level, manufacturer guidelines, wound condition", "Weekly only", "Never"], correct: 1, category: "Dressings", difficulty: "easy" },
      { question: "Honey dressings provide:", options: ["No benefit", "Antimicrobial and debriding properties", "Compression", "Absorption only"], correct: 1, category: "Dressings", difficulty: "medium" },

      // Nutrition & Wound Healing (5 questions)
      { question: "Protein deficiency impairs wound healing by:", options: ["No impact", "Reducing collagen synthesis and immune function", "Increasing healing speed", "Preventing infection"], correct: 1, category: "Nutrition", difficulty: "medium" },
      { question: "Recommended protein intake for wound healing:", options: ["0.5 g/kg/day", "0.8 g/kg/day", "1.25-1.5 g/kg/day", "3 g/kg/day"], correct: 2, category: "Nutrition", difficulty: "hard" },
      { question: "Vitamin C is essential for:", options: ["Blood clotting", "Collagen synthesis", "Pain control", "Infection prevention alone"], correct: 1, category: "Nutrition", difficulty: "easy" },
      { question: "Zinc deficiency affects:", options: ["Vitamin absorption only", "Epithelialization and immune function", "No wound impact", "Pain perception"], correct: 1, category: "Nutrition", difficulty: "medium" },
      { question: "Hydration status affects wound healing by:", options: ["No impact", "Influencing tissue perfusion and nutrient delivery", "Causing infection", "Delaying epithelialization"], correct: 1, category: "Nutrition", difficulty: "easy" },

      // Pain Management (3 questions)
      { question: "Wound pain assessment should occur:", options: ["Once per month", "At each dressing change and routinely", "Only if patient complains", "Never"], correct: 1, category: "Pain Management", difficulty: "easy" },
      { question: "Strategies to reduce dressing change pain include:", options: ["Rushing the procedure", "Pre-medicating, using atraumatic dressings, gentle technique", "Ignoring pain", "Using harsh cleansers"], correct: 1, category: "Pain Management", difficulty: "medium" },
      { question: "Chronic wound pain may indicate:", options: ["Normal healing", "Infection, ischemia, or dressing-related trauma", "Good progress", "Nothing"], correct: 1, category: "Pain Management", difficulty: "medium" },

      // Documentation & Legal (2 questions)
      { question: "Accurate wound documentation includes:", options: ["Size only", "Size, depth, tissue type, drainage, periwound condition, pain", "Color only", "None needed"], correct: 1, category: "Documentation", difficulty: "medium" },
      { question: "Photographs of wounds should:", options: ["Never be taken", "Include measurement tool, patient identifier, date, consistent angle", "Show patient's face", "Be taken randomly"], correct: 1, category: "Documentation", difficulty: "medium" }
    ];

    // Create the mock exam
    const mockExam = await base44.asServiceRole.entities.MockExam.create({
      title: "Comprehensive Wound Care Certification Exam",
      description: "100-question comprehensive exam covering all aspects of wound care including assessment, pressure injuries, diabetic foot care, vascular ulcers, wound healing physiology, infection control, debridement, dressings, nutrition, pain management, and documentation.",
      exam_type: "certification_prep",
      total_questions: 100,
      time_limit_minutes: 180,
      passing_score: 75,
      difficulty_level: "advanced",
      questions: questions.map((q, idx) => ({
        id: `q${idx + 1}`,
        question_text: q.question,
        question_type: "multiple_choice",
        options: q.options.map((opt, i) => ({
          id: `opt${i}`,
          text: opt,
          is_correct: i === q.correct
        })),
        category: q.category,
        difficulty: q.difficulty,
        explanation: null
      })),
      randomize_questions: true,
      show_results_immediately: true,
      certification_alignment: ["WOCN", "CWS", "CWCN"],
      status: "published"
    });

    return Response.json({ 
      success: true, 
      message: "100-question mock exam created successfully",
      exam_id: mockExam.id 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});