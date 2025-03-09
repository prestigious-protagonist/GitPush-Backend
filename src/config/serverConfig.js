require("dotenv").config()
module.exports = {
    BASE_URL: process.env.BASE_URL,
    VALIDATOR_BASE_URL: process.env.VALIDATOR_BASE_URL,
    PORT: process.env.PORT,
    VALIDATOR_BRANCH : process.env.VALIDATOR_BRANCH
}