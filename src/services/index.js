const axios = require("axios")
const {BASE_URL} = require("../config/serverConfig")
class UserService {
    async create(data) {
        try {
            console.log(-3)
            const {username, repositoryName, branchName, path, content, token, message} = data;
            const response1 = await this.branchExists({username, repositoryName, branchName, token})
            console.log(-1)
            if(!response1) {
               
                throw error}
            //now step 2
            const response2 = await this.createBlob({username, repositoryName, token, content})
            console.log(1)
            if(!response2) throw error
            console.log(2)
            //now step 3
            const response3 = await this.createTree({username, repositoryName, token, content, path, base_Tree: response1.data.commit.commit.tree.sha, sha: response2.data.sha})
            if(!response3) throw error
            console.log(3)
            //now step 4
            const response4 = await this.createCommit({username, repositoryName, token, message,tree: response3.data.sha, parents: response1.data.commit.sha})
            if(!response4) throw error
            console.log(4)
            
            //now step 5
            const response5 = await this.createReference({username, branchName, repositoryName, token, refSha: response4.data.sha})
            if(!response5) throw error
            console.log(5)
            return response5
        } catch (error) {
            throw error;
        }
        
    }
    async createReference(data) {
        try {
            const response = await axios.patch(`${BASE_URL}/${data.username}/${data.repositoryName}/git/refs/heads/${data.branchName}`,{
                        sha: data.refSha,
                        force: true
                    },{
                        headers: {
                            Authorization: `Bearer ${data.token}`,
                            Accept: "application/vnd.github+json"
                          }
                    })
            if(response.status == 409) throw new Error("A conflict occurred, possibly due to repository restrictions or branch protection rules.")
            
            return response;
        } catch (error) {
            throw {error: "Something went wrong!",
                msg:"Branch Not Found"
            }
        }
    }
    async createCommit(data) {
        try {
            const response = await axios.post(`${BASE_URL}/${data.username}/${data.repositoryName}/git/commits`,{
                        message: data.message,
                        tree: data.tree,
                        parents: [data.parents]
                      },{
                        headers: {
                            Authorization: `Bearer ${data.token}`,
                            Accept: "application/vnd.github+json"
                          }
                    })
            if(response.status == 403) throw new Error("Access denied. Check your GitHub token permissions.")
            if(response.status == 404) throw new Error("The requested resource (e.g., repository, branch) does not exist.")
            if(response.status == 409) throw new Error("There is a conflict, such as a branch protection rule preventing the commit.")
            if(response.status == 422) throw new Error(" Validation failed, or the request was spammed (e.g., invalid commit data).")
            
            return response;
        } catch (error) {
            throw error
        }
    }

    async createTree(data) {
        try {
            const response = await axios.post(`${BASE_URL}/${data.username}/${data.repositoryName}/git/trees`,{
                base_tree: data.base_Tree,
                tree: [
                    {
                    path: data.path,
                    mode: "100644",
                    type: "blob",
                    sha: data.sha
                    }
                ]
            },{
                headers: {
                    Authorization: `Bearer ${data.token}`
                    }
            })
            if(response.status == 403) throw new Error("Access denied. Check your GitHub token permissions.")
            if(response.status == 404) throw new Error("Repository or base tree not found. Verify repository, branch, and token.")
            if(response.status == 409) throw new Error("Conflict detected. The requested tree creation conflicts with existing data.")
            if(response.status == 422) throw new Error("Invalid input data or excessive requests. Check request structure and rate limits.")
            
            return response;
        } catch (error) {
            throw error
        }
    }
    async createBlob(data) {
        try {
            const response = await axios.post(`${BASE_URL}/${data.username}/${data.repositoryName}/git/blobs`,{
                content: data.content,
                encoding: "utf-8"
            },{
                headers: {
                    Authorization: `Bearer ${data.token}`
                  }
            })
            if(response.status == 403) throw new Error("Access denied. Check your GitHub token permissions.")
            if(response.status == 404) throw new Error("Repository or branch not found. Verify repository, branch name, and token.")
            if(response.status == 409) throw new Error("Conflict detected. The requested blob creation conflicts with existing data.")
            if(response.status == 422) throw new Error("Invalid input. Ensure content encoding and structure are correct.")
            

            return response
        } catch (error) {
            throw error
        }
    }
    async branchExists(data) {
        try {
            const response = await axios.get(`${BASE_URL}/${data.username}/${data.repositoryName}/branches/${data.branchName}`,{
                        headers: {
                            Authorization: `Bearer ${data.token}`
                          }
            })
            if(response.status == 404) {
                throw new Error("Verify the branch name!")
            }
            return response
        } catch (error) {
            if(error.response.data.message == 'Not Found')
                throw {message : "Repository not found"}
            
           
            if(error?.response?.data) {
                throw error.response.data
            }
            throw error
        }
    }
    async createBranch({ username, repositoryName, branchName, token }) {
        try {
            // Step 1: Get the default branch reference
            const repoResponse = await axios.get(`${BASE_URL}/${username}/${repositoryName}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const defaultBranch = repoResponse.data.default_branch || "main"; // Fallback to 'main'
            
            // Step 2: Get the latest commit SHA from the default branch
            const branchResponse = await axios.get(`${BASE_URL}/${username}/${repositoryName}/git/ref/heads/${defaultBranch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const baseSha = branchResponse.data.object.sha;
           
            // Step 3: Create a new branch from the latest commit SHA
            const response = await axios.post(`${BASE_URL}/${username}/${repositoryName}/git/refs`, {
                ref: `refs/heads/${branchName}`,
                sha: baseSha
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            return response.data;
    
        } catch (error) {
            throw error;
        }
    }
       

}

module.exports = UserService