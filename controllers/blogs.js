const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { error } = require('../utils/logger')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)

})

blogsRouter.post('/', async (request, response) => {
    const body = request.body

    if (!body.title || !body.url){
        return response.status(400).json({ error: "title or url missing"})
    }

    const blog = new Blog({
        "title": body.title,
        "author": body.author,
        "url": body.url,
        "likes": body.likes === undefined ? 0 : body.likes
    })
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    const id = request.params.id
    const deleteBlog = await Blog.findByIdAndDelete(id)

    if (deleteBlog) {
        response.status(204).end()
    } else {
        response.status(404).json({ error: 'blog not found'})
    }
})

module.exports = blogsRouter