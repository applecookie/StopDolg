$(document)
    .ready(() => {
        // video carousel
        $('.profile-list')
            .slick({
                infinite: true,
                slidesToShow: 2,
                slidesToScroll: 1,
                responsive: [{
                    breakpoint: 959,
                    settings: {
                        slidesToShow: 1,
                    },
                }],
            });
        // video carousel
        $('.video-list')
            .slick({
                infinite: true,
                slidesToShow: 2,
                slidesToScroll: 1,
                responsive: [{
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                    },
                }],
            });
        // team carousel
        $('.team-list')
            .slick({
                infinite: true,
                slidesToShow: 4,
                slidesToScroll: 1,
                responsive: [{
                    breakpoint: 960,
                    settings: {
                        slidesToShow: 3,
                    },
                }, {
                    breakpoint: 640,
                    settings: {
                        slidesToShow: 2,
                    },
                }, {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                    },
                }],
            });
        // faq accordion
        $('.faq-list__toggle').on('click', function () {
            $(this)
                .toggleClass('_less')
                .siblings('.faq-list__content')
                .find('.faq-list__description')
                .toggleClass('_is-shown');
        });
        // popover
        const $body = $('body');
        $('.popover__reference')
            .on('click', function () {
                $body.addClass('body-overflow');
                $('#' + $(this).data('popover')).addClass('_shown');
            });
        $('.popover__close, .popover__backdrop')
            .on('click', function () {
                $body.removeClass('body-overflow');
                $(this).closest('.popover').removeClass('_shown');
            });
    });
