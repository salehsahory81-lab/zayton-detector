// حالة التطبيق الأساسية
let appState = {
    currentTest: 'quality',
    isTimeTestRunning: false,
    timeTestInterval: null,
    timeRemaining: 90, // تم التحديث إلى 90 ثانية
    colorHistory: [],
    timeChart: null,
    qualityResult: null,
    completedSteps: ['step1'],
    isCameraActive: false
};

// عناصر DOM
const elements = {
    // الأزرار
    qualityBtn: document.getElementById('quality-btn'),
    adulterationBtn: document.getElementById('adulteration-btn'),
    captureBtn: document.getElementById('capture-btn'),
    startTimerBtn: document.getElementById('start-timer-btn'),
    
    // الأقسام
    timeTestSection: document.getElementById('time-test-section'),
    orientationWarning: document.getElementById('orientation-warning'),
    
    // العروض
    timerDisplay: document.getElementById('timer'),
    colorHistory: document.getElementById('color-history'),
    colorPreview: document.getElementById('color-preview'),
    resultText: document.getElementById('result-text'),
    confidence: document.getElementById('confidence'),
    confidenceBadge: document.getElementById('confidence-badge'),
    instructions: document.getElementById('instructions'),
    timeChart: document.getElementById('time-chart'),
    statusMessage: document.getElementById('status-message'),
    
    // خطوات التقدم
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    
    // الوسائط
    video: document.getElementById('video'),
    canvas: document.getElementById('canvas')
};

// قاعدة بيانات الألوان المحدثة
const colorDatabase = {
    quality: {
        '#0B5345': { 
            name: 'بكر ممتاز', 
            confidence: 96, 
            acidity: '≤0.8%',
            description: 'زيت عالي الجودة - آمن للاستخدام'
        },
        '#27AE60': { 
            name: 'بكر عادي', 
            confidence: 92, 
            acidity: '0.9-1.5%',
            description: 'زيت جيد - مناسب للاستخدام اليومي'
        },
        '#F39C12': { 
            name: 'جودة منخفضة', 
            confidence: 88, 
            acidity: '1.6-2.5%',
            description: 'زيت مقبول - تجنب القلي'
        },
        '#E74C3C': { 
            name: 'زيت فاسد', 
            confidence: 93, 
            acidity: '>2.5%',
            description: 'غير صالح للاستخدام'
        },
        '#8E44AD': { 
            name: 'أصباغ مضافة', 
            confidence: 85, 
            acidity: 'مختلف',
            description: 'زيت مغشوش بأصباغ'
        }
    },
    timeAnalysis: {
        '0-20': { 
            name: 'غش عالي', 
            confidence: 95, 
            level: 'high', 
            color: '#FF0000',
            description: 'زيت مغشوش بنسبة عالية'
        },
        '20-40': { 
            name: 'غش متوسط', 
            confidence: 90, 
            level: 'medium', 
            color: '#FF6B00',
            description: 'زيت مغشوش بنسبة متوسطة'
        },
        '40-90': { 
            name: 'غش منخفض', 
            confidence: 87, 
            level: 'low', 
            color: '#FFA500',
            description: 'زيت مغشوش بنسبة طفيفة'
        },
        '90+': { 
            name: 'زيت نقي', 
            confidence: 98, 
            level: 'pure', 
            color: '#00FF00',
            description: 'زيت نقي - جودة عالية'
        }
    }
};

