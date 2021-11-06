const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('./userModel');
const bcrypt = require('bcrypt');

router.post('/signup' ,(req,res,next) =>{
    User.find({email: req.body.email})
    .exec()
    .then(user =>{
        if(user.length >= 1){
            return res.status(422).json({
                message:'Mail exist'
            });
        }else{
            bcrypt.hash(req.body.password,10,(err,hash) =>{
                if(err){
                    return res.status(500).json({
                        error:err
                    });
                }else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password:hash
                    });
                    user.save().then(result =>{
                        console.log(result);
                        res.status(201).json({
                            message:'user created'
                        });
                    }).catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            error:err
                        });
                    });
                }
            });
        }
    })
   
});

router.post('/login',(req, res, next) =>{
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          const error = new Error('un authorized');
          error.statusCode = 401;
          throw error;
        }
        loadedUser = user;
        console.log(loadedUser);
        return bcrypt.compare(password, user.password);
      })
      .then(isEqual => {
        if (!isEqual) {
          const error = new Error('un authorized');
          error.statusCode = 401;
          throw error;
        }
        const token = jwt.sign(
          {
            email: loadedUser.email,
            adminId: loadedUser._id.toString()
          },
          'somesupersecretsecret',
          { expiresIn: '1h' }
        );
        res.status(200).json({ token: token, userId: loadedUser._id.toString() });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
});
  

router.delete('/:userId', (req,res,next) =>{
    User.remove({_id: req.params.userId})
    .exec()
    .then(result =>{
        res.status(200).json({
            message:'User deleted'
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

module.exports = router;