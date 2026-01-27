import { Elysia, t } from 'elysia'
import { CheckToken, GetUser, GetUserById, Login, Logout } from '@modules/auth/auth.service'

export const authRoutes = new Elysia({
    prefix: '/auth'
})
    .get('/user', GetUser)
    .get('/user/:id', ({ params, cookie }) => GetUserById({ params, cookie: cookie as any }), {
        params: t.Object({
            id: t.String()
        }),
    })
    .get('/checktoken', ({ cookie }) => CheckToken({ cookie: cookie as any }))
    .post('/login', ({ body, cookie }) => Login(body, { cookie: cookie as any }), {
        body: t.Object({
            token: t.String(),
            username: t.String(),
            name: t.String(),
            role: t.String(),
        })
    })
    .post('/logout', ({ cookie }) => Logout({ cookie: cookie as any }))