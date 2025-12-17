/* ========= فتح وإغلاق النوافذ ========= */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'block';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

/* ========= Toast ========= */
function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    setTimeout(() => t.hidden = true, 2000);
}

/* ========= التقييم بالنجوم ========= */
document.addEventListener('DOMContentLoaded', () => {
    let selectedRating = 0;
    const stars = document.querySelectorAll('#ratingModal .star');
    const ratingText = document.getElementById('ratingText');
    const submitBtn = document.getElementById('submitRatingBtn');
    const commentBox = document.getElementById('ratingComment');

    if (!stars.length || !submitBtn) return;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = Number(star.dataset.value);
            stars.forEach(s => {
                const val = Number(s.dataset.value);
                s.classList.toggle('active', val <= selectedRating);
            });
            ratingText.textContent = `تقييمك ${selectedRating} من 5`;
            submitBtn.disabled = false;
        });
    });

    submitBtn.addEventListener('click', () => {
        if (selectedRating === 0) {
            toast('يرجى اختيار التقييم أولاً');
            return;
        }
        const ratingData = {
            stars: selectedRating,
            comment: commentBox.value || '',
            date: new Date().toISOString()
        };
        localStorage.setItem('userRating', JSON.stringify(ratingData));
        toast(`شكراً لتقييمك ⭐ ${selectedRating}`);
        stars.forEach(s => s.classList.remove('active'));
        selectedRating = 0;
        ratingText.textContent = 'اضغط على النجوم للتقييم';
        commentBox.value = '';
        submitBtn.disabled = true;
        closeModal('ratingModal');
    });
});

/* ========= إعدادات الخصوصية ========= */
document.addEventListener('DOMContentLoaded', () => {
    const allowNotifications = document.getElementById('allowNotifications');
    const shareData = document.getElementById('shareData');
    const hideActivity = document.getElementById('hideActivity');
    const savePrivacyBtn = document.getElementById('savePrivacyBtn');

    // تحميل الإعدادات المحفوظة
    if (allowNotifications) allowNotifications.checked = localStorage.getItem('privacy_allowNotifications') === 'true';
    if (shareData) shareData.checked = localStorage.getItem('privacy_shareData') === 'true';
    if (hideActivity) hideActivity.checked = localStorage.getItem('privacy_hideActivity') === 'true';

    // حفظ الإعدادات عند الضغط على الزر
    if (savePrivacyBtn) {
        savePrivacyBtn.addEventListener('click', () => {
            if (allowNotifications) localStorage.setItem('privacy_allowNotifications', allowNotifications.checked);
            if (shareData) localStorage.setItem('privacy_shareData', shareData.checked);
            if (hideActivity) localStorage.setItem('privacy_hideActivity', hideActivity.checked);

            toast('تم حفظ إعدادات الخصوصية بنجاح');
            closeModal('privacyModal'); // يغلق المودال بعد الحفظ
        });
    }
});

function go(page) {
  window.location.href = page;
}
function logout(){
  // إذا عندك بيانات مستخدم مخزنة
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");

  // توديه لصفحة تسجيل الدخول
  window.location.href = "login.html";
}
function logout(){
  if(confirm("هل أنت متأكد من تسجيل الخروج؟")){
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
  }
}