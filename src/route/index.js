const express = require("express")
const router = express.Router()

const axios = require("axios")
const UserController = require("../controller/index")
const Validators = require('../utils/validator')

router.post('/push',Validators.fieldsValidator,Validators.validateGitHubToken,Validators.validateRepository, Validators.branchValidator, UserController.create)
router.post('/createBranch',Validators.branchFieldValidator, Validators.validateGitHubToken,Validators.validateRepository, Validators.branchValidator, UserController.createBranch)
module.exports = router