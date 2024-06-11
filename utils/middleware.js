const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const unknownEndPoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return response.status(400).json({ error: 'expected `username` to be unique' })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'token invalid' })
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({
            error: 'token expired'
        })
    }

    next(error)
}

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    }
    return null
}

const tokenExtractor = async (request, response, next) => {
    const token = getTokenFrom(request)

    if(token){
        try{
            const decodedToken = jwt.verify(token, process.env.SECRET)
            if(decodedToken.id){
                request.user = await User.findById(decodedToken.id)
            }
        } catch (error){
            console.error('Token verification error:', error)
        }
    }

    next()
}

const userExtractor = async (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.replace('Bearer ', '')
        try {
            const decodedToken = jwt.verify(token, process.env.SECRET)
            if (decodedToken.id) {
                request.user = await User.findById(decodedToken.id)
            }
        } catch (error) {
            return response.status(401).json({ error: 'token invalid'})
        }
    }
    next()
}

module.exports = {
    userExtractor,
    unknownEndPoint,
    errorHandler,
    tokenExtractor
}