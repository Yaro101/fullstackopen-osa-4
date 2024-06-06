const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { error } = require('../utils/logger')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 })
    response.json(blogs)

})

blogsRouter.post('/', async (request, response) => {
    const {title, author, url, likes, userId} = request.body

    if (!title || !url) {
        return response.status(400).json({ error: "title or url missing" })
    }

    let user = await User.findById(userId)
    if (!user) {
        return response.status(400).json({ error: 'invalid user id' })
    }

    const blog = new Blog({
        title,
        author,
        url,
        likes: likes === undefined ? 0 : likes,
        user: user._id
    })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    const id = request.params.id
    const deleteBlog = await Blog.findByIdAndDelete(id)

    if (deleteBlog) {
        response.status(204).end()
    } else {
        response.status(404).json({ error: 'blog not found' })
    }
})

blogsRouter.put('/:id', async (request, response) => {
    const id = request.params.id
    const body = request.body

    const updatedBlog = {
        likes: body.likes
    }

    const result = await Blog.findByIdAndUpdate(id, updatedBlog, { new: true })
    if (result) {
        response.status(200).json(result)
    } else {
        response.status(404).json({ error: 'blog not found' })
    }
})

module.exports = blogsRouter