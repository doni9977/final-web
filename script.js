const cityData = [
    { name: 'Astana', image: 'image/Astana.jpeg' },
    { name: 'Almaty', image: 'image/Almaty.jpeg' },
    { name: 'Shymkent', image: 'image/Shymkent.jpg' },
    { name: 'Kokshetau', image: 'image/Kokshetau.jpeg' },
    { name: 'Oral', image: 'image/Oral.jpeg' },
    { name: 'Kyzylorda', image: 'image/Kyzylorda.jpeg' },
    { name: 'Oskemen', image: 'image/Oskemen.jpeg' },
    { name: 'Semey', image: 'image/Semey.jpeg' },
    { name: 'Karganda', image: 'image/Karganda.jpeg' },
]; 

const notificationSound = new Audio('notification.mp3'); 

function playNotificationSound() {
    notificationSound.currentTime = 0; 
    notificationSound.play().catch(error => {
        console.warn("Could not play sound (browser autoplay policy):", error);
    });
}

function showToast(message, type = 'success') {
    const $toastContainer = $('#toast-container');
    if (!$toastContainer.length) return;

    const $toast = $('<div></div>')
        .addClass('toast ' + type)
        .text(message);

    $toastContainer.append($toast);

    setTimeout(() => {
        $toast.addClass('show');
    }, 100);

    setTimeout(() => {
        $toast.removeClass('show');
    }, 3000);

    setTimeout(() => {
        $toast.remove();
    }, 3500); 
}

function validateRegistrationForm(event) {
    event.preventDefault(); 

    const $form = $('.register-box form');
    if (!$form.length) return true;

    $form.find('.error-message').remove();
    $form.find('.input-error').removeClass('input-error');

    const fullName = $('#fullname').val().trim();
    const email = $('#email').val().trim();
    const password = $('#password').val();
    const confirmPassword = $('#confirm-password').val();
    let isValid = true;

    function displayError($inputElement, message) {
        $inputElement.after(`<div class="error-message">${message}</div>`);
        $inputElement.addClass('input-error');
        isValid = false;
    }

    if (fullName === '') displayError($('#fullname'), 'Full name is required.');
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') displayError($('#email'), 'Email is required.');
    else if (!emailPattern.test(email)) displayError($('#email'), 'Invalid email format.');
    
    if (password === '') displayError($('#password'), 'Password is required.');
    else if (password.length < 6) displayError($('#password'), 'Password must be at least 6 characters.');
    
    if (confirmPassword === '') displayError($('#confirm-password'), 'Confirm password is required.');
    else if (password !== confirmPassword) displayError($('#confirm-password'), 'Passwords do not match.');
    
    if (!isValid) {
        $('#register-btn').addClass('shake-animation'); 
        setTimeout(() => { $('#register-btn').removeClass('shake-animation'); }, 500); 
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
        displayError($('#email'), 'An account with this email already exists.');
        return; 
    }

    users.push({ name: fullName, email: email, password: password });
    localStorage.setItem('users', JSON.stringify(users));

    const $button = $('#register-btn');
    
    $button.find('.button-text').text('Please wait...');
    $button.find('.spinner-border').show();
    $button.prop('disabled', true); 
    
    setTimeout(() => {
        showToast('Registration successful! Please log in.'); 
        $button.find('.button-text').text('Register');
        $button.find('.spinner-border').hide();
        $button.prop('disabled', false);
        $form.get(0).reset(); 

        window.location.href = 'login.html';
    }, 2000); 
}

