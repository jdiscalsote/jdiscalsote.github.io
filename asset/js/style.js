function toggleMenu(x) {
    x.classList.toggle("change");
};

// Add event listeners to navigation links to close the offcanvas menu
document.querySelectorAll('.navbar-nav li a').forEach(link => {
    link.addEventListener('click', function() {
        let offcanvasElement = document.querySelector('#canvasMenu');
        let offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
        if (offcanvasInstance) {
            toggleMenu();
        }
    });
});

jQuery(function ($) {
    $(window).resize(function () {
        if (window.matchMedia('(max-width: 575px)').matches) {
            $(".offcanvasSide").addClass("offcanvasMobile");
        }
        else {
            $(".offcanvasSide").removeClass("offcanvasMobile");
        }
    });

    $(document).load($(window).width(changeClass));
    function changeClass() {
        if (window.matchMedia('(max-width: 575px)').matches) {
            $(".offcanvasSide").addClass("offcanvasMobile");
        }
        else {
            $(".offcanvasSide").removeClass("offcanvasMobile");
        }
    }
});

document.addEventListener('contextmenu', event => event.preventDefault());
