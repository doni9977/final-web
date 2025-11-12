$(document).ready(function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    if (!currentUser) {
        alert('You must be logged in to view this page.');
        window.location.href = 'login.html';
        return;
    }

    $('#profile-name').text('Welcome, ' + currentUser.name);
    $('#profile-email').text('Email: ' + currentUser.email);

    $('#logout-btn').on('click', function() {
        sessionStorage.removeItem('currentUser');
        
        showToast('You have been logged out.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });

    if ($('body').hasClass('dark-theme')) {
         $('#profile-name').css('color', '#ffd700');
         $('#profile-email').css('color', '#e0e0e0');
    }
});