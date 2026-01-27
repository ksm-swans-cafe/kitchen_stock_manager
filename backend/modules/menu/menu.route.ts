import { Elysia, t } from 'elysia'
import { MenuList, AddMenuList, ThatMenuItem, EditThatMenuItem, DeleteThatMenuItem, MenuPage, EditMenuDescription} from '@modules/menu/menu.service'

export const menuRoutes = new Elysia({
    prefix: '/menu'
})
    .get('/lists', ({ cookie }) => MenuList({ cookie: cookie as any }))
    .post('/lists', ({ body, cookie }) => AddMenuList({ body: body as any, cookie: cookie as any }), {
        body: t.Object({
            menu_name: t.String(),
            menu_ingredients: t.String(),
            menu_subname: t.String(),
            menu_category: t.String(),
            menu_cost: t.Number(),
            menu_lunchbox: t.Optional(t.Array(t.Object({
                lunchbox_name: t.String(),
                lunchbox_set_name: t.String(),
                lunchbox_total: t.Number(),
                lunchbox_total_cost: t.Number(),
            }))),
        })
    })
    .get('/:id', ({ params, cookie }) => ThatMenuItem({ params, cookie: cookie as any }), {
        params: t.Object({
            id: t.String()
        })
    })
    .patch('/:id', ({ params, body, cookie }) => EditThatMenuItem({ params, body: body as any, cookie: cookie as any }), {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            menu_name: t.String(),
            menu_ingredients: t.String(),
            menu_subname: t.String(),
            menu_category: t.String(),
            menu_cost: t.Number(),
            menu_lunchbox: t.Optional(t.String()),
        })
    })
    .delete('/:id', ({ params, cookie }) => DeleteThatMenuItem({ params, cookie: cookie as any }), {
        params: t.Object({
            id: t.String()
        })
    })
    .get('/page', ({ cookie, request }) => MenuPage({ cookie: cookie as any, request: request as Request }))
   