
class AdaptiveLearning {
    constructor(userId) {
        this.userId = userId;
        this.userHistory = JSON.parse(localStorage.getItem(`zayton_user_history_${this.userId}`) || '[]');
        this.performanceStats = JSON.parse(localStorage.getItem(`zayton_performance_stats_${this.userId}`) || '{}');
        this.learningThreshold = 5;
        this.version = '2.0';
    }

    addScanToHistory(scanData) {
        const historyEntry = {
            timestamp: new Date().toISOString(),
            resultType: scanData.resultType,
            confidence: scanData.confidence,
            testType: scanData.testType,
            color: scanData.color,
            deviceInfo: this.getDeviceInfo()
        };

        this.userHistory.push(historyEntry);

        if (this.userHistory.length > 50) {
            this.userHistory = this.userHistory.slice(-50);
        }

        localStorage.setItem(`zayton_user_history_${this.userId}`, JSON.stringify(this.userHistory));

        if (this.userHistory.length % 5 === 0) {
            this.updatePerformanceStats();
        }
    }

    calculateUsagePatterns() {
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

    calculateAverageConfidence() {
        if (this.userHistory.length === 0) return 0;

        const totalConfidence = this.userHistory.reduce((sum, scan) => {
            return sum + (scan.confidence || 0);
        }, 0);

        return Math.round((totalConfidence / this.userHistory.length) * 10) / 10;
    }

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

    analyzeImprovementTrend() {
        if (this.userHistory.length < 5) return 'غير كافٍ للتحليل';

        const recentScans = this.userHistory.slice(-5);
        const firstConfidence = recentScans[0]?.confidence || 0;
        const lastConfidence = recentScans[recentScans.length - 1]?.confidence || 0;

        if (lastConfidence > firstConfidence + 5) return 'متجه للتحسن';
        if (lastConfidence < firstConfidence - 5) return 'متجه للتراجع';
        return 'مستقر';
    }

    getUserLevel() {
        const scanCount = this.userHistory.length;

        if (scanCount >= 20) return 'محترف';
        if (scanCount >= 10) return 'متقدم';
        if (scanCount >= 5) return 'متوسط';
        return 'مبتدئ';
    }

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
}
