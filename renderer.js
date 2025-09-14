const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const batchList = document.getElementById('batchList');
const batchContainer = document.getElementById('batchContainer');
const controls = document.getElementById('controls');
const resizeModeRadios = document.getElementsByName('resizeMode');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const aspectRatioLock = document.getElementById('aspectRatioLock');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const estimatedSize = document.getElementById('estimatedSize');
const convertBtn = document.getElementById('convertBtn');
const resetBtn = document.getElementById('resetBtn');

let currentImage = null;
let originalWidth = 0;
let originalHeight = 0;
let currentMode = 'pixels';
let selectedFiles = [];
let batchItems = [];

// Functions
function updateLabels() {
  const labels = document.querySelectorAll('label[for="widthInput"], label[for="heightInput"]');
  const suffix = currentMode === 'pixels' ? '(px)' : '(%)';
  labels[0].textContent = `Width ${suffix}:`;
  labels[1].textContent = `Height ${suffix}:`;
}

function updateInputs() {
  if (currentMode === 'pixels') {
    widthInput.value = originalWidth;
    heightInput.value = originalHeight;
  } else {
    widthInput.value = 100;
    heightInput.value = 100;
  }
}

function calculateEstimatedSize() {
  let w = parseInt(widthInput.value) || 0;
  let h = parseInt(heightInput.value) || 0;
  if (currentMode === 'percentage') {
    w = originalWidth * w / 100;
    h = originalHeight * h / 100;
  }
  const quality = parseInt(qualitySlider.value) / 100;
  const sizeKB = Math.round((w * h * 3 * quality) / 1024);
  estimatedSize.textContent = `~${sizeKB} KB`;
}

function adjustAspectRatio(changedInput) {
  if (!aspectRatioLock.checked) return;
  const ratio = originalWidth / originalHeight;
  if (changedInput === 'width') {
    let w = parseInt(widthInput.value);
    if (currentMode === 'percentage') {
      w = originalWidth * w / 100;
    }
    const h = Math.round(w / ratio);
    if (currentMode === 'percentage') {
      heightInput.value = Math.round((h / originalHeight) * 100);
    } else {
      heightInput.value = h;
    }
  } else {
    let h = parseInt(heightInput.value);
    if (currentMode === 'percentage') {
      h = originalHeight * h / 100;
    }
    const w = Math.round(h * ratio);
    if (currentMode === 'percentage') {
      widthInput.value = Math.round((w / originalWidth) * 100);
    } else {
      widthInput.value = w;
    }
  }
}

function showBatch() {
  batchContainer.innerHTML = '';
  batchItems = [];
  imagePreview.style.display = 'none';
  controls.style.display = 'none';
  batchList.style.display = 'block';

  selectedFiles.forEach((filePath) => {
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);
    const blob = new Blob([fileContent], { type: 'image/*' });
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100 * (img.height / img.width);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const thumbnailSrc = canvas.toDataURL();

      const itemDiv = document.createElement('div');
      itemDiv.style.border = '1px solid #ccc';
      itemDiv.style.padding = '10px';
      itemDiv.style.borderRadius = '4px';
      itemDiv.style.width = '150px';
      itemDiv.innerHTML = `
        <img src="${thumbnailSrc}" style="width: 100%; height: auto; margin-bottom: 5px;">
        <p style="font-size: 12px; margin: 5px 0; word-break: break-all;">${fileName}</p>
        <input type="number" placeholder="Width (px)" style="width: 100%; margin-bottom: 5px; font-size: 12px;" value="${img.width}">
        <input type="number" placeholder="Height (px)" style="width: 100%; margin-bottom: 5px; font-size: 12px;" value="${img.height}">
        <label style="font-size: 12px;"><input type="checkbox" class="aspect-lock" checked> Lock aspect ratio</label>
        <input type="range" min="1" max="100" value="80" style="width: 100%;">
        <span style="font-size: 12px;">Quality: <span class="quality-val">80</span></span>
      `;

      const qualityInput = itemDiv.querySelector('input[type="range"]');
      const qualityVal = itemDiv.querySelector('.quality-val');
      qualityInput.addEventListener('input', () => {
        qualityVal.textContent = qualityInput.value;
      });

      const widthIn = itemDiv.querySelector('input[placeholder="Width (px)"]');
      const heightIn = itemDiv.querySelector('input[placeholder="Height (px)"]');
      const aspectLock = itemDiv.querySelector('.aspect-lock');

      widthIn.addEventListener('input', () => {
        console.log('Width changed for', fileName);
        if (aspectLock.checked) {
          const ratio = img.width / img.height;
          const w = parseInt(widthIn.value);
          const h = Math.round(w / ratio);
          heightIn.value = h;
          console.log('Adjusted height to', h);
        }
      });

      heightIn.addEventListener('input', () => {
        console.log('Height changed for', fileName);
        if (aspectLock.checked) {
          const ratio = img.width / img.height;
          const h = parseInt(heightIn.value);
          const w = Math.round(h * ratio);
          widthIn.value = w;
          console.log('Adjusted width to', w);
        }
      });

      batchContainer.appendChild(itemDiv);
      batchItems.push({
        filePath,
        img,
        widthInput: widthIn,
        heightInput: heightIn,
        qualityInput
      });
    };
    img.src = URL.createObjectURL(blob);
  });
}