// تعليمات الاستخدام
const instructions = {
    quality: `
        <h3>🎯 المرحلة 1: فحص الجودة (العبوة A)</h3>
        <ol>
            <li>أضف 2 مل من الزيت إلى <strong>العبوة A (الجودة)</strong></li>
            <li>ارجهـا بقوة لمدة 60 ثانية</li>
            <li>اتركها ترتاح 30 ثانية للفصل</li>
            <li>أزل الملصق المعتم</li>
            <li>صور الطبقة السفلية بالكاميرا</li>
        </ol>
        <p style="color: #27ae60; margin-top: 10px;">
            ⭐ هذا الفحص يحدد جودة الزيت ونسبة الحموضة
        </p>
    `,
    adulteration: `
        <h3>🎯 المرحلة 2: فحص الخلط (العبوة B)</h3>
        <ol>
            <li>أضف 2 مل من نفس الزيت إلى <strong>العبوة B (الخلط)</strong></li>
            <li>ارجهـا بقوة لمدة 30 ثانية</li>
            <li>انقر على "بدء فحص العبوة B"</li>
            <li>اترك العبوة ثابتة أمام الكاميرا</li>
            <li>راقب اختفاء اللون خلال 90 ثانية</li>
        </ol>
        <p style="color: #e74c3c; margin-top: 10px;">
            ⏱️ سرعة اختفاء اللون تشير إلى نسبة الزيوت المغشوشة
        </p>
    `
};

// ========== التهيئة ========== //

// بدء الكاميرا
async function startCamera() {
    try {
        showStatus('🔍 جاري تشغيل الكاميرا...', 'info');
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        elements.video.srcObject = stream;
        appState.isCameraActive = true;
        showStatus('✅ الكاميرا جاهزة - يمكنك البدء بالفحص', 'success');
        
    } catch (error) {
        console.error('Camera error:', error);
        appState.isCameraActive = false;
        showStatus('❌ لا يمكن الوصول للكاميرا. تأكد من منح الإذن', 'error');
        enableSimulationMode();
    }
}

// تمكين وضع المحاكاة
function enableSimulationMode() {
    showStatus('🔧 تم تفعيل وضع المحاكاة للاختبار', 'info');
    
    // محاكاة فحص الجودة
    elements.captureBtn.onclick = function() {
        const simulatedColors = ['#0B5345', '#27AE60', '#F39C12', '#E74C3C', '#8E44AD'];
        const randomColor = simulatedColors[Math.floor(Math.random() * simulatedColors.length)];
        const result = findClosestColor(randomColor, 'quality');
        
        if (result) {
            displayQualityResult(result, randomColor);
            appState.qualityResult = result;
            updateProgress();
            showStatus('✅ تم محاكاة فحص الجودة بنجاح', 'success');
        }
    };
}

// عرض رسالة الحالة
function showStatus(message, type = 'info') {
    const colors = {
        info: { bg: '#e8f4fc', color: '#004085' },
        success: { bg: '#d4edda', color: '#155724' },
        error: { bg: '#f8d7da', color: '#721c24' },
        warning: { bg: '#fff3cd', color: '#856404' }
    };
    
    elements.statusMessage.textContent = message;
    elements.statusMessage.style.background = colors[type].bg;
    elements.statusMessage.style.color = colors[type].color;
}

// كشف اتجاه الهاتف
function checkOrientation() {
    const isPortrait = window.innerHeight > window.innerWidth;
    elements.orientationWarning.style.display = isPortrait ? 'block' : 'none';
    return !isPortrait;
}

// ========== إدارة الفحوصات ========== //

// تبديل نوع الفحص
function switchTest(testType) {
    if (testType === 'adulteration' && !appState.qualityResult) {
        showStatus('⚠️ يرجى إكمال فحص الجودة أولاً', 'warning');
        return;
    }
    
    appState.currentTest = testType;
    
    // تحديث الواجهة
    elements.qualityBtn.classList.toggle('active', testType === 'quality');
    elements.adulterationBtn.classList.toggle('active', testType === 'adulteration');
    
    elements.captureBtn.style.display = testType === 'quality' ? 'block' : 'none';
    elements.timeTestSection.style.display = testType === 'adulteration' ? 'block' : 'none';
    elements.timeChart.style.display = testType === 'adulteration' ? 'block' : 'none';
    elements.instructions.innerHTML = instructions[testType];
    
    updateProgress();
}

// تحديث تقدم الخطوات
function updateProgress() {
    elements.step1.classList.toggle('completed', appState.completedSteps.includes('step1'));
    elements.step1.classList.toggle('active', appState.currentTest === 'quality');
    
    elements.step2.classList.toggle('completed', appState.completedSteps.includes('step2'));
    elements.step2.classList.toggle('active', appState.currentTest === 'adulteration');
    
    elements.step3.classList.toggle('completed', appState.completedSteps.includes('step2'));
}

