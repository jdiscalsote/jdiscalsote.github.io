function toggleMenu(x) {
    x.classList.toggle("change");
};

document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('copy', event => event.preventDefault());

/* jQuery(function ($) {
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
}); */