function handleLoginForm(event) {
    event.preventDefault();
    
    const email = $('#email').val().trim();
    const password = $('#password').val();

    if (email === '' || password === '') {
        showToast('Please enter both email and password.', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const foundUser = users.find(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.password === password
    );

    if (foundUser) {
        sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
        showToast('Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
        
    } else {
        showToast('Invalid email or password.', 'error');
        $('.login-box .btn-filled-form').addClass('shake-animation');
        setTimeout(() => { $('.login-box .btn-filled-form').removeClass('shake-animation'); }, 500);
    }
}

function updateHeaderNav() {
    const currentUser = sessionStorage.getItem('currentUser');
    const $loginButton = $('.btn-header'); 

    if (currentUser && $loginButton.length > 0) {
        $loginButton.text('Profile').attr('href', 'profile.html');
    } else if ($loginButton.length > 0) {
        $loginButton.text('Login').attr('href', 'login.html');
    }
}

function animateCounter($element) {
    const target = parseInt($element.data('target'));
    const suffix = $element.data('suffix');
    const duration = 1500; 
    const $this = $element;

    $this.stop(true, true); 

    $({ countNum: 0 }).animate({ countNum: target }, {
        duration: duration,
        easing: 'swing',
        step: function() {
            $this.text(Math.floor(this.countNum) + suffix);
        },
        complete: function() {
            $this.text(target + suffix);
        }
    });
}

function resetCounter($element) {
    $element.stop(true, true);
    const initialText = '0' + $element.data('suffix');
    $element.text(initialText);
}

function setupAccordion() {
    const $accordionHeaders = $('.accordion-header'); 
    
    $accordionHeaders.on('click', function() {
        const $header = $(this);
        const $content = $header.next('.accordion-content');
        const isContentVisible = $header.hasClass('active');

        $('.accordion-header').not($header).removeClass('active');
        $('.accordion-content').not($content).css('maxHeight', '0px')
            .find('.count-up').each(function() {
                resetCounter($(this));
            });

        if (isContentVisible) {
            $content.css('maxHeight', '0px');
            $header.removeClass('active');
            $content.find('.count-up').each(function() {
                resetCounter($(this));
            });
            
        } else {
            $content.css('maxHeight', $content.prop('scrollHeight') + 'px');
            $header.addClass('active');
            $content.find('.count-up').each(function() {
                resetCounter($(this)); 
                animateCounter($(this));
            });
        }
    });
}

function setupPopup() {
    const openButton = document.querySelector('.hero-buttons .btn-filled'); 
    const closeButton = document.getElementById('popup-close');
    const popupOverlay = document.getElementById('popup-overlay');
    const popupContent = document.querySelector('.popup-content');

    if (openButton) {
        openButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            playNotificationSound(); 
            
            if (popupOverlay) {
                popupOverlay.style.display = 'flex';
                setTimeout(() => popupContent.classList.add('show'), 10); 
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
             if (popupOverlay) {
                popupContent.classList.remove('show');
                setTimeout(() => popupOverlay.style.display = 'none', 300); 
             }
        });
    }

    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                popupContent.classList.remove('show');
                setTimeout(() => popupOverlay.style.display = 'none', 300); 
            }
        });
    }
}

function setupThemeToggle() {
    const toggleButton = document.getElementById('theme-toggle-btn');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        if (toggleButton) {
             toggleButton.textContent = 'Day Mode';
        }
    } else {
         if (toggleButton) {
             toggleButton.textContent = 'Night Mode';
        }
    }

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            if (body.classList.contains('dark-theme')) {
                body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
                toggleButton.textContent = 'Night Mode';
            } else {
                body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                toggleButton.textContent = 'Day Mode';
            }
        });
    }
}

function displayTimeBasedGreeting() {
    const greetingElement = document.getElementById('time-based-greeting');
    if (!greetingElement) return;

    const hour = new Date().getHours();
    let greeting;

    switch (true) {
        case (hour >= 5 && hour < 12):
            greeting = 'Good Morning! Have a Great Flight!';
            break;
        case (hour >= 12 && hour < 18):
            greeting = 'Good Afternoon! Where Are You Flying Today?';
            break;
        case (hour >= 18 && hour < 22):
            greeting = 'Good Evening! Ready for Your Next Journey?';
            break;
        default:
            greeting = 'Welcome! The Night Sky Awaits Your Travel.';
    }

    greetingElement.textContent = greeting;
}

function submitDataAsync(data, callback) {
    console.log('Simulating data submission:', data);
    
    setTimeout(() => {
        const success = true; 
        callback(success); 
    }, 1000); 
}

