https://browsersync.io/

https://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features

Из-за ограничений безопасности при работе с веб-камерой пользователя, соединение должно быть "secure origin", то есть HTTPS, мы будем работать на localhost который по идее тоже считается "secure origin". Чтобы поднять сервер на localhost мы будем использовать browsersync (p.s.: подойдёт любой http-server). Заодно browsersync будет автоматически обновлять браузер при изменении HTML, CSS, JS, изображений и других файлов проекта.
