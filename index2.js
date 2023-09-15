const emailValidator = require('deep-email-validator');
async function valid(email) {
    let { valid, reason } = await emailValidator.validate(email);
    if (valid) {
        return true;
    }
    else {
        return false;
    }

};
module.exports = valid;


