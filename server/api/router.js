const express = require('express')
const router = express.Router()

let users = [
  {
    id: '1',
    name: 'Arthur',
    age: 56,
    gender: 'Male',
    notes: 'Programmer, JavaScript'
  },
  {
    id: '2',
    name: 'Beth',
    age: 44,
    gender: 'Female',
    notes: 'Engineer, MySQL'
  },
  {
    id: '3',
    name: 'Charlie',
    age: 48,
    gender: 'Male',
    notes: 'Designer, Blender'
  },
  {
    id: '4',
    name: 'Debbie',
    age: 52,
    gender: 'Female',
    notes: 'Programmer, Python'
  },
]

let createId = () => {
  return (Date.now() + Math.random().toFixed(0))
}

router.get('/users', (req, res) => {
  console.log(`GET request received at: ${new Date().toLocaleTimeString()}`)
  res.json(users)
})

router.post('/users', (req, res) => {
  let newUser = {
    id: createId(),
    name: req.body.name,
    age: req.body.age,
    gender: req.body.gender,
    notes: req.body.notes,
  }
  users.push[newUser]
  console.log(`POST request received at: ${new Date().toLocaleTimeString()}`)
  res.json({ message: `POST request successful`, newUserAdded: newUser})
})


module.exports = router