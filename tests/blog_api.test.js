const { after, beforeEach, test, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
// const blogsRouter = require('../controllers/blogs')

const api = supertest(app)

const initialUsers = [
    {
        username: 'mluukkai',
        _id: new mongoose.Types.ObjectId(),
      },
      {
        username: 'hellas',
        _id: new mongoose.Types.ObjectId(),
      },
]

const initialBlogs = [
    {
        _id: new mongoose.Types.ObjectId(),
        user: initialUsers[0]._id,
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId(),
        user: initialUsers[1]._id,
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId(),
        user: initialUsers[0]._id,
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId(),
        user: initialUsers[1]._id,
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId(),
        user: initialUsers[0]._id,
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId(),
        user: initialUsers[1]._id,
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
        __v: 0
    }
]

describe('Blog API', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        for (let user of initialUsers) {
            let userObject = new User(user)
            await userObject.save()
        }
        await Blog.deleteMany({})
        for (let blog of initialBlogs) {
            let blogObject = new Blog(blog)
            await blogObject.save()
        }
    })

    describe('Fetching blogs', () => {
        test('blogs are returned as json and have and id', async () => {
            const response = await api
                .get('/api/blogs')
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })

        test('there are six blogs', async () => {
            const response = await api.get('/api/blogs')
            const blogs = response.body
            assert.strictEqual(blogs.length, initialBlogs.length)
        })

        test('unique identifier property of blog posts is named id', async () => {
            const response = await api.get('/api/blogs')
            const blogs = response.body
            blogs.forEach(blog => {
                assert.strictEqual(blog._id, undefined)
                assert.notStrictEqual(blog.id, undefined)
            })
        })
    })

    describe('Adding blogs', () => {
        test('respond with 400 if title is missing', async () => {
            const newBlog = {
                userId: initialUsers[0]._id.toString(),
                author: "Test with no title",
                url: "https://examtrple.com"
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)
        })

        test('respond with 400 if url is missing', async () => {
            const newBlog = {
                userId: initialUsers[0]._id.toString(),
                title: "Test with no url",
                author: "Test author"
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)
        })

        test('a valid blog can be added', async () => {
            const newBlog = {
                title: "Async/Await in JavaScript",
                author: "John Tester Doe",
                url: "https://example.com",
                likes: 4,
                userId: initialUsers[0]._id.toString()
            }
            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const response = await api.get('/api/blogs')
            const blogsAtEnd = response.body
            assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)

            const contents = blogsAtEnd.map(blog => blog.title)
            assert(contents.includes('Async/Await in JavaScript'))
        })

        test('if the likes property is missing from the request, it will default to 0', async () => {
            const newBlog = {
                title: "Blog without likes",
                author: "Not so liked one",
                url: "https://examtrple.com",
                userId: initialUsers[0]._id.toString(),
            }

            const response = await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const savedBlog = response.body
            assert.strictEqual(savedBlog.likes, 0)
        })
    })

    describe('Deleting blogs', () => {
        test('succeed with status code 204 if id is valid', async () => {
            const blogsAtStart = await Blog.find({})
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(204)

            const blogsAtEnd = await Blog.find({})
            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

            const titles = blogsAtEnd.map(blog => blog.title)
            assert(!titles.includes(blogToDelete.title))
        })

        test('fails with status code 404 if blog does not exist', async () => {
            const nonExistingId = await new mongoose.Types.ObjectId()
            await api
                .delete(`/api/blogs/${nonExistingId}`)
                .expect(404)
        })
    })

    describe('Updating blogs', () => {
        test('succeeds with valid data', async () => {
            const blogsAtStart = await Blog.find({})
            const blogToUpdate = blogsAtStart[0]

            const newLikes = { likes: 99 }

            const response = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(newLikes)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            assert.strictEqual(response.body.likes, newLikes.likes)

            const blogsAtEnd = await Blog.find({})
            const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
            assert.strictEqual(updatedBlog.likes, newLikes.likes)
        })

        test('fails with status code 404 if blog does not exist', async () => {
            const nonExistingId = await new mongoose.Types.ObjectId()
            const newLikes = { likes: 99 }

            await api
                .put(`/api/blogs/${nonExistingId}`)
                .send(newLikes)
                .expect(404)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})