// ========== فحص الجودة ========== //

elements.captureBtn.addEventListener('click', processQualityTest);

function processQualityTest() {
    if (!checkOrientation()) {
        showStatus('⚠️ يرجى تدوير الهاتف إلى الوضع الأفقي', 'warning');
        return;
    }
    
    if (!appState.isCameraActive) {
        // استخدام المحاكاة إذا كانت الكاميرا غير متاحة
        enableSimulationMode();
        return;
    }
    
    showStatus('📸 جاري تحليل اللون...', 'info');
    
    const result = captureAndAnalyzeColor();
    
    if (!result.success) {
        showStatus(result.message, 'error');
        return;
    }
    
    // تحليل اللون
    const colorResult = findClosestColor(result.hex, 'quality');
    
    if (colorResult) {
        displayQualityResult(colorResult, result.hex);
        appState.qualityResult = colorResult;
        appState.completedSteps.push('step1');
        updateProgress();
        showStatus('✅ تم تحليل الجودة بنجاح', 'success');
    } else {
        showStatus('❌ لم نتمكن من تحديد النتيجة - جرب مرة أخرى', 'error');
    }
}

// التقاط وتحليل اللون
function captureAndAnalyzeColor() {
    const context = elements.canvas.getContext('2d');
    const video = elements.video;
    
    if (!video.videoWidth) {
        return { success: false, message: 'الكاميرا غير جاهزة' };
    }
    
    elements.canvas.width = video.videoWidth;
    elements.canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = context.getImageData(
        elements.canvas.width / 2 - 25,
        elements.canvas.height / 2 - 25,
        50, 50
    );
    
    const rgb = analyzeColor(imageData);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    return { success: true, hex: hex, rgb: rgb };
}

// تحليل اللون
function analyzeColor(imageData) {
    let r = 0, g = 0, b = 0;
    let count = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];
        count++;
    }

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

