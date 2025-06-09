
const userModel = require("../models/user.model")
const ObjectId = require ("mongoose").Types.ObjectId




module.exports.getAllUsers = async (req,res) => {
    const users = await userModel.find().select("-password")
    res.status(200).json(users)
}

module.exports.getUser = (req,res) => {
    console.log(req.params)
    if(!ObjectId.isValid(req.params.id))
    return res.status(400).send("ID unknow : " + req.params.id)

    userModel.findById(req.params.id, (err,docs) => {
        if(!err) res.send(docs)
        else console.log("ID unknnow:" + err)
    }).select("-password")
}


module.exports.updateUser = async (req,res) => {
    if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ID unknown:" + req.params.id)

    try{
        await userModel.findOneAndUpdate(
            {_id: req.params.id},
            {
                $set: {
                    name: req.body.name,
                    picture: req.body.picture,
                    bio: req.body.bio,
                    gender: req.body.gender
                    
                }
            },
            { new:true, upsert:true, setDefaultsOnInsert:true},
            (err,docs) => {
                if (!err) return res.send(docs)
                if (err) return res.status(500).send({message: err})
            }
        )
    } catch (err) {
        return res.status(500).json({message: err})
    }
    
}

module.exports.deleteUser= async (req,res) => {
    if(!ObjectId.isValid(req.params.id))
    return res.status(400).send("ID unknown" + req.params.id)
    try{
        await userModel.remove({_id: req.params.id}).exec()
        res.status(200).json({message: "A bientôt"})
    } catch(err) {
        return res.status(500).json({message:err})
    }
}

module.exports.follow = async (req,res) => {
    if(!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.body.idToFollow))
    return res.status(400).send("ID unknown:" + req.params.id)
    try{
        await userModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { following: req.body.idToFollow}},
            { new: true, upsert:true},
            (err,docs) => {
                if (!err)res.status(201).json(docs)
                else return res.status(400).json(err)
            }
        )
    } catch(err) {
        return res.status(500).json ({message:err})
    }

}

module.exports.unFollow = async (req,res) => {
    if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.body.idToFollow))
    return res.status(400).send("ID unknown:" + req.params.id)

    try{
        await userModel.findByIdAndUpdate(
            req.body.idToUnfollow,
            { $pull: { followers: req.params.id}},
            { new:true, upsert:true},
            (err,docs) => {
                if (err)
                return res.status(400).json(err)
            }
        )
    } catch (err) {
        return res.status(500).json ({ message: err})
    }
}
