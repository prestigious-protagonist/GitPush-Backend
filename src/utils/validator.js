const axios = require("axios");
const {VALIDATOR_BASE_URL, PORT, BASE_URL, VALIDATOR_BRANCH} = require("../config/serverConfig")


const validateGitHubToken = async (req, res, next) => {
    try {
        const { token } = req.body; // Extract token from request body

        if (!token) {
            return res.status(401).json({ success: false, message: "GitHub token is required" });
        }

        const response = await axios.get(VALIDATOR_BASE_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json"
            }
        });

        req.githubUser = response.data; // Store authenticated user info in request
        next(); // Proceed to the next middleware
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired GitHub token",
            error: error.response?.data?.message || error.message
        });
    }
};







const fieldsValidator = async (req, res, next) => {
    try {
        const { username, branchName, repositoryName, path, content, message, token } = req.body;

        if (!(username && branchName && repositoryName && path && content && message && token)) {
            return res.status(400).json({
                success: false,
                status: "BAD_REQUEST",
                message: "One or more missing fields."
            });
        }
        if(message.length<1) {
            return res.status(404).json({
                success: false,
                status: "BAD_REQUEST",
                message: "Message cannot be null."
            });
        }
            
        try {
                
            const response = await axios.get(`${VALIDATOR_BASE_URL}/${username}`);
            
            if (!response.data.id) {
                return res.status(404).json({
                    success: false,
                    status: "USER_NOT_FOUND",
                    message: "Incorrect Username."
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({
                    success: false,
                    status: "USER_NOT_FOUND",
                    message: "Incorrect Username."
                });
            }
            return res.status(500).json({
                success: false,
                status: "INTERNAL_SERVER_ERROR",
                message: "GitHub API error. Please try again later."
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};


const branchValidator = async (req, res, next) => {
    try {
        const data = req.body
        const response = await axios.get(`${VALIDATOR_BRANCH}/repos/${data.username}/${data.repositoryName}/branches`,{
                    headers: {
                        Authorization: `Bearer ${data.token}`
                      }
        })
        if(response.data.length < 1){
            return res.status(404).json({
                success: false,
                status: 404,
                message: "No default branch found. Please create a default branch manually before proceeding."
            })
        }
        
        next()

    } catch (error) {
        next(error)
    }
};
const branchFieldValidator = async (req, res, next) => {
    try {
        const { username, repositoryName, branchName, token } = req.body;

        if (!username || !repositoryName || !branchName || !token) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields. Required: username, repositoryName, branchName, token"
            });
        }
        try {
                
            const response = await axios.get(`${VALIDATOR_BASE_URL}/${username}`);
            
            if (!response.data.id) {
                return res.status(404).json({
                    success: false,
                    status: "USER_NOT_FOUND",
                    message: "Incorrect Username."
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({
                    success: false,
                    status: "USER_NOT_FOUND",
                    message: "Incorrect Username."
                });
            }
            console.error(error)
            return res.status(500).json({
                success: false,
                status: "INTERNAL_SERVER_ERROR",
                message: "GitHub API error. Please try again later.",
                error: [error]
            });
        }

        next(); // Proceed if all fields are present
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error during validation",
            error: error.message
        });
    }
};

const validateRepository = async (req, res, next) => {
    try {
        const { username, repositoryName, token } = req.body;

        if (!username || !repositoryName || !token) {
            return res.status(400).json({ 
                success: false, 
                message: "Username, repositoryName, and token are required" 
            });
        }

        const response = await axios.get(`${BASE_URL}/${username}/${repositoryName}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json"
            }
        });

        req.repositoryData = response.data; // Store repo details in request
        next(); // Proceed to the next middleware
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: "Repository not found or access denied",
            error: error.response?.data?.message || error.message
        });
    }
};


module.exports = { fieldsValidator, branchValidator, validateGitHubToken, validateRepository, branchFieldValidator };
