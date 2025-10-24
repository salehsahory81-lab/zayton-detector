// المساعد الذكي لتقديم النصائح والإرشادات
class SmartAssistant {
    constructor() {
        this.userLevel = 'beginner';
        this.lastAdvice = null;
        this.adviceHistory = [];
    }

    // تحليل النتائج وتقديم نصائح مخصصة
    analyzeResults(scanResults, testType) {
        const advice = {
            general: this.getGeneralAdvice(scanResults),
            technical: this.getTechnicalAdvice(scanResults, testType),
            actions: this.getRecommendedActions(scanResults),
            warnings: this.getWarnings(scanResults)
        };

        this.lastAdvice = advice;
        this.saveToHistory(advice);
        
        return advice;
    }

    // نصائح عامة حسب النتيجة
    getGeneralAdvice(results) {
        const { quality, adulteration, confidence } = results;
        
        if (quality === 'مغشوش' || adulteration === 'غش عالي') {
            return {
                title: '⚠️ انتباه! زيت مغشوش',
                message: 'هذا الزيت يحتوي على نسب عالية من الغش. يوصى بعدم الاستخدام.',
                urgency: 'high',
                icon: '🚫'
            };
        }

        if (quality === 'بكر ممتاز' && confidence > 85) {
            return {
                title: '✅ زيت ممتاز',
                message: 'هذا زيت زيتون بكر ممتاز بجودة عالية. يمكنك الاستخدام بأمان.',
                urgency: 'low',
                icon: '👍'
            };
        }

        if (quality === 'بكر عادي') {
            return {
                title: 'ℹ️ زيت عادي',
                message: 'جودة الزيت مقبولة ولكن ليست ممتازة. مناسب للطهي اليومي.',
                urgency: 'medium',
                icon: '💡'
            };
        }

        return {
            title: '🔍 تحتاج إلى مزيد من الفحص',
            message: 'النتيجة غير حاسمة. جرب الفحص مرة أخرى في ظروف إضاءة أفضل.',
            urgency: 'medium',
            icon: '📱'
        };
    }

    // نصائح تقنية متقدمة
    getTechnicalAdvice(results, testType) {
        const tips = [];
        
        if (results.confidence < 70) {
            tips.push({
                tip: 'تحسين دقة الفحص',
                details: 'تأكد من الإضاءة الجيدة وثبات الكاميرا أثناء الفحص',
                action: 'retry_scan'
            });
        }

        if (testType === 'color' && results.colorAnalysis?.issues) {
            tips.push({
                tip: 'مشاكل في تحليل اللون',
                details: 'حاول تقريب الكاميرا أكثر أو استخدام خلفية بيضاء',
                action: 'adjust_camera'
            });
        }

        if (testType === 'time' && results.timeAnalysis?.variance > 10) {
            tips.push({
                tip: 'تفاوت في وقت التفاعل',
                details: 'حاول استخدام كمية متساوية من الزيت في كل فحص',
                action: 'standardize_quantity'
            });
        }

        return tips;
    }

    // إجراءات موصى بها
    getRecommendedActions(results) {
        const actions = [];
        
        if (results.quality === 'مغشوش') {
            actions.push({
                action: 'report_vendor',
                title: 'الإبلاغ عن التاجر',
                description: 'يمكنك الإبلاغ عن الزيت المغشوش للجهات المختصة',
                priority: 'high'
            });
        }

        if (results.confidence < 60) {
            actions.push({
                action: 'retest',
                title: 'إعادة الفحص',
                description: 'جرب الفحص مرة أخرى للتأكد من النتيجة',
                priority: 'medium'
            });
        }

        actions.push({
            action: 'save_result',
            title: 'حفظ النتيجة',
            description: 'احفظ هذه النتيجة لمقارنتها مع فحوصات مستقبلية',
            priority: 'low'
        });

        return actions;
    }

    // تحذيرات مهمة
    getWarnings(results) {
        const warnings = [];
        
        if (results.adulteration === 'غش عالي') {
            warnings.push({
                type: 'health_warning',
                message: 'الزيت المغشوش قد يكون ضاراً بالصحة',
                severity: 'high'
            });
        }

        if (results.quality === 'منخفض الجودة') {
            warnings.push({
                type: 'quality_warning',
                message: 'جودة الزيت منخفضة وقد لا يكون مناسباً للاستهلاك المباشر',
                severity: 'medium'
            });
        }

        return warnings;
    }

    // حفظ في السجل
    saveToHistory(advice) {
        this.adviceHistory.push({
            timestamp: new Date().toISOString(),
            advice: advice,
            userLevel: this.userLevel
        });

        // حفظ فقط آخر 50 نصيحة
        if (this.adviceHistory.length > 50) {
            this.adviceHistory = this.adviceHistory.slice(-50);
        }

        localStorage.setItem('zayton_advice_history', JSON.stringify(this.adviceHistory));
    }

    // الحصول على نصائح بناءً على السجل
    getHistoricalAdvice() {
        const commonPatterns = this.analyzeAdvicePatterns();
        return {
            frequentIssues: commonPatterns.frequentIssues,
            improvementTips: this.getImprovementTips(commonPatterns),
            successRate: this.calculateSuccessRate()
        };
    }

    // تحليل أنماط النصائح
    analyzeAdvicePatterns() {
        const issueCount = {};
        
        this.adviceHistory.forEach(entry => {
            const mainAdvice = entry.advice.general.title;
            issueCount[mainAdvice] = (issueCount[mainAdvice] || 0) + 1;
        });

        const frequentIssues = Object.entries(issueCount)
            .filter(([_, count]) => count > 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        return { frequentIssues, totalScans: this.adviceHistory.length };
    }

    // نصائح تحسين
    getImprovementTips(patterns) {
        const tips = [];
        
        if (patterns.frequentIssues.some(issue => issue[0].includes('انتباه'))) {
            tips.push('💡 حاول شراء الزيت من مصادر موثوقة لتجنب الغش');
        }

        if (patterns.frequentIssues.some(issue => issue[0].includes('تحتاج إلى مزيد'))) {
            tips.push('📸 تأكد من جودة الصورة وثبات الكاميرا لتحسين الدقة');
        }

        if (patterns.totalScans < 5) {
            tips.push('🔍 استمر في استخدام التطبيق لتحسين مهارات الفحص');
        }

        return tips;
    }

    // حساب معدل النجاح
    calculateSuccessRate() {
        if (this.adviceHistory.length === 0) return 0;
        
        const successfulScans = this.adviceHistory.filter(entry => 
            !entry.advice.general.title.includes('انتباه') && 
            !entry.advice.general.title.includes('تحتاج إلى مزيد')
        ).length;

        return Math.round((successfulScans / this.adviceHistory.length) * 100);
    }

    // تحديث مستوى المستخدم
    updateUserLevel(scansCount, successRate) {
        if (scansCount >= 20 && successRate >= 80) {
            this.userLevel = 'expert';
        } else if (scansCount >= 10 && successRate >= 70) {
            this.userLevel = 'intermediate';
        } else if (scansCount >= 5) {
            this.userLevel = 'beginner_plus';
        } else {
            this.userLevel = 'beginner';
        }
    }

    // الحصول على إحصائيات المساعد
    getAssistantStats() {
        return {
            userLevel: this.userLevel,
            totalAdviceGiven: this.adviceHistory.length,
            successRate: this.calculateSuccessRate(),
            lastAdvice: this.lastAdvice,
            frequentPatterns: this.analyzeAdvicePatterns()
        };
    }
}

// إنشاء نسخة عامة من المساعد الذكي
const smartAssistant = new SmartAssistant();