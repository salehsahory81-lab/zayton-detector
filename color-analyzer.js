// محلل الألوان المتقدم للكشف عن جودة الخلفية وتصحيح الألوان
class AdvancedColorAnalyzer {
    constructor() {
        this.referenceColors = {
            white: { r: 255, g: 255, b: 255 },
            black: { r: 0, g: 0, b: 0 },
            gray: { r: 128, g: 128, b: 128 }
        };
    }

    // كشف نوع الخلفية وجودتها
    detectBackgroundType(imageData) {
        try {
            const corners = this.getCornerPixels(imageData);
            const backgroundScore = this.analyzeBackgroundUniformity(corners);
            
            if (backgroundScore.uniformity > 0.8) {
                return {
                    type: 'uniform',
                    color: backgroundScore.dominantColor,
                    confidence: backgroundScore.uniformity,
                    quality: 'ممتازة'
                };
            } else if (backgroundScore.uniformity > 0.6) {
                return {
                    type: 'acceptable',
                    color: backgroundScore.dominantColor,
                    confidence: backgroundScore.uniformity,
                    quality: 'جيدة'
                };
            } else {
                return {
                    type: 'noisy',
                    confidence: backgroundScore.uniformity,
                    quality: 'ضعيفة',
                    advice: '⚠️ استخدم خلفية بيضاء موحدة'
                };
            }
        } catch (error) {
            return { type: 'unknown', quality: 'غير معروفة' };
        }
    }

    // أخذ عينات من زوايا الصورة
    getCornerPixels(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const sampleSize = Math.min(30, Math.floor(width * 0.1));
        
        return [
            this.getPixelRegion(imageData, 5, 5, sampleSize, sampleSize),
            this.getPixelRegion(imageData, width - sampleSize - 5, 5, sampleSize, sampleSize),
            this.getPixelRegion(imageData, 5, height - sampleSize - 5, sampleSize, sampleSize),
            this.getPixelRegion(imageData, width - sampleSize - 5, height - sampleSize - 5, sampleSize, sampleSize)
        ];
    }

    // تحليل تجانس الخلفية
    analyzeBackgroundUniformity(corners) {
        let totalDiff = 0;
        let comparisonCount = 0;
        const cornerColors = [];

        corners.forEach(corner => {
            const avgColor = this.calculateAverageColor(corner);
            cornerColors.push(avgColor);
        });

        for (let i = 0; i < cornerColors.length; i++) {
            for (let j = i + 1; j < cornerColors.length; j++) {
                const diff = this.colorDistance(corners[i], corners[j]);
                totalDiff += diff;
                comparisonCount++;
            }
        }

        const avgDiff = totalDiff / comparisonCount;
        const uniformity = Math.max(0, 1 - (avgDiff / 50));

        return {
            uniformity: Math.round(uniformity * 100) / 100,
            dominantColor: this.getDominantColor(cornerColors),
            maxDifference: Math.round(avgDiff)
        };
    }

    // حساب متوسط اللون في منطقة
    calculateAverageColor(region) {
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let i = 0; i < region.data.length; i += 4) {
            r += region.data[i];
            g += region.data[i + 1];
            b += region.data[i + 2];
            count++;
        }

        return {
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count)
        };
    }

    // استخراج منطقة بكسل من الصورة
    getPixelRegion(imageData, x, y, width, height) {
        const region = new ImageData(width, height);
        let index = 0;

        for (let row = y; row < y + height; row++) {
            for (let col = x; col < x + width; col++) {
                const pixelIndex = (row * imageData.width + col) * 4;
                if (pixelIndex < imageData.data.length) {
                    region.data[index++] = imageData.data[pixelIndex];
                    region.data[index++] = imageData.data[pixelIndex + 1];
                    region.data[index++] = imageData.data[pixelIndex + 2];
                    region.data[index++] = imageData.data[pixelIndex + 3];
                }
            }
        }

        return region;
    }

    // الحصول على اللون السائد
    getDominantColor(colors) {
        let r = 0, g = 0, b = 0;
        colors.forEach(color => {
            r += color.r;
            g += color.g;
            b += color.b;
        });

        return {
            r: Math.round(r / colors.length),
            g: Math.round(g / colors.length),
            b: Math.round(b / colors.length)
        };
    }

    // حساب المسافة بين لونين
    colorDistance(region1, region2) {
        const color1 = this.calculateAverageColor(region1);
        const color2 = this.calculateAverageColor(region2);
        
        return Math.sqrt(
            Math.pow(color1.r - color2.r, 2) +
            Math.pow(color1.g - color2.g, 2) +
            Math.pow(color1.b - color2.b, 2)
        );
    }
}

// إنشاء نسخة عامة للمحلل
const colorAnalyzer = new AdvancedColorAnalyzer();