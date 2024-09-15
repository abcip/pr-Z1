// Глобальные переменные
let originalImage = null;
let history = [];
let currentStep = -1;
const maxHistorySteps = 20;

// DOM элементы
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const imagePreview = document.getElementById('imagePreview');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const keepAspectRatio = document.getElementById('keepAspectRatio');
const applyResize = document.getElementById('applyResize');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const saturationSlider = document.getElementById('saturation');
const applyAdjustments = document.getElementById('applyAdjustments');
const textInput = document.getElementById('textInput');
const fontSelect = document.getElementById('fontSelect');
const fontSize = document.getElementById('fontSize');
const textColor = document.getElementById('textColor');
const hexColor = document.getElementById('hexColor');
const addTextBtn = document.getElementById('addText');
const addRectangleBtn = document.getElementById('addRectangle');
const addCircleBtn = document.getElementById('addCircle');
const shapeColor = document.getElementById('shapeColor');
const shapeHexColor = document.getElementById('shapeHexColor');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const cropBtn = document.getElementById('cropBtn');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel = document.getElementById('modalCancel');

// Загрузка изображения
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#000';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#ccc';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        handleFile(file);
    } else {
        showError('Please upload a JPEG or PNG image.');
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        originalImage = new Image();
        originalImage.src = e.target.result;
        originalImage.onload = () => {
            widthInput.value = originalImage.width;
            heightInput.value = originalImage.height;
        };
        resetHistory();
    };
    reader.readAsDataURL(file);
}

// Изменение размера изображения
applyResize.addEventListener('click', () => {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        showError('Please enter valid dimensions.');
        return;
    }
    resizeImage(width, height);
});

function resizeImage(width, height) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imagePreview, 0, 0, width, height);
    imagePreview.src = canvas.toDataURL();
    addToHistory();
}

keepAspectRatio.addEventListener('change', () => {
    if (keepAspectRatio.checked && originalImage) {
        const aspect = originalImage.width / originalImage.height;
        widthInput.addEventListener('input', () => {
            heightInput.value = Math.round(widthInput.value / aspect);
        });
        heightInput.addEventListener('input', () => {
            widthInput.value = Math.round(heightInput.value * aspect);
        });
    }
});

// Настройка параметров изображения
function updateSliderValue(slider, valueSpan) {
    slider.addEventListener('input', () => {
        valueSpan.textContent = slider.value;
    });
}

updateSliderValue(brightnessSlider, document.getElementById('brightnessValue'));
updateSliderValue(contrastSlider, document.getElementById('contrastValue'));
updateSliderValue(saturationSlider, document.getElementById('saturationValue'));

applyAdjustments.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imagePreview.naturalWidth;
    canvas.height = imagePreview.naturalHeight;
    ctx.filter = `brightness(${100 + parseInt(brightnessSlider.value)}%) ` +
        `contrast(${100 + parseInt(contrastSlider.value)}%) ` +
        `saturate(${100 + parseInt(saturationSlider.value)}%)`;
    ctx.drawImage(imagePreview, 0, 0);
    imagePreview.src = canvas.toDataURL();
    addToHistory();
});

// Добавление текста
textColor.addEventListener('input', () => {
    hexColor.value = textColor.value;
});

hexColor.addEventListener('input', () => {
    if (/^#[0-9A-F]{6}$/i.test(hexColor.value)) {
        textColor.value = hexColor.value;
    }
});

addTextBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imagePreview.naturalWidth;
    canvas.height = imagePreview.naturalHeight;
    ctx.drawImage(imagePreview, 0, 0);

    ctx.font = `${fontSize.value}px ${fontSelect.value}`;
    ctx.fillStyle = textColor.value;
    ctx.fillText(textInput.value, 20, 40); // Позиция текста фиксирована для простоты

    imagePreview.src = canvas.toDataURL();
    addToHistory();
});

// Добавление фигур
shapeColor.addEventListener('input', () => {
    shapeHexColor.value = shapeColor.value;
});

shapeHexColor.addEventListener('input', () => {
    if (/^#[0-9A-F]{6}$/i.test(shapeHexColor.value)) {
        shapeColor.value = shapeHexColor.value;
    }
});

