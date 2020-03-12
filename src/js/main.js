$(document)
    .ready(() => {
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
        $('.mass-media__list')
            .slick({
                infinite: true,
                slidesToShow: 5,
                variableWidth: true,
                responsive: [{
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 4,
                        variableWidth: false,
                    },
                }, {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 3,
                        variableWidth: false,
                    },
                }, {
                    breakpoint: 640,
                    settings: {
                        slidesToShow: 2,
                        variableWidth: false,
                    },
                }, {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        variableWidth: false,
                    },
                }],
            });
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
                .closest('.faq-list__header')
                .siblings('.faq-list__description')
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

        $('.js-show-more-toggle').on('click', function () {
            $('.js-show-more-content').slideDown('slow');
            $(this).prop("disabled", true);
            $('.show-more-arrow').addClass('_less');
        });
    });
