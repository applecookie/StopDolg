$(document)
    .ready(() => {
        const animationSpeed = 300;
        const $blockquote = $('.comment__blockquote');
        const blockquoteMaxHeight = Math.floor(parseFloat($blockquote.find('p').css('line-height'))) * 10;
        function calculateCollapses() {
            $blockquote.each(function () {
                const $this = $(this);
                const $paragraphs = $this.find('p');
                const $toggleWrapper = $this.parent().next();
                let paragraphsHeight = 0;
                let limitHeight = 0;
                let limitFound = false;
                let paragraphMargin;
                let i;
                for (i = 0; i < $paragraphs.length; i++) {
                    const $paragraph = $paragraphs.eq(i);
                    if (!paragraphMargin) {
                        paragraphMargin = parseFloat($paragraph.css('margin-bottom'));
                    }

                    const height = $paragraph.outerHeight(true);
                    paragraphsHeight += height;

                    if (!limitFound && (limitHeight + height) - paragraphMargin <= blockquoteMaxHeight) {
                        limitHeight += height;
                    } else {
                        limitFound = true;
                    }
                }

                limitHeight = limitHeight || blockquoteMaxHeight;

                if (paragraphsHeight > blockquoteMaxHeight) {
                    $toggleWrapper.removeClass('_hide');
                    $this.css('height', `${limitHeight - paragraphMargin}px`);
                    $this.data({
                        maxHeight: limitHeight - paragraphMargin,
                        fullHeight: paragraphsHeight,
                    });
                } else {
                    $toggleWrapper.addClass('_hide');
                    $this.css('height', null);
                }
            });
        }

        calculateCollapses();

        $('.comment__footer .collapse-toggle').on('click', function (e) {
            const $this = $(this);
            const $text = $this
                .parent()
                .prev()
                .find('.comment__blockquote');
            if ($this.hasClass('_less')) {
                $text.animate({
                    height: $text.data('maxHeight'),
                }, animationSpeed);
                $this
                    .removeClass('_less')
                    .find('span')
                    .text('Развернуть');
            } else {
                $text.animate({
                    height: $text.data('fullHeight'),
                }, animationSpeed);
                $this
                    .addClass('_less')
                    .find('span')
                    .text('Свернуть');
            }
        });

        $(window)
            .resize(() => {
                calculateCollapses();
            });
    });
