// نظام التعلم التكيفي لتحسين الدقة مع الاستخدام
class AdaptiveLearningSystem {
    constructor() {
        this.userHistory = JSON.parse(localStorage.getItem('zayton_user_history') || '[]');
        this.performanceStats = JSON.parse(localStorage.getItem('zayton_performance_stats') || '{}');
        this.learningThreshold = 5;
        this.version = '2.0';
    }

    // تحليل أنماط استخدام المستخدم
    analyzeUserPatterns() {
        if (this.userHistory.length < 3) {
            return {
                hasEnoughData: false,
                message: 'نحتاج إلى المزيد من المسوحات لتحليل الأنماط'
            };
        }

        const patterns = {
            scanFrequency: this.analyzeScanFrequency(),
            averageConfidence: this.calculateAverageConfidence(),
            commonResults: this.findCommonResults(),
            improvementTrend: this.analyzeImprovementTrend()
        };

        return {
            hasEnoughData: true,
            patterns: patterns,
            userLevel: this.getUserLevel(),
            recommendations: this.generateRecommendations(patterns)
        };
    }

    // تحليل تكرار المسح
    analyzeScanFrequency() {
        if (this.userHistory.length < 2) return 'منخفض';

        const timestamps = this.userHistory.map(scan => 
            new Date(scan.timestamp).getTime()
        ).sort();

        const totalDuration = timestamps[timestamps.length - 1] - timestamps[0];
        const averageInterval = totalDuration / (timestamps.length - 1);

        if (averageInterval < 24 * 60 * 60 * 1000) return 'مرتفع';
        if (averageInterval < 7 * 24 * 60 * 60 * 1000) return 'متوسط';
        return 'منخفض';
    }

    // حساب متوسط الثقة
    calculateAverageConfidence() {
        if (this.userHistory.length === 0) return 0;

        const totalConfidence = this.userHistory.reduce((sum, scan) => {
            return sum + (scan.confidence || 0);
        }, 0);

        return Math.round((totalConfidence / this.userHistory.length) * 10) / 10;
    }

    // إيجاد النتائج الشائعة
    findCommonResults() {
        const resultCounts = {};
        
        this.userHistory.forEach(scan => {
            const resultType = scan.resultType;
            resultCounts[resultType] = (resultCounts[resultType] || 0) + 1;
        });

        return Object.keys(resultCounts)
            .filter(result => resultCounts[result] > 1)
            .sort((a, b) => resultCounts[b] - resultCounts[a])
            .slice(0, 3);
    }

    // تحليل اتجاه التحسن
    analyzeImprovementTrend() {
        if (this.userHistory.length < 5) return 'غير كافٍ للتحليل';

        const recentScans = this.userHistory.slice(-5);
        const firstConfidence = recentScans[0]?.confidence || 0;
        const lastConfidence = recentScans[recentScans.length - 1]?.confidence || 0;

        if (lastConfidence > firstConfidence + 5) return 'متجه للتحسن';
        if (lastConfidence < firstConfidence - 5) return 'متجه للتراجع';
        return 'مستقر';
    }

    // تحديد مستوى المستخدم
    getUserLevel() {
        const scanCount = this.userHistory.length;
        
        if (scanCount >= 20) return 'محترف';
        if (scanCount >= 10) return 'متقدم';
        if (scanCount >= 5) return 'متوسط';
        return 'مبتدئ';
    }

    // توليد توصيات مخصصة
    generateRecommendations(patterns) {
        const recommendations = [];

        if (patterns.averageConfidence < 70) {
            recommendations.push('راجع تعليمات الاستخدام لتحسين دقة النتائج');
        }

        if (patterns.scanFrequency === 'منخفض') {
            recommendations.push('جرب استخدام التطبيق بانتظام لتحسين مهاراتك');
        }

        if (patterns.improvementTrend === 'متجه للتراجع') {
            recommendations.push('حاول استخدام إعدادات ثابتة للحصول على نتائج متسقة');
        }

        if (patterns.commonResults.includes('غش عالي')) {
            recommendations.push('قد تحتاج إلى تغيير مصدر الزيت المستخدم');
        }

        return recommendations.length > 0 ? recommendations : ['أداؤك ممتاز! استمر في العمل الجيد'];
    }

    // حفظ مسح في التاريخ
    saveScan(scanData) {
        const historyEntry = {
            timestamp: new Date().toISOString(),
            resultType: scanData.resultType,
            confidence: scanData.confidence,
            testType: scanData.testType,
            color: scanData.color,
            deviceInfo: this.getDeviceInfo()
        };

        this.userHistory.push(historyEntry);

        // حفظ فقط آخر 50 مسح
        if (this.userHistory.length > 50) {
            this.userHistory = this.userHistory.slice(-50);
        }

        localStorage.setItem('zayton_user_history', JSON.stringify(this.userHistory));

        // تحديث الإحصائيات كل 5 مسوحات
        if (this.userHistory.length % 5 === 0) {
            this.updatePerformanceStats();
        }
    }

    // الحصول على معلومات الجهاز
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent.substring(0, 100),
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`
        };
    }

    // تحديث إحصائيات الأداء
    updatePerformanceStats() {
        const stats = {
            totalScans: this.userHistory.length,
            averageConfidence: this.calculateAverageConfidence(),
            successfulScans: this.userHistory.filter(scan => 
                scan.confidence >= 80
            ).length,
            lastUpdated: new Date().toISOString(),
            version: this.version
        };

        this.performanceStats = stats;
        localStorage.setItem('zayton_performance_stats', JSON.stringify(stats));
    }

    // تطبيق التصحيحات التكيفية
    applyLearningCorrections(analysisResult) {
        if (this.userHistory.length < this.learningThreshold) {
            return analysisResult;
        }

        const patterns = this.analyzeUserPatterns();
        if (!patterns.hasEnoughData) return analysisResult;

        // حساب معامل التحسين بناءً على الأداء التاريخي
        const confidenceBoost = this.calculateConfidenceBoost(patterns.patterns.averageConfidence);
        
        return {
            ...analysisResult,
            confidence: Math.min(98, Math.round(analysisResult.confidence * confidenceBoost)),
            learningApplied: true,
            userLevel: patterns.userLevel
        };
    }

    // حساب معامل تعزيز الثقة
    calculateConfidenceBoost(averageConfidence) {
        if (averageConfidence >= 85) return 1.02;
        if (averageConfidence >= 75) return 1.01;
        if (averageConfidence >= 65) return 1.0;
        return 0.98;
    }

    // الحصول على تقرير الأداء
    getPerformanceReport() {
        const patterns = this.analyzeUserPatterns();
        
        return {
            basicStats: {
                totalScans: this.userHistory.length,
                averageConfidence: patterns.patterns.averageConfidence,
                userLevel: patterns.userLevel
            },
            patterns: patterns.hasEnoughData ? patterns.patterns : null,
            recommendations: patterns.recommendations,
            lastScan: this.userHistory[this.userHistory.length - 1]
        };
    }

    // مسح بيانات المستخدم
    clearUserData() {
        this.userHistory = [];
        this.performanceStats = {};
        localStorage.removeItem('zayton_user_history');
        localStorage.removeItem('zayton_performance_stats');
        return 'تم مسح جميع بيانات التعلم بنجاح';
    }
}

// إنشاء نسخة عامة لنظام التعلم
const adaptiveLearner = new AdaptiveLearningSystem();