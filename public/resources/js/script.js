$(document).ready(function(){
    /*sticky nav setting*/
    $('.js-section-features').waypoint(function(direction){
        if(direction == "down"){
            $('nav').addClass('sticky')
        } else{
            $('nav').removeClass('sticky')
        }
    }, {
        offset: '65px'
      });

    /*scroll btn*/
    $('.js-btn-scroll-rewards').click(function(){
        $('html,vody').animate({scrollTop: $('.js-section-reward').offset().top}, 1000)
    });


    $('.js-btn-scroll-guide').click(function(){
        $('html,vody').animate({scrollTop: $('.js-section-features').offset().top}, 1000)
    });

    /* Navigation scroll */
        $(function() {
            $('a[href*=#]:not([href=#])').click(function() {
            if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
                if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
                }
            }
            });
        });
});