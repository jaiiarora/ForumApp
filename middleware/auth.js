const jwt=require('jsonwebtoken');
const config= require('config');

module.exports=function(req,res,next){
    //Get token from header
    const token= req.header('x-auth-token');
    //Check if no token
    if (!token){
        return res.status(401).json({
            msg:'No token. Authorization denied'
        });
    }
    

    //verify the token
    try{
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        //once decoded use that user
        req.user=decoded.user;
        next();
    }
    catch(err)
    {
        res.status(401).json({msg:"Token not valid"});
    }
}