function addShape(shapeType) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imagePreview.naturalWidth;
    canvas.height = imagePreview.naturalHeight;
    ctx.drawImage(imagePreview, 0, 0);

    ctx.fillStyle = shapeColor.value;
    if (shapeType === 'rectangle') {
        ctx.fillRect(20, 20, 100, 80);
    } else if (shapeType === 'circle') {
        ctx.beginPath();
        ctx.arc(60, 60, 40, 0, 2 * Math.PI);
        ctx.fill();
    }

    imagePreview.src = canvas.toDataURL();
    addToHistory();
}

addRectangleBtn.addEventListener('click', () => addShape('rectangle'));
addCircleBtn.addEventListener('click', () => addShape('circle'));

// История изменений
function addToHistory() {
    currentStep++;
    history = history.slice(0, currentStep);
    history.push(imagePreview.src);
    if (history.length > maxHistorySteps) {
        history.shift();
        currentStep--;
    }
    updateUndoRedoButtons();
}

function resetHistory() {
    history = [imagePreview.src];
    currentStep = 0;
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    undoBtn.disabled = currentStep <= 0;
    redoBtn.disabled = currentStep >= history.length - 1;
}

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

function undo() {
    if (currentStep > 0) {
        currentStep--;
        imagePreview.src = history[currentStep];
        updateUndoRedoButtons();
    }
}

function redo() {
    if (currentStep < history.length - 1) {
        currentStep++;
        imagePreview.src = history[currentStep];
        updateUndoRedoButtons();
    }
}

// Сохранение изображения
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'edited_image.png';
    link.href = imagePreview.src;
    link.click();
});

// Возврат к исходному изображению
resetBtn.addEventListener('click', () => {
    showConfirmation('Are you sure you want to reset to the original image? All changes will be lost.', () => {
        imagePreview.src = originalImage.src;
        resetHistory();
    });
});

// Обработка ошибок и предупреждений
function showError(message) {
    alert(message);
}

function showConfirmation(message, onConfirm) {
    modalMessage.textContent = message;
    modal.style.display = 'block';

    modalConfirm.onclick = () => {
        onConfirm();
        modal.style.display = 'none';
    };

    modalCancel.onclick = () => {
        modal.style.display = 'none';
    };
}

// Предупреждение при выходе без сохранения
window.addEventListener('beforeunload', (event) => {
    if (history.length > 1) {
        event.preventDefault();
        event.returnValue = '';
    }
});

// Функция обрезки 
let isCropping = false;

cropBtn.addEventListener('click', () => {
    if (isCropping) return;

    isCropping = true;

    alert('You are in photo cropping mode. Select the area and hold down the right click . Press esc to cancel the action');
    const imageRect = imagePreview.getBoundingClientRect();

    const selectionRect = document.createElement('div');
    selectionRect.style.position = 'absolute';
    selectionRect.style.border = '2px dashed red';
    selectionRect.style.cursor = 'move';
    document.body.appendChild(selectionRect);

    let startX, startY, endX, endY;

    const onMouseDown = (e) => {
        startX = e.clientX;
        startY = e.clientY;

        selectionRect.style.left = startX + 'px';
        selectionRect.style.top = startY + 'px';
        selectionRect.style.width = '0px';
        selectionRect.style.height = '0px';

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
        endX = e.clientX;
        endY = e.clientY;

        const width = endX - startX;
        const height = endY - startY;

        selectionRect.style.width = Math.abs(width) + 'px';that you want to crop
        selectionRect.style.height = Math.abs(height) + 'px';
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('keydown', onKeyDown);

        const selectionRectData = selectionRect.getBoundingClientRect();
        const cropX = selectionRectData.left - imageRect.left;
        const cropY = selectionRectData.top - imageRect.top;
        const cropWidth = selectionRectData.width;
        const cropHeight = selectionRectData.height;

        document.body.removeChild(selectionRect);

        cropImage(cropX, cropY, cropWidth, cropHeight);
        isCropping = false;
    };

    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('keydown', onKeyDown);

            document.body.removeChild(selectionRect);
            isCropping = false;
        }
    };

    imagePreview.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
});

// Function to crop the image
function cropImage(x, y, width, height) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(imagePreview, x, y, width, height, 0, 0, width, height);

    imagePreview.src = canvas.toDataURL();
}



// Оптимизация производительности
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedResize = debounce(() => {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        resizeImage(width, height);
    }
}, 300);

widthInput.addEventListener('input', debouncedResize);
heightInput.addEventListener('input', debouncedResize);
