import { Elysia, t } from 'elysia'
import { DashboardList, PackagingNoteUpdate, PinnedUpdate, CartDescriptionUpdate } from '@modules/dashboard/dashboard.service'

export const dashboardRoutes = new Elysia({
    prefix: '/dashboard'
})
    .get('/lists', ({ cookie }) => DashboardList({ cookie: cookie as any }))
    .patch('/packaging-note/:id', ({ cookie, params, body }) => PackagingNoteUpdate({ cookie: cookie as any, params: params as any, body: body as any }), {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            packaging_notes: t.Optional(t.Array(t.Object({
                id: t.String(),
                value: t.String(),
            }))),
            packaging_note: t.Optional(t.String()),
        })
    })
    .patch('/pinned/:id', ({ cookie, params, body }) => PinnedUpdate({ cookie: cookie as any, params: params as any, body: body as any }), {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            pinned: t.Boolean()
        })
    })
    .patch('/cart-description/:id', ({ cookie, params, body }) => CartDescriptionUpdate({ cookie: cookie as any, params: params as any, body: body as any }), {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            description: t.Array(t.Object({
                description_id: t.String(),
                description_title: t.String(),
                description_value: t.String(),
            }))
        })
    })
    .patch('/menu-description/:id', ({ params, body, cookie }) => EditMenuDescription({ params, body: body as any, cookie: cookie as any }), {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            lunchbox_name: t.String(),
            menu_name: t.String(),
            menu_description: t.Array(t.Object({
                menu_description_id: t.Nullable(t.String()),
                menu_description_title: t.String(),
                menu_description_value: t.String(),
            }))
        })
    })