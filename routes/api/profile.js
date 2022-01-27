const express=require('express');
const router=express.Router();
const auth=require('../../middleware/auth');
const Profile=require('../../models/Profile');
const User=require('../../models/User');
const {check, validationResult} = require('express-validator/check');
const request = require('request');


//@route GET api/profile/me
//@desc Get current users profile
//@access Private
router.get('/me', auth, async (req,res)=>{
    try{
        var profile= await Profile.findOne({user:req.user.id}).populate('user',
        ['name','avatar']);

        if (!profile)
        {
            return res.status(400).json({msg:"There is no profile for this user"});
        }
        res.json(profile);
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route POST api/profile/me
//@desc Create/Update users profile
//@access Private

router.post('/', [auth, [
    check('department','Department is Required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty(),

]], async(req,res)=>{
    const errors=validationResult(req);
    if (!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }

    const{
        user,
        department,
        bio,
        skills
    }=req.body;
    //Build profile Object
    const profileFields={};
    profileFields.user=req.user.id;
    if (department)    profileFields.department=department;
    if (bio)    profileFields.bio=bio;
    if (skills){
        profileFields.skills=skills.split(',').map(skill=>skill.trim());

    }
    //console.log(profileFields.skills);
    try{
        let profile=await Profile.findOne({user:req.user.id});
        if (profile)
        {
            //update it
            profile= await Profile.findOneAndUpdate({user:req.user.id},{$set:
            profileFields},
            {new:true});
            return res.json(profile);

        }
        //create it
        profile=new Profile(profileFields);
        await profile.save();
        return res.json(profile);
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route Get api/profile
//@desc Get all profiles
//@access Public

router.get('/', async(req,res)=>{
    try{
        const profiles=await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})



//@route Get api/profile
//@desc Get all profiles
//@access Public


router.get('/user/:user_id', async(req,res)=>{
    try{
        const profile=await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
        if (!profile)
        {
            return res.status(400).json({msg:"Profile not found."});
        }
        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        if (err.kind=='ObjectId')
        {
            return res.status(400).json({msg:"Profile not found."});
        }
        res.status(500).send('Server Error');
    }
})

//@route Get api/delete
//@desc Delete profile
//@access Private


router.delete('/', auth, async(req,res)=>{
    try{
        //@todo -remove users posts
        //Remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg:"User Removed"});
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


module.exports=router;