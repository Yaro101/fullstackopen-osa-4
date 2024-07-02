const { after, beforeEach, test, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const initialUsers = [
    {
        username: 'mluukkai',
        passwordHash: bcrypt.hashSync('password1', 10),
        _id: new mongoose.Types.ObjectId(),
    },
    {
        username: 'hellas',
        passwordHash: bcrypt.hashSync('password2', 10),
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
        console.log('Deleting all users and blogs...')

        await User.deleteMany({})
        await Blog.deleteMany({})

        const userPromises = initialUsers.map(user => new User(user).save())
        await Promise.all(userPromises)

        const blogPromises = initialBlogs.map(blog => new Blog(blog).save())
        await Promise.all(blogPromises)
    })

    describe('Fetching blogs', () => {
        test('blogs are returned as json and have and id', async () => {
            const response = await api
                .get('/api/blogs')
                .expect(200)
                .expect('Content-Type', /application\/json/)

            assert(response.body.length === initialBlogs.length)
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
            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'mluukkai', password: 'password1' })
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const token = loginResponse.body.token

            const newBlog = {
                userId: initialUsers[0]._id.toString(),
                author: "Test with no title",
                url: "https://examtrple.com"
            }

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400)
        })

        test('respond with 400 if url is missing', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'mluukkai', password: 'password1' })
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const token = loginResponse.body.token

            const newBlog = {
                userId: initialUsers[0]._id.toString(),
                title: "Test with no url",
                author: "Test author"
            }

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400)
        })

        test('a valid blog can be added', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'mluukkai', password: 'password1' })
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const token = loginResponse.body.token

            const newBlog = {
                title: "Async/Await in JavaScript",
                author: "John Tester Doe",
                url: "https://example.com",
                likes: 4,
                userId: initialUsers[0]._id.toString()
            }
            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
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
            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'mluukkai', password: 'password1' })
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const token = loginResponse.body.token

            const newBlog = {
                title: "Blog without likes",
                author: "Not so liked one",
                url: "https://example.com",
                userId: initialUsers[0]._id.toString(),
            }

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const savedBlog = response.body
            assert.strictEqual(savedBlog.likes, 0)
        })
    })

    describe('Deleting blogs', () => {
        test('succeed with status code 204 if id is valid', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'mluukkai', password: 'password1' })
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const token = loginResponse.body.token

            const blogsAtStart = await Blog.find({})
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)

            const blogsAtEnd = await Blog.find({})
            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

            const titles = blogsAtEnd.map(blog => blog.title)
            assert(!titles.includes(blogToDelete.title))
        })

        test('fails with status code 404 if blog does not exist', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'mluukkai', password: 'password1' })
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const token = loginResponse.body.token

            const nonExistingId = await new mongoose.Types.ObjectId()
            await api
                .delete(`/api/blogs/${nonExistingId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404)
        })
    })

    describe('Updating blogs', () => {
        test('succeeds with valid data', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'mluukkai', password: 'password1' })
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const token = loginResponse.body.token

            const blogsAtStart = await Blog.find({})
            const blogToUpdate = blogsAtStart[0]

            const newLikes = { likes: 99 }

            const response = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .set('Authorization', `Bearer ${token}`)
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