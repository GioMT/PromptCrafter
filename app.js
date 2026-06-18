// Global Application State
const appState = {
  activeTab: "panel-pose",
  activePrompt: "",
  poseType: "A-pose",
  ugcContentStrategy: "",
  ugcCameraDistance: "medium",
  ugcEnvMotion: "adaptive",
  ugcModelingStrategy: ""
};

// Google Flow Omni Ingredient Sequential Reference Definitions
const GUIDES = {
  "panel-pose": [
    { title: "Whole Body Photo", ref: "input_file_0.png (Ingredient 1)" },
    { title: "Closeup Face Photo", ref: "input_file_1.png (Ingredient 2)" }
  ],
  "panel-ugc": [
    { title: "Character Pose Sheet (from Step 1)", ref: "input_file_0.png (Ingredient 1)" },
    { title: "Product Image (e.g. soap packaging)", ref: "input_file_1.png (Ingredient 2)" },
    { title: "Setting/Background Image (optional)", ref: "input_file_2.png (Ingredient 3)" }
  ],
  "panel-continuation": [
    { title: "Character Pose Sheet (from Step 1)", ref: "input_file_0.png (Ingredient 1)" },
    { title: "Product Image (e.g. soap packaging)", ref: "input_file_1.png (Ingredient 2)" },
    { title: "Final Frame of previous 10s video", ref: "input_file_2.png (Ingredient 3)" },
    { title: "Setting/Background Image (optional)", ref: "input_file_3.png (Ingredient 4)" }
  ]
};

// DOM Elements
const elements = {
  tabBtns: document.querySelectorAll('.tab-btn'),
  panels: document.querySelectorAll('.workspace-panel'),
  promptOutput: document.getElementById('prompt-output'),
  btnCopyPrompt: document.getElementById('btn-copy-prompt'),
  toast: document.getElementById('toast-notify'),
  toastText: document.getElementById('toast-text'),
  guideContainer: document.getElementById('guide-list-container'),
  
  // UGC Type Selector
  ugcTypeCards: document.querySelectorAll('.ugc-type-card'),
  groupSpokenScript: document.getElementById('group-spoken-script'),
  
  poseCharAge: document.getElementById('pose-char-age'),
  poseChipsContainer: document.getElementById('pose-chips-container'),
  poseSignatureDetail: document.getElementById('pose-signature-detail'),
  expressionChipsContainer: document.getElementById('expression-chips-container'),
  
  ugcProductDesc: document.getElementById('ugc-product-desc'),
  ugcBgDesc: document.getElementById('ugc-bg-desc'),
  ugcAction: document.getElementById('ugc-action'),
  ugcActionGroup: document.getElementById('ugc-action-group'),
  ugcExplainerFields: document.getElementById('ugc-explainer-fields'),
  ugcSpokenScript: document.getElementById('ugc-spoken-script'),
  ugcDistanceSelector: document.getElementById('ugc-distance-selector'),
  ugcEnvMotionSelector: document.getElementById('ugc-env-motion-selector'),
  ugcCameraSection: document.getElementById('ugc-camera-section'),
  ugcStrategySection: document.getElementById('ugc-modeling-strategy-section'),
  
  contPrevAction: document.getElementById('cont-prev-action'),
  contAction: document.getElementById('cont-action'),
  contSpokenScript: document.getElementById('cont-spoken-script'),
  
  // Action Buttons
  btnGeneratePose: document.getElementById('btn-generate-pose'),
  btnGenerateUgc: document.getElementById('btn-generate-ugc'),
  btnGenerateContinuation: document.getElementById('btn-generate-continuation'),
  
  // Modal Elements
  refModal: document.getElementById('ref-modal'),
  btnShowRefImg: document.getElementById('btn-show-ref-img'),
  btnCloseModal: document.getElementById('btn-close-modal')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupTabListeners();
  setupUgcTypeListeners();
  setupUgcDistanceListeners();
  setupUgcEnvMotionListeners();
  setupUgcStrategyListeners();
  setupPoseChipsListeners();
  setupPoseTypeListeners();
  setupGenerateButtons();
  setupCopyButton();
  updatePoseIngredientsGuide();
  renderIngredientGuide(appState.activeTab);
  setupModalListeners();
});

