const mongoose = require("mongoose")
const {isEmail} = require("validator")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema(

    {
        role: {
            type:String,
            default:"compte d'essai",
            required:true
        },
        name: {
            type:String,
            required:true,
            minlength: 8,
            maxlength: 55,
            unique: true,
            trim:true,
        },

        email: {
            type:String,
            required:true,
            validate: [isEmail],
            lowercase: true,
            unique:true,
            trim:true
        },

        password: {
            type: String,
            required: true,
            max: 1024,
            minlength: 6
        },

        picture: {
            type:String,
            default: "./uploads/profil/random-user.png"
        },

        bio: {
            type:String,
            max: 500,
        },

        gender : {
            Type:String,
            
        },
        address: {
            Type:String,
            
        },

        followers: {
            type:[String]
        },
        following: {
            type:[String]
        },
    },

    {
        timestamps:true,
    }

)

userSchema.pre("save", async function(next) {
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.static.login = async function(email,password) {
    const user = await this.findOne({email})
    if (user) {
        const auth = await bcrypt.compare(password, user.password)
        if (auth) {
            return user
        }
        throw Error("mot de passe incorrect")
    }
    throw Error("addresse mail incorrect")
}

const UserModel = mongoose.model("user", userSchema)
module.exports = UserModel