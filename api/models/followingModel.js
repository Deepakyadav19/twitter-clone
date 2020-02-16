const mongoose = require('mongoose');
const schema = require('../schemas');
const followingSchema = mongoose.Schema(schema.following)

class Following{
    constructor(){
        this.model = mongoose.model('Following', followingSchema)
    }
    
    async follow(followedObj){
        return await this.model.create(followedObj )
    }

    async unfollow(criteria={}){
        return await this.model.deleteOne(criteria )
    }
}

module.exports = new Following();