// =============================================
// POSE CHIPS & TYPE LISTENERS
// =============================================
function setupPoseChipsListeners() {
  // Listeners for Pose chips
  if (elements.poseChipsContainer) {
    elements.poseChipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.pose-chip');
      if (chip) {
        chip.classList.toggle('active');
        
        // Show/hide Signature Action Details input group based on chip selection state
        if (chip.getAttribute('data-pose') === 'Signature Action Pose') {
          const group = document.getElementById('group-signature-action');
          if (group) {
            if (chip.classList.contains('active')) {
              group.classList.remove('hidden');
            } else {
              group.classList.add('hidden');
            }
          }
          // Dynamically update sequential ingredients guide
          updatePoseIngredientsGuide();
        }
      }
    });
  }

  // Listeners for Expression chips
  if (elements.expressionChipsContainer) {
    elements.expressionChipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.pose-chip');
      if (chip) {
        chip.classList.toggle('active');
      }
    });
  }
}

function setupPoseTypeListeners() {
  const container = document.getElementById('pose-base-type-selector');
  if (!container) return;
  const cards = container.querySelectorAll('.pose-type-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      const poseType = card.getAttribute('data-type'); // "A-pose" or "T-pose"
      appState.poseType = poseType;
      updatePoseChipsLabels(poseType);
    });
  });
}

function updatePoseChipsLabels(poseType) {
  const mapping = {
    "Front View (Whole Body)": `Front View in ${poseType} (Whole Body)`,
    "Left Side Profile (Whole Body)": `Left Side Profile in ${poseType} (Whole Body)`,
    "Right Side Profile (Whole Body)": `Right Side Profile in ${poseType} (Whole Body)`,
    "Back View (Whole Body)": `Back View in ${poseType} (Whole Body)`
  };
  
  const chips = elements.poseChipsContainer.querySelectorAll('.pose-chip');
  chips.forEach(chip => {
    const originalPose = chip.getAttribute('data-pose');
    
    // Normalize clean pose
    let cleanPose = originalPose;
    cleanPose = cleanPose.replace('in A-pose ', '').replace('in T-pose ', '');
    
    if (mapping[cleanPose]) {
      const newLabel = mapping[cleanPose];
      chip.setAttribute('data-pose', newLabel);
      
      const checkmark = chip.querySelector('.checkmark');
      const spanMarkup = checkmark ? checkmark.outerHTML : '';
      chip.innerHTML = `\n                ${spanMarkup}\n                ${newLabel}\n              `;
    }
  });
}

function updatePoseIngredientsGuide() {
  const signatureChip = elements.poseChipsContainer.querySelector('[data-pose="Signature Action Pose"]');
  const hasSignatureAction = signatureChip && signatureChip.classList.contains('active');
  
  if (hasSignatureAction) {
    GUIDES["panel-pose"] = [
      { title: "Whole Body Photo", ref: "input_file_0.png (Ingredient 1)" },
      { title: "Closeup Face Photo", ref: "input_file_1.png (Ingredient 2)" },
      { title: "Signature Action Product/Prop", ref: "input_file_2.png (Ingredient 3)" }
    ];
  } else {
    GUIDES["panel-pose"] = [
      { title: "Whole Body Photo", ref: "input_file_0.png (Ingredient 1)" },
      { title: "Closeup Face Photo", ref: "input_file_1.png (Ingredient 2)" }
    ];
  }
  
  if (appState.activeTab === "panel-pose") {
    renderIngredientGuide("panel-pose");
  }
}

// =============================================
// TAB NAVIGATION
// =============================================
function setupTabListeners() {
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPanelId = btn.getAttribute('data-tab');
      
      // Update navigation active state
      elements.tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update panel visibility
      elements.panels.forEach(panel => {
        if (panel.id === targetPanelId) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
      
      appState.activeTab = targetPanelId;
      
      // Render the correct sidebar setup guide
      renderIngredientGuide(targetPanelId);
      
      // Reset output preview box on switch
      elements.promptOutput.classList.add('empty');
      elements.promptOutput.innerHTML = 'Fill in the details on the left and click "Generate" to build your Google Flow Omni prompt.';
      appState.activePrompt = "";
    });
  });
}