function setupContactFormSubmission() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        submitDataAsync(formData, (isSuccess) => {
            if (isSuccess) {
                form.reset(); 
                showToast('Message sent successfully!');
            } else {
                showToast('Submission failed. Please try again.', 'error');
            }
        });
    });
}

function renderCityCarousel() {
    const carouselInner = document.querySelector('.city-carousel');
    if (!carouselInner) return;

    carouselInner.innerHTML = '';
    
    cityData.forEach((city, index) => {
        const slide = document.createElement('div');
        slide.classList.add('city-slide');
        if (index === 0) {
            slide.classList.add('active'); 
        }

        const cityImage = document.createElement('img');
        cityImage.src = city.image;
        cityImage.alt = `${city.name} skyline`;
        
        slide.appendChild(cityImage);
        carouselInner.appendChild(slide);
    });
}

function setupCityGallery() {
    const mainCarouselWrapper = document.querySelector('.city-carousel-inner');
    const mainCarousel = document.querySelector('.city-carousel');
    if (!mainCarousel) return;

    const thumbnailsContainer = document.createElement('div');
    thumbnailsContainer.classList.add('city-thumbnails');
    mainCarouselWrapper.appendChild(thumbnailsContainer);
    
    const thumbnailsHTML = cityData.map((city, index) => `
        <img 
            src="${city.image}" 
            alt="${city.name}" 
            data-city-index="${index}" 
            class="thumbnail-img ${index === 0 ? 'active-thumbnail' : ''}"
        >
    `).join('');
    
    thumbnailsContainer.innerHTML = thumbnailsHTML;
    
    const thumbnailImages = document.querySelectorAll('.thumbnail-img');
    const citySlides = document.querySelectorAll('.city-slide');

    thumbnailImages.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', (event) => {
            
            citySlides.forEach(slide => slide.classList.remove('active'));
            citySlides[index].classList.add('active');

            thumbnailImages.forEach(img => img.classList.remove('active-thumbnail'));
            event.target.classList.add('active-thumbnail');
        });
    });
}

function setupCityCarouselAutoplay(interval = 5000) {
    const citySlides = document.querySelectorAll('.city-slide');
    const thumbnailImages = document.querySelectorAll('.thumbnail-img');
    if (citySlides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = citySlides.length;

    function nextSlide() {
        citySlides[currentSlide].classList.remove('active');
        thumbnailImages[currentSlide].classList.remove('active-thumbnail');
        
        currentSlide = (currentSlide + 1) % totalSlides;

        citySlides[currentSlide].classList.add('active');
        thumbnailImages[currentSlide].classList.add('active-thumbnail');
    }

    setInterval(nextSlide, interval);
}

function updateDateTime() {
    const dateTimeElement = document.getElementById('current-date-time');

    if (dateTimeElement) {
        const now = new Date();
        
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
        };
        
        const formattedDateTime = now.toLocaleDateString('en-US', options);

        dateTimeElement.textContent = ` | Current Time: ${formattedDateTime}`;
    }
}

function setupFlightClassFilter() {
    $('#class-filter-input').on('keyup', function() {
        const filterText = $(this).val().toLowerCase();
        
        $('.flight-classes-grid .class-card-item').each(function() {
            const cardText = $(this).text().toLowerCase();
            
            if (cardText.includes(filterText)) {
                $(this).show(); 
            } else {
                $(this).hide(); 
            }
        });
    });
}

function setupCityAutocomplete() {
    const $input = $('#departure-city');
    const $suggestions = $('#city-suggestions');
    const cityNames = cityData.map(city => city.name);

    $input.on('keyup', function() {
        const searchText = $(this).val().toLowerCase();
        
        if (searchText.length === 0) {
            $suggestions.empty().hide();
            return;
        }

        const filteredCities = cityNames.filter(name => 
            name.toLowerCase().startsWith(searchText)
        );
        
        $suggestions.empty();
        
        if (filteredCities.length > 0) {
            filteredCities.forEach(cityName => {
                const $item = $('<div>')
                    .addClass('suggestion-item')
                    .text(cityName)
                    .on('click', function() {
                        $input.val(cityName);
                        $suggestions.empty().hide();
                    });
                $suggestions.append($item);
            });
            $suggestions.show();
        } else {
            $suggestions.hide();
        }
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.input-autocomplete-wrapper').length) {
            $suggestions.hide();
        }
    });
}


