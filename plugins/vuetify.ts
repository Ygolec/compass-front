// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import {VFileUpload} from 'vuetify/labs/VFileUpload'

export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({
        date:{
            locale:{
                firstDayOfWeek: 1,
                masks:{
                    input:['DD.MM.YYYY'],
                    title:['MMMM YYYY', 'MMMM']
                },
                names:{
                    days:['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
                    shortDays:['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
                    shorterDays:['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
                    months:['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
                    shortMonths:['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
                }
            }
        },
        components: {
            VFileUpload,
        },
    })
    app.vueApp.use(vuetify)
})
