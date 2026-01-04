const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { body, validationResult } = require('express-validator');

// VALIDATION
const studentValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name should contain only letters'),

  body('marks')
    .isArray({ min: 5, max: 5 })
    .withMessage('Enter marks for 5 subjects')
];

// GET ALL STUDENTS Pagination + Search + Division
router.get('/', async (req, res) => {
  try {
    // pagination values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // filters
    const search = req.query.search;
    const division = req.query.division;

    const filter = {};

    // search by name
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // filter by division
    if (division) {
      filter.division = division;
    }

    // total count for pagination
    const totalStudents = await Student.countDocuments(filter);

    // fetch students
    const students = await Student.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalStudents / limit),
        totalStudents
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET STUDENT BY ID

router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ADD NEW STUDENT
router.post('/', studentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, marks } = req.body;

    const student = new Student({
      name,
      marks: marks.map(Number)
    });

    await student.save();
    res.status(201).json(student);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE STUDENT
router.put('/:id', studentValidation, async (req, res) => {
  try {
    const { name, marks } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name,
        marks: marks.map(Number)
      },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE STUDENT

router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