function setupScrollProgressBar() {
    $(window).on('scroll', function() {
        const docHeight = $(document).height();
        const winHeight = $(window).height();
        const scrollTop = $(window).scrollTop();
        const scrollable = docHeight - winHeight;
        
        if (scrollable > 0) {
            const progress = (scrollTop / scrollable) * 100;
            $('#scroll-progress-bar').css('width', progress + '%');
        } else {
             $('#scroll-progress-bar').css('width', '100%');
        }
    });
}

function checkLazyImages() {
    const $window = $(window);
    const windowHeight = $window.height();
    const scrollTop = $window.scrollTop();
    const fold = scrollTop + windowHeight;

    $('.lazy-load').each(function() {
        const $image = $(this);
        if ($image.offset().top < fold) {
            const dataSrc = $image.attr('data-src');
            if (dataSrc) {
                $image.attr('src', dataSrc).on('load', function() {
                    $(this).removeClass('lazy-load');
                });
            }
        }
    });
}

function setupLazyLoading() {
    $(window).on('scroll resize', checkLazyImages);
    checkLazyImages(); 
}

function setupServiceClassModal() {
    const classInfo = {
        'economy': {
            title: 'Economy Class',
            description: 'The perfect choice for travelers who value affordability. You get a comfortable seat, basic service, and the opportunity to enjoy your flight at the best price.'
        },
        'comfort': {
            title: 'Comfort Class',
            description: 'More than just economy. This class offers extra legroom, priority boarding, and enhanced in-flight dining. An excellent combination of price and comfort.'
        },
        'business': {
            title: 'Business Class',
            description: 'The ultimate in privileges. You can expect seats that convert into a full bed, an exclusive menu, access to business lounges, and personal service on board.'
        }
    };

    const $modalOverlay = $('#class-modal-overlay');
    const $modalContent = $('.class-modal-content');
    const $modalTitle = $('#class-modal-title');
    const $modalDescription = $('#class-modal-description');

    $('.btn-learn-more').on('click', function(e) {
        e.preventDefault(); 

        const classKey = $(this).data('class'); 
        const info = classInfo[classKey];

        if (info) {
            $modalTitle.text(info.title);
            $modalDescription.text(info.description);

            $modalOverlay.css('display', 'flex');
            setTimeout(() => {
                $modalContent.addClass('show');
            }, 10);
        }
    });

    function closeModal() {
        $modalContent.removeClass('show');
        setTimeout(() => {
            $modalOverlay.css('display', 'none');
        }, 300); 
    }

    $('#class-modal-close').on('click', closeModal);
    $modalOverlay.on('click', function(e) {
        if (e.target === this) { 
            closeModal();
        }
    });
}

