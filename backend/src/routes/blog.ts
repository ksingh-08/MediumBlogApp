import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

import { sign,verify } from 'hono/jwt'
import { use } from 'hono/jsx'
import { createBlogInput } from 'ksingh08-medium-common';


export const blogRouter = new Hono<{
  Bindings: {
		DATABASE_URL: string
    JWT_SECRET: string
	},
    Variables:{
        userId : string ;
    }
}>();
blogRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET);
        if (user) {
            //@ts-ignore
            c.set("userId", user.id);
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }
    } catch(e) {
        c.status(403);
        return c.json({
            message: "You are not logged in"
        })
    }
});

blogRouter.post('/',async (c)=>{
    const body = await c.req.json();
     const { success } = createBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const authorId = c.get("userId");
     const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

    const blog = await prisma.blog.create({
        data:{
            title:body.title,
            content:body.content,
            authorId: Number(authorId)
        }
    })
  return c.json({
    id:blog.id
  })
})
// blogRouter.use('api/v1/blog/*',async(c,next)=>{
//   const header = c.req.header("authorization") || "";
//   const token = header.split(" ")[1]
//   const response = await verify(token, c.env.JWT_SECRET)
//   if(response.id){
//     next()
//   }else{
//     c.status(403)
//     return c.json({error : "unauthorized"})
//   }
//   await next()
// })





blogRouter.put('/',async(c)=>{
      const body = await c.req.json();
     const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

    const blog = await prisma.blog.update({
        where:{
            id:body.id
        },
        data:{
            title:body.title,
            content:body.content,
            
        }
    })
  return c.json({
    id:blog.id
  })
})

blogRouter.get('/bulk',async (c)=>{
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

const blogs= await prisma.blog.findMany({
    select:{
        content:true,
        title:true,
        id:true,
        author:{
            select:{
                name:true
            }
        }
    }
});

return c.json({
    blogs
})


})


blogRouter.get('/:id',async(c)=>{
      const id = c.req.param("id");
     const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())
     
    try{
        const blog = await prisma.blog.findFirst({
        where:{
            id:Number(id)
        },
        select:{
            id:true,
            title:true,
            content:true,
            author:{
                select:{
                    name:true
                }
            }
        }
    })
  return c.json({
    blog
  })
    }
    catch(e){
        c.status(411);
        return c.json({
            message:"Error while fetching blog post"
        })
    }
    
})

