import { Elysia, t } from 'elysia'
import { LunchboxList, LunchboxCategories } from '@modules/lunchbox/lunchbox.service'

export const lunchboxRoutes = new Elysia({
    prefix: '/lunchbox'
})
    .get('/lists', ({ cookie }) => LunchboxList({ cookie: cookie as any }))
    .get('/categories', ({ cookie, request }) => LunchboxCategories({ cookie: cookie as any, request: request as any }))