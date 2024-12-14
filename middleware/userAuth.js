import jwt from 'jsonwebtoken'

const userAuth = async(req,res,next)=>{
    const {token}= req.cookies;
    if(!token){
        return res.status(401).json({message:'Not Authorized.Please login Again'})
    }
    try {
        const tokenDecode=jwt.verify(token,process.env.JWT_SECRET)
        if(tokenDecode.id){
            req.body.userId = tokenDecode.id;
            next();
        }
        else{
            return res.status(401).json({message:'Not Authorized.Please login '})
        }

    } catch (error) {
      res.json({
        succes:false,
        message: 'Invalid token. Please login again',
      })  
    }
}

export default userAuth;