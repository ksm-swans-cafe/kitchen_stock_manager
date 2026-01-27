import { Elysia, t } from 'elysia'
import { CartList, CartUpdateList, CartCreate, CartStatusUpdate, CartTimeUpdate, CartMenuUpdate, CartMenuIngredientsStatusUpdate, CartMenuAllIngredientsStatusUpdate } from '@modules/cart/cart.service'

export const cartRoutes = new Elysia({
    prefix: '/cart'
})
    .get('/lists', ({ cookie, request }) => CartList({ cookie: cookie as any, request: request as Request }))
    .patch('/:id', ({ cookie, params, body }) => CartUpdateList({ cookie: cookie as any, params: params as any, body: body as any }), {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            username: t.String(),
            lunchboxes: t.Array(t.Object({
                lunchbox_name: t.String(),
                lunchbox_set_name: t.String(),
                lunchbox_limit: t.Number(),
                lunchbox_total: t.Number(),
                lunchbox_total_cost: t.Number(),
            })),
            menu_items: t.Array(t.Object({
                menu_name: t.String(),
                menu_subname: t.String(),
                menu_category: t.String(),
                menu_total: t.Number(),
                menu_ingredients: t.Array(t.Object({
                    ingredient_name: t.String(),
                    useItem: t.Number(),
                })),
            })),
            customer_name: t.String(),
            customer_tel: t.String(),
            delivery_date: t.String(),
            location_send: t.String(),
            export_time: t.String(),
            receive_time: t.String(),
            shipping_cost: t.Number(),
            last_update: t.Optional(t.String())
        })
    })
    .post('/create', ({ cookie, body }) => CartCreate({ cookie: cookie as any, body: body as any }))
    .patch('/status/:id', ({ cookie, params, body }) => CartStatusUpdate({ cookie: cookie as any, params: params as any, body: body as any }), {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            status: t.String(),
            last_update: t.Optional(t.String())
        })
    })
    .patch('/time/:id', ({ cookie, params, body }) => CartTimeUpdate({ cookie: cookie as any, params: params as any, body: body as any }), {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            delivery_date: t.String(),
            export_time: t.String(),
            receive_time: t.String(),
        })
    })
    .patch('/menu/:id', ({ cookie, params, body }) => CartMenuUpdate({ cookie: cookie as any, params: params as any, body: body as any }), {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            menu_name: t.String(),
            menu_total: t.Number(),
        })
    })
    .patch('/menu/ingredient-status/:id', ({ cookie, params, body }) => CartMenuIngredientsStatusUpdate({ cookie: cookie as any, params: params as any, body: body as any }), {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            menuName: t.String(),
            ingredientName: t.String(),
            isChecked: t.Boolean(),
        })
    })
    .patch('/menu/all-ingredients-status/:id', ({ cookie, params, body }) => CartMenuAllIngredientsStatusUpdate({ cookie: cookie as any, params: params as any, body: body as any }), {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            isChecked: t.Boolean(),
        })
    })