// =============================================
// SIDEBAR INGREDIENT GUIDE RENDERER
// =============================================
function renderIngredientGuide(tabId) {
  const steps = GUIDES[tabId] || [];
  elements.guideContainer.innerHTML = "";
  
  steps.forEach((step, idx) => {
    const card = document.createElement('div');
    card.className = "guide-step-card";
    
    // Formatting step index as 01, 02, etc.
    const stepNum = String(idx + 1).padStart(2, '0');
    
    card.innerHTML = `
      <div class="guide-step-num">${stepNum}</div>
      <div class="guide-step-info">
        <span class="guide-step-title">${step.title}</span>
        <span class="guide-step-ref">${step.ref}</span>
      </div>
    `;
    elements.guideContainer.appendChild(card);
  });
}

// =============================================
// PRESETS HELPER
// =============================================
function setPreset(inputId, text) {
  const field = document.getElementById(inputId);
  if (field) {
    field.value = text;
    showToast("Preset loaded successfully!");
  }
}

// =============================================
// UGC TYPE TOGGLE
// =============================================
function setupUgcTypeListeners() {
  elements.ugcTypeCards.forEach(card => {
    card.addEventListener('click', () => {
      elements.ugcTypeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      const selectedType = card.getAttribute('data-type');
      appState.ugcContentStrategy = selectedType;
      
      if (selectedType === 'explainer') {
        elements.groupSpokenScript.classList.remove('hidden');
        if (elements.ugcCameraSection) {
          elements.ugcCameraSection.classList.add('hidden');
        }
        if (elements.ugcStrategySection) {
          elements.ugcStrategySection.classList.add('hidden');
        }
        if (elements.ugcActionGroup) {
          elements.ugcActionGroup.classList.remove('hidden');
        }
        if (elements.ugcExplainerFields) {
          elements.ugcExplainerFields.classList.remove('hidden');
        }
      } else {
        elements.groupSpokenScript.classList.add('hidden');
        if (elements.ugcCameraSection) {
          elements.ugcCameraSection.classList.remove('hidden');
        }
        if (elements.ugcStrategySection) {
          elements.ugcStrategySection.classList.remove('hidden');
        }
        if (elements.ugcActionGroup) {
          elements.ugcActionGroup.classList.add('hidden');
        }
        if (elements.ugcExplainerFields) {
          elements.ugcExplainerFields.classList.add('hidden');
        }
      }
    });
  });
}


// =============================================
// UGC CAMERA DISTANCE TOGGLE
// =============================================
function setupUgcDistanceListeners() {
  if (elements.ugcDistanceSelector) {
    const cards = elements.ugcDistanceSelector.querySelectorAll('.pose-type-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        appState.ugcCameraDistance = card.getAttribute('data-distance');
      });
    });
  }
}

// =============================================
// UGC ENVIRONMENT MOTION TOGGLE
// =============================================
function setupUgcEnvMotionListeners() {
  if (elements.ugcEnvMotionSelector) {
    const cards = elements.ugcEnvMotionSelector.querySelectorAll('.pose-type-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        appState.ugcEnvMotion = card.getAttribute('data-motion');
      });
    });
  }
}

// =============================================
// UGC MODELING STRATEGY TOGGLE
// =============================================
function setupUgcStrategyListeners() {
  const selector = document.getElementById('ugc-strategy-selector');
  if (selector) {
    const cards = selector.querySelectorAll('.pose-type-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        appState.ugcModelingStrategy = card.getAttribute('data-strategy');
      });
    });
  }
}

