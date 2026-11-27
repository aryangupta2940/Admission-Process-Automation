const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;

function validateApplicationInput(body) {
  const errors = [];

  const fullName = (body.fullName || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();
  const dateOfBirth = body.dateOfBirth;
  const gender = body.gender;
  const address = (body.address || '').trim();
  const tenthPercentage = Number(body.tenthPercentage);
  const twelfthPercentage = Number(body.twelfthPercentage);
  const previousSchool = (body.previousSchool || '').trim();
  const course = (body.course || '').trim();

  if (fullName.length < 2) errors.push('Full name must be at least 2 characters.');
  if (!EMAIL_REGEX.test(email)) errors.push('Valid email address is required.');
  if (!PHONE_REGEX.test(phone)) errors.push('Valid phone number (7-15 digits) is required.');
  if (!dateOfBirth || Number.isNaN(Date.parse(dateOfBirth))) {
    errors.push('Valid date of birth is required.');
  }
  if (!['Male', 'Female', 'Other'].includes(gender)) {
    errors.push('Gender must be Male, Female, or Other.');
  }
  if (address.length < 5) errors.push('Complete residential address is required.');

  if (Number.isNaN(tenthPercentage) || tenthPercentage < 0 || tenthPercentage > 100) {
    errors.push('10th marks/percentage must be between 0 and 100.');
  }
  if (Number.isNaN(twelfthPercentage) || twelfthPercentage < 0 || twelfthPercentage > 100) {
    errors.push('12th marks/percentage must be between 0 and 100.');
  }
  if (previousSchool.length < 2) errors.push('Previous school/college name is required.');
  if (!course) errors.push('Course selection is required.');

  return errors;
}

module.exports = {
  EMAIL_REGEX,
  PHONE_REGEX,
  validateApplicationInput,
};
