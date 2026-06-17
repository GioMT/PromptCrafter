// Global Application State
const appState = {
  activeTab: "panel-pose",
  activePrompt: ""
};

// Google Flow Omni Ingredient Sequential Reference Definitions
const GUIDES = {
  "panel-pose": [
    { title: "Full Body Photo", ref: "input_file_0.png (Ingredient 1)" },
    { title: "Half Body Photo", ref: "input_file_1.png (Ingredient 2)" },
    { title: "Closeup Face Photo", ref: "input_file_2.png (Ingredient 3)" }
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
  
  // Input fields
  poseCharDesc: document.getElementById('pose-char-desc'),
  poseStyle: document.getElementById('pose-style'),
  poseAttire: document.getElementById('pose-attire'),
  posePositions: document.getElementById('pose-positions'),
  
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
  setupGenerateButtons();
  setupCopyButton();
  renderIngredientGuide(appState.activeTab);
});

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
    const char = elements.poseCharDesc.value.trim();
    const style = elements.poseStyle.value;
    const attire = elements.poseAttire.value.trim();
    const positions = elements.posePositions.value.trim();
    
    if (!char || !attire || !positions) {
      alert("Please fill in character demographics, apparel details, and desired poses.");
      return;
    }
    
    const rawPrompt = `[CHARACTER MODEL INGREDIENTS:
  - Full Body Image: reference [input_file_0.png]
  - Half Body Image: reference [input_file_1.png]
  - Closeup Face Image: reference [input_file_2.png]
]

Google Flow Omni Pose Reference Sheet Directive:
Generate a highly detailed, professional character pose reference sheet.
Subject: A consistent model representing the demographics and features in [input_file_2.png] (described as: ${char}), wearing attire in [input_file_0.png] and [input_file_1.png] (described as: ${attire}).
Layout: A single layout containing multiple poses in one clean grid: ${positions}.
Aesthetic Style: ${style}.

Ensure identical facial features, clothing wrinkles, hair texture, body proportions, and expressions across all angles. Make a cohesive character reference matrix, bright studio lighting, neutral light gray background, clean borders separating views.`;

    const htmlPrompt = `[CHARACTER MODEL INGREDIENTS:<br>
  - Full Body Image: reference <span class="highlight-image">[input_file_0.png]</span><br>
  - Half Body Image: reference <span class="highlight-image">[input_file_1.png]</span><br>
  - Closeup Face Image: reference <span class="highlight-image">[input_file_2.png]</span><br>
]<br><br>
<strong>Google Flow Omni Pose Reference Sheet Directive:</strong><br>
Generate a highly detailed, professional character pose reference sheet.<br>
Subject: A consistent model representing the demographics and features in <span class="highlight-image">[input_file_2.png]</span> (described as: <span class="highlight-tag">${char}</span>), wearing attire in <span class="highlight-image">[input_file_0.png]</span> and <span class="highlight-image">[input_file_1.png]</span> (described as: <span class="highlight-tag">${attire}</span>).<br>
Layout: A single layout containing multiple poses in one clean grid: <span class="highlight-tag">${positions}</span>.<br>
Aesthetic Style: <span class="highlight-tag">${style}</span>.<br><br>
Ensure identical facial features, clothing wrinkles, hair texture, body proportions, and expressions across all angles. Make a cohesive character reference matrix, bright studio lighting, neutral light gray background, clean borders separating views.`;

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
