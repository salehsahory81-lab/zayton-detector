// نظام الاستجابة للشاشات المختلفة
class ResponsiveSystem {
    constructor() {
        this.currentOrientation = this.getOrientation();
        this.setupResponsiveListeners();
    }

    // الحصول على اتجاه الشاشة
    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    // إعداد مستمعي الاستجابة
    setupResponsiveListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        
        // كشف نوع الجهاز
        this.detectDeviceType();
    }

    // التعامل مع تغيير الحجم
    handleResize() {
        const newOrientation = this.getOrientation();
        
        if (newOrientation !== this.currentOrientation) {
            this.currentOrientation = newOrientation;
            this.adaptLayout();
        }
        
        this.optimizeForScreenSize();
    }

    // التعامل مع تغيير الاتجاه
    handleOrientationChange() {
        setTimeout(() => {
            this.currentOrientation = this.getOrientation();
            this.adaptLayout();
        }, 100);
    }

    // كشف نوع الجهاز
    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /mobile|android|iphone|ipad|ipod/.test(userAgent);
        const isTablet = /ipad|tablet/.test(userAgent) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        this.deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
        document.body.setAttribute('data-device', this.deviceType);
    }

    // تكييف التخطيط
    adaptLayout() {
        const container = document.querySelector('.container');
        const cameraFrame = document.querySelector('.camera-frame');
        
        if (this.currentOrientation === 'portrait') {
            container.style.maxWidth = '100%';
            if (cameraFrame) {
                cameraFrame.style.height = '200px';
            }
        } else {
            container.style.maxWidth = '800px';
            if (cameraFrame) {
                cameraFrame.style.height = '300px';
            }
        }
    }

    // تحسين لحجم الشاشة
    optimizeForScreenSize() {
        const screenWidth = window.innerWidth;
        
        if (screenWidth < 768) {
            this.activateMobileMode();
        } else {
            this.activateDesktopMode();
        }
    }

    // تفعيل وضع الجوال
    activateMobileMode() {
        document.body.classList.add('mobile-mode');
        document.body.classList.remove('desktop-mode');
        
        // تحسين الأزرار للشاشات الصغيرة
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.padding = '12px 15px';
            button.style.fontSize = '14px';
        });
    }

    // تفعيل وضع سطح المكتب
    activateDesktopMode() {
        document.body.classList.add('desktop-mode');
        document.body.classList.remove('mobile-mode');
        
        // تحسين الأزرار للشاشات الكبيرة
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.padding = '15px 20px';
            button.style.fontSize = '16px';
        });
    }

    // التحقق من دعم الكاميرا
    async checkCameraSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('Camera API not supported');
            return false;
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            return videoDevices.length > 0;
        } catch (error) {
            console.error('Error checking camera support:', error);
            return false;
        }
    }

    // الحصول على معلومات الأداء
    getPerformanceInfo() {
        return {
            deviceType: this.deviceType,
            orientation: this.currentOrientation,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            userAgent: navigator.userAgent.substring(0, 100)
        };
    }
}

// إنشاء نسخة عامة لنظام الاستجابة
const responsiveSystem = new ResponsiveSystem();