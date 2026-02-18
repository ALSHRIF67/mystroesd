// public/script.js

(function() {
    'use strict';

    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('categories-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('close-sidebar-btn');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // منع التمرير خلف الـ sidebar
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // فتح بالضغط على الهامبورجر
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openSidebar);
    }

    // إغلاق بزر الإغلاق داخل الـ sidebar
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }

    // إغلاق بالضغط على الخلفية (backdrop)
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // إغلاق بضغط ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    // منع انتشار الضغط داخل الـ sidebar عشان ما يقفلش لما نضغط جواه
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // لو الشاشة كبّرت و فتحنا الـ sidebar، بعدين ضغطنا على أي لينك نسيبه يشتغل و يقفل الـ sidebar تلقائي
    const categoryLinks = sidebar.querySelectorAll('a.category-item');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function() {
            // نقفل الـ sidebar بعد ميضغط على الرابط (بمهلة بسيطة)
            setTimeout(closeSidebar, 100);
        });
    });

})();