// =============================================
// PROMPT GENERATION TEMPLATES
// =============================================
function setupGenerateButtons() {
  
  // Tab 1: Pose Sheet Prompt Generator
  elements.btnGeneratePose.addEventListener('click', () => {
    const age = elements.poseCharAge.value.trim();
    const selectedPoseChips = Array.from(elements.poseChipsContainer.querySelectorAll('.pose-chip.active'));
    const selectedExpressionChips = Array.from(elements.expressionChipsContainer.querySelectorAll('.pose-chip.active'));
    const signatureDetail = elements.poseSignatureDetail.value.trim();
    
    if (!age || (selectedPoseChips.length === 0 && selectedExpressionChips.length === 0)) {
      alert("Please enter the character age and select at least one pose or expression.");
      return;
    }

    const signatureChip = elements.poseChipsContainer.querySelector('[data-pose="Signature Action Pose"]');
    const hasSignatureAction = signatureChip && signatureChip.classList.contains('active');

    // Build the list of poses
    const poses = selectedPoseChips.map(chip => {
      const poseName = chip.getAttribute('data-pose');
      if (poseName === 'Signature Action Pose') {
        return `Signature Action Pose (${signatureDetail || 'holding a product @input_file_2.png'})`;
      }
      return poseName;
    }).join(', ');

    // Build the list of expressions closeups
    const expressionsList = selectedExpressionChips.map(chip => chip.getAttribute('data-expression')).join(', ');
    const expressionsSection = expressionsList ? `a set of closeup headshots expressing: ${expressionsList}` : '';

    // Join all views on the sheet
    const allViews = [poses, expressionsSection].filter(Boolean).join(', ');

    // Determine ingredients list based on signature action selection
    let ingredientsRaw = `  - Whole Body Image: reference @input_file_0.png
  - Closeup Face Image: reference @input_file_1.png`;
    let ingredientsHtml = `  - Whole Body Image: reference <span class="highlight-image">@input_file_0.png</span>
  - Closeup Face Image: reference <span class="highlight-image">@input_file_1.png</span>`;

    if (hasSignatureAction) {
      ingredientsRaw += `\n  - Signature Action Product/Prop Image: reference @input_file_2.png`;
      ingredientsHtml += `\n  - Signature Action Product/Prop Image: reference <span class="highlight-image">@input_file_2.png</span>`;
    }

    const rawPrompt = `[CHARACTER MODEL INGREDIENTS:
${ingredientsRaw}
]

Google Flow Omni Pose Reference Sheet Directive:
Generate a highly detailed, professional character pose reference sheet.
Subject: A consistent model representing the age of ${age}.

Fidelity & Natural Realism Directives:
1. Face Fidelity: The generated character sheet MUST strictly maintain and replicate the natural face structure, facial features, expressions, and details from the closeup reference photo @input_file_1.png. Do not alter, average, or change the facial structure or details.
2. Body Fidelity: The generated character sheet MUST strictly maintain and replicate the natural body structure, physical proportions, and anatomical details from the whole body reference photo @input_file_0.png.
3. Realism: The character poses must look completely natural and realistic, ensuring organic skin textures, natural hair flow, and realistic lighting.
4. Style Parameters: Clear silhouette, no shading, even lighting, sharp focus, and a clean neutral gray background.
5. Text Overlay Parameters: Overlay a text title "Character Pose & Expression Sheet" in the top-left corner of the generated image, and overlay the URL link "https://www.pramft-omni.xyz/" in the bottom-right corner of the generated image.

Layout & Presentation Directives:
1. Grid Layout: A single layout containing multiple poses in one clean grid: ${allViews}.
2. Border Separation: The whole body poses and headshot expressions should have a clean border separating all views.
3. Expression Labels: Explicitly label each headshot expression view with its corresponding emotion text (e.g., "Happy Face", "Smiling Face") printed clearly underneath the view.

Ensure identical facial features, hair volume, body proportions, and expressions across all angles. Make a cohesive character reference matrix, bright studio lighting, neutral light gray background. A neutral facial expression must remain for the whole body poses.`;

    const htmlPrompt = `[CHARACTER MODEL INGREDIENTS:
${ingredientsHtml}
]

<strong>Google Flow Omni Pose Reference Sheet Directive:</strong>
Generate a highly detailed, professional character pose reference sheet.
Subject: A consistent model representing the age of <span class="highlight-tag">${age}</span>.

<strong>Fidelity & Natural Realism Directives:</strong>
1. <strong>Face Fidelity:</strong> The generated character sheet MUST strictly maintain and replicate the natural face structure, facial features, expressions, and details from the closeup reference photo <span class="highlight-image">@input_file_1.png</span>. Do not alter, average, or change the facial structure or details.
2. <strong>Body Fidelity:</strong> The generated character sheet MUST strictly maintain and replicate the natural body structure, physical proportions, and anatomical details from the whole body reference photo <span class="highlight-image">@input_file_0.png</span>.
3. <strong>Realism:</strong> The character poses must look completely natural and realistic, ensuring organic skin textures, natural hair flow, and realistic lighting.
4. <strong>Style Parameters:</strong> Clear silhouette, no shading, even lighting, sharp focus, and a clean neutral gray background.
5. <strong>Text Overlay Parameters:</strong> Overlay a text title "Character Pose & Expression Sheet" in the top-left corner of the generated image, and overlay the URL link "https://www.pramft-omni.xyz/" in the bottom-right corner of the generated image.

Layout & Presentation Directives:
1. <strong>Grid Layout:</strong> A single layout containing multiple poses in one clean grid: <span class="highlight-tag">${allViews}</span>.
2. <strong>Border Separation:</strong> The whole body poses and headshot expressions should have a clean border separating all views.
3. <strong>Expression Labels:</strong> Explicitly label each headshot expression view with its corresponding emotion text (e.g., "Happy Face", "Smiling Face") printed clearly underneath the view.

Ensure identical facial features, hair volume, body proportions, and expressions across all angles. Make a cohesive character reference matrix, bright studio lighting, neutral light gray background. A neutral facial expression must remain for the whole body poses.`;

    renderPrompt(rawPrompt, htmlPrompt);
  });

  // Tab 2: UGC Video Prompt Generator
  elements.btnGenerateUgc.addEventListener('click', () => {
    if (!appState.ugcContentStrategy) {
      alert("Please select a UGC Content Strategy (Modeling & Posing or Product Showcase / Explainer).");
      return;
    }
    
    const isExplainer = appState.ugcContentStrategy === 'explainer';
    const script = elements.ugcSpokenScript.value.trim();

    const isFar = appState.ugcCameraDistance === 'far';
    const distanceDirective = isFar
      ? "Position the camera approximately 5 meters away from the subject so the full body from head to feet and the walking pad/prop are entirely visible within the frame. Use a wide full-body shot composition — do NOT crop or cut off the subject's feet, legs, or any part of the prop. The entire walking pad must be clearly visible on screen."
      : "Frame the subject in a standard medium shot from the waist up.";
    
    let actionText = "";
    if (!isExplainer) {
      if (!appState.ugcModelingStrategy) {
        alert("Please select a Modeling Action Strategy (Walking Pad or Walk-Away / Walk-In).");
        return;
      }
      if (appState.ugcModelingStrategy === 'walk-away-in') {
        actionText = `The video opens with the subject standing close to the camera in a confident, relaxed pose. The subject then turns and walks away from the camera, pausing at a mid-distance mark to strike 2–3 deliberate poses that clearly highlight the outfit and its silhouette. After posing, the subject turns back and walks toward the camera with a natural, confident stride, ending the clip with a close-up framing.`;
      } else {
        actionText = `The subject walks steadily on a walking pad at a natural, relaxed pace while showcasing the outfit/product. The subject maintains a gentle, confident smile and looks directly into the camera throughout the entire clip.`;
      }
    } else {
      const product = elements.ugcProductDesc.value.trim();
      const bg = elements.ugcBgDesc.value.trim();
      actionText = elements.ugcAction.value.trim();
      if (!product) {
        alert("Please enter the product details.");
        return;
      }
      if (!actionText) {
        alert("Please enter the pacing action instructions.");
        return;
      }
    }

    const isAdaptiveMotion = appState.ugcEnvMotion === 'adaptive';
    const motionDirective = isAdaptiveMotion
      ? "Animate the environment in @input_file_2.png with contextually natural, extremely subtle ambient micro-motions (e.g., gentle rustling of foliage/leaves, soft shifting of light beams and shadows, or delicate air movements) to make the background feel alive and realistic. Keep all environment movements completely secondary, low-frequency, and organic — avoid any forced warping, artificial morphing, or distraction from the main subject."
      : "The background environment should remain completely static and motionless throughout the clip.";

    const explainerMotionDirective = isAdaptiveMotion
      ? "Animate the background in @input_file_2.png with contextually natural, extremely subtle ambient micro-motions (e.g., soft shifting of window light, gentle drifting of shadows, or natural textures breathing) to ensure the setting feels alive and realistic. Keep all background movement secondary, slow, and low-frequency — avoid any forced warping, artificial morphing, or distraction from the model."
      : "The background environment should remain completely static and motionless throughout the clip.";
    
    let rawPrompt = "";
    let htmlPrompt = "";

    if (!isExplainer) {
      // Type 1: Modeling & Posing UGC (image-only ingredients)
      const modelingIngredientsRaw = `[CHARACTER REFERENCE: Use character pose sheet @input_file_0.png — strictly replicate facial structure, body proportions, hair, and skin tone.]
[OUTFIT/PRODUCT REFERENCE: The subject must be wearing the exact clothing, outfit, or accessory shown in @input_file_1.png.]
[ENVIRONMENT REFERENCE: Use the background and setting shown in @input_file_2.png as the scene environment.]`;

      const modelingIngredientsHtml = `[CHARACTER REFERENCE: Use character pose sheet <span class="highlight-image">@input_file_0.png</span> — strictly replicate facial structure, body proportions, hair, and skin tone.]
[OUTFIT/PRODUCT REFERENCE: The subject must be wearing the exact clothing, outfit, or accessory shown in <span class="highlight-image">@input_file_1.png</span>.]
[ENVIRONMENT REFERENCE: Use the background and setting shown in <span class="highlight-image">@input_file_2.png</span> as the scene environment.]`;

      rawPrompt = `${modelingIngredientsRaw}

DIRECTIVE — Google Flow Omni UGC Modeling Video (10-Second Clip):

Subject: Generate a 10-second UGC-style vertical video featuring the consistent character model from @input_file_0.png wearing the exact outfit/product shown in @input_file_1.png.

Scene: The video takes place in the environment depicted in @input_file_2.png. Match the lighting, color palette, and ambient atmosphere of the reference. ${motionDirective}

Camera: Permanent steady camera, front-facing the subject at eye level. Strictly maintain a single continuous shot with no cuts, camera panning, zoom transitions, or alternate angles for the entire 10 seconds. ${distanceDirective}

Action: ${actionText}

Audio: Casual, upbeat background music only. No spoken dialogue or voiceover.

Technical Requirements:
- Aspect ratio: Vertical 9:16 (TikTok/Reels format).
- Visual style: Mobile phone camera, organic natural lighting, photorealistic skin tones, commercial UGC aesthetic.
- Maintain 100% consistent facial features, hair volume, and body proportions with the character reference sheet throughout the clip.`;

      htmlPrompt = `${modelingIngredientsHtml}

<strong>DIRECTIVE — Google Flow Omni UGC Modeling Video (10-Second Clip):</strong>

<strong>Subject:</strong> Generate a 10-second UGC-style vertical video featuring the consistent character model from <span class="highlight-image">@input_file_0.png</span> wearing the exact outfit/product shown in <span class="highlight-image">@input_file_1.png</span>.

<strong>Scene:</strong> The video takes place in the environment depicted in <span class="highlight-image">@input_file_2.png</span>. Match the lighting, color palette, and ambient atmosphere of the reference. <span class="highlight-tag">${motionDirective}</span>

<strong>Camera:</strong> Permanent steady camera, front-facing the subject at eye level. Strictly maintain a single continuous shot with no cuts, camera panning, zoom transitions, or alternate angles for the entire 10 seconds. <span class="highlight-tag">${distanceDirective}</span>

<strong>Action:</strong> <span class="highlight-tag">${actionText}</span>

<strong>Audio:</strong> Casual, upbeat background music only. No spoken dialogue or voiceover.

<strong>Technical Requirements:</strong>
- Aspect ratio: Vertical 9:16 (TikTok/Reels format).
- Visual style: Mobile phone camera, organic natural lighting, photorealistic skin tones, commercial UGC aesthetic.
- Maintain 100% consistent facial features, hair volume, and body proportions with the character reference sheet throughout the clip.`;
    } else {
      // Type 2: Product Showcase & Explainer UGC
      const product = elements.ugcProductDesc.value.trim();
      const bg = elements.ugcBgDesc.value.trim();

      if (!script) {
        alert("Please enter the spoken script text for the Explainer type UGC prompt.");
        return;
      }

      const explainerIngredientsRaw = `[CHARACTER REFERENCE INGREDIENT: Character Pose Sheet @input_file_0.png]
[PRODUCT INGREDIENT: Product Image @input_file_1.png - described as: ${product}]
[ENVIRONMENT INGREDIENT: Background Photo @input_file_2.png - described as: ${bg || 'Bright neutral studio setting'}]`;

      const explainerIngredientsHtml = `[CHARACTER REFERENCE INGREDIENT: Character Pose Sheet <span class="highlight-image">@input_file_0.png</span>]
[PRODUCT INGREDIENT: Product Image <span class="highlight-image">@input_file_1.png</span> - described as: <span class="highlight-tag">${product}</span>]
[ENVIRONMENT INGREDIENT: Background Photo <span class="highlight-image">@input_file_2.png</span> - described as: <span class="highlight-tag">${bg || 'Bright neutral studio setting'}</span>]`;
      
      rawPrompt = `${explainerIngredientsRaw}

Google Flow Omni UGC Video Explainer Directive (10-Second Clip):
Subject: The consistent model from pose sheet @input_file_0.png is showcasing the product @input_file_1.png (${product}) directly to the camera.
Location: Background setting from @input_file_2.png (${bg || 'Bright neutral studio setting'}). ${explainerMotionDirective}
Movement/Action: ${actionText}.

[SPOKEN NARRATION AUDIO SYNC:
"${script}"
]

Camera / Style: Steady front-facing camera. Mobile phone camera, vertical 9:16, lipsync aligned with spoken script, photorealistic detail, warm skin tone lighting, TikTok product review format.`;

      htmlPrompt = `${explainerIngredientsHtml}

<strong>Google Flow Omni UGC Video Explainer Directive (10-Second Clip):</strong>
Subject: The consistent model from pose sheet <span class="highlight-image">@input_file_0.png</span> is showcasing the product <span class="highlight-image">@input_file_1.png</span> (${product}) directly to the camera.
Location: Background setting from <span class="highlight-image">@input_file_2.png</span> (${bg || 'Bright neutral studio setting'}). <span class="highlight-tag">${explainerMotionDirective}</span>
Movement/Action: <span class="highlight-tag">${actionText}</span>.

<span class="highlight-script">[SPOKEN NARRATION AUDIO SYNC:
"${script}"
]</span>

Camera / Style: Steady front-facing camera. Mobile phone camera, vertical 9:16, lipsync aligned with spoken script, photorealistic detail, warm skin tone lighting, TikTok product review format.`;
    }
    
    renderPrompt(rawPrompt, htmlPrompt);
  });

  // Tab 3: Video Continuation Prompt Generator
  elements.btnGenerateContinuation.addEventListener('click', () => {
    const prevAction = elements.contPrevAction.value.trim();
    const action = elements.contAction.value.trim();
    const script = elements.contSpokenScript.value.trim();
    
    if (!prevAction || !action) {
      alert("Please enter the previous scene state and the next scene action description.");
      return;
    }
    
    const rawPrompt = `[CHARACTER REFERENCE INGREDIENT: Character Pose Sheet @input_file_0.png]
[PRODUCT INGREDIENT: Product Image @input_file_1.png]
[TRANSITION BRIDGE INGREDIENT: Last Frame of Previous Clip @input_file_2.png]
[ENVIRONMENT INGREDIENT: Optional Setting @input_file_3.png]

Google Flow Omni Video Continuation Directive (10-Second Clip):
Generate a sequel video scene that starts EXACTLY from the visual pose, facial expressions, and product positioning of the transition bridge @input_file_2.png.
Scene Context: Resuming from previous state where: ${prevAction}.
Continuation Action/Movement: ${action}.
${script ? `\n[SPOKEN NARRATION AUDIO SYNC:\n"${script}"\n]` : '\nAudio: Background music, no speaking.'}

Maintain identical character facial structure, curly hair volume, apparel folds, product angles, background setting, and lighting intensity as shown in @input_file_2.png to ensure a seamless, fluid transition between the two video clips.`;

    const htmlPrompt = `[CHARACTER REFERENCE INGREDIENT: Character Pose Sheet <span class="highlight-image">@input_file_0.png</span>]
[PRODUCT INGREDIENT: Product Image <span class="highlight-image">@input_file_1.png</span>]
[TRANSITION BRIDGE INGREDIENT: Last Frame of Previous Clip <span class="highlight-image">@input_file_2.png</span>]
[ENVIRONMENT INGREDIENT: Optional Setting <span class="highlight-image">@input_file_3.png</span>]

<strong>Google Flow Omni Video Continuation Directive (10-Second Clip):</strong>
Generate a sequel video scene that starts EXACTLY from the visual pose, facial expressions, and product positioning of the transition bridge <span class="highlight-image">@input_file_2.png</span>.
Scene Context: Resuming from previous state where: <span class="highlight-tag">${prevAction}</span>.
Continuation Action/Movement: <span class="highlight-tag">${action}</span>.
${script ? `<span class="highlight-script">[SPOKEN NARRATION AUDIO SYNC:
"${script}"
]</span>` : 'Audio: Background music, no speaking.'}

Maintain identical character facial structure, curly hair volume, apparel folds, product angles, background setting, and lighting intensity as shown in <span class="highlight-image">@input_file_2.png</span> to ensure a seamless, fluid transition between the two video clips.`;

    renderPrompt(rawPrompt, htmlPrompt);
  });
}

