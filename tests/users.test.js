const { after, beforeEach, test, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
    // console.log('Deleting all users and blogs...')
    await User.deleteMany({})
    // const usersBefore = await User.countDocuments({})
    // console.log(`Users before inserting initial: ${usersBefore}`)

})

describe('User management', () => {
    test('creating a user with valid data', async () => {
        const newUser = {
            username: 'mluukkai 2',
            name: 'Matti Luukkainen',
            password: 'salainen'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await User.find({})
        assert.strictEqual(usersAtEnd.length, 1)
        assert.strictEqual(usersAtEnd[0].username, newUser.username)
    })

    test('creating a user fails with a short password', async () => {
        const newUser = {
            username: 'mluukkai 3',
            name: 'Matti Luukkainen',
            password: 'sa'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('fetching users returns users', async () => {
        const newUser = {
            username: 'mluukkai 4',
            name: 'Matti Luukkainen',
            password: 'salainen'
        }

        const savedUser = await new User(newUser).save()

        const response = await api.get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtResponse = response.body
        assert.strictEqual(usersAtResponse.length, 1)
        assert.strictEqual(usersAtResponse[0].username, savedUser.username)
    })
})

after(async () => {
    await mongoose.connection.close()
})