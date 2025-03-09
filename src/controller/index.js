const UserService= require('../services/index')
this.UserService = new UserService()

const create = async (req, res) => {
    try {
        const response = await this.UserService.create(req.body)
        return res.status(201).json({
            success: true,
            status:response?.status,
            message: response?.data||response,
            error:[]
        })
    } catch (error) {
        console.log(error)
        if(error.error) {
            return res.status(404).json({
                success: false,
                message: error.msg,
                error: error.error
            })
        }
        if(error.status == "USER_NOT_FOUND"){
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error
            })
        }
        
        return res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}
const createBranch = async (req, res) => {
    try {
        const response = await this.UserService.createBranch(req.body);
        
        return res.status(201).json({
            success: true,
            status: response?.status,
            message: "Successfully created a new branch.",
            explanation: response?.data || response,
            error: []
        });
    } catch (error) {
        if(error.response?.data?.message == 'Reference already exists') {
            return res.status(500).json({
                success: false,
                message: "Branch already exists.",
                error: [] 
            });
        }
        return res.status(500).json({
            success: false,
            message: error.response?.data,
            error: [] 
        });
    }
};
module.exports = {
    create,
    createBranch
}