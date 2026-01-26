import { Elysia } from 'elysia'
import { authRoutes } from '@modules/auth/auth.route'
import { menuRoutes } from '@modules/menu/menu.route'
import { logger } from "elysia-logger";
import { cors } from '@elysiajs/cors'
const app = new Elysia({
    name: 'api',
    prefix: '/api',
})
    .use(
        logger({
            transport: "console", // Pretty console output
        }))
    .use(cors({
        credentials: true,
        origin: (request) => {
            const origin = request.headers.get('origin')
            if (!origin) return true

            return (
                origin.startsWith('http://localhost:') ||
                origin.startsWith('http://127.0.0.1:')
            )
        }
    }))
    
app.use([authRoutes, menuRoutes])

console.log(`Server is running on http://localhost:3001`)
app.listen(3001)