function setupCopyToClipboard() {
    $('body').on('click', '.btn-copy', function() {
        const $button = $(this);
        let textToCopy = $button.data('copy');
        if (!textToCopy) {
            const $siblingText = $button.siblings('.text-to-copy').first();
            if ($siblingText.length) textToCopy = $siblingText.text().trim();
        }
        if (!textToCopy) {
            const $closest = $button.closest('.founder-card, .founder-header');
            if ($closest.length) {
                const $h3 = $closest.find('h3').first();
                if ($h3.length) textToCopy = $h3.text().trim();
            }
        }
        if (!textToCopy) {
            showToast('Nothing to copy', 'error');
            return;
        }
        const $tooltip = $button.find('.tooltip-text');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                $button.addClass('copied');
                if ($tooltip.length) $tooltip.text('Copied!');
                else $button.find('.btn-label').text('Copied!');
                setTimeout(() => {
                    $button.removeClass('copied');
                    if ($tooltip.length) $tooltip.text('Copy to clipboard');
                    else $button.find('.btn-label').text($button.data('label') || 'Copy');
                }, 1800);
            }).catch(() => {
                fallbackCopyText(textToCopy, $button);
            });
        } else {
            fallbackCopyText(textToCopy, $button);
        }
    });

    function fallbackCopyText(text, $button) {
        try {
            const $temp = $('<textarea>');
            $temp.css({position: 'absolute', left: '-9999px', top: '0'});
            $temp.val(text);
            $('body').append($temp);
            $temp.select();
            document.execCommand('copy');
            $temp.remove();
            const $tooltip = $button.find('.tooltip-text');
            $button.addClass('copied');
            if ($tooltip.length) $tooltip.text('Copied!');
            else $button.find('.btn-label').text('Copied!');
            setTimeout(() => {
                $button.removeClass('copied');
                if ($tooltip.length) $tooltip.text('Copy to clipboard');
                else $button.find('.btn-label').text($button.data('label') || 'Copy');
            }, 1800);
        } catch (err) {
            showToast('Copy failed', 'error');
        }
    }
}

function setupSearchHighlighting() {
    const highlightBtn = document.getElementById('highlight-btn');
    const clearBtn = document.getElementById('clear-highlight-btn');
    const keywordInput = document.getElementById('highlight-keyword-input');

    if (!highlightBtn || !clearBtn || !keywordInput) {
        return; 
    }

    const contentAreas = document.querySelectorAll('.about-intro, .about-details, .partners-section');

    const originalContent = [];
    contentAreas.forEach((el, index) => {
        originalContent[index] = el.innerHTML;
    });

    function clearHighlight() {
        contentAreas.forEach((el, index) => {
            el.innerHTML = originalContent[index];
        });
        setupAccordion();
    }

    clearBtn.addEventListener('click', clearHighlight);

    function highlightKeyword(keyword) {
        if (!keyword) return;
        const regex = new RegExp(`(${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');

        contentAreas.forEach(el => {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            let node;
            const textNodes = [];
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }

            textNodes.forEach(textNode => {
                const parent = textNode.parentNode;
                
                if (!parent || (parent.nodeName === 'SPAN' && parent.classList.contains('highlight'))) {
                    return;
                }

                const frag = document.createDocumentFragment();
                let lastIndex = 0;
                textNode.nodeValue.replace(regex, (match, p1, offset) => {
                    if (offset > lastIndex) {
                        frag.appendChild(document.createTextNode(textNode.nodeValue.slice(lastIndex, offset)));
                    }
                    const span = document.createElement('span');
                    span.className = 'highlight';
                    span.textContent = match;
                    frag.appendChild(span);
                    lastIndex = offset + match.length;
                });
                if (lastIndex < textNode.nodeValue.length) {
                    frag.appendChild(document.createTextNode(textNode.nodeValue.slice(lastIndex)));
                }
                if (frag.childNodes.length) {
                    parent.replaceChild(frag, textNode);
                }
            });
        });
    }

    highlightBtn.addEventListener('click', () => {
        clearHighlight();
        const keyword = keywordInput.value.trim();
        if (keyword) highlightKeyword(keyword);
    });
}

$(document).ready(function() {
    console.log("jQuery is ready!"); 

    updateHeaderNav(); 
    $('.login-box form').on('submit', handleLoginForm); 
    $('.register-box form').on('submit', validateRegistrationForm); 
    
    setupAccordion(); 
    setupPopup();
    setupThemeToggle();
    displayTimeBasedGreeting();
    setupContactFormSubmission();
    setupSearchHighlighting(); 
    
    if (document.querySelector('.city-carousel')) { 
        renderCityCarousel();
        setupCityGallery();
        setupCityCarouselAutoplay(5000); 
    }

    updateDateTime();
    setInterval(updateDateTime, 1000); 
    
    setupFlightClassFilter(); 
    setupCityAutocomplete(); 
    setupScrollProgressBar(); 
    setupLazyLoading();
    setupServiceClassModal(); 
    setupCopyToClipboard(); 
});