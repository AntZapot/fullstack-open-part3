require('dotenv').config();
const Person = require('./models/person');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :body'))
app.use(cors())
app.use(express.static('build'))

const errorHandler = (error, request, response, next) => {
    console.log(error.name);
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }
    next(error);
}

app.get('/info', (request , response) => {
    const date = new Date();
    response.send(
        `<p>Phonebook has info for ${Person.length} people</p><p>${date}</p>`
    )
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons);
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person);
    })
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ 
            error: 'name or number missing' 
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    });

    person.save()
        .then(savedNote => savedNote.toJSON())
        .then(savedAndFormattedNote => {
            response.json(savedAndFormattedNote)
        }) 
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end();
        })
        .catch(error => next(error))
});



app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body;

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {
        new: true,
        runValidators: true, 
        context: 'query' 
    })
        .then(updatedPerson => {
            response.json(updatedPerson)    
        })
        .catch(error => next(error));
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})