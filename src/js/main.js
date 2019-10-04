$(document)
    .ready(() => {
        // team slider
        $('.slikparnt')
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
