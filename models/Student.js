const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    marks: {
      type: [Number],
      required: true,
      validate: {
        validator: function (marks) {
          return marks.length === 5;
        },
        message: 'Exactly 5 marks are required'
      }
    },

    percentage: Number,
    division: String
  },
  {
    timestamps: true
  }
);

/* PRE-SAVE HOOK */
studentSchema.pre('save', function () {
  const total = this.marks.reduce((sum, m) => sum + m, 0);
  const percentage = (total / 500) * 100;

  this.percentage = Number(percentage.toFixed(2));

  if (percentage >= 75) this.division = 'Distinction';
  else if (percentage >= 60) this.division = 'First Class';
  else if (percentage >= 50) this.division = 'Second Class';
  else this.division = 'Third Class';
});

module.exports = mongoose.model('Student', studentSchema);