// Event listeners
resizeModeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentMode = e.target.value;
    updateLabels();
    updateInputs();
    calculateEstimatedSize();
  });
});

widthInput.addEventListener('input', () => {
  adjustAspectRatio('width');
  calculateEstimatedSize();
});

heightInput.addEventListener('input', () => {
  adjustAspectRatio('height');
  calculateEstimatedSize();
});

aspectRatioLock.addEventListener('change', () => {
  if (aspectRatioLock.checked) {
    adjustAspectRatio('width'); // Recalculate
  }
});

qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = qualitySlider.value;
  calculateEstimatedSize();
});

// Drag and drop functionality
dropZone.addEventListener('click', async () => {
  const result = await ipcRenderer.invoke('open-file-dialog');

  if (!result.canceled && result.filePaths.length > 0) {
    selectedFiles = result.filePaths;
    if (selectedFiles.length > 1) {
      showBatch();
    } else {
      // Handle the first file for preview
      const filePath = selectedFiles[0];
      const fileName = path.basename(filePath);
      const fileContent = fs.readFileSync(filePath);

      // Create a blob and file
      const blob = new Blob([fileContent], { type: 'image/*' });
      const file = new File([blob], fileName, { type: 'image/*' });

      handleFile(file);
    }
  }
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
});

// File input change
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

// Handle file loading
function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    currentImage = new Image();
    currentImage.onload = () => {
      originalWidth = currentImage.width;
      originalHeight = currentImage.height;
      imagePreview.src = e.target.result;
      imagePreview.style.display = 'block';
      controls.style.display = 'block';
      updateInputs();
      updateLabels();
      calculateEstimatedSize();
    };
    currentImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Quality slider
qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = qualitySlider.value;
});

// Convert and save
convertBtn.addEventListener('click', async () => {
  console.log('Starting conversion');
  if (batchItems.length > 0) {
    console.log('Batch mode with', batchItems.length, 'items');
    // Batch processing with per-file settings
    let processed = 0;
    for (const item of batchItems) {
      const width = parseInt(item.widthInput.value);
      const height = parseInt(item.heightInput.value);
      const quality = parseInt(item.qualityInput.value) / 100;

      console.log('Converting', item.filePath, 'to', width, 'x', height, 'quality', quality);

      if (width <= 0 || height <= 0) {
        console.error('Invalid dimensions for', item.filePath);
        processed++;
        continue;
      }

      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(item.img, 0, 0, width, height);

      // Convert to WebP blob
      await new Promise((resolve) => {
        canvas.toBlob(async (webpBlob) => {
          if (!webpBlob) {
            console.error('Failed to create WebP blob for', item.filePath);
            resolve();
            return;
          }
          const arrayBuffer = await webpBlob.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);

          const baseName = path.basename(item.filePath, path.extname(item.filePath));
          const suggestedName = `${baseName}.webp`;

          const success = await ipcRenderer.invoke('save-file-dialog', {
            buffer,
            suggestedName
          });

          if (success) {
            console.log('Saved', suggestedName);
          } else {
            console.error('Failed to save', suggestedName);
          }

          processed++;
          if (processed === batchItems.length) {
            alert(`${processed} image(s) converted and saved successfully!`);
          }
          resolve();
        }, 'image/webp', quality);
      });
    }
  } else if (selectedFiles.length > 0) {
    // Single or global batch processing
    const quality = parseInt(qualitySlider.value) / 100;

    let processed = 0;
    for (const filePath of selectedFiles) {
      const fileContent = fs.readFileSync(filePath);
      const blob = new Blob([fileContent], { type: 'image/*' });
      const img = new Image();

      await new Promise((resolve) => {
        img.onload = () => {
          let width = parseInt(widthInput.value);
          let height = parseInt(heightInput.value);
          if (currentMode === 'percentage') {
            width = Math.round(img.width * width / 100);
            height = Math.round(img.height * height / 100);
          }

          if (width <= 0 || height <= 0) {
            resolve();
            return;
          }

          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP blob
          canvas.toBlob(async (webpBlob) => {
            const arrayBuffer = await webpBlob.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            const baseName = path.basename(filePath, path.extname(filePath));
            const suggestedName = `${baseName}.webp`;

            await ipcRenderer.invoke('save-file-dialog', {
              buffer,
              suggestedName
            });

            processed++;
            if (processed === selectedFiles.length) {
              alert(`${processed} image(s) converted and saved successfully!`);
            }
            resolve();
          }, 'image/webp', quality);
        };
        img.src = URL.createObjectURL(blob);
      });
    }
  }
});

// Reset
resetBtn.addEventListener('click', () => {
  currentImage = null;
  selectedFiles = [];
  batchItems = [];
  imagePreview.style.display = 'none';
  batchList.style.display = 'none';
  controls.style.display = 'none';
  fileInput.value = '';
  widthInput.value = '';
  heightInput.value = '';
  qualitySlider.value = 80;
  qualityValue.textContent = '80';
});