function renderPrompt(rawText, htmlText) {
  appState.activePrompt = rawText;
  elements.promptOutput.classList.remove('empty');
  elements.promptOutput.innerHTML = htmlText;
  showToast("Prompt generated! Ready to copy.");
}

// =============================================
// COPY TO CLIPBOARD
// =============================================
function setupCopyButton() {
  elements.btnCopyPrompt.addEventListener('click', () => {
    if (!appState.activePrompt) {
      showToast("Generate a prompt first before copying!", "warning");
      return;
    }
    
    navigator.clipboard.writeText(appState.activePrompt).then(() => {
      // Toggle button visual state
      elements.btnCopyPrompt.classList.add('copied');
      const textSpan = elements.btnCopyPrompt.querySelector('span');
      const originalText = textSpan.innerText;
      textSpan.innerText = "Copied!";
      
      showToast("Prompt copied to clipboard!");
      
      setTimeout(() => {
        elements.btnCopyPrompt.classList.remove('copied');
        textSpan.innerText = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      showToast("Failed to copy. Please select and copy manually.", "error");
    });
  });
}

// =============================================
// TOAST NOTIFICATIONS
// =============================================
function showToast(message, type = "success") {
  elements.toastText.innerText = message;
  
  if (type === "error") {
    elements.toast.style.borderColor = "var(--error)";
  } else if (type === "warning") {
    elements.toast.style.borderColor = "var(--accent-amber)";
  } else {
    elements.toast.style.borderColor = "var(--accent-purple)";
  }
  
  elements.toast.classList.add('show');
  
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

// =============================================
// REFERENCE MODAL HANDLERS
// =============================================
function setupModalListeners() {
  if (elements.btnShowRefImg && elements.refModal) {
    elements.btnShowRefImg.addEventListener('click', (e) => {
      e.preventDefault();
      elements.refModal.classList.remove('hidden');
    });
  }

  if (elements.btnCloseModal && elements.refModal) {
    elements.btnCloseModal.addEventListener('click', () => {
      elements.refModal.classList.add('hidden');
    });
  }

  // Close modal when clicking outside the modal-card
  if (elements.refModal) {
    elements.refModal.addEventListener('click', (e) => {
      if (e.target === elements.refModal) {
        elements.refModal.classList.add('hidden');
      }
    });
  }
}