// تحويل RGB إلى Hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// البحث عن أقرب لون
function findClosestColor(hexColor, type) {
    const database = colorDatabase[type];
    let minDistance = Infinity;
    let closestColor = null;

    const r1 = parseInt(hexColor.slice(1, 3), 16);
    const g1 = parseInt(hexColor.slice(3, 5), 16);
    const b1 = parseInt(hexColor.slice(5, 7), 16);

    for (const [dbHex, data] of Object.entries(database)) {
        const r2 = parseInt(dbHex.slice(1, 3), 16);
        const g2 = parseInt(dbHex.slice(3, 5), 16);
        const b2 = parseInt(dbHex.slice(5, 7), 16);

        const distance = Math.sqrt(
            Math.pow(r2 - r1, 2) + 
            Math.pow(g2 - g1, 2) + 
            Math.pow(b2 - b1, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestColor = { hex: dbHex, ...data };
        }
    }

    return closestColor;
}

// عرض نتيجة الجودة
function displayQualityResult(result, hexColor) {
    elements.colorPreview.style.backgroundColor = hexColor;
    elements.resultText.textContent = `✅ ${result.name}`;
    elements.resultText.className = `result-text quality-${result.name.replace(/\s+/g, '-').toLowerCase()}`;
    elements.confidenceBadge.textContent = `${result.confidence}%`;
    elements.confidence.innerHTML = `
        الثقة: <strong>${result.confidence}%</strong><br>
        الحموضة: <strong>${result.acidity}</strong><br>
        <small>${result.description}</small>
    `;
}

// ========== event listeners ========== //

elements.qualityBtn.addEventListener('click', () => switchTest('quality'));
elements.adulterationBtn.addEventListener('click', () => switchTest('adulteration'));

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

// ========== التهيئة النهائية ========== //

document.addEventListener('DOMContentLoaded', function() {
    showStatus('⚡ جاري تهيئة التطبيق...', 'info');
    startCamera();
    checkOrientation();
    elements.instructions.innerHTML = instructions.quality;
});// حالة التطبيق الأساسية
let appState = {
    currentTest: 'quality',
    isTimeTestRunning: false,
    timeTestInterval: null,
    timeRemaining: 90, // تم التحديث إلى 90 ثانية
    colorHistory: [],
    timeChart: null,
    qualityResult: null,
    completedSteps: ['step1'],
    isCameraActive: false
};

// عناصر DOM
const elements = {
    // الأزرار
    qualityBtn: document.getElementById('quality-btn'),
    adulterationBtn: document.getElementById('adulteration-btn'),
    captureBtn: document.getElementById('capture-btn'),
    startTimerBtn: document.getElementById('start-timer-btn'),
    
    // الأقسام
    timeTestSection: document.getElementById('time-test-section'),
    orientationWarning: document.getElementById('orientation-warning'),
    
    // العروض
    timerDisplay: document.getElementById('timer'),
    colorHistory: document.getElementById('color-history'),
    colorPreview: document.getElementById('color-preview'),
    resultText: document.getElementById('result-text'),
    confidence: document.getElementById('confidence'),
    confidenceBadge: document.getElementById('confidence-badge'),
    instructions: document.getElementById('instructions'),
    timeChart: document.getElementById('time-chart'),
    statusMessage: document.getElementById('status-message'),
    
    // خطوات التقدم
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    
    // الوسائط
    video: document.getElementById('video'),
    canvas: document.getElementById('canvas')
};

// قاعدة بيانات الألوان المحدثة
const colorDatabase = {
    quality: {
        '#0B5345': { 
            name: 'بكر ممتاز', 
            confidence: 96, 
            acidity: '≤0.8%',
            description: 'زيت عالي الجودة - آمن للاستخدام'
        },
        '#27AE60': { 
            name: 'بكر عادي', 
            confidence: 92, 
            acidity: '0.9-1.5%',
            description: 'زيت جيد - مناسب للاستخدام اليومي'
        },
        '#F39C12': { 
            name: 'جودة منخفضة', 
            confidence: 88, 
            acidity: '1.6-2.5%',
            description: 'زيت مقبول - تجنب القلي'
        },
        '#E74C3C': { 
            name: 'زيت فاسد', 
            confidence: 93, 
            acidity: '>2.5%',
            description: 'غير صالح للاستخدام'
        },
        '#8E44AD': { 
            name: 'أصباغ مضافة', 
            confidence: 85, 
            acidity: 'مختلف',
            description: 'زيت مغشوش بأصباغ'
        }
    },
    timeAnalysis: {
        '0-20': { 
            name: 'غش عالي', 
            confidence: 95, 
            level: 'high', 
            color: '#FF0000',
            description: 'زيت مغشوش بنسبة عالية'
        },
        '20-40': { 
            name: 'غش متوسط', 
            confidence: 90, 
            level: 'medium', 
            color: '#FF6B00',
            description: 'زيت مغشوش بنسبة متوسطة'
        },
        '40-90': { 
            name: 'غش منخفض', 
            confidence: 87, 
            level: 'low', 
            color: '#FFA500',
            description: 'زيت مغشوش بنسبة طفيفة'
        },
        '90+': { 
            name: 'زيت نقي', 
            confidence: 98, 
            level: 'pure', 
            color: '#00FF00',
            description: 'زيت نقي - جودة عالية'
        }
    }
};

// تعليمات الاستخدام
const instructions = {
    quality: `
        <h3>🎯 المرحلة 1: فحص الجودة (العبوة A)</h3>
        <ol>
            <li>أضف 2 مل من الزيت إلى <strong>العبوة A (الجودة)</strong></li>
            <li>ارجهـا بقوة لمدة 60 ثانية</li>
            <li>اتركها ترتاح 30 ثانية للفصل</li>
            <li>أزل الملصق المعتم</li>
            <li>صور الطبقة السفلية بالكاميرا</li>
        </ol>
        <p style="color: #27ae60; margin-top: 10px;">
            ⭐ هذا الفحص يحدد جودة الزيت ونسبة الحموضة
        </p>
    `,
    adulteration: `
        <h3>🎯 المرحلة 2: فحص الخلط (العبوة B)</h3>
        <ol>
            <li>أضف 2 مل من نفس الزيت إلى <strong>العبوة B (الخلط)</strong></li>
            <li>ارجهـا بقوة لمدة 30 ثانية</li>
            <li>انقر على "بدء فحص العبوة B"</li>
            <li>اترك العبوة ثابتة أمام الكاميرا</li>
            <li>راقب اختفاء اللون خلال 90 ثانية</li>
        </ol>
        <p style="color: #e74c3c; margin-top: 10px;">
            ⏱️ سرعة اختفاء اللون تشير إلى نسبة الزيوت المغشوشة
        </p>
    `
};

// ========== التهيئة ========== //

// بدء الكاميرا
async function startCamera() {
    try {
        showStatus('🔍 جاري تشغيل الكاميرا...', 'info');
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        elements.video.srcObject = stream;
        appState.isCameraActive = true;
        showStatus('✅ الكاميرا جاهزة - يمكنك البدء بالفحص', 'success');
        
    } catch (error) {
        console.error('Camera error:', error);
        appState.isCameraActive = false;
        showStatus('❌ لا يمكن الوصول للكاميرا. تأكد من منح الإذن', 'error');
        enableSimulationMode();
    }
}

// تمكين وضع المحاكاة
function enableSimulationMode() {
    showStatus('🔧 تم تفعيل وضع المحاكاة للاختبار', 'info');
    
    // محاكاة فحص الجودة
    elements.captureBtn.onclick = function() {
        const simulatedColors = ['#0B5345', '#27AE60', '#F39C12', '#E74C3C', '#8E44AD'];
        const randomColor = simulatedColors[Math.floor(Math.random() * simulatedColors.length)];
        const result = findClosestColor(randomColor, 'quality');
        
        if (result) {
            displayQualityResult(result, randomColor);
            appState.qualityResult = result;
            updateProgress();
            showStatus('✅ تم محاكاة فحص الجودة بنجاح', 'success');
        }
    };
}

// عرض رسالة الحالة
function showStatus(message, type = 'info') {
    const colors = {
        info: { bg: '#e8f4fc', color: '#004085' },
        success: { bg: '#d4edda', color: '#155724' },
        error: { bg: '#f8d7da', color: '#721c24' },
        warning: { bg: '#fff3cd', color: '#856404' }
    };
    
    elements.statusMessage.textContent = message;
    elements.statusMessage.style.background = colors[type].bg;
    elements.statusMessage.style.color = colors[type].color;
}

// كشف اتجاه الهاتف
function checkOrientation() {
    const isPortrait = window.innerHeight > window.innerWidth;
    elements.orientationWarning.style.display = isPortrait ? 'block' : 'none';
    return !isPortrait;
}

// ========== إدارة الفحوصات ========== //

// تبديل نوع الفحص
function switchTest(testType) {
    if (testType === 'adulteration' && !appState.qualityResult) {
        showStatus('⚠️ يرجى إكمال فحص الجودة أولاً', 'warning');
        return;
    }
    
    appState.currentTest = testType;
    
    // تحديث الواجهة
    elements.qualityBtn.classList.toggle('active', testType === 'quality');
    elements.adulterationBtn.classList.toggle('active', testType === 'adulteration');
    
    elements.captureBtn.style.display = testType === 'quality' ? 'block' : 'none';
    elements.timeTestSection.style.display = testType === 'adulteration' ? 'block' : 'none';
    elements.timeChart.style.display = testType === 'adulteration' ? 'block' : 'none';
    elements.instructions.innerHTML = instructions[testType];
    
    updateProgress();
}

// تحديث تقدم الخطوات
function updateProgress() {
    elements.step1.classList.toggle('completed', appState.completedSteps.includes('step1'));
    elements.step1.classList.toggle('active', appState.currentTest === 'quality');
    
    elements.step2.classList.toggle('completed', appState.completedSteps.includes('step2'));
    elements.step2.classList.toggle('active', appState.currentTest === 'adulteration');
    
    elements.step3.classList.toggle('completed', appState.completedSteps.includes('step2'));
}

// ========== فحص الجودة ========== //

elements.captureBtn.addEventListener('click', processQualityTest);

function processQualityTest() {
    if (!checkOrientation()) {
        showStatus('⚠️ يرجى تدوير الهاتف إلى الوضع الأفقي', 'warning');
        return;
    }
    
    if (!appState.isCameraActive) {
        // استخدام المحاكاة إذا كانت الكاميرا غير متاحة
        enableSimulationMode();
        return;
    }
    
    showStatus('📸 جاري تحليل اللون...', 'info');
    
    const result = captureAndAnalyzeColor();
    
    if (!result.success) {
        showStatus(result.message, 'error');
        return;
    }
    
    // تحليل اللون
    const colorResult = findClosestColor(result.hex, 'quality');
    
    if (colorResult) {
        displayQualityResult(colorResult, result.hex);
        appState.qualityResult = colorResult;
        appState.completedSteps.push('step1');
        updateProgress();
        showStatus('✅ تم تحليل الجودة بنجاح', 'success');
    } else {
        showStatus('❌ لم نتمكن من تحديد النتيجة - جرب مرة أخرى', 'error');
    }
}

// التقاط وتحليل اللون
function captureAndAnalyzeColor() {
    const context = elements.canvas.getContext('2d');
    const video = elements.video;
    
    if (!video.videoWidth) {
        return { success: false, message: 'الكاميرا غير جاهزة' };
    }
    
    elements.canvas.width = video.videoWidth;
    elements.canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = context.getImageData(
        elements.canvas.width / 2 - 25,
        elements.canvas.height / 2 - 25,
        50, 50
    );
    
    const rgb = analyzeColor(imageData);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    return { success: true, hex: hex, rgb: rgb };
}

// تحليل اللون
function analyzeColor(imageData) {
    let r = 0, g = 0, b = 0;
    let count = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];
        count++;
    }

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

