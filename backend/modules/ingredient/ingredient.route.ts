import { Elysia, t } from 'elysia'
import { IngredientList, IngredientUnits, IngredientDetail, IngredientCreate, IngredientUpdate } from '@modules/ingredient/ingredient.service'

export const ingredientRoutes = new Elysia({
    prefix: '/ingredient'
})
    .get('/lists', ({ cookie }) => IngredientList({ cookie: cookie as any }))
    .post('/create', ({ cookie, body }) => IngredientCreate({ cookie: cookie as any, body: body as any }))
    .get('/units', ({ cookie, request }) => IngredientUnits({ cookie: cookie as any, request: request as any }))
    .get('/:id', ({ cookie, params }) => IngredientDetail({ cookie: cookie as any, params: params as any }))
    .patch('/:id', ({ cookie, params, body }) => IngredientUpdate({ cookie: cookie as any, params: params as any, body: body as any }))
    .post('/transaction/:type/:ingredient_name', ({ cookie, params, body }) => IngredientTransaction({ cookie: cookie as any, params: params as any, body: body as any }))