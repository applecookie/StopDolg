module.exports = function(id) {
    if (this && this.menu) {
        for (let i = 0, iLen = this.menu.length; i < iLen; ++i) {
            const menu = this.menu[i];

            if (menu.id === id) {
                return menu.title;
            }
        }
    }

    return null;
};