// تحويل RGB إلى Hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// البحث عن أقرب لون
function findClosestColor(hexColor, type) {
    const database = colorDatabase[type];
    let minDistance = Infinity;
    let closestColor = null;

    const r1 = parseInt(hexColor.slice(1, 3), 16);
    const g1 = parseInt(hexColor.slice(3, 5), 16);
    const b1 = parseInt(hexColor.slice(5, 7), 16);

    for (const [dbHex, data] of Object.entries(database)) {
        const r2 = parseInt(dbHex.slice(1, 3), 16);
        const g2 = parseInt(dbHex.slice(3, 5), 16);
        const b2 = parseInt(dbHex.slice(5, 7), 16);

        const distance = Math.sqrt(
            Math.pow(r2 - r1, 2) + 
            Math.pow(g2 - g1, 2) + 
            Math.pow(b2 - b1, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestColor = { hex: dbHex, ...data };
        }
    }

    return closestColor;
}

// عرض نتيجة الجودة
function displayQualityResult(result, hexColor) {
    elements.colorPreview.style.backgroundColor = hexColor;
    elements.resultText.textContent = `✅ ${result.name}`;
    elements.resultText.className = `result-text quality-${result.name.replace(/\s+/g, '-').toLowerCase()}`;
    elements.confidenceBadge.textContent = `${result.confidence}%`;
    elements.confidence.innerHTML = `
        الثقة: <strong>${result.confidence}%</strong><br>
        الحموضة: <strong>${result.acidity}</strong><br>
        <small>${result.description}</small>
    `;
}

// ========== event listeners ========== //

elements.qualityBtn.addEventListener('click', () => switchTest('quality'));
elements.adulterationBtn.addEventListener('click', () => switchTest('adulteration'));

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

// ========== التهيئة النهائية ========== //

document.addEventListener('DOMContentLoaded', function() {
    showStatus('⚡ جاري تهيئة التطبيق...', 'info');
    startCamera();
    checkOrientation();
    elements.instructions.innerHTML = instructions.quality;
});