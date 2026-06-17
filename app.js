// Global Application State
const appState = {
  activeTab: "panel-pose",
  activePrompt: "",
  poseType: "A-pose"
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
  ugcSpokenScript: document.getElementById('ugc-spoken-script'),
  
  contPrevAction: document.getElementById('cont-prev-action'),
  contAction: document.getElementById('cont-action'),
  contSpokenScript: document.getElementById('cont-spoken-script'),
  
  // Action Buttons
  btnGeneratePose: document.getElementById('btn-generate-pose'),
  btnGenerateUgc: document.getElementById('btn-generate-ugc'),
  btnGenerateContinuation: document.getElementById('btn-generate-continuation')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupTabListeners();
  setupUgcTypeListeners();
  setupPoseChipsListeners();
  setupPoseTypeListeners();
  setupGenerateButtons();
  setupCopyButton();
  updatePoseIngredientsGuide();
  renderIngredientGuide(appState.activeTab);
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
  const cards = document.querySelectorAll('.pose-type-card');
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
      
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;
      
      if (radio.value === 'explainer') {
        elements.groupSpokenScript.classList.remove('hidden');
      } else {
        elements.groupSpokenScript.classList.add('hidden');
      }
    });
  });
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
        return `Signature Action Pose (${signatureDetail || 'holding a product [input_file_2.png]'})`;
      }
      return poseName;
    }).join(', ');

    // Build the list of expression closeups
    const expressionsList = selectedExpressionChips.map(chip => chip.getAttribute('data-expression')).join(', ');
    const expressionsSection = expressionsList ? `a set of closeup headshots expressing: ${expressionsList}` : '';

    // Join all views on the sheet
    const allViews = [poses, expressionsSection].filter(Boolean).join(', ');

    // Determine ingredients list based on signature action selection
    let ingredientsRaw = `  - Whole Body Image: reference [input_file_0.png]
  - Closeup Face Image: reference [input_file_1.png]`;
    let ingredientsHtml = `  - Whole Body Image: reference <span class="highlight-image">[input_file_0.png]</span><br>
  - Closeup Face Image: reference <span class="highlight-image">[input_file_1.png]</span>`;

    if (hasSignatureAction) {
      ingredientsRaw += `\n  - Signature Action Product/Prop Image: reference [input_file_2.png]`;
      ingredientsHtml += `<br>\n  - Signature Action Product/Prop Image: reference <span class="highlight-image">[input_file_2.png]</span>`;
    }

    const rawPrompt = `[CHARACTER MODEL INGREDIENTS:
${ingredientsRaw}
]

Google Flow Omni Pose Reference Sheet Directive:
Generate a highly detailed, professional character pose reference sheet.
Subject: A consistent model representing the age of ${age}.

Fidelity & Natural Realism Directives:
1. Face Fidelity: The generated character sheet MUST strictly maintain and replicate the natural face structure, facial features, expressions, and details from the closeup reference photo [input_file_1.png]. Do not alter, average, or change the facial structure or details.
2. Body Fidelity: The generated character sheet MUST strictly maintain and replicate the natural body structure, physical proportions, and anatomical details from the whole body reference photo [input_file_0.png].
3. Realism: The character poses must look completely natural and realistic, ensuring organic skin textures, natural hair flow, and realistic lighting.
4. Style Parameters: Clear silhouette, no shading, even lighting, sharp focus, and a clean neutral gray background.

Layout: A single layout containing multiple poses in one clean grid: ${allViews}.

Ensure identical facial features, hair volume, body proportions, and expressions across all angles. Make a cohesive character reference matrix, bright studio lighting, neutral light gray background, clean borders separating views.`;

    const htmlPrompt = `[CHARACTER MODEL INGREDIENTS:<br>
${ingredientsHtml}<br>
]<br><br>
<strong>Google Flow Omni Pose Reference Sheet Directive:</strong><br>
Generate a highly detailed, professional character pose reference sheet.<br>
Subject: A consistent model representing the age of <span class="highlight-tag">${age}</span>.<br><br>
<strong>Fidelity & Natural Realism Directives:</strong><br>
1. <strong>Face Fidelity:</strong> The generated character sheet MUST strictly maintain and replicate the natural face structure, facial features, expressions, and details from the closeup reference photo <span class="highlight-image">[input_file_1.png]</span>. Do not alter, average, or change the facial structure or details.<br>
2. <strong>Body Fidelity:</strong> The generated character sheet MUST strictly maintain and replicate the natural body structure, physical proportions, and anatomical details from the whole body reference photo <span class="highlight-image">[input_file_0.png]</span>.<br>
3. <strong>Realism:</strong> The character poses must look completely natural and realistic, ensuring organic skin textures, natural hair flow, and realistic lighting.<br>
4. <strong>Style Parameters:</strong> Clear silhouette, no shading, even lighting, sharp focus, and a clean neutral gray background.<br><br>
Layout: A single layout containing multiple poses in one clean grid: <span class="highlight-tag">${allViews}</span>.<br><br>
Ensure identical facial features, hair volume, body proportions, and expressions across all angles. Make a cohesive character reference matrix, bright studio lighting, neutral light gray background, clean borders separating views.`;

    renderPrompt(rawPrompt, htmlPrompt);
  });

  // Tab 2: UGC Video Prompt Generator
  elements.btnGenerateUgc.addEventListener('click', () => {
    const product = elements.ugcProductDesc.value.trim();
    const bg = elements.ugcBgDesc.value.trim();
    const action = elements.ugcAction.value.trim();
    
    if (!product || !action) {
      alert("Please enter product details and pacing action instructions.");
      return;
    }
    
    const isExplainer = document.getElementById('ugc-type-explainer').checked;
    const script = elements.ugcSpokenScript.value.trim();
    
    let rawPrompt = "";
    let htmlPrompt = "";
    
    const baseIngredientsRaw = `[CHARACTER REFERENCE INGREDIENT: Character Pose Sheet [input_file_0.png]]
[PRODUCT INGREDIENT: Product Image [input_file_1.png] - described as: ${product}]
[ENVIRONMENT INGREDIENT: Background Photo [input_file_2.png] - described as: ${bg || 'Bright neutral studio setting'}]`;

    const baseIngredientsHtml = `[CHARACTER REFERENCE INGREDIENT: Character Pose Sheet <span class="highlight-image">[input_file_0.png]</span>]<br>
[PRODUCT INGREDIENT: Product Image <span class="highlight-image">[input_file_1.png]</span> - described as: <span class="highlight-tag">${product}</span>]<br>
[ENVIRONMENT INGREDIENT: Background Photo <span class="highlight-image">[input_file_2.png]</span> - described as: <span class="highlight-tag">${bg || 'Bright neutral studio setting'}</span>]`;

    if (!isExplainer) {
      // Type 1: Modeling & Posing UGC
      rawPrompt = `${baseIngredientsRaw}

Google Flow Omni UGC Video Directive (10-Second Clip):
Subject: The consistent model shown in pose sheet [input_file_0.png] is posing, modeling, and showcasing the product [input_file_1.png] (${product}).
Location: Background setting shown in [input_file_2.png] (${bg || 'Bright neutral studio setting'}).
Action details: ${action}.
Audio: Casual upbeat background music, no spoken words.
Camera / Style: Shoot on mobile phone camera, vertical 9:16 layout, natural handheld movements, organic light, clear product details, commercial UGC aesthetic.`;

      htmlPrompt = `${baseIngredientsHtml}<br><br>
<strong>Google Flow Omni UGC Video Directive (10-Second Clip):</strong><br>
Subject: The consistent model shown in pose sheet <span class="highlight-image">[input_file_0.png]</span> is posing, modeling, and showcasing the product <span class="highlight-image">[input_file_1.png]</span> (${product}).<br>
Location: Background setting shown in <span class="highlight-image">[input_file_2.png]</span> (${bg || 'Bright neutral studio setting'}).<br>
Action details: <span class="highlight-tag">${action}</span>.<br>
Audio: Casual upbeat background music, no spoken words.<br>
Camera / Style: Shoot on mobile phone camera, vertical 9:16 layout, natural handheld movements, organic light, clear product details, commercial UGC aesthetic.`;
    } else {
      // Type 2: Product Showcase & Explainer UGC
      if (!script) {
        alert("Please enter the spoken script text for the Explainer type UGC prompt.");
        return;
      }
      
      rawPrompt = `${baseIngredientsRaw}

Google Flow Omni UGC Video Explainer Directive (10-Second Clip):
Subject: The consistent model shown in pose sheet [input_file_0.png] is showcasing and talking about the product [input_file_1.png] (${product}) directly to the camera.
Location: Background setting shown in [input_file_2.png] (${bg || 'Bright neutral studio setting'}).
Movement/Action: ${action}.

[SPOKEN NARRATION AUDIO SYNC:
"${script}"
]

Camera / Style: Shoot on mobile phone camera, vertical 9:16 layout, mouth movement lipsync aligned perfectly with spoken script, photorealistic detail, warm skin tone lighting, engaging TikTok product review format.`;

      htmlPrompt = `${baseIngredientsHtml}<br><br>
<strong>Google Flow Omni UGC Video Explainer Directive (10-Second Clip):</strong><br>
Subject: The consistent model shown in pose sheet <span class="highlight-image">[input_file_0.png]</span> is showcasing and talking about the product <span class="highlight-image">[input_file_1.png]</span> (${product}) directly to the camera.<br>
Location: Background setting shown in <span class="highlight-image">[input_file_2.png]</span> (${bg || 'Bright neutral studio setting'}).<br>
Movement/Action: <span class="highlight-tag">${action}</span>.<br><br>
<span class="highlight-script">[SPOKEN NARRATION AUDIO SYNC:<br>
"${script}"<br>
]</span><br><br>
Camera / Style: Shoot on mobile phone camera, vertical 9:16 layout, mouth movement lipsync aligned perfectly with spoken script, photorealistic detail, warm skin tone lighting, engaging TikTok product review format.`;
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
    
    const rawPrompt = `[CHARACTER REFERENCE INGREDIENT: Character Pose Sheet [input_file_0.png]]
[PRODUCT INGREDIENT: Product Image [input_file_1.png]]
[TRANSITION BRIDGE INGREDIENT: Last Frame of Previous Clip [input_file_2.png]]
[ENVIRONMENT INGREDIENT: Optional Setting [input_file_3.png]]

Google Flow Omni Video Continuation Directive (10-Second Clip):
Generate a sequel video scene that starts EXACTLY from the visual pose, facial expressions, and product positioning of the transition bridge [input_file_2.png].
Scene Context: Resuming from previous state where: ${prevAction}.
Continuation Action/Movement: ${action}.
${script ? `\n[SPOKEN NARRATION AUDIO SYNC:\n"${script}"\n]` : '\nAudio: Background music, no speaking.'}

Maintain identical character facial structure, curly hair volume, apparel folds, product angles, background setting, and lighting intensity as shown in [input_file_2.png] to ensure a seamless, fluid transition between the two video clips.`;

    const htmlPrompt = `[CHARACTER REFERENCE INGREDIENT: Character Pose Sheet <span class="highlight-image">[input_file_0.png]</span>]<br>
[PRODUCT INGREDIENT: Product Image <span class="highlight-image">[input_file_1.png]</span>]<br>
[TRANSITION BRIDGE INGREDIENT: Last Frame of Previous Clip <span class="highlight-image">[input_file_2.png]</span>]<br>
[ENVIRONMENT INGREDIENT: Optional Setting <span class="highlight-image">[input_file_3.png]</span>]<br><br>
<strong>Google Flow Omni Video Continuation Directive (10-Second Clip):</strong><br>
Generate a sequel video scene that starts EXACTLY from the visual pose, facial expressions, and product positioning of the transition bridge <span class="highlight-image">[input_file_2.png]</span>.<br>
Scene Context: Resuming from previous state where: <span class="highlight-tag">${prevAction}</span>.<br>
Continuation Action/Movement: <span class="highlight-tag">${action}</span>.<br>
${script ? `<span class="highlight-script">[SPOKEN NARRATION AUDIO SYNC:<br>"${script}"<br>]</span>` : 'Audio: Background music, no speaking.'}<br><br>
Maintain identical character facial structure, curly hair volume, apparel folds, product angles, background setting, and lighting intensity as shown in <span class="highlight-image">[input_file_2.png]</span> to ensure a seamless, fluid transition between the two video clips.`;

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
